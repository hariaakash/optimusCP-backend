var User = require('../models/user');
module.exports = function(io) {
    var x = 0;
    io.on('connection', function(socket) {
        console.log('A user connected');
        socket.on('auth', function(authKey) {
            User.findOne({
                    authKey: authKey
                })
                .then(function(user) {
                    if (user) {
                        socket.user = user;
                        console.log(user.email)
                        socket.emit('loggedin', user)
                    } else {
                        socket.emit('logout', 'Session ended !!')
                    }
                })
        });

        socket.on('disconnect', function() {
            console.log('A user disconnected');
            x--;
        });
    });
};
