const yiff = require('../modules/e6lib/yiff.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

exports.run = async (client, message, args, level) => {
	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	if(!args.length) return message.channel.send('You need to supply one or more tags to serach for'); // Check if args are empty

	const settings = message.settings;

	const blacklist = settings.serverBlacklist;

	let tags = [...args];

	for(i in blacklist) {
		tags.push(`-${blacklist[i]}`)
	}

	const posts = await e6.search(tags, 1, 1);
	const post = posts.data[0];

	if(!posts.data.length) return message.channel.send('Nobody here but us chickens!');

	if(!posts.ok) return message.channel.send('A server errror was encountered. Perhaps e621 is down?');

	const embed = new MessageEmbed()
		.setColor(e6.randcol())
		.setTitle('Link')
		.setURL(`https://e621.net/posts/${post.id}`)
		.setAuthor({name: post.tags.artist.join(' ')})
		.setFooter({text: `ID: ${post.id}\nPage: 1\nSearch: ${args.join(' ')}`})
		.addFields(
			{name: 'Score', value: String(post.score.total), inline: true},
			{name: 'Favourites', value: String(post.fav_count), inline: true},
			{name: 'Comments', value: String(post.comment_count), inline: true}
		)
		.setImage(post.file.url ?? '')

	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('next')
			.setLabel('next')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('showtags')
			.setLabel('Show Tags')
			.setStyle('SECONDARY')
	);

	return message.channel.send({'embeds': [embed], components: [row]});
}

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: [],
	permLevel: 'User'
};

exports.help = {
	name: 'search',
	category: 'General',
	description: 'Search e621 posts by tags, seperated by spaces',
	usage: 'search <tags>'
}