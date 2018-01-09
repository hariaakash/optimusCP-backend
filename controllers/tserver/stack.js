module.exports = function(req, res, ssh, uniR, user, team) {
    function exec() {
        ssh.connect({
                host: team.added[x].ip,
                port: team.added[x].port,
                username: 'optimusCP',
                password: String(team.added[x]._id)
            })
            .then(function() {
                team.save()
                    .then(function(team) {
                        uniR(res, true, msg)
                        ssh.exec(cmd)
                            .then(function(result) {
                                if (result.stdout.split(':')[0] == "TRUE") {
                                    team.added[x].stack.id = req.body.stack;
                                    team.added[x].logs.push({
                                        msg: 'Installation successfull !!',
                                        user: user.email
                                    });
                                    team.save();
                                    console.log(result)
                                } else {
                                    team.added[x].logs.push({
                                        msg: 'Installation failed, error: ' + result.stdout.split(':')[1],
                                        user: user.email
                                    });
                                    team.save();
                                    console.log(result)
                                }
                            })
                            .catch(function(err) {
                                uniR(res, false, 'Some error occurred !!');
                            });
                    });
            })
            .catch(function(err) {
                uniR(res, false, 'Some error occurred !!');
            });
    }
    if ((x = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '',
            os = (team.added[x].info.os.indexOf("CentOS") >= 0) ? 'centos' : 'ubuntu';
        switch (req.body.stack) {
            case 1:
                cmd = 'wget https://optimuscp.io/bash/stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' lamp ' + team.added[x]._id;
                msg = 'LAMP is getting installed'
                team.added[x].logs.push({
                    msg: 'LAMP stack installation started !!',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'LAMP stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            case 2:
                cmd = 'wget https://optimuscp.io/bash/stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' mean ' + team.added[x]._id;
                msg = 'MEAN is getting installed'
                team.added[x].logs.push({
                    msg: 'MEAN stack installation started !!',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'MEAN stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            case 3:
                cmd = 'wget https://optimuscp.io/bash/stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' django ' + team.added[x]._id;
                msg = 'Django is getting installed'
                team.added[x].logs.push({
                    msg: 'Djano stack installation started !!',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'Djano stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                exec();
                break;
            case 4:
                cmd = 'wget https://optimuscp.io/bash/stack.sh && chmod +x stack.sh && sed -i "s/\r//" stack.sh && ./stack.sh ' + os + ' rails ' + team.added[x]._id;
                msg = 'Ruby on Rails is getting installed'
                team.added[x].logs.push({
                    msg: 'Ruby on Rails stack installation started !!',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'Ruby on Rails stack is currently being installed !!',
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
