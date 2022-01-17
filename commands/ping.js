exports.run = async (client, message, args, level) => {
	const pingMsg = await message.channel.send('Ping?');
	return message.channel.send(`Pong!\n\nLatency: ${pingMsg.timestamp - message.timestamp}ms`);
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