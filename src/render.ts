import { format } from 'util';
import * as vscode from 'vscode';
import Configuration from './configuration';
import Stock from './stock';
import { calcFixedNumber, keepDecimal } from './utils';
import { FutureData } from './futures';

const stockHub = new Map();
let accountPnLBar: vscode.StatusBarItem | null = null;

function getItemColor(item: Stock) {
	return item.percent >= 0
		? Configuration.getRiseColor()
		: Configuration.getFallColor();
}

function getItemText(item: Stock) {
	const hasHold = item.hold_number > 0;
	const base = format(
		'%s %s %s%',
		item.alias ?? item.name,
		keepDecimal(item.price, calcFixedNumber(item)),
		keepDecimal(item.percent * 100, 2),
	);
	if (hasHold) {
		const dailyPnL = Math.round(item.updown * item.hold_number);
		const dailyPnLStr = dailyPnL > 0 ? `+${dailyPnL}` : `${dailyPnL}`;
		return `${base} [${dailyPnLStr}]`;
	}
	return base;
}

function getTooltipText(item: Stock) {
	const hasHold = item.hold_number > 0;
	const tooltips = [
		`【${item.name}】今日行情`,
		`涨跌：${item.updown}   百分：${keepDecimal(item.percent * 100, 2)}%`,
		`最高：${item.high}   最低：${item.low}`,
		`今开：${item.open}   昨收：${item.yestclose}`,
	];
	if (hasHold) {
		const dailyPnL = Math.round(item.updown * item.hold_number);
		const dailyPnLStr = dailyPnL > 0 ? `+${dailyPnL}` : `${dailyPnL}`;
		tooltips.push(`当日盈亏：${dailyPnLStr}`);

		const effectivePrice = item.price || item.yestclose || item.hold_price;
		const totalPnL = Math.round(
			(effectivePrice - item.hold_price) * item.hold_number,
		);
		const totalPnLStr = totalPnL > 0 ? `+${totalPnL}` : `${totalPnL}`;
		tooltips.push(`持仓盈亏：${totalPnLStr}`);
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
		(code) => !stocks.some((s: Stock) => s.code === code),
	);
	for (const item of deleted) {
		stockHub.get(item).barItem.hide();
		stockHub.get(item).barItem.dispose();
		stockHub.delete(item);
	}

	// 配置更新后添加的股票
	const added = stocks.filter(
		(s: Stock) => !stockHub.has(s.code),
	);
	for (const item of added) {
		const barItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
		);
		stockHub.set(item.code, { barItem });
		barItem.show();
	}

	// 更新股票的价格
	for (const stock of stocks) {
		const barItem = stockHub.get(stock.code);
		if (barItem) {
			barItem.barItem.text = getItemText(stock);
			barItem.barItem.color = getItemColor(stock);
			barItem.barItem.tooltip = getTooltipText(stock);
		}
	}

	// 渲染账户当日盈亏汇总
	renderAccountPnL(stocks);
};

let futureBars: vscode.StatusBarItem[] = [];

function renderAccountPnL(stocks: Stock[]) {
	// 汇总所有持仓股票的当日盈亏
	let totalDailyPnL = 0;
	let hasAnyHold = false;
	const details: string[] = [];

	for (const stock of stocks) {
		if (stock.hold_number > 0) {
			hasAnyHold = true;
			const pnl = Math.round(stock.updown * stock.hold_number);
			totalDailyPnL += pnl;
			const pnlStr = pnl > 0 ? `+${pnl}` : `${pnl}`;
			details.push(`${stock.alias || stock.name || stock.code}：${pnlStr}`);
		}
	}

	if (!hasAnyHold) {
		if (accountPnLBar) {
			accountPnLBar.hide();
			accountPnLBar.dispose();
			accountPnLBar = null;
		}
		return;
	}

	if (!accountPnLBar) {
		accountPnLBar = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
		);
		accountPnLBar.show();
	}

	const pnlStr = totalDailyPnL > 0 ? `+${totalDailyPnL}` : `${totalDailyPnL}`;
	accountPnLBar.text = `今日：${pnlStr}`;
	accountPnLBar.color =
		totalDailyPnL >= 0
			? (Configuration.getRiseColor() as string)
			: (Configuration.getFallColor() as string);

	const tooltipLines = ['【账户当日盈亏】', ...details, `合计：${pnlStr}`];
	accountPnLBar.tooltip = tooltipLines.join('\n');
}

export function stopAllRender() {
	for (const [, item] of stockHub) {
		const barItem = item.barItem;
		barItem.hide();
		barItem.dispose();
	}
	stockHub.clear();

	if (accountPnLBar) {
		accountPnLBar.hide();
		accountPnLBar.dispose();
		accountPnLBar = null;
	}

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
