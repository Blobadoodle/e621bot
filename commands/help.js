const { MessageEmbed } = require("discord.js");

exports.run = (client, message, args, level) => {
	const { container } = client;

	if(!args[0]) {
		const myCommands = message.guild ? container.commands.filter(cmd => container.levelCache[cmd.conf.permLevel] <= level) :
			container.commands.filter(cmd => container.levelCache[cmd.conf.permLevel] <= level && cmd.conf.guildOnly !== true);

		const enabledCommands = myCommands.filter(cmd => cmd.conf.enabled);

		const sorted = enabledCommands.sort((p, c) => p.help.category > c.help.category ? 1 : 
		  p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 );

		let fields = [];
		
		sorted.forEach( c => {
			fields.push({name: c.help.name, value: `${c.help.description}\nUsage: \`${c.help.usage}\``})
		})

		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Help')
			.setDescription('Help for all available commands')
			.addFields(...fields)
			.setTimestamp();

		return message.channel.send({embeds: [embed]})
	}
}


exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: ["h"],
	permLevel: "User"
  };
  
  exports.help = {
	name: "help",
	category: "System",
	description: "Displays all the available commands.",
	usage: "help <command>"
  };