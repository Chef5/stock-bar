import * as vscode from 'vscode';
import logger from './logger';
import Configuration from './configuration';
import { neteaseStockProvider } from './provider';
import { render } from './render';
import timer from './timer';
import StockInstance from './stock';

function loadChoiceStocks() {
	return Configuration.getStocks().map((v) => {
		if (typeof v === 'string') {
			return new StockInstance(v);
		}
		if (typeof v === 'object') {
			return new StockInstance(v.code, v.alias);
		}
		throw new Error(
			'配置格式错误, 查看 https://github.com/Chef5/stock-bar#配置',
		);
	});
}

exports.activate = function activate(context: vscode.ExtensionContext) {
	let stocks = loadChoiceStocks();

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(() => {
			stocks = loadChoiceStocks();
		}),
	);

	const task: () => any = async () => {
		try {
			// 从云端获取最新状态
			logger.debug('call fetchData');
			const data = await neteaseStockProvider.fetch(stocks.map((v) => v.code));
			// 更新本地的数据
			for (const origin of data) {
				const stock = stocks.find((v) => v.code === origin.code);
				if (!stock) {
					continue;
				}
				stock.update(origin);
			}
			// 渲染内容
			logger.debug('render');
			render(stocks);
		} catch (e) {
			logger.error('%O', e);
		}

		// 阻塞等待下一个循环
		logger.debug('timer await');
		await timer.await();

		// 继续循环
		return task();
	};

	// 丢进宏任务队列
	setTimeout(task);
};

exports.deactivate = function deactivate() {};
