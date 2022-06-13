const log = require('../log.js');

exports.run = async (client, message, args, level) => {
	const pingMsg = await message.channel.send('Ping?');
	const latency = pingMsg.createdTimestamp - message.createdTimestamp;
	log.debug(`Pinged. Latency: ${latency}ms`);
	return pingMsg.edit(`Pong!\nLatency: ${latency}ms`);
}

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: [],
	permLevel: 'User'
};

exports.help = {
	name: 'ping',
	category: 'Misc',
	description: 'Replies with pong!',
	usage: 'ping'
}