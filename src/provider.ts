import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * 网易股票查询接口
 */
class NeteaseStockProvider {
	httpService: AxiosInstance;

	constructor() {
		this.httpService = axios.create({
			timeout: 10000,
			baseURL: 'https://api.money.126.net/data/feed',
		});
	}

	/**
	 *
	 * @param codes
	 */
	async fetch(codes: string[]) {
		try {
			const rep = await this.httpService.get(`${codes.join(',')}?callback=a`);
			const result = JSON.parse(rep.data.slice(2, -2));
			return Object.keys(result).map((item) => {
				if (!result[item].code) {
					result[item].code = item; //兼容港股美股
				}
				return result[item];
			});
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

export const neteaseStockProvider = new NeteaseStockProvider();
