import * as vscode from 'vscode';
import { StockOptions, FutureOptions } from 'stock-bar';

export default class Configuration {
	/**
	 * @private
	 */
	static stockBarConfig() {
		return vscode.workspace.getConfiguration('stock-bar');
	}

	/**
	 * @deprecated
	 */
	static getShowTime() {
		return Configuration.stockBarConfig().get('showTime');
	}

	static getStocks() {
		const stocks = Configuration.stockBarConfig().get('stocks');
		if (Object.prototype.toString.call(stocks) === '[object Object]') {
			return this.updateStocks(stocks as Record<string, string>);
		}
		return stocks as StockOptions;
	}

	static getFutures() {
		const futures = Configuration.stockBarConfig().get('futures');
		if (!futures) {
			return [];
		}
		const items = futures as FutureOptions;
		items.forEach((item) => (item.code = item.code.toUpperCase()));
		return items;
	}

	static getUpdateInterval() {
		const updateInterval = Configuration.stockBarConfig().get('updateInterval');
		return typeof updateInterval === 'number' ? updateInterval : 10000;
	}

	static getRiseColor() {
		return Configuration.stockBarConfig().get('riseColor');
	}

	static getFallColor() {
		return Configuration.stockBarConfig().get('fallColor');
	}

	/**
	 * 获取是否使用qos.hk接口获取港美股实时数据
	 */
	static getUseQosForHkUs() {
		return Configuration.stockBarConfig().get('useQosForHkUs') === true;
	}

	/**
	 * 获取qos.hk接口的token
	 */
	static getQosHkToken() {
		return Configuration.stockBarConfig().get('qosHkToken') as string;
	}

	static updateStocks(stocks: Record<string, string>) {
		const newStocks: StockOptions = Object.entries(stocks).map(
			([code, alias]) => (alias ? { code, alias } : code),
		);
		Configuration.stockBarConfig().update('stocks', newStocks, 1);
		return newStocks;
	}
}
