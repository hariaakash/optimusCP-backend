var lamp = 'https://bitnami.com/redirect/to/167501/bitnami-lampstack-7.1.12-0-linux-x64-installer.run';
module.exports = function(req, res, ssh, uniR, user) {
    function exec(user) {
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
                        console.log('qq')
                        // if (result.stdout.indexOf("optimus-finished") >= 0) {
                        //     user.added[x].stack.id = req.body.stack;
                        //     user.added[x].logs.push({
                        //         msg: 'LAMP stack installation successfull !!'
                        //     });
                        //     user.save();
                        //     console.log('qq1')
                        // } else {
                        //     user.added[x].logs.push({
                        //         msg: 'LAMP stack installation failed !!'
                        //     });
                        //     user.save();
                        //     console.log('qq2')
                        // }
                    })
                    .catch(function(err) {
                        console.log('qqerr')
                    });
            })
            .catch(function(err) {
                uniR(res, false, 'Some error occurred !!');
            });
    }
    if ((x = user.added.findIndex(x => x._id == req.body.serverId)) >= 0) {
        var cmd = '',
            msg = '';
        switch (req.body.stack) {
            case 1:
                var oscmd = (user.added[x].info.os.indexOf("CentOS") >= 0) ? 'yum' : 'apt-get';
                cmd = 'sudo ' + oscmd + ' -y update && wget ' + lamp + ' -O lamp.run && chmod +x lamp.run && ./lamp.run --mode unattended --disable_glibcxx_version_check 1 --disable-components varnish,phpmyadmin --prefix /opt/lamp --base_password "' + user.added[x]._id + '" && rm lamp.run && cd /opt/lamp/ && ./use_lampstack';
                msg = 'LAMP is getting installed with mysql password: ' + user.added[x]._id
                user.added[x].logs.push({
                    msg: 'LAMP stack installation started !!'
                });
                user.added[x].msgboard = {
                    msg: 'LAMP stack is currently being installed !!',
                    time: 2 * 60 * 1000,
                    date: Date.now()
                };
                user.save()
                    .then(function(user) {
                        exec(user);
                    });
                break;
            case 2:
                cmd = 'wget https://optimuscp.io/bash/mean.sh -O mean.sh && chmod +x mean.sh && dos2unix mean.sh && ./mean.sh';
                msg = 'MEAN is getting installed'
                user.added[x].logs.push({
                    msg: 'Installed MEAN Stack'
                });
                user.save();
                exec();
                break;
            case 3:
                cmd = 'wget https://optimuscp.io/bash/django.sh -O django.sh && chmod +x django.sh && dos2unix django.sh && ./django.sh';
                msg = 'Django is getting installed'
                user.added[x].logs.push({
                    msg: 'Installed Django Framework'
                });
                user.save();
                exec();
                break;
            case 4:
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
