export interface StockOption {
	code: string;
	alias?: string;
	barTemplate?: string;
	tooltipTemplate?: string;
}
type color = string;

export type StockOptions = (string | StockOption)[];
export type UpdateIntervalOption = number;
export type RiseColorOption = color;
export type FallColorOption = color;

export enum StockVariableName {
	code = 'code', // 代码
	type = 'type', // 类型
	status = 'status', // 状态
	symbol = 'symbol', // 标识
	name = 'name', // 名称

	alias = 'alias', // 昵称
	barTemplate = 'barTemplate', // 状态栏模板
	tooltipTemplate = 'tooltipTemplate', // 详情模板
	color = 'color', // 颜色
	day = 'day', // 日期 mm月dd日

	percent = 'percent', // 百分
	high = 'high', // 最高价
	low = 'low', // 最低
	price = 'price', // 当前价格
	close = 'close', // 收盘价
	open = 'open', // 开盘价
	updown = 'updown', // 涨跌
	arrow = 'arrow↓', // 箭头
	yestclose = 'yestclose', // 昨收

	askvol5 = 'askvol5', // 卖5 手
	askvol4 = 'askvol4', // 卖4
	askvol3 = 'askvol3', // 卖3
	askvol2 = 'askvol2', // 卖2
	askvol1 = 'askvol1', // 卖1

	bidvol1 = 'bidvol1', // 买1
	bidvol2 = 'bidvol2', // 买2
	bidvol3 = 'bidvol3', // 买3
	bidvol4 = 'bidvol4', // 买4
	bidvol5 = 'bidvol5', // 买5

	ask5 = 'ask5', // 卖5
	ask4 = 'ask4', // 买4
	ask3 = 'ask3', // 买3
	ask2 = 'ask2', // 买2
	ask1 = 'ask1', // 买1

	bid1 = 'bid1', // 买1
	bid2 = 'bid2', // 买2
	bid3 = 'bid3', // 买3
	bid4 = 'bid4', // 买4
	bid5 = 'bid5', // 买5

	volume = 'volume', // 成交量
	turnover = 'turnover', // 成交额
}
