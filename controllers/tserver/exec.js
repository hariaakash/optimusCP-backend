var lamp = 'https://bitnami.com/redirect/to/167501/bitnami-lampstack-7.1.12-0-linux-x64-installer.run';
module.exports = function(req, res, ssh, requestIp, uniR, user, team) {
    function exec() {
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
                        if (req.body.cmd == 3 && req.body.cmd == 5 || req.body.cmd == 6) {

                        }
                    })
                    .catch(function(err) {});
            })
            .catch(function(err) {
                uniR(res, false, 'Some error occurred !!');
            });
    }
    if ((x = team.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '';
        switch (req.body.cmd) {
            case 1:
                cmd = 'sudo reboot';
                msg = 'Restarted successfully !!';
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Restarted server',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'System is rebooting !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
                team.save();
                exec();
                break;
            case 2:
                cmd = 'sudo hostnamectl set-hostname ' + req.body.hname
                team.added[x].info.hname = req.body.hname;
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Changed hostname to ' + req.body.hname,
                    user: user.email
                });
                team.save();
                msg = 'Hostname changed successfully !!';
                exec();
                break;
            case 3:
                var oscmd = (team.added[x].info.os.indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                cmd = 'sudo ' + oscmd + ' update && sudo ' + oscmd + ' -y upgrade'
                msg = 'System will be updated !!';
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Updated server',
                    user: user.email
                });
                team.added[x].msgboard = {
                    msg: 'System is being updated !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                team.save();
                exec();
                break;
            case 5:
                cmd = 'wget https://optimuscp.io/bash/lamp.sh -O lamp.sh && chmod +x lamp.sh && dos2unix lamp.sh && ./lamp.sh ' + team.added[x]._id
                msg = 'LAMP is getting installed with mysql password: ' + team.added[x]._id
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Installed LAMP with password: ' + team.added[x]._id,
                    user: user.email
                });
                team.save();
                exec();
                break;
            case 6:
                cmd = 'wget https://optimuscp.io/bash/mean.sh -O mean.sh && chmod +x mean.sh && dos2unix mean.sh && ./mean.sh';
                msg = 'MEAN is getting installed'
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Installed MEAN Stack',
                    user: user.email
                });
                team.save();
                exec();
                break;
            case 7:
                cmd = 'wget https://optimuscp.io/bash/django.sh -O django.sh && chmod +x django.sh && dos2unix django.sh && ./django.sh';
                msg = 'Django is getting installed'
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Installed Django Framework',
                    user: user.email
                });
                team.save();
                exec();
                break;
            case 8:
                cmd = 'wget https://optimuscp.io/bash/rails.sh -O rails.sh && chmod +x rails.sh && dos2unix rails.sh && ./rails.sh';
                msg = 'Ruby on Rails is getting installed'
                team.added[x].logs.push({
                    ip: requestIp.getClientIp(req),
                    msg: 'Installed Ruby on Rails Framework',
                    user: user.email
                });
                team.save();
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
