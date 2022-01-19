const fs = require('fs');

const colors = {
	'red': '\x1b[31m',
	'green': '\x1b[32m',
	'yellow': '\x1b[33m',
	'blue': '\x1b[34m',
	'reset': '\x1b[0m',
};

class Logger {
	constructor(loc, fn) {

		if(loc.endsWith('/')) {
			this.loc = loc + fn;
		} else {
			this.loc = loc + '/' + fn;
		}

		if(!fs.existsSync(loc)) {
			fs.mkdirSync(loc)
			this.info(`Created folder ${loc}`)
		}
	}
	#log(msg, color, level) {
		const d = new Date();
		const log = `[${colors[color]}${level}${colors['reset']}][${d.toLocaleDateString()} ${d.toLocaleTimeString()}] ${msg}`;
		const filelog = `[${level}][${d.toLocaleDateString()} ${d.toLocaleTimeString()}] ${msg}\n`;
		if (level === 'ERROR' || level === 'WARN') {
			console.error(log);
		} else {
			console.log(log);
		}
		fs.writeFile(this.loc, filelog, { flag: 'a' }, err => {
			if (err) {
				console.error(err);
				return
			}
		});
	}

	warn(msg) {
		this.#log(msg, 'yellow', 'WARN');
	}
	error(msg) {
		this.#log(msg, 'red', 'ERROR');
	}
	info(msg) {
		this.#log(msg, 'green', 'INFO');
	}
	debug(msg) {
		this.#log(msg, 'blue', 'DEBUG');
	}
}

module.exports = Logger;