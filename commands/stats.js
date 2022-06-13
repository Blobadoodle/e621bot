const { version } =	require('discord.js')

exports.run = (client, message, args, level) => {
	message.channel.send(`
	\`\`\`
	• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
	• Users      :: ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b).toLocaleString()}
	• Servers    :: ${client.guilds.cache.size.toLocaleString()}
	• Channels   :: ${client.channels.cache.size.toLocaleString()}
	• Discord.js :: v${version}
	• Node       :: ${process.version}\`\`\`
	`);
}

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: [],
	permLevel: "Bot Admin"
  };
  
  exports.help = {
	name: "stats",
	category: "Miscellaneous",
	description: "Gives some useful bot statistics",
	usage: "stats"
  };