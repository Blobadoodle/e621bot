const log = require('../log.js');
const yiff = require('../modules/e6lib/yiff.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = async (client, interaction) => {

	if(!interaction.isButton()) return;

	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	const embed = interaction.message.embeds[0];
	const footer = embed.footer.text;
	const msg = interaction.message;

	let pageStr, tagStr;
	[pageStr, tagStr] = footer.split('\n');
	const cpage = parseInt(pageStr.substring(6));
	const tags = tagStr.substring(8).split(' ');
	let page = cpage;

	if(interaction.customId === 'next') page++;
	else page--;

	const posts = await e6.search(tags, 1, page);
	const post = posts.data[0];
	if(!posts.data.length) return msg.edit('Nobody here but us chickens');

	if(!posts.ok) return msg.edit('A server error was encountered. Perhaps e621 is down?');

	const uploader = await e6.getuser(post.uploader_id);

	let avatar = '';
	
	if(uploader.data.avatar_id != null) avatar = await e6.getpost(uploader.data.avatar_id);
	avatar = avatar.data.file.url;

	const NewEmbed = {
		'type': 'rich',
		'title': 'e621.net',
		'color': e6.colours[Math.floor(Math.random()*e6.colours.length)],
		'fields': [
			{
				'name': 'Score:',
				'value': String(post.score.total),
				'inline': true
			},
			{
				'name': 'Favourites:',
				'value': String(post.fav_count),
				'inline': true
			},
			{
				'name': 'Comments:',
				'value': String(post.comment_count),
				'inline': true
			}
		],
		'image': {
			'url': post.file.url ?? '',
			'height': post.file.height ?? 0,
			'width': post.file.width ?? 0
		},
		'author': {
			'name': uploader.data.name,
			'url': `https://e621.net/users/${uploader.data.id}`,
			'icon_url': avatar
		},
		'footer': {
			'text': `Page: ${page}\nSearch: ${tags.join(' ')}`
		},
		'url': `https://e621.net/posts/${post.id}`
	}

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

	interaction.deferUpdate();
	return msg.edit({'embeds': [NewEmbed], components: [row]})
};