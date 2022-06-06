const util = require('util');

class Logger {

	/**
	 * @private
	 */
	prefix(loggerLevel) {
		return util.format(
			'[%s] [%s]',
			new Date().toLocaleString(),
			loggerLevel,
		);
	}

	fatal(msg, ...args) {
		console.error(
			util.format(`${this.prefix('fatal')} ${msg}`, ...args),
		);
	}

	error(msg, ...args) {
		console.error(
			util.format(`${this.prefix('error')} ${msg}`, ...args),
		);
	}

	warn(msg, ...args) {
		console.warn(
			util.format(`${this.prefix('warn')} ${msg}`, ...args),
		);
	}

	info(msg, ...args) {
		console.log(
			util.format(`${this.prefix('info')} ${msg}`, ...args),
		);
	}

	debug(msg, ...args) {
		console.log(
			util.format(`${this.prefix('debug')} ${msg}`, ...args),
		);
	}
}

module.exports = new Logger();
