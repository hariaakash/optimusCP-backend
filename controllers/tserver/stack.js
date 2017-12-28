var lamp = 'https://bitnami.com/redirect/to/167501/bitnami-lampstack-7.1.12-0-linux-x64-installer.run';
module.exports = function(req, res, ssh, requestIp, uniR, user, team) {
    function exec(team) {
        ssh.connect({
                host: team.added[x].ip,
                port: team.added[x].port,
                username: 'optimusCP',
                password: String(team.added[x]._id)
            })
            .then(function() {
                uniR(res, true, msg)
                ssh.exec(cmd)
                    .then(function(result) {
                        console.log(result);
                        // if (result.stdout.indexOf("optimus-finished") >= 0) {
                        //     team.added[x].stack.id = req.body.stack;
                        //     team.added[x].logs.push({
                        //         msg: 'LAMP stack installation successfull !!'
                        //     });
                        //     team.save();
                        // } else {
                        //     team.added[x].logs.push({
                        //         msg: 'LAMP stack installation failed !!'
                        //     });
                        //     team.save();
                        // }
                    })
                    .catch(function(err) {console.log(err)});
            })
            .catch(function(err) {
                console.log(err)
                uniR(res, false, 'Some error occurred !!');
            });
    }
    if ((x = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '';
        switch (req.body.stack) {
            case 1:
                var oscmd = (team.added[x].info.os.indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                cmd = 'sudo ' + oscmd + ' -y update && echo optimus-updated && wget ' + lamp + ' -O lamp.run && chmod +x lamp.run && echo optimus-downloaded && ./lamp.run --mode unattended --disable_glibcxx_version_check 1 --disable-components varnish,phpmyadmin --prefix /opt/lamp --base_password "' + team.added[x]._id + '" && echo optimus-installed && rm lamp.run && cd /opt/lamp/ && ./use_lampstack && echo optimus-finished';
                msg = 'LAMP is getting installed with mysql password: ' + team.added[x]._id
                team.added[x].logs.push({
                    msg: 'LAMP stack installation started !!'
                });
                team.added[x].msgboard = {
                    msg: 'LAMP stack is currently being installed !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
                team.save()
                    .then(function(team) {
                        exec(team);
                    });
                break;
            case 2:
                cmd = 'wget https://optimuscp.io/bash/mean.sh -O mean.sh && chmod +x mean.sh && dos2unix mean.sh && ./mean.sh';
                msg = 'MEAN is getting installed'
                team.added[x].logs.push({
                    msg: 'MEAN stack installation started !!'
                });
                team.added[x].msgboard = {
                    msg: 'MEAN stack is currently being installed !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
                team.save()
                    .then(function(team) {
                        exec(team);
                    });
                break;
            case 3:
                cmd = 'wget https://optimuscp.io/bash/django.sh -O django.sh && chmod +x django.sh && dos2unix django.sh && ./django.sh';
                msg = 'Django is getting installed'
                team.added[x].logs.push({
                    msg: 'Djano stack installation started !!'
                });
                team.added[x].msgboard = {
                    msg: 'Djano stack is currently being installed !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
                team.save()
                    .then(function(team) {
                        exec(team);
                    });
                break;
            case 4:
                cmd = 'wget https://optimuscp.io/bash/rails.sh -O rails.sh && chmod +x rails.sh && dos2unix rails.sh && ./rails.sh';
                msg = 'Ruby on Rails is getting installed'
                team.added[x].logs.push({
                    msg: 'Ruby on Rails stack installation started !!'
                });
                team.added[x].msgboard = {
                    msg: 'Ruby on Rails stack is currently being installed !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
                team.save()
                    .then(function(team) {
                        exec(team);
                    });
                break;
            default:
                uniR(res, false, 'Command not found !!');
                break;
        }
    } else {
        uniR(res, false, 'Server not found !!');
    }
};
