var isReachable = require('is-reachable');
var sg = require('sendgrid')('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');
var cron = require('node-cron');
var Team = require('../../models/team');
var userUrl = 'https://optimuscp.io/dashboard/#!/';

module.exports = function() {
    cron.schedule('* * * * *', function() {
        Team.find({})
            .then(function(teams) {
                for (i = 0; i < teams.length; i++) {
                    for (j = 0; j < teams[i].added.length; j++) {
                        (function(i, j) {
                            isReachable(teams[i].added[j].ip + ':' + teams[i].added[j].port)
                                .then(function(reachable) {
                                    if (reachable) {
                                        teams[i].added[j].monitorLogs[teams[i].added[j].monitorLogs.length - 1].current = Date.now();
                                        if (!teams[i].added[j].monitorLogs[teams[i].added[j].monitorLogs.length - 1].isReachable) {
                                            teams[i].added[j].monitorLogs.push({
                                                isReachable: true
                                            });
                                            var helper = require('sendgrid').mail;
                                            var from = new helper.Email('support@optimuscp.io', 'OptimusCP');
                                            var to = new helper.Email(teams[i].members[0].email);
                                            var subject = 'Server ' + teams[i].added[j].name + ' is UP [OptimusCP]';
                                            var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                                            var mail = new helper.Mail(from, subject, to, body);
                                            // var personalization = new helper.Personalization()
                                            // to = new helper.Email('hari1997aakash@gmail.com', "Example User")
                                            // personalization.addTo(email)
                                            // mail.addPersonalization(personalization);
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', teams[i].name));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Server is UP'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg1-', 'Your server ' + teams[i].added[j].name + ' (' + teams[i].added[j].ip + ') is back UP.'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg2-', 'It was down from : ' + teams[i].added[j].monitorLogs[teams[i].added[j].monitorLogs.length - 2].start + ' to ' + teams[i].added[j].monitorLogs[teams[i].added[j].monitorLogs.length - 2].current + ' .'));
                                            mail.setTemplateId('d737b3b2-539b-4953-9bb1-57e5f23efe63');
                                            var request = sg.emptyRequest({
                                                method: 'POST',
                                                path: '/v3/mail/send',
                                                body: mail.toJSON(),
                                            });
                                            sg.API(request);
                                        }
                                        teams[i].save();
                                    } else {
                                        teams[i].added[j].monitorLogs[teams[i].added[j].monitorLogs.length - 1].current = Date.now();
                                        if (teams[i].added[j].monitorLogs[teams[i].added[j].monitorLogs.length - 1].isReachable) {
                                            teams[i].added[j].monitorLogs.push({
                                                isReachable: false
                                            });
                                            var helper = require('sendgrid').mail;
                                            var from = new helper.Email('support@optimuscp.io', 'OptimusCP');
                                            var to = new helper.Email(teams[i].members[0].email);
                                            var subject = 'Server ' + teams[i].added[j].name + ' is DOWN [OptimusCP]';
                                            var body = new helper.Content('text/html', 'Welcome to OptimusCP');
                                            var mail = new helper.Mail(from, subject, to, body);
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', teams[i].name));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-url-', userUrl));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-body-', 'Server is DOWN'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg1-', 'Your server ' + teams[i].added[j].name + ' (' + teams[i].added[j].ip + ') is currently DOWN.'));
                                            mail.personalizations[0].addSubstitution(new helper.Substitution('-msg2-', 'We will alert you when it is back up.'));
                                            mail.setTemplateId('d737b3b2-539b-4953-9bb1-57e5f23efe63');
                                            var request = sg.emptyRequest({
                                                method: 'POST',
                                                path: '/v3/mail/send',
                                                body: mail.toJSON(),
                                            });
                                            sg.API(request);
                                        }
                                        teams[i].save();
                                    }
                                });
                        })(i, j);
                    }
                }
            });
    });
};
