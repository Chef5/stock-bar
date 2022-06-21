import Configuration from './configuration';
import { StockVariableName } from './stock-bar';

import { codeConvert, templateReplace } from './utils';

export default class StandardStock {
	public code: string; // 代码
	public type: string; // 类型
	public status: string; // 状态
	public symbol: string; // 标识
	public name: string; // 名称

	public alias: string; // 昵称
	public barTemplate: string; // 状态栏模板
	public tooltipTemplate: string; // 详情模板
	public color: string; // 颜色
	public day: string; // 日期 mm月dd日

	public percent: number | string; // 百分
	public high: number; // 最高价
	public low: number; // 最低
	public price: number | string; // 当前价格
	public close: number; // 收盘价
	public open: number; // 开盘价
	public updown: number; // 涨跌
	public arrow: number; // 箭头
	public yestclose: number; // 昨收

	public askvol5: number; // 卖5 单位：手
	public askvol4: number; // 卖4
	public askvol3: number; // 卖3
	public askvol2: number; // 卖2
	public askvol1: number; // 卖1

	public bidvol1: number; // 买1
	public bidvol2: number; // 买2
	public bidvol3: number; // 买3
	public bidvol4: number; // 买4
	public bidvol5: number; // 买5

	public ask5: number; // 卖5 元
	public ask4: number; // 卖4
	public ask3: number; // 卖3
	public ask2: number; // 卖2
	public ask1: number; // 卖1

	public bid1: number; // 买1
	public bid2: number; // 买2
	public bid3: number; // 买3
	public bid4: number; // 买4
	public bid5: number; // 买5

	public volume: number; // 成交量
	public turnover: number; // 成交额

	constructor(stock: Record<string, any>, provider?: string) {
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
	 * @memberof StandardStock
	 */
	renew(origin: StandardStock) {
		Object.entries(origin).forEach(([key, val]) => {
			this[StockVariableName[key]] = val;
		});
	}

	/**
	 * @description 获取状态栏显示
	 * @returns {string} 显示文字
	 * @memberof StandardStock
	 */
	getItemText(): string {
		const template = Configuration.getBarTemplate();
		return templateReplace(this.barTemplate || template, this);
	}

	/**
	 * @description 获取状态栏显示
	 * @returns {string} 显示文字
	 * @memberof StandardStock
	 */
	getTooltipText(): string {
		const template = Configuration.getTooltipTemplate();
		return templateReplace(this.tooltipTemplate || template, this);
	}
}
