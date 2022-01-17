exports.run = async (client, message, args, level) => {
	if(message.author.id != 429299975252606989) {
		return message.channel.send("You do not have permission to run this command.");
	}

	const { container } = client;
	if (!args || args.length < 1 ) return message.channel.send('Must provide a command name to reload.');
	
	const command = container.commands.get(args[0]) || container.commands.get(container.aliases.get(args[0]));

	if (!command) {
		return message.channel.send("That command does not exist");
	}

	delete require.cache[require.resolve(`./${command.help.name}.js`)];

	container.commands.delete(command.help.name);
	const props = require(`./${command.help.name}.js`);
	container.commands.set(command.help.name, props);

	message.channel.send(`The command \`${command.help.name}\` has been reloaded`)
};

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: [],
	permLevel: 'Bot Admin'
};

exports.help = {
	name: 'reload',
	category: 'System',
	description: 'Reload a command that\'s been modified',
	usage: 'reload [command]'
};