function keepDecimal(num, fixed) {
	var result = parseFloat(num);
	if (isNaN(result)) {
		return '--';
	}
	return result.toFixed(fixed);
}

function calcFixedNumber(item) {
	var high =
		String(item.high).indexOf('.') === -1
			? 0
			: String(item.high).length - String(item.high).indexOf('.') - 1;
	var low =
		String(item.low).indexOf('.') === -1
			? 0
			: String(item.low).length - String(item.low).indexOf('.') - 1;
	var open =
		String(item.open).indexOf('.') === -1
			? 0
			: String(item.open).length - String(item.open).indexOf('.') - 1;
	var yest =
		String(item.yestclose).indexOf('.') === -1
			? 0
			: String(item.yestclose).length - String(item.yestclose).indexOf('.') - 1;
	var updown =
		String(item.updown).indexOf('.') === -1
			? 0
			: String(item.updown).length - String(item.updown).indexOf('.') - 1;
	var max = Math.max(high, low, open, yest, updown);

	if (max === 0) {
		max = 2;
	}

	return max;
}

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
function codeConvert(code) {
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
}

/**
 * 判断当前时间是否在区间内
 */
function isCurrentTimeInShowTime(customShowTime) {
	let showTime = [0, 23];
	if (
		Array.isArray(customShowTime) &&
		customShowTime.length === 2 &&
		customShowTime[0] <= customShowTime[1]
	) {
		showTime = customShowTime;
	}
	const now = new Date().getHours();
	return now >= showTime[0] && now <= showTime[1];
}

module.exports = {
	keepDecimal,
	calcFixedNumber,
	codeConvert,
	isCurrentTimeInShowTime,
};
