import Configuration from '../../configuration';
import type { Transformer } from '../../interfaces/transformer';
import type { StockQuote } from '../../interfaces/stockQuote';
import { NeteaseStockQuote } from './stockQuote';
import {
	calcFixedNumber,
	calcVolume,
	getToday,
	keepDecimal,
} from '../../utils';

export class NeteaseTransformer implements Transformer {
	/**
	 * @description 网易 -> 标准股票
	 * @param data 网易数据
	 * @param stock 标准股票
	 * @returns {NeteaseStockQuote} 标准股票
	 * @memberof NeteaseTransformer
	 */
	transform(data: Record<string, any>): StockQuote {
		const standardStock = new NeteaseStockQuote({});
		// 挨个转换数据
		standardStock.code = data.code;
		standardStock.type = data.type;
		standardStock.status = data.status;
		standardStock.symbol = data.symbol;
		standardStock.name = data.name;
		standardStock.color = this.calculateColor(data.percent);
		standardStock.percent = this.calculatePercent(data.percent);
		standardStock.high = data.high;
		standardStock.low = data.low;
		standardStock.close = data.close;
		standardStock.open = data.open;
		standardStock.updown = data.updown;
		standardStock.arrow = data.arrow;
		standardStock.yestclose = data.yestclose;
		standardStock.price = this.calculatePrice(data.price, standardStock);

		standardStock.askvol5 = this.calculateVolume(data.askvol5);
		standardStock.askvol4 = this.calculateVolume(data.askvol4);
		standardStock.askvol3 = this.calculateVolume(data.askvol3);
		standardStock.askvol2 = this.calculateVolume(data.askvol2);
		standardStock.askvol1 = this.calculateVolume(data.askvol1);
		standardStock.bidvol1 = this.calculateVolume(data.bidvol1);
		standardStock.bidvol2 = this.calculateVolume(data.bidvol2);
		standardStock.bidvol3 = this.calculateVolume(data.bidvol3);
		standardStock.bidvol4 = this.calculateVolume(data.bidvol4);
		standardStock.bidvol5 = this.calculateVolume(data.bidvol5);
		standardStock.ask5 = data.ask5;
		standardStock.ask4 = data.ask4;
		standardStock.ask3 = data.ask3;
		standardStock.ask2 = data.ask2;
		standardStock.ask1 = data.ask1;
		standardStock.bid1 = data.bid1;
		standardStock.bid2 = data.bid2;
		standardStock.bid3 = data.bid3;
		standardStock.bid4 = data.bid4;
		standardStock.bid5 = data.bid5;

		standardStock.volume = this.calculateVolume(data.volume);
		standardStock.turnover = data.turnover;

		standardStock.day = getToday();
		return standardStock;
	}

	/**
	 * @description 计算颜色
	 * @param {number} percent 百分比
	 * @memberof NeteaseTransformer
	 */
	calculateColor(percent: number) {
		return percent >= 0
			? Configuration.getRiseColor()
			: Configuration.getFallColor();
	}

	/**
	 * @description 计算百分比，保留2位小数 xx.xx
	 * @param {number} percent 百分比
	 * @memberof Transformer
	 */
	calculatePercent(percent: number) {
		return keepDecimal(percent * 100, 2);
	}

	/**
	 * @description 计算价格，保留2位小数 xx.xx
	 * @param {number} price 价格
	 * @param {NeteaseStockQuote} stock 股票数据
	 * @memberof NeteaseTransformer
	 */
	calculatePrice(price: number, stock: NeteaseStockQuote) {
		return keepDecimal(Number(price), calcFixedNumber(stock));
	}

	/**
	 * @description 计算手数
	 * @param {number} vol 量
	 * @memberof NeteaseTransformer
	 */
	calculateVolume(vol: number) {
		return calcVolume(vol);
	}
}
