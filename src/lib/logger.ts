export enum LogLevel {
	LOG = 0,
	DEBUG,
	INFO,
	WARN,
	ERROR,
	OFF
}

export class Logger {
	private static level: LogLevel = parseInt(import.meta.env.VITE_LOG_LEVEL);
	static log(...args) {
		if (this.level === LogLevel.LOG) console.log(...args);
	}

	static debug(...args) {
		if (this.level <= LogLevel.DEBUG) console.log(...args);
	}

	static info(...args) {
		if (this.level <= LogLevel.INFO) console.info(...args);
	}

	static warn(...args) {
		if (this.level <= LogLevel.WARN) console.warn(...args);
	}

	static error(...args) {
		if (this.level <= LogLevel.ERROR) console.error(...args);
	}
}
