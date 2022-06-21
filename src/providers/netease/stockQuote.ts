import Configuration from '../../configuration';
import { StockVariableName } from '../../defined';
import { codeConvert, templateReplace } from '../../utils';
import { StockQuote } from '../../interfaces/stockQuote';

export class NeteaseStockQuote extends StockQuote {
	constructor(stock: Record<string, any>) {
		super();
		Object.entries(stock).forEach(([key, val]) => {
			if (key === 'code') {
				this.code = codeConvert(val);
				this.symbol = val;
			} else {
				this[StockVariableName[key]] = val;
			}
		});
	}

	/**
	 * @description 更新
	 * @param origin 数据源
	 * @memberof NeteaseStockQuote
	 */
	renew(origin: StockQuote) {
		Object.entries(origin).forEach(([key, val]) => {
			this[StockVariableName[key]] = val;
		});
	}

	/**
	 * @description 获取状态栏显示
	 * @returns {string} 显示文字
	 * @memberof NeteaseStockQuote
	 */
	getItemText(): string {
		const template = Configuration.getBarTemplate();
		return templateReplace(this.barTemplate || template, this);
	}

	/**
	 * @description 获取状态栏显示
	 * @returns {string} 显示文字
	 * @memberof NeteaseStockQuote
	 */
	getTooltipText(): string {
		const template = Configuration.getTooltipTemplate();
		return templateReplace(this.tooltipTemplate || template, this);
	}
}
