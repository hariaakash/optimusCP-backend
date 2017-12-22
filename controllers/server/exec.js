var lamp = 'https://bitnami.com/redirect/to/167501/bitnami-lampstack-7.1.12-0-linux-x64-installer.run';
module.exports = function(req, res, ssh, uniR, user) {
    function exec() {
        ssh.connect({
                host: user.added[x].ip,
                port: user.added[x].port,
                username: 'optimusCP',
                password: String(user.added[x]._id)
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
    if ((x = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '';
        switch (req.body.cmd) {
            case 1:
                cmd = 'sudo reboot';
                msg = 'Restarted successfully !!';
                user.added[x].logs.push({
                    msg: 'Restarted server'
                });
                user.added[x].msgboard = {
                    msg: 'System is rebooting !!',
                    time: 1 * 60 * 1000,
                    date: Date.now()
                };
                user.save();
                exec();
                break;
            case 2:
                cmd = 'sudo hostnamectl set-hostname ' + req.body.hname
                user.added[x].info.hname = req.body.hname;
                user.added[x].logs.push({
                    msg: 'Changed hostname to ' + req.body.hname
                });
                user.save();
                msg = 'Hostname changed successfully !!';
                exec();
                break;
            case 3:
                var oscmd = (user.added[x].info.os.indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                cmd = 'sudo ' + oscmd + ' update && sudo ' + oscmd + ' -y upgrade'
                msg = 'System will be updated !!';
                user.added[x].logs.push({
                    msg: 'Updated server'
                });
                user.added[x].msgboard = {
                    msg: 'System is being updated !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                user.save();
                exec();
                break;
            case 5:
                var oscmd = (user.added[x].info.os.indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                cmd = 'sudo ' + oscmd + ' -y update && echo optimus-updated && wget ' + lamp + ' -O lamp.run && chmod +x lamp.run && echo optimus-downloaded && ./lamp.run --mode unattended --disable_glibcxx_version_check 1 --disable-components varnish,phpmyadmin --prefix /opt/lamp --base_password "' + user.added[x]._id + '" && echo optimus-installed && rm lamp.run && cd /opt/lamp/ && ./use_lampstack && echo optimus-finished';
                msg = 'LAMP is getting installed with mysql password: ' + user.added[x]._id
                user.added[x].logs.push({
                    msg: 'Installing LAMP !!'
                });
                user.added[x].msgboard = {
                    msg: 'LAMP stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                user.save();
                exec();
                break;
            case 6:
                cmd = 'wget https://optimuscp.io/bash/mean.sh -O mean.sh && chmod +x mean.sh && dos2unix mean.sh && ./mean.sh';
                msg = 'MEAN is getting installed'
                user.added[x].logs.push({
                    msg: 'Installed MEAN Stack'
                });
                user.save();
                exec();
                break;
            case 7:
                cmd = 'wget https://optimuscp.io/bash/django.sh -O django.sh && chmod +x django.sh && dos2unix django.sh && ./django.sh';
                msg = 'Django is getting installed'
                user.added[x].logs.push({
                    msg: 'Installed Django Framework'
                });
                user.save();
                exec();
                break;
            case 8:
                cmd = 'wget https://optimuscp.io/bash/rails.sh -O rails.sh && chmod +x rails.sh && dos2unix rails.sh && ./rails.sh';
                msg = 'Ruby on Rails is getting installed'
                user.added[x].logs.push({
                    msg: 'Installed Ruby on Rails Framework'
                });
                user.save();
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
