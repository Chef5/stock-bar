export default class Stock {
	code: string;
	symbol: string;
	name: string | null;
	alias: string;
	hold_price = 0;
	hold_number = 0;
	price = 0;
	updown = 0;
	percent = 0;
	high = 0;
	low = 0;
	open = 0;
	yestclose = 0;

	constructor(
		code: string,
		alias?: string | undefined,
		hold_price?: number | undefined,
		hold_number?: number | undefined,
	) {
		this.code = code;
		this.symbol = code;
		this.name = null;
		this.alias = alias ?? '';
		this.hold_price = hold_price ?? 0;
		this.hold_number = hold_number ?? 0;
	}
	update(origin: Stock) {
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
