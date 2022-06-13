const log = require('../log.js');

exports.run = async (client, message, args, level) => {
	message.channel.send('Bot is shutting down.');
	log.info(`${message.author.id} has shut down the bot.`);
	await Promise.all(client.container.commands.map(cmd => {
		delete require.cache[require.resolve(`./${cmd.help.name}.js`)];

		client.container.commands.delete(cmd.help.name);
	}));
	process.exit(0);
};

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: ["restart"],
	permLevel: 'Bot Admin'
};

exports.help = {
	name: 'reboot',
	category: 'System',
	description: 'Shuts down and restarts the bot',
	usage: 'reboot'
}