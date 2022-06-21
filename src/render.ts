import * as vscode from 'vscode';
import StandardStock from './standardStock';

const stockHub = new Map();

/**
 *
 * @param {StandardStock[]} stocks
 * @returns
 */
export const render = (stocks: StandardStock[]) => {
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
		stockHub.get(code).barItem.text = stocks[code].getItemText();
		stockHub.get(code).barItem.color = stocks[code].color;
		stockHub.get(code).barItem.tooltip = stocks[code].getTooltipText();
	}
};
