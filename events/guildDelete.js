const log = require('../log.js');
const { settings } = require("../modules/settings");

module.exports = (client, guild) => {
	if (!guild.available) return; // If there is an outage, return

	log.info(`${guild.id} has removed the bot.`);

	if(settings.has(guild.id)) {
		settings.delete(guild.id);
	}
}