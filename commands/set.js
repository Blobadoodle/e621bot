const { settings } = require('../modules/settings');
const config = require('../config.js');

exports.run = async (client, message, [key, ...value], level) => {
	
	const serverSettings = message.settings;

	const defaults = config.defaultSettings;

	if(!key) return message.channel.send(`Please supply a key!\n\nUsage: set <key> <value>\n\nAll available keys include: ${Object.keys(defaults).join(', ')}`);

	if(!defaults[key]) return message.channel.send(`That key does not exist!\n\nAll available keys include: ${Object.keys(defaults).join(', ')}`);

	let jValue;

	if(key != 'globalBlacklist') jValue = value.join(' ');
	else jValue = value;

	if (jValue.length < 1) return message.channel.send('Please specify a new value!\n\nUsage: set <key> <value>');

	if(jValue === serverSettings[key]) return message.channel.send('This setting already has that value!');

	if(!settings.has(message.guild.id)) settings.set(message.guild.id, defaults);

	settings.set(message.guild.id, jValue, key);

	return message.channel.send(`${key} successfully set to ${jValue}`);
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ['settings', 'setting'],
	permLevel: 'Moderator'
};

exports.help = {
	name: 'set',
	category: 'General',
	description: 'Change settings for this server.',
	usage: 'set <key> <value>'
}