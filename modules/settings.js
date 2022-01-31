const Enmap = require('enmap');

module.exports = {
	settings: new Enmap({
		name: 'settings',
	}),
	userSettings: new Enmap({
		name: 'usersettings',
	}),
};