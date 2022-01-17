require('dotenv').config();

const { Client, Collection } = require('discord.js');

const fs = require('fs');
const { eventNames } = require('process');
const { intents, partials, permLevels } = require('./config.js');

const client = new Client({ intents, partials });

const commands = new Collection();
const aliases = new Collection();

const log = require('./log.js');

// Generate a cache of client permissions for pretty perm names in commands.
const levelCache = {};
for (let level of permLevels) {
	levelCache[level.name] = level.level;
}

// To reduce client pollution we'll create a single container property
// that we can attach everything we need to.
client.container = {
	commands,
	aliases,
	levelCache
};

async function init() {

	const commands = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))
	for (const file of commands) {
		const props = require(`./commands/${file}`);
		log.info(`Loading command: ${props.help.name}`);
		client.container.commands.set(props.help.name, props);
		props.conf.aliases.forEach(alias => {
			client.container.aliases.set(alias, props.help.name);
		});
	}

	const eventfiles = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));
	for (const file of eventfiles) {
		const eventName = file.split('.')[0];
		log.info(`Loading Event: ${eventName}`);
		const event = require(`./events/${file}`);

		client.on(eventName, event.bind(null, client));
	}

	client.on('threadCreate', (thread) => thread.join()); // The bot will join any thread that is created so people can use it in that thread

	client.login(process.env.DISCORD_TOKEN);
}

init();