const config = require('../config.js');
const { MessageSelectMenu, MessageActionRow } = require('discord.js');

exports.run = async (client, message, args, level) => {

	const defaults = config.defaultSettings;

	let options =  [];

	for(i of defaults) {
		options.push({ label: i.prettyName, value: i.name, description: i.description });
	}

	const row = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
				.setCustomId('setting')
				.setPlaceholder('Select a setting to change')
				.setOptions(options)
		)
	return message.channel.send({content: 'Here are the available settings to tweak', components: [row]});
}
exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ['set', 'setting', 'config'],
	permLevel: 'Moderator'
};

exports.help = {
	name: 'settings',
	category: 'General',
	description: 'Change settings for this server.',
	usage: 'settings'
}