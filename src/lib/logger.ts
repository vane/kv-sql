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
	private static el?: HTMLElement;

	static setElement(el: HTMLElement) {
		this.el = el;
	}

	static log(...args) {
		if (this.level === LogLevel.LOG) console.log(...args);
	}

	static debug(...args) {
		if (this.level <= LogLevel.DEBUG) {
			console.log(...args);
			this.logEl(LogLevel.LOG, ...args);
		}
	}

	static info(...args) {
		if (this.level <= LogLevel.INFO) {
			console.info(...args);
			this.logEl(LogLevel.INFO, ...args);
		}
	}

	static warn(...args) {
		if (this.level <= LogLevel.WARN) {
			console.warn(...args);
			this.logEl(LogLevel.WARN, ...args);
		}
	}

	static error(...args) {
		if (this.level <= LogLevel.ERROR) {
			console.error(...args);
			this.logEl(LogLevel.ERROR, ...args);
		}
	}

	private static logEl(level = LogLevel.LOG, ...args) {
		if (!this.el) return;
		let msg = ''
		for (const arg of args) {
			if (arg instanceof Error) {
				msg += `<pre>${arg.stack}</pre>`
			} else if (arg instanceof Object) {
				msg += `${JSON.stringify(arg)} `
			} else {
				msg += `${arg} `
			}
		}
		let color = 'black'
		switch (level) {
			case LogLevel.LOG:
			case LogLevel.INFO:
				break;
			case LogLevel.WARN:
				color = '#b7b738'
				break
			case LogLevel.ERROR:
				color = '#c92828'
				break
		}
		this.el.innerHTML = `<p style="color: ${color};margin:0;padding:0;">${msg}</p>` + this.el.innerHTML
	}
}
