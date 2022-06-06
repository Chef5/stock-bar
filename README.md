# Stock Bar

VScode 插件 | A 股 | 港股 | 实时股票数据 | 状态栏实时更新

Github： https://github.com/Chef5/stock-bar

![image](https://raw.githubusercontent.com/Chef5/stock-bar/main/stock-bar-plugin.png)

> 原作者项目很久没有维护了，这里为了满足个人需求，因此改动了部分代码，增强了部分功能，欢迎star或者fork

> FORK自： https://github.com/TDGarden/stock-watch

## 新功能

- 自定义bar显示：底部默认只会显示股价、百分点这样的纯数字（比较隐秘一点），当然为了区分，也可以自定义显示股票的名称
- 调整hover显示内容

## 配置

修改用户配置，添加你所需要监控的股票代码

```
  // 配置需要监控的股票代码
  // 可根据沪市深市分别加上sh、sz前缀，亦可不加
  // 不加前缀的情况下，6开头的代码默认加上sh，其余加上sz
  // 需要查看上证指数，代码为sh000001

  // 港股股票代码前面需要加上hk前缀，如hk09988即可监控阿里巴巴港股
  // 港股指数代码如下
  // 1.工商指数: hkHSC
  // 2.恒生中国企业指数: hkHSCEI
  // 3.恒生指数: hkHSI
  // 4.红筹指数: hkHSCCI
  // 5.恒生金融分类: hkHSF
  // 6.恒生地产分类: hkHSP
  // 7.恒生公用事业分类: hkHSU
  // 8.标普香港创业板指: hkGEM

  // 美股股票代码前面需要加上US_前缀，如US_AAPL即可监控苹果股票行情
  // 美股指数代码如下
  // 1.道琼斯指数: US_DOWJONES
  // 2.纳斯达克: US_NASDAQ
  // 3.标普500: US_SP500

  // "股票代码": "自定义名称"，自定义名称可以为空字符串，自定义名称建议使用字母（更加隐秘）
  "stock-bar.stocks": {
    "sh000001": "上证"
  },

  // 配置轮询请求最新数据的时间间隔
  "stock-bar.updateInterval": 10000


  // 配置股票涨的颜色，默认跟随系统
  "stock-bar.riseColor": ""


  // 配置股票跌的颜色，默认跟随系统
  "stock-bar.fallColor": ""

  // 配置展示的时间段，默认为[9, 16]，每十分钟判断一下
  "stock-bar.showTime": [9, 16]


```

## 开发贡献

学习：[如何开发一款vscode插件](https://zhuanlan.zhihu.com/p/386196218)

如果有什么更好的建议，欢迎提issue、pr
