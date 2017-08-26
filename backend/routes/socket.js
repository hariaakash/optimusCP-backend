module.exports = function (io) {
	var users = [];
	io.on('connection', function (client) {
		var authKey = '';
		client.on('authentication', function (data) {
			authKey = data.authKey;
			users.push({
				authKey: authKey,
				client: client
			});
			console.log('Client connected with authKey: ' + authKey);
			for (i = 0; i < users.length; i++)
				console.log(users[i].authKey);
		});
		client.on('disconnect', function () {
			users.splice(users.indexOf(authKey), 1);
			console.log('Client disconnected with authKey: ' + authKey);
			for (i = 0; i < users.length; i++)
				console.log(users[i].authKey);
		});
	});
};
