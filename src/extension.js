const vscode = require('vscode');
const logger = require('./logger');
const { Configuration } = require('./configuration');
const { neteaseStockProvider } = require('./provider');
const {
	calcFixedNumber,
	keepDecimal,
	codeConvert,
	isCurrentTimeInShowTime,
} = require('./utils');

let statusBarItems = {};
let stockCodes = [];
let timer = null;
let showTimer = null;

exports.activate = function activate(context) {
	init();
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(handleConfigChange),
	);
};

exports.deactivate = function deactivate() {};

function init() {
	initShowTimeChecker();
	if (isShowTime()) {
		stockCodes = getStockCodes();
		fetchAllData();
		timer = setInterval(fetchAllData, Configuration.getUpdateInterval());
	} else {
		hideAllStatusBar();
	}
}

function initShowTimeChecker() {
	showTimer && clearInterval(showTimer);
	showTimer = setInterval(() => {
		if (isShowTime()) {
			init();
		} else {
			timer && clearInterval(timer);
			hideAllStatusBar();
		}
	}, 1000 * 60 * 10);
}

function hideAllStatusBar() {
	Object.keys(statusBarItems).forEach((item) => {
		statusBarItems[item].hide();
		statusBarItems[item].dispose();
	});
}

function handleConfigChange() {
	timer && clearInterval(timer);
	showTimer && clearInterval(showTimer);
	const codes = getStockCodes();
	Object.keys(statusBarItems).forEach((item) => {
		if (codes.indexOf(item) === -1) {
			statusBarItems[item].hide();
			statusBarItems[item].dispose();
			delete statusBarItems[item];
		}
	});
	init();
}

function getStockCodes() {
	return Object.keys(Configuration.getStocks()).map(codeConvert);
}

function isShowTime() {
	return isCurrentTimeInShowTime(Configuration.getShowTime());
}

function getItemText(item) {
	const stocks = Configuration.getStocks();
	const customName = stocks[`${item.type.toLowerCase()}${item.symbol}`];
	const label = customName ?? `${item.type}${item.symbol}`;
	return `${label ? label + ' ' : label}${keepDecimal(
		item.price,
		calcFixedNumber(item),
	)} ${keepDecimal(item.percent * 100, 2)}%`;
}

function getTooltipText(item) {
	return (
		`【${item.name}】今日行情\n` +
		`涨跌：${item.updown}   百分：${keepDecimal(item.percent * 100, 2)}%\n` +
		`最高：${item.high}   最低：${item.low}\n` +
		`今开：${item.open}   昨收：${item.yestclose}`
	);
}

function getItemColor(item) {
	return item.percent >= 0
		? Configuration.getRiseColor()
		: Configuration.getFallColor();
}

async function fetchAllData() {
	logger.debug('call fetchAndUpdateStocks');
	try {
		displayData(await neteaseStockProvider.fetch(stockCodes));
	} catch (e) {
		logger.error('%O', e);
	}
}

/**
 *
 * @param {any[]} stocks
 */
function displayData(stocks) {
	stocks.forEach((item) => {
		const key = item.code;
		if (!statusBarItems[key]) {
			statusBarItems[key] = vscode.window.createStatusBarItem(
				vscode.StatusBarAlignment.Left,
				0 - stockCodes.indexOf(item.code),
			);
			statusBarItems[key].show();
		}
		statusBarItems[key].text = getItemText(item);
		statusBarItems[key].color = getItemColor(item);
		statusBarItems[key].tooltip = getTooltipText(item);
	});
}
