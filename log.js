const Logger = require('./modules/logger.js'); // Custom logger

function getDate() {
	const d = new Date();
	return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}-${d.getHours() + 1}-${d.getMinutes()}-${d.getSeconds()}`;
}

const log = new Logger('./logs/', `${getDate()}.log`); // Create logger object

module.exports = log;