const vscode = require('vscode');
const logger = require('./logger');
const { neteaseStockProvider } = require('./provider');
const { calcFixedNumber, keepDecimal, codeConvert, isCurrentTimeInShowTime } = require('./utils');

let statusBarItems = {};
let stockCodes = [];
let updateInterval = 10000;
let timer = null;
let showTimer = null;

exports.activate = function activate(context) {
	init();
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(handleConfigChange)
	);
}

exports.deactivate = function deactivate() {}

function init() {
	initShowTimeChecker();
	if (isShowTime()) {
		stockCodes = getStockCodes();
		updateInterval = getUpdateInterval();
		fetchAllData();
		timer = setInterval(fetchAllData, updateInterval);
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
	const config = vscode.workspace.getConfiguration();
	const stocks = Object.keys(config.get('stock-bar.stocks'));
	return stocks.map(codeConvert);
}

function getUpdateInterval() {
	const config = vscode.workspace.getConfiguration();
	return config.get('stock-bar.updateInterval');
}

function isShowTime() {
	const config = vscode.workspace.getConfiguration();
	const configShowTime = config.get('stock-bar.showTime');
	return isCurrentTimeInShowTime(configShowTime)
}

async function fetchAllData() {
	logger.debug('call fetchAllData');
	try {
		displayData(
			await neteaseStockProvider.fetch(stockCodes),
		);
	} catch (e){
		logger.error('%O', e);
	}
}

function getItemText(item) {
	const config = vscode.workspace.getConfiguration();
	const stocks = config.get('stock-bar.stocks');
  	const customName = stocks[`${item.type.toLowerCase()}${item.symbol}`];
  	const label = customName === null || customName === undefined ? `${item.type}${item.symbol}` : customName;
	return `${label?label + ' ':label}${keepDecimal(item.price, calcFixedNumber(item))} ${keepDecimal(item.percent * 100, 2)}%`;
}

function getTooltipText(item) {
	return `【${item.name}】今日行情\n涨跌：${
		item.updown
	}   百分：${keepDecimal(item.percent * 100, 2)}%\n最高：${
		item.high
	}   最低：${item.low}\n今开：${item.open}   昨收：${item.yestclose}`;
}

function getItemColor(item) {
	const config = vscode.workspace.getConfiguration();
	const riseColor = config.get('stock-bar.riseColor');
	const fallColor = config.get('stock-bar.fallColor');

	return item.percent >= 0 ? riseColor : fallColor;
}

async function fetchAllData() {
	logger.debug('call fetchAllData');
	try {
		displayData(
			await neteaseStockProvider.fetch(stockCodes),
		);
	} catch (e){
		logger.error('%O', e);
	}
}

function displayData(data) {
	data.map((item) => {
		const key = item.code;
		if (statusBarItems[key]) {
			statusBarItems[key].text = getItemText(item);
			statusBarItems[key].color = getItemColor(item);
			statusBarItems[key].tooltip = getTooltipText(item);
		} else {
			statusBarItems[key] = createStatusBarItem(item);
		}
	});
}

function createStatusBarItem(item) {
	const barItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		0 - stockCodes.indexOf(item.code)
	);
	barItem.text = getItemText(item);
	barItem.color = getItemColor(item);
	barItem.tooltip = getTooltipText(item);
	barItem.show();
	return barItem;
}