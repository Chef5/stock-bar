interface Stock {
	code: string;
	alias: string;
}
type color = string;

export type Stocks = (string|Stock)[];
export type UpdateInterval = number;
export type RiseColor = color;
export type FallColor = color;
