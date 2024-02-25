import axios, { AxiosError, AxiosInstance } from 'axios';
import Stock from './stock';

class SinaStockTransform {
	/**
	 * 构造函数
	 */
	constructor(
		private readonly code: string,
		private readonly params: string[],
	) {
		this.params = params;
		this.params[0] = this.params[0].split('"')[1];
		this.code = code.toLowerCase();
	}

	/**
	 * 获取名称
	 */
	get name(): string {
		switch (this.code.slice(0, 2)) {
			case 'sh':
				return String(this.params[0] || '---');
			case 'sz':
				return String(this.params[0] || '---');
			case 'hk':
				return String(this.params[1] || '---');
			case 'us':
				return String(this.params[0] || '---');
			case 'bj':
				return String(this.params[0] || '---');
			default:
				return '---';
		}
	}

	/**
	 * 获取现价
	 */
	get price(): number {
		switch (this.code.slice(0, 2)) {
			case 'sh':
				return Number(this.params[3] || 0);
			case 'sz':
				return Number(this.params[3] || 0);
			case 'hk':
				return Number(this.params[6] || 0);
			case 'us':
				return Number(this.params[1] || 0);
			case 'bj':
				return Number(this.params[3] || 0);
			default:
				return 0;
		}
	}

	/**
	 * 获取最低价
	 */
	get low(): number {
		switch (this.code.slice(0, 2)) {
			case 'sh':
				return Number(this.params[5] || 0);
			case 'sz':
				return Number(this.params[5] || 0);
			case 'hk':
				return Number(this.params[5] || 0);
			case 'us':
				return Number(this.params[7] || 0);
			case 'bj':
				return Number(this.params[5] || 0);
			default:
				return 0;
		}
	}

	/**
	 * 获取最高价
	 */
	get high(): number {
		switch (this.code.slice(0, 2)) {
			case 'sh':
				return Number(this.params[4] || 0);
			case 'sz':
				return Number(this.params[4] || 0);
			case 'hk':
				return Number(this.params[4] || 0);
			case 'us':
				return Number(this.params[6] || 0);
			case 'bj':
				return Number(this.params[4] || 0);
			default:
				return 0;
		}
	}

	/**
	 * 获取昨日收盘价
	 */
	get yestclose(): number {
		switch (this.code.slice(0, 2)) {
			case 'sh':
				return Number(this.params[2] || 0);
			case 'sz':
				return Number(this.params[2] || 0);
			case 'hk':
				return Number(this.params[3] || 0);
			case 'us':
				return Number(this.params[26] || 0);
			case 'bj':
				return Number(this.params[2] || 0);
			default:
				return 0;
		}
	}

	/**
	 * 获取涨跌
	 */
	get percent(): number {
		if (!this.price) {
			return 0;
		}
		return this.fixed((this.price - this.yestclose) / this.yestclose, 4);
	}

	/**
	 * 今开
	 */
	get open(): number {
		return Number(this.params[1]);
	}

	/**
	 * 涨跌价格
	 */
	get updown() {
		return this.fixed(this.price - this.open);
	}

	fixed(n: number, q = 2) {
		return Math.round(n * 10 ** q) / 10 ** q;
	}

	/**
	 * 获取股票数据
	 */
	transform(): Partial<Stock> {
		return {
			code: this.code,
			name: this.name,
			percent: this.percent,
			updown: this.updown,
			price: this.price,
			open: this.open,
			low: this.low,
			high: this.high,
			yestclose: this.yestclose,
		};
	}
}

/**
 * 新浪股票查询接口
 */
class SinaStockProvider {
	httpService: AxiosInstance;

	constructor() {
		this.httpService = axios.create({
			timeout: 10000,
			baseURL: 'https://hq.sinajs.cn',
		});
	}

	/**
	 *
	 * @param codes
	 */
	async fetch(codes: string[]) {
		try {
			const rep = await this.httpService.get('', {
				params: {
					list: codes.join(','),
				},
				headers: {
					referer: 'http://finance.sina.com.cn/',
				},
				responseType: 'arraybuffer',
			});
			const rawData = new TextDecoder('GBK').decode(rep.data);
			const rawStocks = rawData.split(';').map((v) => v.split(','));

			const result = [];
			for (let i = 0; i < codes.length; i++) {
				result.push(new SinaStockTransform(codes[i], rawStocks[i]).transform());
			}
			return result;
		} catch (err: unknown) {
			const error = err as AxiosError;
			/**
			 * @see https://axios-http.com/docs/handling_errors
			 */
			if (error.response) {
				throw new Error(String(error.response.data));
			}
			if (error.request) {
				throw new Error('The request was made but no response was received');
			}
			throw new Error(error.message);
		}
	}
}

export const sinaStockProvider = new SinaStockProvider();
