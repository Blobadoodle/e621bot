const log = require('../log.js');

module.exports = (client, guild) => {
	if (!guild.available) return; // If tehre is an outage, return

	log.info(`${guild.id} has removed the bot.`);

	//log.info(`${guild.id} added the bot. Owner: ${guild.ownerId}`);
}