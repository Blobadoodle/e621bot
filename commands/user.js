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

	const user = await e6.getuser(id);

	if(user.status === 404) return message.channel.send('Nobody here but us chickens!');

	if (!user.ok) return message.channel.send('A server error was encountered. Perhaps e621 is down?')
	
	const date = user.data.created_at.substring(0,10).replaceAll('-', '/');

	let avat_post = undefined;

	if(user.data.avatar_id != null) avat_post = await e6.getpost(user.data.avatar_id);


	let embed = {
		"type": "rich",
		"title": user.data.name,
		"description": "",
		"color":  colours[Math.floor(Math.random()*colours.length)],
		"fields": [
		  {
			"name": `Join Date`,
			"value": date,
			"inline": true
		  },
		  {
			"name": `Level`,
			"value": `${user.data.level} (${user.data.level_string})`,
			"inline": true
		  },
		  {
			"name": `Posts`,
			"value": String(user.data.post_upload_count),
			"inline": true
		  },
		  {
			"name": `Forum Posts`,
			"value": String(user.data.forum_post_count),
			"inline": true
		  },
		  {
			"name": `Comments`,
			"value": String(user.data.comment_count),
			"inline": true
		  }
		],
		"url": `https://e621.net/users/${id}`
	  }
	
	if (avat_post != undefined) {
		embed["image"] = {
			"url": avat_post.data.file.url,
			"height": avat_post.data.file.height,
			"width": avat_post.data.file.width
		}
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
	name: 'user',
	category: 'General',
	description: 'Get an e621 user from its ID or URL!',
	usage: 'user <id/url>'
}