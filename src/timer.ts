import Configuration from './configuration';

class Timer {
	async await() {
		// 工作日工作时间 9:00-11.30 13:00-15:00
		if (this.isWorkDay() && this.isWorkTime()) {
			return await this.sleep(Configuration.getUpdateInterval());
		}

		// 周末一直是睡眠
		await this.sleep(60 * 60 * 1000);
		await this.await();
	}

	/**
	 * @private
	 * 判断 工作日工作时间 9:00-11.30 13:00-15:00
	 */
	isWorkTime() {
		const hours = new Date().getHours();
		const minutes = new Date().getMinutes();
		const time = hours * 100 + minutes;
		return (time >= 900 && time <= 1130) || (time >= 1300 && time <= 1500);
	}

	/**
	 * @private
	 * 判断今天是否是工作日
	 * ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
	 */
	isWorkDay() {
		const currentDay = new Date().getDay();
		return ![0, 6].includes(currentDay);
	}

	/**
	 * @private
	 * @param {number} ms
	 * @returns
	 */
	sleep(ms: number) {
		return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
	}
}

export default new Timer();
