import { format } from 'util';
import * as vscode from 'vscode';
import Configuration from './configuration';
import Stock from './stock';
import { calcFixedNumber, keepDecimal } from './utils';
import { FutureData } from './futures';

const stockHub = new Map();

function getItemColor(item: Stock) {
	return item.percent >= 0
		? Configuration.getRiseColor()
		: Configuration.getFallColor();
}

function getItemText(item: Stock) {
	return format(
		'%s %s %s%',
		item.alias ?? item.name,
		keepDecimal(item.price, calcFixedNumber(item)),
		keepDecimal(item.percent * 100, 2),
	);
}

function getTooltipText(item: Stock) {
	const hasHold = item.hold_price && item.hold_number;
	const tooltips = [
		`【${item.name}】今日行情`,
		`涨跌：${item.updown}   百分：${keepDecimal(item.percent * 100, 2)}%`,
		`最高：${item.high}   最低：${item.low}`,
		`今开：${item.open}   昨收：${item.yestclose}`,
	];
	if (hasHold) {
		const balance = Math.round(
			(item.price - item.hold_price) * item.hold_number,
		);
		const balanceStr = balance > 0 ? `+${balance}` : `${balance}`;
		tooltips.push(`盈亏：${balanceStr}`);
	}
	return tooltips.join('\n');
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

let futureBars: vscode.StatusBarItem[] = [];

export function stopAllRender() {
	for (const [code, item] of stockHub) {
		const barItem = item.barItem;
		barItem.hide();
		barItem.dispose();
	}
	stockHub.clear();

	for (const item of futureBars) {
		const barItem = item;
		barItem.hide();
		barItem.dispose();
	}
	futureBars = [];
}

function syncFutureBarItem(futures: FutureData[]) {
	const addBars = futures.length - futureBars.length;
	for (let i = 0; i < -addBars; i++) {
		const barItem = futureBars[futureBars.length - 1];
		barItem.dispose();
		futureBars.pop();
	}

	for (let i = 0; i < addBars; i++) {
		const barItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
		);
		barItem.show();
		futureBars.push(barItem);
	}
}

function formatFuture(item: FutureData) {
	let percentStr = '-';
	let balanceStr = '-';
	const hasHold = item.hold_price && item.hold_number && item.ratio;
	if (item.price) {
		const percent = item.price.pre_price
			? (item.price.current_price - item.price.pre_price) / item.price.pre_price
			: 0;
		percentStr = `${keepDecimal(percent * 100, 2)}`;
		if (hasHold) {
			const balance = Math.round(
				(item.price.current_price - item.hold_price) *
					item.hold_number *
					item.ratio,
			);
			balanceStr = balance > 0 ? `+${balance}` : `${balance}`;
		}
	}

	const text = `${item.alias ?? item.name ?? item.code} ${
		item.price?.current_price ?? '-'
	} ${percentStr}%`;

	const tooltips = [
		`【${item.name}】今日行情`,
		`涨跌：${item.price?.updown}   百分：${percentStr}%`,
		`最高：${item.price?.high}   最低：${item.price?.low}`,
		`今开：${item.price?.open}   昨收：${item.price?.pre_price}`,
	];
	if (hasHold) {
		tooltips.push(`盈亏：${balanceStr}`);
	}

	return {
		text,
		tooltip: tooltips.join('\n'),
	};
}

export function renderFutures(futures: FutureData[]) {
	syncFutureBarItem(futures);
	for (const [index, barItem] of futureBars.entries()) {
		const { text, tooltip } = formatFuture(futures[index]);
		barItem.text = text;
		barItem.tooltip = tooltip;
	}
}
