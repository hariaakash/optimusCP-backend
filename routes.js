module.exports = function (app) {

	// Require Routes
	var user = require('./routes/user');
	var server = require('./routes/server');

	// Use Routes
	app.use('/user', user);
	app.use('/server', server);
};
