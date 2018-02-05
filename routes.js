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
	app.use('/webapi/user', user);
	app.use('/webapi/payment', payment);
	app.use('/webapi/server', server);
	app.use('/webapi/apiKey', apiKey);
	app.use('/api', api);
	app.use('/webapi/admin', admin);
	app.use('/webapi/team', team);
	app.use('/webapi/tserver', tserver);
};
