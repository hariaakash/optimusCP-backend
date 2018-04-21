module.exports = function (app) {

	// Require Routes
	var user = require('./routes/user');
	var payment = require('./routes/payment');
	var server = require('./routes/server');
	var apiKey = require('./routes/apiKey');
	var api = require('./routes/api');
	var admin = require('./routes/admin');
	var team = require('./routes/team');
	var tserver = require('./routes/tserver');

	// Use Routes
	app.use('/user', user);
	app.use('/payment', payment);
	app.use('/server', server);
	app.use('/apiKey', apiKey);
	app.use('/api', api);
	app.use('/admin', admin);
	app.use('/team', team);
	app.use('/tserver', tserver);
};
