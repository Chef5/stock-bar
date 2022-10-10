import Stock from './stock';

export const keepDecimal = (num: number, fixed: number) => {
	const result = parseFloat(String(num));
	if (isNaN(result)) {
		return '--';
	}
	return result.toFixed(fixed);
};

export const calcFixedNumber = (item: Stock) => {
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
