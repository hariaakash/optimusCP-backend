var isReachable = require('is-reachable');
var sg = require('sendgrid')('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');
var cron = require('node-cron');
var User = require('../../models/user');
var userUrl = 'https://optimuscp.io/dashboard/#!/';

module.exports = function() {
    cron.schedule('* * * * *', function() {
        User.find({})
            .then(function(users) {
                for (i = 0; i < users.length; i++) {
                    for (j = 0; j < users[i].added.length; j++) {
                        (function(i, j) {
                            isReachable(users[i].added[j].ip + ':' + users[i].added[j].port, {
                                    timeout: 1000
                                })
                                .then(function(reachable) {
                                    if (reachable) {
                                        users[i].added[j].monitorLogs[users[i].added[j].monitorLogs.length - 1].current = Date.now();
                                        if (!users[i].added[j].monitorLogs[users[i].added[j].monitorLogs.length - 1].isReachable) {
                                            users[i].added[j].monitorLogs.push({
                                                isReachable: true
                                            });
                                            var helper = require('sendgrid').mail;
                                            var from = new helper.Email('support@optimuscp.io', 'OptimusCP');
                                            var to = new helper.Email(users[i].email);
                                            var subject = 'Server ' + users[i].added[j].name + ' is UP [OptimusCP]';
                                            var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                                            var mail = new helper.Mail(from, subject, to, body);
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', users[i].email));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Server is UP'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg1-', 'Your server ' + users[i].added[j].name + ' (' + users[i].added[j].ip + ') is back UP.'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg2-', 'It was down from : ' + users[i].added[j].monitorLogs[users[i].added[j].monitorLogs.length - 2].start + ' to ' + users[i].added[j].monitorLogs[users[i].added[j].monitorLogs.length - 2].current + ' .'));
                                            mail.setTemplateId('d737b3b2-539b-4953-9bb1-57e5f23efe63');
                                            var request = sg.emptyRequest({
                                                method: 'POST',
                                                path: '/v3/mail/send',
                                                body: mail.toJSON(),
                                            });
                                            sg.API(request);
                                        }
                                        users[i].save();
                                    } else {
                                        users[i].added[j].monitorLogs[users[i].added[j].monitorLogs.length - 1].current = Date.now();
                                        if (users[i].added[j].monitorLogs[users[i].added[j].monitorLogs.length - 1].isReachable) {
                                            users[i].added[j].monitorLogs.push({
                                                isReachable: false
                                            });
                                            var helper = require('sendgrid').mail;
                                            var from = new helper.Email('support@optimuscp.io', 'OptimusCP');
                                            var to = new helper.Email(users[i].email);
                                            var subject = 'Server ' + users[i].added[j].name + ' is DOWN [OptimusCP]';
                                            var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                                            var mail = new helper.Mail(from, subject, to, body);
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', users[i].email));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Server is DOWN'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg1-', 'Your server ' + users[i].added[j].name + ' (' + users[i].added[j].ip + ') is currently DOWN.'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg2-', 'We will alert you when it is back up.'));
                                            mail.setTemplateId('d737b3b2-539b-4953-9bb1-57e5f23efe63');
                                            var request = sg.emptyRequest({
                                                method: 'POST',
                                                path: '/v3/mail/send',
                                                body: mail.toJSON(),
                                            });
                                            sg.API(request);
                                        }
                                        users[i].save();
                                    }
                                });
                        })(i, j);
                    }
                }
            });
    });
};
