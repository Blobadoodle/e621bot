const log = require('../log.js');
const yiff = require('../modules/e6lib/yiff.js');

const colours = [ 0xffb538, 0x012e57, 0x3673aa, 0xffffff ]

exports.run = async (client, message, args, level) => {
	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	if (!args[0]) return message.channel.send('You need to supply an ID or URL');

	let findid = /[0-9]{1,7}/g
	let id = args[0].match(findid) ?? [];
	if (id.length === 0) return message.channel.send('That is not a valid ID or URL')

	id = id[id.length - 1]; // Get last string of numbers in string
	const post = await e6.getpost(id);

	const uploader = await e6.getuser(post.data.uploader_id);
	let avatar = await e6.getpost(uploader.data.avatar_id);
	try {
		avatar = avatar.data.file.url || '';
	} catch {
		avatar = '';
	}

	if (post.status === 404) return message.channel.send('Nobody here but us chickens!');

	if (!post.ok) return message.channel.send('A server error was encountered. Perhaps e621 is down?');

	const embed = {
		'type': 'rich',
		'title': 'e621.net',
		'color': colours[Math.floor(Math.random()*colours.length)],
		'fields': [
			{
				'name': 'Score:',
				'value': String(post.data.score.total),
				'inline': true
			},
			{
				'name': 'Favourites:',
				'value': String(post.data.fav_count),
				'inline': true
			},
			{
				'name': 'Comments:',
				'value': String(post.data.comment_count),
				'inline': true
			}
		],
		'image': {
			'url': post.data.file.url ?? '',
			'height': post.data.file.height ?? 0,
			'width': post.data.file.width ?? 0
		},
		'author': {
			'name': uploader.data.name,
			'url': `https://e621.net/users/${uploader.data.id}`,
			'icon_url': avatar
		},
		'url': `https://e621.net/posts/${post.data.id}`
	}

	return message.channel.send({'embeds': [embed]});
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