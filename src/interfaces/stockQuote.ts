
export abstract class StockQuote {
    code: string; // 代码
    type: string; // 类型
    status: string; // 状态
    symbol: string; // 标识
    name: string; // 名称

    alias: string; // 昵称
    barTemplate: string; // 状态栏模板
    tooltipTemplate: string; // 详情模板
    color: string; // 颜色
    day: string; // 日期 mm月dd日

    percent: number | string; // 百分
    high: number; // 最高价
    low: number; // 最低
    price: number | string; // 当前价格
    close: number; // 收盘价
    open: number; // 开盘价
    updown: number; // 涨跌
    arrow: number; // 箭头
    yestclose: number; // 昨收

    askvol5: number; // 卖5 单位：手
    askvol4: number; // 卖4
    askvol3: number; // 卖3
    askvol2: number; // 卖2
    askvol1: number; // 卖1

    bidvol1: number; // 买1
    bidvol2: number; // 买2
    bidvol3: number; // 买3
    bidvol4: number; // 买4
    bidvol5: number; // 买5

    ask5: number; // 卖5 元
    ask4: number; // 卖4
    ask3: number; // 卖3
    ask2: number; // 卖2
    ask1: number; // 卖1

    bid1: number; // 买1
    bid2: number; // 买2
    bid3: number; // 买3
    bid4: number; // 买4
    bid5: number; // 买5

    volume: number; // 成交量
    turnover: number; // 成交额

    /**
     * @description 更新
     * @param origin 数据源
     * @memberof StandardStock
     */
    abstract renew(origin: StockQuote): void

    /**
     * @description 获取状态栏显示
     * @returns {string} 显示文字
     * @memberof StandardStock
     */
    abstract getItemText(): string

    /**
     * 获取状态栏显示
     * @returns {string} 显示文字
     * @memberof StandardStock
     */
    abstract getTooltipText(): string
}