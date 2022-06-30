const log = require('../log.js');
const yiff = require('../modules/e6lib/yiff.js');
const { settings } = require('../modules/settings');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { getSettings, setSettings } = require('../modules/functions.js');
const { pass } = require('../modules/passmsg.js');

module.exports = async (client, interaction) => {
	if(interaction.isButton()) return handleButton(interaction);
	else if(interaction.isSelectMenu()) return handleSelect(interaction);
	else return;
};

function handleSelect(interaction) {
	interaction.deferUpdate();
	const id = interaction.customId;
	if(id === 'setting') return handleSetting(interaction);
	else if(id === 'modRole' || id === 'adminRole') return handleModRole(interaction);
}

function handleModRole(interaction) {
	const value = interaction.values[0];

	console.log(value);
	if(!settings.has(interaction.message.guild.id)) setSettings(interaction.message.guild);

	settings.set(interaction.message.guild.id, value, interaction.customId);
	;console.log(interaction.message.guild.id, interaction.customId, value);
	return interaction.message.edit({content: `Successfully set ${(interaction.customId === 'modRole') ? 'Mod' : 'Admin'} role to ${value}`, components: []});
}

function handleSetting(interaction) {
	const value = interaction.values[0];

	switch(value) {
		case 'prefix':
			interaction.message.edit({content: 'Please select the prefix for this server.', components: []});
			break;
		case 'modRole':
		case 'adminRole':
			let options = [];

			interaction.guild.roles.cache.forEach((value, key) => {
				options.push({label: value.name, value: value.name});
			})

			const row = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId(value)
					.setPlaceholder('Select the role to give permissions to.')
					.setOptions(options)
			)

			return interaction.message.edit({content: `Please select the ${(value === 'modRole') ? 'Mod' : 'Admin'} role for this server.`, components: [row]})
		case 'systemNotice':
			interaction.message.edit({content: 'Please reply with yes or no to toggle replying to commands if the user does not have permission', components: []});
			break;
		case 'serverBlacklist':
			const settings = getSettings(interaction.message.guild);
			const blacklist = settings.serverBlacklist;
			interaction.message.edit({content: `Please type the tag blacklist that will be applied to everyone across the server, seperated by commas.\nCurrent blacklist is: \`${blacklist.join(',')}\``, components: []});
			break;
	}

	pass(interaction.message.author.id, interaction.message.channel.id, (client, message) => { 
		let msg = message.content;
		msg = msg.toLowerCase();

		if(value === 'serverBlacklist') { // Blacklist is to be percieved as comma delimited lists.
			msg = msg.split(',');
			for (const i in msg) {
				msg[i] = msg[i].trim();
			}
		} else if(value === 'systemNotice') {
			if(msg === 'y' || msg.includes('yes')) msg = true;
			else msg = false;
		}

		if(!settings.has(message.guild.id)) setSettings(message.guild);
		settings.set(message.guild.id, msg, value);
		return interaction.message.edit(`Successfully changed setting to ${msg}`);
	});
}

function handleButton(interaction) {
	if(interaction.customId === 'next' || interaction.customId === 'prev') {
		handleNextPrev(interaction);
	} else if (interaction.customId === 'delete') {
		interaction.deferUpdate();
		interaction.message.delete();
	} else if (interaction.customId === 'show') {
		handleShow(interaction);
	} else if (interaction.customId === 'showtags') {
		handleShowTags(interaction);
	} else if (interaction.customId === 'hidetags_post' || interaction.customId === 'hidetags_search') {
		handleHideTags(interaction);
	}
}

async function handleHideTags(interaction) {
	interaction.deferUpdate();

	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);
	
	const msg = interaction.message;
	const embed = msg.embeds[0];
	const footer = embed.footer.text;

	let id, page, tags;

	if(interaction.customId === 'hidetags_post') {
		id = parseInt(footer.substring(4));
	} else {
		[id, page, tags] = footer.split('\n');
		id = parseInt(id.substring(4));
		page = parseInt(page.substring(6));
		tags = tags.substring(8).split(' ');
	}

	const post = await e6.getpost(id);

	if(post.status === 404) return msg.edit({content: 'Nobody here but us chickens!', embeds: [], components: []});

	if(!post.ok) return msg.edit({content: 'A server error was encountered perhaps e621 is down?'});

	let description = post.data.description;
	if(description.length > 150) {
		description = description.substring(0, 149) + '...';
	}

	const newEmbed = new MessageEmbed()
		.setColor(e6.randcol())
		.setTitle('Link')
		.setURL(`https://e621.net/post/${id}`)
		.addFields(
			{name: 'Score', value: String(post.data.score.total)},
			{name: 'Favourites', value: String(post.data.fav_count)},
			{name: 'Comments', value: String(post.data.comment_count)}
		)
		.setImage(post.data.file.url ?? '')
		.setFooter({text: (interaction.customId === 'hidetags_post') ? `ID: ${id}\n` : `ID: ${id}\nPage: ${page}\nSearch: ${tags.join(' ')}`})
		.setAuthor({name: post.data.tags.artist.join(' ')})
		.setDescription(description)
		.setTimestamp(new Date(post.data.created_at));
	
	const row = new MessageActionRow()
	if(interaction.customId === 'hidetags_search') {
		row.addComponents(
			new MessageButton()
				.setCustomId('prev')
				.setLabel('prev')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('next')
				.setLabel('next')
				.setStyle('PRIMARY')
		)
	}
	
	row.addComponents(
		new MessageButton()
			.setCustomId('showtags')
			.setLabel('Show Tags')
			.setStyle('SECONDARY')
	)

	return msg.edit({embeds: [newEmbed], components: [row]});
}

async function handleShowTags(interaction) {
	interaction.deferUpdate();

	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	const msg = interaction.message;
	const embed = msg.embeds[0];
	const footer = embed.footer.text;

	let type = '';
	if(footer.split('\n').length === 1) {
		type = 'post'; // Posts only have ID in footer
	} else {
		type = 'search'; // Searchs have ID, tags and page in footer
	}

	let id, page, searchtags;
	if(type === 'search') {
		[id, page, searchtags] = footer.split('\n');
		id = parseInt(id.substring(4));
		page = parseInt(page.substring(6));
		searchtags = searchtags.substring(8).split(' ');
	} else {
		id = parseInt(footer.substring(4));
	}

	log.info(`show tags ${id}`);

	const post = await e6.getpost(id);

	if(post.status === 404) return msg.edit({content: 'That post has since been deleted'});

	if(!post.ok) return msg.edit({content: 'A server error was encountered. Perhaps e621 is down?'});

	const tags = post.data.tags;

	const newEmbed = new MessageEmbed()
		.setColor(e6.randcol())
		.setTitle(`Tags for ${id}`)
		.setURL(`https://e621.net/posts/${id}`)
		.setImage(post.data.file.url ?? '')
		.setFooter({text: (type === 'post') ? `ID: ${id}\n` : `ID: ${id}\nPage: ${page}\nSearch: ${searchtags.join(' ')}`})
		.setAuthor({name: post.data.tags.artist.join(' ')})
		.addFields(
			{name: 'General', value: tags.general.join(', ') || '*None*', inline: true},
			{name: 'Species', value: tags.species.join(', ') || '*None*', inline: true},
			{name: 'Character', value: tags.character.join(', ') || '*None*', inline: true},
			{name: 'Copyright', value: tags.copyright.join(', ') || '*None*', inline: true},
			{name: 'Artist', value: tags.artist.join(', ') || '*None*', inline: true},
			{name: 'Invalid', value: tags.invalid.join(', ') || '*None*', inline: true},
			{name: 'Lore', value: tags.lore.join(', ') || '*None*', inline: true},
			{name: 'Meta', value: tags.meta.join(', ') || '*None*', inline: true},
		)
		.setTimestamp(new Date(post.data.created_at));
	
	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId((type === 'post') ? 'hidetags_post' : 'hidetags_search') // Searches will have to be handled differently to incolude prev,next buttons etc.
			.setLabel('Hide Tags')
			.setStyle('SECONDARY')
	)

	return msg.edit({embeds: [newEmbed], components: [row]});
}

async function handleNextPrev(interaction) {
	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	const msg = interaction.message;
	const embed = msg.embeds[0];
	const footer = embed.footer.text;

	let pageStr, tagStr, idStr;
	[idStr, pageStr, tagStr] = footer.split('\n');
	const id = parseInt(idStr.substring(4));
	const cpage = parseInt(pageStr.substring(6));
	let tags = tagStr.substring(8).split(' ');
	let page = cpage;
	log.info(`${interaction.customId} page: ${page} tags: ${tags} id: ${id}`);

	if(interaction.customId === 'next') page++;
	else page--;

	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('prev')
			.setLabel('prev')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('next')
			.setLabel('next')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('showtags')
			.setLabel('Show Tags')
			.setStyle('SECONDARY')
	);

	const prevrow = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('prev')
			.setLabel('prev')
			.setStyle('PRIMARY'),
	);

	const settings = getSettings(msg.guild);

	const blacklist = settings.serverBlacklist;

	let stags = [...tags];

	for(i in blacklist) {
		stags.push(`-${blacklist[i]}`)
	}

	const posts = await e6.search(stags, 1, page);
	const post = posts.data[0];

	const emptyembed = new MessageEmbed()
		.setColor(e6.randcol())
		.setTitle('e621.net')
		.setURL('https://e621.net')
		.setDescription('Nobody here but us chickens!')
		.setFooter({text: `Page: ${page}\nSearch: ${tags.join(' ')}`})

	if(!posts.data.length) { 
		interaction.deferUpdate();
		return msg.edit({embeds: [emptyembed], components: [prevrow]});
	}

	if(!posts.ok) return msg.edit('A server error was encountered. Perhaps e621 is down?');

	let uriTags = [];
	for(const tag of args) {
		uriTags.push(encodeURIComponent(tag));
	}

	let description = post.data.description;
	if(description.length > 150) {
		description = description.substring(0, 149) + '...';
	}

	const NewEmbed = new MessageEmbed()
		.setColor(e6.randcol())
		.setTitle('Link')
		.setURL(`https://e621.net/posts/${post.id}?q=${uriTags.join('+')}`)
		.addFields(
			{name: 'Score', value: String(post.score.total), inline: true},
			{name: 'Favourites', value: String(post.fav_count), inline: true},
			{name: 'Comments', value:String(post.comment_count), inline: true}
		)
		.setImage(post.file.url)
		.setAuthor({name: post.tags.artist.join(' ')})
		.setDescription(description)
		.setFooter({text: `ID: ${post.id}\nPage: ${page}\nSearch: ${tags.join(' ')}`});

	interaction.deferUpdate();
	return msg.edit({'embeds': [NewEmbed], components: [row]})
}

async function handleShow(interaction) {
	interaction.deferUpdate();

	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	const msg = interaction.message;
	const embed = msg.embeds[0];
	const footer = embed.footer.text;

	const id = parseInt(footer.substring(4))

	const post = await e6.getpost(id);

	if(post.status === 404) return msg.edit({content: 'Nobody here but us chickens!'}) // TODO: make these appear in the embed not in the contetn

	if (!post.ok) return msg.edit({content: 'A server error was encountered. Perhaps e621 is down?'});

	let description = post.data.description;
	if(description.length > 150) {
		description = description.substring(0, 149) + '...';
	}

	const newEmbed = new MessageEmbed()
		.setColor(e6.randcol())
		.setTitle('Link')
		.setURL(`https://e621.net/posts/${post.data.id}`)
		.addFields(
			{name: 'Score', value: String(post.data.score.total)},
			{name: 'Favourites', value: String(post.data.fav_count)},
			{name: 'Comments', value: String(post.data.comment_count)}
		)
		.setImage(post.data.file.url ?? '')
		.setFooter({text: `ID: ${post.data.id}`})
		.setAuthor({name: post.data.tags.artist.join(' ')})
		.setDescription(description)
		.setTimestamp(new Date(post.data.created_at));

	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('delete')
			.setLabel('Hide')
			.setStyle('SECONDARY'),
	);
	return msg.edit({embeds: [newEmbed], components: [row]});
}