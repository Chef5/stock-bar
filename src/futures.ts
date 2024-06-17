// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/stock-bar.d.ts" />

import axios, { AxiosInstance } from 'axios';
import { FutureOption } from 'stock-bar';
import logger from './logger';

class Provider {
	instance: AxiosInstance;
	constructor() {
		this.instance = axios.create({
			timeout: 8000,
		});
	}

	async getBasicInfo(code: string) {
		try {
			const url = `https://fupage.10jqka.com.cn/futgwapi/api/f10/contract/v1/info?code=${code}`;
			const results = await Promise.all([
				this.instance.get(`https://fupage.10jqka.com.cn/futgwapi/api/f10/contract/v1/info?code=${code.toUpperCase()}`),
				this.instance.get(`https://fupage.10jqka.com.cn/futgwapi/api/f10/contract/v1/info?code=${code.toLowerCase()}`)
			])
			const data = results[0].data.data || results[1].data.data || {};
			const name = data.name || '';
			const tradeUnit = (data.trade_unit || '').trim();
			let ratio = 0;
			if (tradeUnit) {
				const match = tradeUnit.match(/^\d*/);
				if (match && match.length > 0) {
					ratio = parseFloat(match[0]) || 0;
				}
			}
			return {
				code,
				name,
				ratio,
			};
		} catch (err: unknown) {
			logger.error('getBasicInfo error %O', err);
			return null;
		}
	}

	async getLatestPrice(code: string) {
		try {
			const headers = {
				Referer: 'https://goodsfu.10jqka.com.cn/',
				'Content-Type': 'application/json',
			};
			const url = `https://d.10jqka.com.cn/v6/time/qh_${code}/last.js`;
			const ret = (await this.instance.get(url, { headers })).data;
			const match = ret.match(/\(({.*})\)/);
			if (!match) {
				return null;
			}

			const js = JSON.parse(match[1]);
			const keys = Object.keys(js);
			if (keys.length <= 0) {
				return null;
			}
			const data = js[keys[0]];
			const pre_price = parseFloat(data['pre']);
			const allLines = (data['data'] || '').split(';');
			if (allLines.length <= 0) {
				return null;
			}
			const lastLine = allLines[allLines.length - 1];
			if (!lastLine) return null;
			const lineArr = lastLine.split(',');
			const current_price = parseFloat(lineArr[1]);
			const name = data['name'] || '';
			return {
				name,
				pre_price,
				current_price,
			};
		} catch (err: unknown) {
			logger.error('getLastestPrice error %O', err);
			return null;
		}
	}
}

class ProviderSina extends Provider {
	async getLatestPrice(code: string) {
		try {
			const headers = {
				Referer: 'https://finance.sina.com.cn',
				'Content-Type': 'application/json',
			};
			const url = `https://hq.sinajs.cn?list=nf_${code}`;
			let ret = (await this.instance.get(url, { headers, responseType:'arraybuffer'})).data;
			ret = new TextDecoder('GBK').decode(ret);
			const match = ret.match(/\"(.*)\"/);
			if (!match) {
				return null;
			}
			const arr = match[1].split(',');
			if (arr.length <= 5) { return null; }
			const name = arr[0];
			const open = parseFloat(arr[2]);
			const high = parseFloat(arr[3]);
			const low = parseFloat(arr[4]);
			const current_price = parseFloat(arr[8]);
			const pre_price = parseFloat(arr[10]);
			return {
				name,
				pre_price,
				current_price,
			};
		} catch (err: unknown) {
			logger.error('getLastestPrice error %O', err);
			return null;
		}
	}
}

const provider = new ProviderSina();

export class FutureData {
	code: string;
	name = '';
	alias: string;
	hold_price = 0;
	hold_number = 0;
	ratio = 0;
	inited = false;
	init_times = 0;
	price: {
		pre_price: number;
		current_price: number;
	} = null;

	constructor(option: FutureOption) {
		this.syncConfig(option);
	}

	syncConfig(option: FutureOption) {
		this.code = option.code;
		this.alias = option.alias || '';
		this.hold_number = option.hold_number || 0;
		this.hold_price = option.hold_price || 0;
	}

	async updateConfig() {
		if (this.inited) {
			return;
		}
		this.init_times++;
		const info = await provider.getBasicInfo(this.code);
		console.log('updateConfig', info);
		if (info) {
			this.inited = true;
			if (!this.name) {
				this.name = info.name;
			}
			this.ratio = info.ratio;
			return;
		}
		if (this.init_times >= 3) {
			this.inited = true;
			return;
		}
	}

	async updatePrice() {
		const info = await provider.getLatestPrice(this.code);
		if (info) {
			this.price = info;
			this.name = info.name;
		}
	}
}

export default class FutureHandler {
	futures: FutureData[] = [];

	updateConfig(options: FutureOption[]) {
		//logger.debug('future updateConfig');
		const newFutures = [];
		for (const option of options) {
			let future = this.futures.find((item) => item.code == option.code);
			if (future == null) {
				future = new FutureData(option);
			} else {
				future.syncConfig(option);
			}
			newFutures.push(future);
		}
		this.futures = newFutures;
	}

	async updateData() {
		if (this.futures.length <= 0) {
			return;
		}
		await Promise.all(this.futures.map((item) => item.updateConfig()));
		await Promise.all(this.futures.map((item) => item.updatePrice()));
	}
}

async function testGetBasicInfo() {
	const data = await provider.getBasicInfo('cu2409');
	console.log(data);
}

async function testGetPrice() {
	const data = await provider.getLatestPrice('CU2409');
	console.log(data);
}

testGetBasicInfo();