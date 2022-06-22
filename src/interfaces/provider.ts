import { StockQuote } from './stockQuote';

export interface Provider {
	fetch(codes: string[]): Promise<StockQuote[]>;
}
