import { StockQuote } from './interfaces/stockQuote';

export const keepDecimal = (num: number, fixed: number) => {
	const result = parseFloat(String(num));
	if (isNaN(result)) {
		return '--';
	}
	return result.toFixed(fixed);
};

export const calcFixedNumber = (item: StockQuote) => {
	const high =
		String(item.high).indexOf('.') === -1
			? 0
			: String(item.high).length - String(item.high).indexOf('.') - 1;
	const low =
		String(item.low).indexOf('.') === -1
			? 0
			: String(item.low).length - String(item.low).indexOf('.') - 1;
	const open =
		String(item.open).indexOf('.') === -1
			? 0
			: String(item.open).length - String(item.open).indexOf('.') - 1;
	const yest =
		String(item.yestclose).indexOf('.') === -1
			? 0
			: String(item.yestclose).length - String(item.yestclose).indexOf('.') - 1;
	const updown =
		String(item.updown).indexOf('.') === -1
			? 0
			: String(item.updown).length - String(item.updown).indexOf('.') - 1;
	let max = Math.max(high, low, open, yest, updown);

	if (max === 0) {
		max = 2;
	}

	return max;
};

/**
 * @description 计算手数
 * @param num 股数
 */
export const calcVolume = (num: number) => {
	return Math.ceil(num / 100);
};

/**
 * 股票代码转换器，(网易接口需要该格式的代码)
 * 转换之后 0 开头为上海市场 1开头为深圳市场
 * us_xxxx => us_xxxx
 * hkxxxx  => hkxxxx
 * szxxxx  => 1xxxxx
 * shxxxx  => 0xxxxx
 * 6xxxxx  => 0xxxxx
 * 0xxxxx  => 1xxxxx
 * @param {string} code
 * @returns
 */
export const codeConvert = (code: string) => {
	if (isNaN(Number(code[0]))) {
		if (code.toLowerCase().indexOf('us_') > -1) {
			return code.toUpperCase();
		}
		if (code.indexOf('hk') > -1) {
			return code;
		}
		return code.toLowerCase().replace('sz', '1').replace('sh', '0');
	}
	return (code[0] === '6' ? '0' : '1') + code;
};

/**
 * @description 模板替换，变量使用 ${}
 * @param {string} template 模板
 * @param {Record<string, any>} data 数据
 * @returns
 */
export const templateReplace = (
	template: string,
	data: Record<string, any> = {},
) => {
	if (typeof template === 'string') {
		return template.replace(
			/\$\{\s*([$#@\-\d\w]+)\s*\}/gim,
			(fullMath, grp: string) => {
				const val = data[grp];
				if (typeof val === 'function') {
					return val();
				} else if (val === null || val === undefined) {
					return '';
				} else if (typeof val === 'object' || typeof val === 'symbol') {
					return val.toString();
				}
				return val.valueOf();
			},
		);
	}
	return '';
};

/**
 * @description 向前填充字符
 * @param {number | string} val 源字符串
 * @param {number} len 长度
 * @param {string} char 字符
 * @returns
 */
export const padStart = (val: number | string, len = 2, char = '0'): string => {
	return String(val).padStart(len, char);
};

/**
 * @description 向后填充字符
 * @param {number | string} val 源字符串
 * @param {number} len 长度
 * @param {string} char 字符
 * @returns
 */
export const padEnd = (val: number | string, len = 2, char = '0'): string => {
	return String(val).padEnd(len, char);
};

/**
 * @description 获取今天日期
 */
export const getToday = () => {
	const dt = new Date();
	return `${padStart(dt.getMonth() + 1)}月${padStart(dt.getDate())}日`;
};
