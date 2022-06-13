const log = require('../log.js');
const { MessageEmbed } = require('discord.js');

module.exports = (client, guild) => {

	const embed = new MessageEmbed()
		.setColor('#FF0000')
		.setTitle('Welcome!')
		.setDescription('Hello! My default prefix is \`&\`. You can edit the settings with \`&set\` command.')

	const syschannel = guild.systemChannel;

	syschannel.send({embeds: [embed]});
	log.info(`${guild.id} added the bot. Owner: ${guild.ownerId}`);
}