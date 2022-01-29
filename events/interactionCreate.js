const log = require('../log.js');
const yiff = require('../modules/e6lib/yiff.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { getSettings } = require('../modules/functions.js');

module.exports = async (client, interaction) => {

	if(!interaction.isButton()) return;

	if(interaction.customId === 'next' || interaction.customId === 'prev') {
		const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

		const embed = interaction.message.embeds[0];
		const footer = embed.footer.text;
		const msg = interaction.message;

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

		const blacklist = settings.globalBlacklist;
	
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

		const embed = interaction.message.embeds[0];
		const footer = embed.footer.text;
		const msg = interaction.message;

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
};