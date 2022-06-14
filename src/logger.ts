import { format } from 'util';

class Logger {
	/**
	 * @private
	 */
	prefix(loggerLevel: string) {
		return format('[%s] [%s]', new Date().toLocaleString(), loggerLevel);
	}

	fatal(msg: string, ...args: any[]) {
		console.error(format(`${this.prefix('fatal')} ${msg}`, ...args));
	}

	error(msg: string, ...args: any[]) {
		console.error(format(`${this.prefix('error')} ${msg}`, ...args));
	}

	warn(msg: string, ...args: any[]) {
		console.warn(format(`${this.prefix('warn')} ${msg}`, ...args));
	}

	info(msg: string, ...args: any[]) {
		console.log(format(`${this.prefix('info')} ${msg}`, ...args));
	}

	debug(msg: string, ...args: any[]) {
		console.log(format(`${this.prefix('debug')} ${msg}`, ...args));
	}
}

export default new Logger();
