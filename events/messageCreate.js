const log = require('../log.js');
const { permlevel, getSettings } = require('../modules/functions.js');
const { getpasses } = require('../modules/passmsg.js');

module.exports = async (client, message) => {

	if(message.author.bot) return;

	const { container } = client;

	const settings = message.settings = getSettings(message.guild);

	// Check if the bot was mentioned with no message which will show the prefix on that server
	const prefixMention = new RegExp(`^<@!?${client.user.id}> ?$`);
	if (message.content.match(prefixMention)) {
		return message.channel.send(`My prefix on this guild is \`${settings.prefix}\``)
	}

	// Check if message begins with prefix or bot mention
	const prefix = new RegExp(`^<@!?${client.user.id}> |^\\${settings.prefix}`).exec(message.content);

	let passes = getpasses();
	if(Object.keys(passes).length != 0) {
		passes.func(client, message);
	}

	if (!prefix) return;

	const args = message.content.split(' ');

	const command = args.shift().substring(1).toLowerCase(); // Get the command name and remove it from the args

	const cmd = container.commands.get(command) || container.commands.get(container.aliases.get(command));

	if (!cmd) return;
	if (!cmd.conf.enabled) return;

	const level = permlevel(message);

	if (level < container.levelCache[cmd.conf.permLevel]) {
		if (settings.systemNotice === "true") return message.channel.send(`You do not have permission to use this command.`);
	}

	try {
		await cmd.run(client, message, args, level);
		log.info(`${message.author.id} ran command &${cmd.help.name} ${args.join(' ')}`);
	} catch (e) {
		console.error(e);
		log.error(`The command ${cmd.help.name} ran by ${message.author.id} encountered an error`);
		message.channel.send(`There was a problem with your request.\n\`\`\`${e.message}\`\`\``)
		.catch(e => console.error("An error occurred replying on an error", e));
	}
}