const log = require('../log.js');

module.exports = async client => {

	log.info(`${client.user.tag}, ready to serve ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users in ${client.guilds.cache.size} servers.`);

	client.user.setActivity('&help', { type: "WATCHING"});
};