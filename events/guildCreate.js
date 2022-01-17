const log = require('../log.js');

module.exports = (client, guild) => {
	log.info(`${guild.id} added the bot. Owner: ${guild.ownerId}`);
}