import { format } from 'util';
import * as vscode from 'vscode';
import Configuration from './configuration';
import Stock from './stock';
import StandardStock from './standardStock';
import { templateReplace } from './utils';

const stockHub = new Map();

function getItemColor(item: Stock) {
	return item.percent >= 0
		? Configuration.getRiseColor()
		: Configuration.getFallColor();
}

function getItemText(item: Stock) {
	const template = Configuration.getBarTemplate();
	return templateReplace(item.barTemplate || template, new StandardStock(item));
	// return format(
	// 	'%s %s %s%',
	// 	item.alias ?? item.name,
	// 	keepDecimal(item.price, calcFixedNumber(item)),
	// 	keepDecimal(item.percent * 100, 2),
	// );
}

function getTooltipText(item: Stock) {
	const template = Configuration.getTooltipTemplate();
	return templateReplace(
		item.tooltipTemplate || template,
		new StandardStock(item),
	);
	// return (
	// 	`【${item.name}】今日行情\n` +
	// 	`涨跌：${item.updown}   百分：${item.percent}%\n` +
	// 	`最高：${item.high}   最低：${item.low}\n` +
	// 	`今开：${item.open}   昨收：${item.yestclose}`
	// );
}

/**
 *
 * @param {any} stocks
 * @returns
 */
export const render = (stocks: any) => {
	// 移除 配置更新后被删除的股票
	const deleted = Array.from(stockHub.keys()).filter(
		(code) => !(code in stocks),
	);
	for (const item of deleted) {
		stockHub.get(item).barItem.hide();
		stockHub.get(item).barItem.dispose();
		stockHub.delete(item);
	}

	// 配置更新后添加的股票
	const added = Array.from(Object.keys(stocks)).filter(
		(code) => !stockHub.has(code),
	);
	for (const item of added) {
		const barItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
		);
		stockHub.set(item, { barItem });
		barItem.show();
	}

	// 更新股票的价格
	for (const code in Object.keys(stocks)) {
		stockHub.get(code).barItem.text = getItemText(stocks[code]);
		stockHub.get(code).barItem.color = getItemColor(stocks[code]);
		stockHub.get(code).barItem.tooltip = getTooltipText(stocks[code]);
	}
};
