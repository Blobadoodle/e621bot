const log = require('../log.js');
const yiff = require('../modules/e6lib/yiff.js');

const colours = [ 0xffb538, 0x012e57, 0x3673aa, 0xffffff ]

exports.run = async (client, message, args, level) => {
	const e6 = new yiff(process.env.E6_USER, process.env.E6_KEY, `e621bot/1.0 (by ${process.env.E6_USER})`);

	if(!args.length) return message.channel.send('You need to supply one or more tags to serach for'); // Check if args are empty

	const posts = await e6.search(args, 1, 1);
	const post = posts.data[0];

	const uploader = await e6.getuser(post.uploader_id);

	let avatar = '';
	
	if(uploader.data.avatar_id != null) avatar = await e6.getpost(uploader.data.avatar_id);
	avatar = avatar.data.file.url;

	const embed = {
		'type': 'rich',
		'title': 'e621.net',
		'color': colours[Math.floor(Math.random()*colours.length)],
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
		'url': `https://e621.net/posts/${post.id}`
	}	

	return message.channel.send({'embeds': [embed]});
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