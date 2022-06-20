const yiff = require('../modules/e6lib/yiff.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

exports.run = async (client, message, args, level) => {
	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	if (!args[0]) return message.channel.send('You need to supply an ID or URL');

	let findid = /[0-9]{1,7}/g
	let id = args[0].match(findid) ?? [];
	if (id.length === 0) return message.channel.send('That is not a valid ID or URL')

	id = id[id.length - 1]; // Get last string of numbers in string
	const post = await e6.getpost(id);

	if (post.status === 404) return message.channel.send('Nobody here but us chickens!');

	if (!post.ok) return message.channel.send('A server error was encountered. Perhaps e621 is down?');

	const embed =  new MessageEmbed()
		.setColor(e6.randcol())
		.setTitle('Link')
		.setURL(`https://e621.net/posts/${post.data.id}`)
		.addFields(
			{ name: 'Score', value: String(post.data.score.total), inline: true},
			{ name: 'Favourites', value: String(post.data.fav_count), inline: true},
			{ name: 'Comments', value: String(post.data.comment_count), inline: true}
		)
		.setFooter({ text: `ID: ${post.data.id}\n`})
		.setAuthor({name: post.data.tags.artist.join(' ')});

	const tags = [...post.data.tags.general, ...post.data.tags.species, ...post.data.tags.character, ...post.data.tags.copyright, ...post.data.tags.artist, ...post.data.tags.invalid, ...post.data.tags.lore, ...post.data.tags.meta ];

	const settings = message.settings;

	const blacklist = settings.serverBlacklist;

	const badtags = tags.filter(element => blacklist.includes(element));

	if(badtags.length === 0) {
		embed.setImage(post.data.file.url ?? '');
		return message.channel.send({'embeds': [embed]});
	} else {
		embed.setDescription(`**This post contains the tags: \`${badtags.join(', ')}\` which are on your blacklist. Are you sure you want to view ths post?**`);
		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('show')
				.setLabel('Show anyway')
				.setStyle('DANGER'),
			new MessageButton()
				.setCustomId('delete')
				.setLabel('Cancel')
				.setStyle('SECONDARY'),
		);
		return message.channel.send({'embeds': [embed], components: [row]});
	}
}

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: ['getpost'],
	permLevel: 'User'
};

exports.help = {
	name: 'post',
	category: 'General',
	description: 'Get an e621 post from its ID or URL!',
	usage: 'post <id/url>'
}