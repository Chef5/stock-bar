import * as vscode from 'vscode';
import logger from './logger';
import Configuration from './configuration';
import { stockProvider } from './provider';
import { render, renderFutures, stopAllRender } from './render';
import Stock from './stock';
import FutureHandler from './futures';
import { clearInterval } from 'timers';
import { StockQuickPickItem } from './vscode/StockQuickPickItem';

export default class StockBarController {
	private timer: NodeJS.Timer | null = null;
	private stocks: Stock[] = [];
	private futureHandler = new FutureHandler();
	private quickPick = this.createQuickPick();

	constructor() {
		this.stocks = this.loadChoiceStocks();
	}

	private createQuickPick(): vscode.QuickPick<StockQuickPickItem> {
		const picker = vscode.window.createQuickPick<StockQuickPickItem>();
		picker.canSelectMany = false;
		picker.matchOnDescription = true;
		picker.matchOnDetail = true;
		picker.onDidAccept(() => {
			const item = picker.selectedItems[0];
			if (!picker.busy) {
				item?.action();
			}
		});
		return picker;
	}

	private loadChoiceStocks(): Stock[] {
		return Configuration.getStocks().map((item) => {
			if (typeof item === 'string') return new Stock(item);
			if (typeof item === 'object')
				return new Stock(
					item.code,
					item.alias,
					item.hold_price,
					item.hold_number,
				);
			throw new Error(
				'配置格式错误, 查看 https://github.com/Chef5/stock-bar#配置',
			);
		});
	}

	private async ticker(): Promise<void> {
		try {
			logger.debug('call fetchData');
			const [stockData] = await Promise.all([
				stockProvider.fetch(this.stocks.map((s) => s.code)),
				this.futureHandler.updateData(),
			]);

			stockData.forEach((data) => {
				const stock = this.stocks.find(
					(s) => s.code.toLowerCase() === data.code,
				);
				stock?.update(data);
			});

			logger.debug('render');
			render(this.stocks);
			renderFutures(this.futureHandler.futures);
		} catch (error) {
			logger.error('%O', error);
		}
	}

	private openQuickPick(items: StockQuickPickItem[], title = ''): void {
		this.quickPick.busy = false;
		this.quickPick.value = '';
		this.quickPick.items = items;
		this.quickPick.placeholder = title;
		this.quickPick.show();
	}

	private async searchStocks(query: string): Promise<void> {
		const stockItems = await sinaStockProvider.fetch([query]);
		const selectionItems: StockQuickPickItem[] = stockItems.map((stock) => ({
			label: stock.name,
			action: () => this.handleStockSelection(stock),
		}));

		selectionItems.push({
			label: '返回',
			action: () => this.openSearch(),
		});

		this.openQuickPick(selectionItems);
	}

	private async handleStockSelection(stock: Stock): Promise<void> {
		if (stock.name === '---') {
			vscode.window.showErrorMessage('股票代码不存在，请重新重新添加！');
			return;
		}

		const code = stock.code.toLowerCase();
		const currentStocks = Configuration.getStocks() || [];
		const exists = currentStocks.some((item) =>
			typeof item === 'string'
				? item.toLowerCase() === code
				: item.code.toLowerCase() === code,
		);

		if (!exists) {
			currentStocks.push({
				code,
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
			this.quickPick.hide();
			this.restart();
		} else {
			vscode.window.showInformationMessage(
				`股票 ${stock.name} (${code}) 已存在！`,
			);
		}
	}

	private async openSearch(): Promise<void> {
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

		if (input?.trim()) {
			await this.searchStocks(input.trim());
		}
	}

	public restart(): void {
		const interval = Configuration.getUpdateInterval();
		if (this.timer) clearInterval(this.timer);
		this.stocks = this.loadChoiceStocks();
		this.futureHandler.updateConfig(Configuration.getFutures());
		this.timer = setInterval(() => this.ticker(), interval);
		this.ticker();
	}

	public stop(): void {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
		stopAllRender();
	}

	public registerCommands(context: vscode.ExtensionContext): void {
		context.subscriptions.push(
			vscode.commands.registerCommand('stockbar.start', () => this.restart()),
			vscode.commands.registerCommand('stockbar.stop', () => this.stop()),
			vscode.commands.registerCommand('stockbar.add', () => this.openSearch()),
			vscode.workspace.onDidChangeConfiguration(() => {
				if (this.timer) this.restart();
			}),
		);

		this.restart();
	}

	public dispose(): void {
		this.stop(); // 清理定时器
		this.quickPick.dispose(); // 释放 QuickPick
	}
}
