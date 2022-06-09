/**
 * 网易股票查询接口
 */
class NeteaseStockProvider {
	constructor() {
		this.httpService = require('axios').default.create({
			timeout: 10000,
			baseURL: 'https://api.money.126.net/data/feed',
		});
	}

	/**
	 *
	 * @param {string[]} codes
	 */
	fetch(codes) {
		return this.httpService
			.get(`${codes.join(',')}?callback=a`)
			.then((rep) => {
				const result = JSON.parse(rep.data.slice(2, -2));
				return Object.keys(result).map((item) => {
					if (!result[item].code) {
						result[item].code = item; //兼容港股美股
					}
					return result[item];
				});
			})
			.catch((error) => {
				/**
				 * @see https://axios-http.com/docs/handling_errors
				 */
				if (error.response) {
					throw new Error(error.response.data);
				}
				if (error.request) {
					throw new Error('The request was made but no response was received');
				}
				throw new Error(error.message);
			});
	}
}

module.exports.neteaseStockProvider = new NeteaseStockProvider();
