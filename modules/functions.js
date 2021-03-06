const log = require('../log.js');
const config = require('../config.js');
const { settings } = require('./settings');

function permlevel(message) {
	let permlvl = 0;
  
	const permOrder = config.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);
  
	while (permOrder.length) {
	  const currentLevel = permOrder.shift();
	  if (message.guild && currentLevel.guildOnly) continue;
	  if (currentLevel.check(message)) {
		permlvl = currentLevel.level;
		break;
	  }
	}
	return permlvl;
}
  
process.on("uncaughtException", err => {
	const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
	log.error(`Uncaught Exception: ${errorMsg}`);
	// Always best practice to let the code crash on uncaught exceptions. 
	// Because you should be catching them anyway.
	process.exit(1);
});
/*
process.on("unhandledRejection", err => {
	log.error(`Unhandled rejection: ${err}`);
});
*/
function getSettings(guild) {
	let guildConf = settings.get(guild.id);

	if(guildConf != null && guildConf != undefined) {
		return guildConf;
	} else {
		guildConf = config.defaultSettings;
	}
	let csettings = {};

	for(const i of guildConf) {
		csettings[i.name] = i.value;
	}

	return csettings;
}

function setSettings(guild) {
	const defaults = config.defaultSettings;

	let csettings = {};

	for(const i of defaults) {
		csettings[i.name] = i.value;
	}

	return settings.set(guild.id, csettings);
}

module.exports = { permlevel, getSettings, setSettings };