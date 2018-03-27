module.exports = function(req, res, ssh, uniR, user) {
    function exec() {
        ssh.connect({
                host: user.added[x].ip,
                port: user.added[x].port,
                username: 'optimusCP',
                password: String(user.added[x]._id)
            })
            .then(function() {
                user.save()
                    .then(function(user) {
                        uniR(res, true, msg)
                        ssh.exec(cmd)
                            .then(function(result) {
                                if (result.stdout.split(':')[0] == "TRUE") {
                                    user.added[x].stack.id = req.body.stack;
                                    user.added[x].logs.push({
                                        msg: 'Installation successfull !!'
                                    });
                                    user.save();
                                    console.log(result)
                                } else {
                                    user.added[x].logs.push({
                                        msg: 'Installation failed, error: ' + result.stdout.split(':')[1]
                                    });
                                    user.save();
                                    console.log(result)
                                }
                            })
                            .catch(function(err) {
                                console.log(err)
                                uniR(res, false, 'Some error occurred !!');
                            });
                    });
            })
            .catch(function(err) {
                console.log(err)
                uniR(res, false, 'Some error occurred !!');
            });
    }
    if ((x = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '',
            os = (user.added[x].info.os.indexOf("CentOS") >= 0) ? 'centos' : 'ubuntu';
        switch (req.body.stack) {
            case 1:
                cmd = 'wget https://optimuscp.io/bash/stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' lamp ' + user.added[x]._id;
                msg = 'LAMP is getting installed'
                user.added[x].logs.push({
                    msg: 'LAMP stack installation started !!'
                });
                user.added[x].msgboard = {
                    msg: 'LAMP stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            case 2:
                cmd = 'wget https://optimuscp.io/bash/stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' mean ' + user.added[x]._id;
                msg = 'MEAN is getting installed'
                user.added[x].logs.push({
                    msg: 'MEAN stack installation started !!'
                });
                user.added[x].msgboard = {
                    msg: 'MEAN stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            case 3:
                cmd = 'wget https://optimuscp.io/bash/stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' django ' + user.added[x]._id;
                msg = 'Django is getting installed'
                user.added[x].logs.push({
                    msg: 'Django stack installation started !!'
                });
                user.added[x].msgboard = {
                    msg: 'Django stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            case 4:
                cmd = 'wget https://optimuscp.io/bash/stack.sh -O stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' rails ' + user.added[x]._id;
                msg = 'Ruby on Rails is getting installed'
                user.added[x].logs.push({
                    msg: 'Ruby on Rails stack installation started !!'
                });
                user.added[x].msgboard = {
                    msg: 'Ruby on Rails stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            case 5:
                cmd = 'wget https://optimuscp.io/bash/stack.sh -O stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' tf ' + user.added[x]._id;
                msg = 'Tensorflow is getting installed'
                user.added[x].logs.push({
                    msg: 'Tensorflow installation started !!'
                });
                user.added[x].msgboard = {
                    msg: 'Tensorflow is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            default:
                uniR(res, false, 'Command not found !!');
                break;
        }
    } else {
        uniR(res, false, 'Server not found !!');
    }
};
