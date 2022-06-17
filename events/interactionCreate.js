const log = require('../log.js');
const yiff = require('../modules/e6lib/yiff.js');
const { settings } = require('../modules/settings');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { getSettings, setSettings } = require('../modules/functions.js');
const { pass } = require('../modules/passmsg.js');

module.exports = async (client, interaction) => {

	if(interaction.isButton()) return handleButton(interaction);
	else if(interaction.isSelectMenu()) return handleSelect(interaction);
	else return;
};

async function handleSelect(interaction) {
	const value = interaction.values[0];

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
	
	switch(value) {
		case 'prefix':
			return interaction.message.edit({content: 'Please select the prefix for this server.', components: []});
		case 'modRole':
			return interaction.message.edit({content: 'Please type the moderator role for this server.', components: []});
		case 'adminRole':
			return interaction.message.edit({content: 'Please type the administrator role for this server.', components: []});
		case 'systemNotice':
			return interaction.message.edit({content: 'Please reply with yes or no to toggle replying to commands if the user does not have permission', components: []});
		case 'serverBlacklist':
			const settings = getSettings(interaction.message.guild);
			const blacklist = settings.serverBlacklist;
			return interaction.message.edit({content: `Please type the tag blacklist that will be applied to everyone across the server, seperated by commas.\nCurrent blacklist is: \`${blacklist.join(',')}\``, components: []});
	}
}

async function handleButton(interaction) {
	if(interaction.customId === 'next' || interaction.customId === 'prev') {
		const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

		const msg = interaction.message;
		const embed = msg.embeds[0];
		const footer = embed.footer.text;

		let pageStr, tagStr;
		[pageStr, tagStr] = footer.split('\n');
		const cpage = parseInt(pageStr.substring(6));
		let tags = tagStr.substring(8).split(' ');
		let page = cpage;

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
			.setDescription('Nobody here but us chickens!')
			.setFooter({text: `Page: ${page}\nSearch: ${tags.join(' ')}`})

		if(!posts.data.length) { 
			interaction.deferUpdate();
			return msg.edit({embeds: [emptyembed], components: [prevrow]});
		}

		if(!posts.ok) return msg.edit('A server error was encountered. Perhaps e621 is down?');

		const NewEmbed = new MessageEmbed()
			.setColor(e6.randcol())
			.setTitle('e621.net')
			.setURL(`https://e621.net/posts/${post.id}`)
			.addFields(
				{name: 'Score', value: String(post.score.total), inline: true},
				{name: 'Favourites', value: String(post.fav_count), inline: true},
				{name: 'Comments', value:String(post.comment_count), inline: true}
			)
			.setImage(post.file.url)
			.setFooter({text: `Page: ${page}\nSearch: ${tags.join(' ')}`});

		interaction.deferUpdate();
		return msg.edit({'embeds': [NewEmbed], components: [row]})
	} else if (interaction.customId === 'delete') {
		interaction.deferUpdate();
		interaction.message.delete();
	} else if (interaction.customId === 'show') {
		const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

		const msg = interaction.message;
		const embed = msg.embeds[0];
		const footer = embed.footer.text;

		const id = parseInt(footer.substring(4))

		const post = await e6.getpost(id);

		if(post.status === 404) return msg.edit({content: 'Nobody here but us chickens!'}) // TODO: make these appear in the embed not in the contetn

		if (!post.ok) return msg.edit({content: 'A server error was encountered. Perhaps e621 is down?'});

		const newEmbed = new MessageEmbed()
			.setColor(e6.randcol())
			.setTitle('e621.net')
			.setURL(`https://e621.net/posts/${post.data.id}`)
			.addFields(
				{name: 'Score', value: String(post.data.score.total)},
				{name: 'Favourites', value: String(post.data.fav_count)},
				{name: 'Comments', value: String(post.data.comment_count)}
			)
			.setImage(post.data.file.url ?? '')
			.setFooter({text: `ID: ${post.data.id}`})
			.setAuthor({name: post.data.tags.artist.join(' ')})

		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('delete')
				.setLabel('Hide')
				.setStyle('SECONDARY'),
		);

		interaction.deferUpdate();
		return msg.edit({embeds: [newEmbed], components: [row]});
	}
}