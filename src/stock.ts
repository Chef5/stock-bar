import { codeConvert } from './utils';

export default class StockInstance {
	code: string;
	symbol: string;
	name: string | null;
	alias: string;
	price: number;
	updown: number;
	percent: number;
	high: number;
	low: number;
	open: number;
	yestclose: number;

	constructor(code: string, alias?: string | undefined) {
		this.code = codeConvert(code);
		this.symbol = code;
		this.name = null;
		this.alias = alias ?? '';
		this.price = 0;
		this.updown = 0;
		this.percent = 0;
		this.high = 0;
		this.low = 0;
		this.open = 0;
		this.yestclose = 0;
	}
	update(origin: StockInstance) {
		this.name = origin.name;
		this.price = origin.price;
		this.high = origin.high;
		this.low = origin.low;
		this.updown = origin.updown;
		this.percent = origin.percent;
		this.open = origin.open;
		this.yestclose = origin.yestclose;
	}
}
