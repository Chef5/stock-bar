declare module 'stock-bar' {
	export interface StockOption {
		code: string;
		alias: string;
	}
	type color = string;

	export interface FutureOption {
		code: string;
		alias?: string;
		hold_price?: number; //持仓成本
		hold_number?: number; //持仓, 1代表多，-1代表空
	}

	export type StockOptions = (string | StockOption)[];
	export type FutureOptions = FutureOption[];
	export type UpdateIntervalOption = number;
	export type RiseColorOption = color;
	export type FallColorOption = color;
}
