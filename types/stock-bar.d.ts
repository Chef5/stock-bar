declare module 'stock-bar' {
	export interface StockOption {
		code: string;
		alias: string;
	}
	type color = string;
	
	export type StockOptions = (string|StockOption)[];
	export type UpdateIntervalOption = number;
	export type RiseColorOption = color;
	export type FallColorOption = color;
}
