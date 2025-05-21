import axios, { AxiosError, AxiosInstance } from 'axios';
import Stock from './stock';
import Configuration from './configuration';

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
			case 'gb':
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
			case 'gb':
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
			case 'gb':
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
			case 'gb':
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
			case 'gb':
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
		switch (this.code.slice(0, 2)) {
			case 'hk':
				return Number(this.params[2] || 0);
			default:
				return Number(this.params[1] || 0);
		}
	}

	/**
	 * 涨跌价格
	 */
	get updown() {
		return this.fixed(this.price - this.yestclose);
	}

	fixed(n: number, q = 3) {
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

/**
 * qos.hk股票查询接口
 */
class QosHkStockProvider {
	httpService: AxiosInstance;

	constructor() {
		this.httpService = axios.create({
			timeout: 10000,
			baseURL: 'https://api.qos.hk',
		});
	}

	/**
	 * 将股票代码格式化为qos.hk接口需要的格式
	 * @param codes
	 */
	formatCodes(codes: string[]): string[] {
		const groups: Record<string, string[]> = {
			US: [],
			HK: [],
			SH: [],
			SZ: [],
			CF: [],
		};

		codes.forEach((code) => {
			const upperCode = code.toUpperCase();
			if (upperCode.startsWith('GB_')) {
				// 美股
				groups.US.push(upperCode.replace('GB_', ''));
			} else if (upperCode.startsWith('HK')) {
				// 港股
				groups.HK.push(upperCode.replace('HK', ''));
			} else if (upperCode.startsWith('SH')) {
				// 上证
				groups.SH.push(upperCode.replace('SH', ''));
			} else if (upperCode.startsWith('SZ')) {
				// 深证
				groups.SZ.push(upperCode.replace('SZ', ''));
			}
		});

		// 构建请求格式
		return Object.entries(groups)
			.filter(([_, codes]) => codes.length > 0)
			.map(([market, codes]) => `${market}:${codes.join(',')}`);
	}

	/**
	 * 将qos.hk返回的数据转换为Stock格式
	 * @param data
	 */
	transformQosData(data: any[]): Partial<Stock>[] {
		return data.map((item) => {
			const code = item.c.toLowerCase();
			const prefixMap: Record<string, string> = {
				'us:': 'gb_',
				'hk:': 'hk',
				'sh:': 'sh',
				'sz:': 'sz',
				'cf:': 'cf',
			};

			// 从原始代码中提取市场和股票代码
			const [market, stockCode] = item.c.split(':');
			// 构建符合现有系统的code格式
			let formattedCode = '';

			if (market.toUpperCase() === 'US') {
				formattedCode = `gb_${stockCode.toLowerCase()}`;
			} else {
				formattedCode = `${market.toLowerCase()}${stockCode}`;
			}

			// 计算涨跌幅
			const price = Number(item.lp);
			const yestclose = Number(item.yp);
			const percent = yestclose ? (price - yestclose) / yestclose : 0;
			const updown = price - yestclose;

			return {
				code: formattedCode,
				name: formattedCode, // qos.hk接口不返回名称，直接使用code
				price: price,
				open: Number(item.o),
				high: Number(item.h),
				low: Number(item.l),
				percent: Number(percent.toFixed(4)),
				updown: Number(updown.toFixed(3)),
				yestclose: yestclose,
			};
		});
	}

	/**
	 * 获取数据
	 * @param codes 股票代码数组
	 */
	async fetch(codes: string[]) {
		// 获取token
		const token = Configuration.getQosHkToken();
		if (!token) {
			throw new Error('未配置QOS.HK的Token，请检查配置');
		}

		try {
			// 处理请求数据格式
			const formattedCodes = this.formatCodes(codes);
			if (formattedCodes.length === 0) {
				return [];
			}

			const rep = await this.httpService.post(`/snapshot?key=${token}`, {
				codes: formattedCodes,
			});

			if (rep.data.msg !== 'OK' || !rep.data.data) {
				throw new Error(`请求失败: ${rep.data.msg || '未知错误'}`);
			}

			return this.transformQosData(rep.data.data);
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

/**
 * 提供一个统一的接口，根据配置选择使用哪个provider
 */
class StockProvider {
	private sinaProvider: SinaStockProvider;
	private qosHkProvider: QosHkStockProvider;

	constructor() {
		this.sinaProvider = new SinaStockProvider();
		this.qosHkProvider = new QosHkStockProvider();
	}

	/**
	 * 获取股票数据
	 * @param codes
	 */
	async fetch(codes: string[]) {
		const useQosForHkUs = Configuration.getUseQosForHkUs();

		// 如果未开启qos.hk或没有配置token，全部使用新浪接口
		if (!useQosForHkUs || !Configuration.getQosHkToken()) {
			return this.sinaProvider.fetch(codes);
		}

		// 把代码分为两组：港美股(qos.hk) 和 A股(新浪)
		const hkUsCodes = codes.filter((code) => {
			const lowerCode = code.toLowerCase();
			return lowerCode.startsWith('hk') || lowerCode.startsWith('gb_');
		});

		const aCodes = codes.filter((code) => {
			const lowerCode = code.toLowerCase();
			return (
				lowerCode.startsWith('sh') ||
				lowerCode.startsWith('sz') ||
				lowerCode.startsWith('bj')
			);
		});

		const results: Partial<Stock>[] = [];

		// 并行获取数据
		if (hkUsCodes.length > 0 && aCodes.length > 0) {
			const [hkUsData, aData] = await Promise.all([
				this.qosHkProvider.fetch(hkUsCodes),
				this.sinaProvider.fetch(aCodes),
			]);
			return [...hkUsData, ...aData];
		} else if (hkUsCodes.length > 0) {
			return await this.qosHkProvider.fetch(hkUsCodes);
		} else {
			return await this.sinaProvider.fetch(aCodes);
		}
	}
}

export const sinaStockProvider = new SinaStockProvider();
export const stockProvider = new StockProvider();
