import { StockQuote } from "./stockQuote";

export interface Transformer {
    transform(data: Record<string, any>): StockQuote;
}