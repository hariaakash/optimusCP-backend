module.exports = function (app) {

	// Require Routes
	var user = require('./routes/user');
	var server = require('./routes/server');
	var apiKey = require('./routes/apiKey');
	var api = require('./routes/api');

	// Use Routes
	app.use('/user', user);
	app.use('/server', server);
	app.use('/apiKey', apiKey);
	app.use('/api', api);
};
