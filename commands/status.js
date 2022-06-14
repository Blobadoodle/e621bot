const log = require('../log');

exports.run = (client, message, [type, ...status], level) => {
	if(!type || !status) {
		return message.channel.send('Please provide a valid status. (Type can be: PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM, COMPETING)')
	}
	status = status.join(' ');
	client.user.setActivity(status, { type: type});
	return message.channel.send(`Set activity to ${type} ${status}`);
}

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: [],
	permLevel: 'Bot Admin'
}

exports.help = {
	name: 'status',
	category: 'System',
	description: 'Sets the bot\'s status.',
	usage: 'status [type] [status]'
}