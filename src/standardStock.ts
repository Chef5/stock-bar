import { StockVariableName } from './stock-bar';

import { calcFixedNumber, keepDecimal, calcVolume } from './utils';

export default class StandardStock {
	code = ''; // 代码
	type = ''; // 类型
	status = ''; // 状态
	symbol = ''; // 标识
	name = ''; // 名称
	alias = ''; // 昵称

	percent = ''; // 百分
	high = ''; // 最高价
	low = ''; // 最低
	price = ''; // 当前价格
	close = ''; // 收盘价
	open = ''; // 开盘价
	updown = ''; // 涨跌
	arrow = ''; // 箭头
	yestclose = ''; // 昨收

	askvol5 = 0; // 卖5  Math.ceil(n/100)=手
	askvol4 = 0; // 卖4
	askvol3 = 0; // 卖3
	askvol2 = 0; // 卖2
	askvol1 = 0; // 卖1

	bidvol1 = 0; // 买1
	bidvol2 = 0; // 买2
	bidvol3 = 0; // 买3
	bidvol4 = 0; // 买4
	bidvol5 = 0; // 买5

	ask5 = '-'; // 卖5 元
	ask4 = '-'; // 卖4
	ask3 = '-'; // 卖3
	ask2 = '-'; // 卖2
	ask1 = '-'; // 卖1

	bid1 = '-'; // 买1
	bid2 = '-'; // 买2
	bid3 = '-'; // 买3
	bid4 = '-'; // 买4
	bid5 = '-'; // 买5

	volume = '-'; // 成交量
	turnover = '-'; // 成交额

	constructor(stock: Record<string, any>, provider?: string) {
		// TODO: 根据不同供应商转换
		Object.entries(stock).forEach(([key, val]) => {
			this[StockVariableName[key]] = val;
		});

		this.calculate(); // 计算数据
	}

	/**
	 * @description 计算数据
	 * @memberof StandardStock
	 */
	calculate() {
		this.calculatePercent(); // 计算百分比
		this.calculatePrice(); // 计算价格
		this.calculateVolume(); // 计算手数
	}

	/**
	 * @description 计算百分比
	 * @memberof StandardStock
	 */
	calculatePercent() {
		if (this.percent) {
			this.percent = keepDecimal(Number(this.percent) * 100, 2);
		}
	}

	/**
	 * @description 计算价格
	 * @memberof StandardStock
	 */
	calculatePrice() {
		if (this.price) {
			this.price = keepDecimal(Number(this.price), calcFixedNumber(this));
		}
	}

	/**
	 * @description 计算手数
	 * @memberof StandardStock
	 */
	calculateVolume() {
		for (let i = 1; i <= 5; i++) {
			if (this[`askvol${i}`]) {
				this[`askvol${i}`] = calcVolume(this[`askvol${i}`]);
			}
			if (this[`bidvol${i}`]) {
				this[`bidvol${i}`] = calcVolume(this[`bidvol${i}`]);
			}
		}
		if (this.volume) {
			this.volume = `${calcVolume(Number(this.volume))}`;
		}
	}
}
