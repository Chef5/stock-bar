# Stock Bar

VScode 插件 | A 股 | 港股 | 期货 | 实时股票数据 | 状态栏实时更新

`Stock Bar` 会在开盘期间自动刷新股票数据，并在 VScode 底部状态栏显示股票基本数据，让你在使用 VScode 期间能随时关注到你的股票。

`Stock Bar` 默认只会显示股价、百分点这样的纯数字，当你将鼠标移上去就可以查看详情。当然为了区分，也可以自定义显示股票的名称。

![image](https://img.cdn.1zdz.cn/github/readme/stock-bar-plugin.png)

插件已开源，开源地址：[Github](https://github.com/Chef5/stock-bar)，欢迎点星星 ⭐️、提 issue 或者 pr

## 命令

`Ctrl/Cmd + Shift + P` 打开命令输入面板：

- `Show Stock Bar` 显示 Stock Bar
- `Hide Stock Bar` 关闭 Stock Bar（后台不再发起更新数据请求）

## 插件配置

修改用户配置，添加你所需要监控的股票代码

```js
// 股票配置：数组
"stock-bar.stocks": [
  "sh000001", // 可以直接添加股票代码字符串
  {
    "code": "sz000001", // 也可以添加详细配置
    "alias":  "平安",
    "hold_price": 0,
    "hold_number": 0
  }
],

// 期货配置：数组
"stock-bar.futures": [
  {
    "code": "cu2409",
    "alias":  "铜",
    "hold_price": 0,
    "hold_number": -1
  }
],

// 更新数据时间间隔，单位：毫秒
"stock-bar.updateInterval": 10000

// 股票涨的颜色，默认跟随系统
"stock-bar.riseColor": ""

// 股票跌的颜色，默认跟随系统
"stock-bar.fallColor": ""
```

## 股票配置说明

股票配置可以股票代码字符串，也可以进行一下配置：

- **code**: `string`，股票代码，需要添加股市前缀，前缀参考文档下方：前缀说明
- **alias**: `string`，别名，默认为空
- **hold_price**: `number`，持仓价格，非必填，默认为0
- **hold_number**: `number`，持仓数量，非必填，默认为0

股票代码字符串时，如：`["sz000001"]` 等价于 `[{"code": "sz000001", "alias": "", "hold_price": 0, "hold_number": 0}]`

## 期货配置说明

- **code**: `string`，期货代码, 如：`cu2409`、`sa2409`
- **alias**: `string`，期货别名
- **hold_price**: `number`，持仓价格，即多空单的价格
- **hold_number**: `number`，持仓，正数代表持有多单，负数代表持有空单


## 前缀说明

- **sh**：沪市，不加前缀的情况下，`6` 开头的代码默认加上 `sh`（上证指数：`sh000001`）
- **sz**：深市，不加前缀的情况下，除 `6` 开头的代码外，默认加上 `sz`
- **hk**：港股，如：阿里巴巴港股 `hk09988`
- **US_**：美股，如：苹果股票 `US_AAPL`
- **hkHSC**：工商指数（港股指数）
- **hkHSCEI**：恒生中国企业指数（港股指数）
- **hkHSI**：恒生指数（港股指数）
- **hkHSCCI**：红筹指数（港股指数）
- **hkHSF**：恒生金融分类（港股指数）
- **hkHSP**：恒生地产分类（港股指数）
- **hkHSU**：恒生公用事业分类（港股指数）
- **hkGEM**：标普香港创业板指（港股指数）
- **US_DOWJONES**：道琼斯指数（美股指数）
- **US_NASDAQ**：纳斯达克（美股指数）
- **US_SP500**：标普 500（美股指数）

## 更新日志

[CHANGELOG](./CHANGELOG.md)

## 贡献者

感谢这些可爱的贡献者参与开发和维护 Stock Bar，让 `Stock Bar` 更加完美！

<p>
  <a href="https://github.com/arrebole">
    <img src="https://github.com/arrebole.png?size=100" width="100" height="100" style="border-radius: 50%;" />
  </a>
  <a href="https://github.com/Liudon">
    <img src="https://github.com/Liudon.png?size=100" width="100" height="100" style="border-radius: 50%;" />
  </a>
  <a href="https://github.com/weibobo">
    <img src="https://github.com/weibobo.png?size=100" width="100" height="100" style="border-radius: 50%;" />
  </a>
  <a href="https://github.com/boweipacer">
    <img src="https://github.com/boweipacer.png?size=100" width="100" height="100" style="border-radius: 50%;" />
  </a>
  <a href="https://github.com/capadong">
    <img src="https://github.com/capadong.png?size=100" width="100" height="100" style="border-radius: 50%;" />
  </a>
</p>

## 版本许可

本项目开源基于`MIT`开源协议。完整的许可协议请参阅[LICENSE](./LICENSE)文件。

## 源

> 插件源：`Stock Bar`最初 Fork 自[stock-watch](https://github.com/TDGarden/stock-watch)，现在已对其进行了重大重构。

> 股票数据来源：
>
> - 新浪
> - 同花顺
