import { codeConvert } from './utils';

export default class Stock {
	code: string;
	symbol: string;
	name: string | null;
	alias: string;
	barTemplate: string;
	tooltipTemplate: string;

	price = 0;
	updown = 0;
	percent = 0;
	high = 0;
	low = 0;
	open = 0;
	yestclose = 0;

	constructor(
		code: string,
		alias?: string,
		barTemplate?: string,
		tooltipTemplate?: string,
	) {
		this.code = codeConvert(code);
		this.symbol = code;
		this.name = null;
		this.alias = alias ?? '';
		this.barTemplate = barTemplate ?? '';
		this.tooltipTemplate = tooltipTemplate ?? '';
	}
	update(origin: Stock) {
		Object.entries(origin).forEach(([key, val]) => {
			this[key] = val;
		});
	}
}
