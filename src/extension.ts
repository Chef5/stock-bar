import * as vscode from 'vscode';
import logger from './logger';
import Configuration from './configuration';
import { sinaStockProvider } from './provider';
import { render, renderFutures, stopAllRender } from './render';
import Stock from './stock';
import FutureHandler from './futures';
import { clearInterval } from 'timers';
import { StockQuickPickItem } from './vscode/StockQuickPickItem';

function loadChoiceStocks() {
	return Configuration.getStocks().map((v) => {
		if (typeof v === 'string') {
			return new Stock(v);
		}
		if (typeof v === 'object') {
			return new Stock(v.code, v.alias, v.hold_price, v.hold_number);
		}
		throw new Error(
			'配置格式错误, 查看 https://github.com/Chef5/stock-bar#配置',
		);
	});
}

let timer = null;
let stocks: Stock[];

function restart() {
	const interval = Configuration.getUpdateInterval();
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
	stocks = loadChoiceStocks();
	futureHandler.updateConfig(Configuration.getFutures());

	timer = setInterval(ticker, interval);
	ticker();
}

const futureHandler = new FutureHandler();

async function ticker() {
	try {
		// 从云端获取最新状态
		logger.debug('call fetchData');
		const [data] = await Promise.all([
			sinaStockProvider.fetch(stocks.map((v) => v.code)),
			futureHandler.updateData(),
		]);
		// 更新本地的数据
		for (const origin of data) {
			const stock = stocks.find((v) => v.code.toLowerCase() === origin.code);
			if (!stock) {
				continue;
			}
			stock.update(origin);
		}
		// 渲染内容
		logger.debug('render');
		render(stocks);
		renderFutures(futureHandler.futures);
	} catch (e) {
		logger.error('%O', e);
	}
}

function stop() {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
	stopAllRender();
}

const quickPick = vscode.window.createQuickPick<StockQuickPickItem>();
quickPick.canSelectMany = false;
quickPick.matchOnDescription = true;
quickPick.matchOnDetail = true;
quickPick.onDidAccept(() => {
	const item: StockQuickPickItem = quickPick.selectedItems[0];
	if (!quickPick.busy) {
		item.action();
	}
});

function openQuickPick(items: StockQuickPickItem[], title = '') {
	quickPick.busy = false;
	quickPick.value = '';
	quickPick.items = items;
	quickPick.placeholder = title;
	quickPick.show();
}

async function searchStocks(query: string) {
	const stockItems: Stock[] = await sinaStockProvider.fetch([query]);

	const selectionItems = stockItems.map((stock): StockQuickPickItem => {
		return {
			label: stock.name,
			action: async () => {
				if (stock.name == '---') {
					vscode.window.showErrorMessage('股票代码不存在，请重新重新添加！');
				} else {
					const code = stock.code.toLowerCase(); // 比如 "SZ000001"
					const currentStocks = Configuration.getStocks() || [];

					// 判断是否已存在
					const exist = currentStocks.some((item) => {
						if (typeof item === 'string') return item.toLowerCase() === code;
						return item.code.toLowerCase() === code;
					});

					if (!exist) {
						currentStocks.push({
							code: code,
							alias: stock.name,
							hold_price: 0,
							hold_number: 0,
						});
						await Configuration.stockBarConfig().update(
							'stocks',
							currentStocks,
							vscode.ConfigurationTarget.Global,
						);
						vscode.window.showInformationMessage(
							`已成功添加：${stock.name} (${code})`,
						);

						quickPick.hide();
						restart();
					} else {
						vscode.window.showInformationMessage(
							`股票 ${stock.name} (${code}) 已存在！`,
						);
					}
				}
			},
		};
	});

	selectionItems.push({
		label: '返回',
		action: () => {
			openSearch();
		},
	});

	openQuickPick(selectionItems);
}

async function openSearch() {
	const input = await vscode.window.showInputBox({
		prompt: `sh：沪市，不加前缀的情况下，6 开头的代码默认加上 sh（上证指数：sh000001）
				sz：深市，不加前缀的情况下，除 6 开头的代码外，默认加上 sz
				hk：港股，如：阿里巴巴港股 hk09988
				US_：美股，如：苹果股票 US_AAPL
				hkHSC：工商指数（港股指数）
				hkHSCEI：恒生中国企业指数（港股指数）
				hkHSI：恒生指数（港股指数）
				hkHSCCI：红筹指数（港股指数）
				hkHSF：恒生金融分类（港股指数）
				hkHSP：恒生地产分类（港股指数）
				hkHSU：恒生公用事业分类（港股指数）
				hkGEM：标普香港创业板指（港股指数）
				US_DOWJONES：道琼斯指数（美股指数）
				US_NASDAQ：纳斯达克（美股指数）
				US_SP500：标普 500（美股指数）`,
		placeHolder:
			'请输入股票代码，支持沪深、港股、美股，具体格式参考占位文本说明',
	});

	if (input && input.trim()) {
		await searchStocks(input.trim());
	}
}

export function activate(context: vscode.ExtensionContext) {
	stocks = loadChoiceStocks();

	const startCmd = vscode.commands.registerCommand('stockbar.start', restart);
	const stopCmd = vscode.commands.registerCommand('stockbar.stop', stop);
	const addCmd = vscode.commands.registerCommand('stockbar.add', async () => {
		await openSearch();
	});

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(() => {
			if (timer) {
				restart();
			}
		}),
	);
	context.subscriptions.push(startCmd);
	context.subscriptions.push(stopCmd);
	context.subscriptions.push(addCmd);
	restart(); // 初始默认打开
}

export function deactivate() {
	return;
}
