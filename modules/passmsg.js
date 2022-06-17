let passes = {};

exports.getpasses = () => {
	return passes;
}

function delpass(channel) {
	passes = {};
}

exports.pass = (user, channel, func) => {
	const newfunc = (client, message) => {
		func(client, message);
		delpass(channel);
	}
	passes = {
		user: user,
		channel: channel,
		func: newfunc
	}
};