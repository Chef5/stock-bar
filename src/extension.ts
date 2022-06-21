import * as vscode from 'vscode';
import logger from './logger';
import Configuration from './configuration';
import { NeteaseProvider, NeteaseStockQuote } from './providers';
import { render } from './render';
import timer from './timer';

const loadChoiceStocks = () => {
	return Configuration.getStocks().map((v) => {
		if (typeof v === 'string') {
			return new NeteaseStockQuote({
				code: v,
			});
		}
		if (typeof v === 'object') {
			return new NeteaseStockQuote({
				code: v.code,
				alias: v.alias || '',
				barTemplate: v.barTemplate || '',
				tooltipTemplate: v.tooltipTemplate || '',
			});
		}
		throw new Error(
			'配置格式错误, 查看 https://github.com/Chef5/stock-bar#插件配置',
		);
	});
};

export function activate(context: vscode.ExtensionContext) {
	let stocks = loadChoiceStocks();

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(() => {
			stocks = loadChoiceStocks();
		}),
	);

	const neteaseProvider = new NeteaseProvider();
	const task: () => any = async () => {
		try {
			// 从云端获取最新状态
			logger.debug('call fetchData');
			const data = await neteaseProvider.fetch(stocks.map((v) => v.code));
			// 更新本地的数据
			for (const origin of data) {
				const stock = stocks.find((v) => v.code === origin.code);
				if (!stock) {
					continue;
				}
				stock.renew(origin);
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
}

export function deactivate() {
	return;
}
