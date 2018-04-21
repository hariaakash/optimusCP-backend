var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var hat = require('hat');
var bcrypt = require('bcryptjs');
var sg = require('sendgrid')('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');
var request = require('request');
var requestIp = require('request-ip');
var User = require('../models/user');
var Payment = require('../models/payment');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//Responder
var uniR = require('../controllers/uniR');

//instamojo
var headers = {
    'X-Api-Key': '16b10f4ff4f4c18dda2c9c8c4a1caf63',
    'X-Auth-Token': 'dea2ca7b2c6f6d3a26dabb483e3f8336'
};
var payload = {
    purpose: 'OptimusCP Credits',
    amount: 0,
    buyer_name: 'Hari',
    email: 'smgdark@gmail.com',
    phone: '9566211235',
    send_email: false,
    send_sms: false,
    redirect_url: 'https://optimuscp.io/dashboard/#!/billing/processPayment',
    webhook: 'https://webapi.optimuscp.io/payment/instamojo',
    allow_repeated_payments: false
};


app.get('/', function(req, res) {
    if (req.query.authKey) {
        User.findOne({
                authKey: req.query.authKey
            })
            .populate('payment')
            .select('payment')
            .then(function(user) {
                if (user) {
                    var payments = [];
                    user.payment = user.payment.reverse()
                    for (i = 0; i < user.payment.length; i++)
                        payments.push({
                            no: i,
                            _id: user.payment[i]._id,
                            status: user.payment[i].status,
                            amount: user.payment[i].amount,
                            modified_at: user.payment[i].modified_at
                        })
                    res.json({
                        status: true,
                        data: payments
                    });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                console.log(err)
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.post('/', function(req, res) {
    if (req.body.authKey && req.body.amount) {
        User.findOne({
                authKey: req.body.authKey
            })
            .then(function(user) {
                if (user) {
                    request.get('https://free.currencyconverterapi.com/api/v5/convert?q=USD_INR&compact=ultra', function(error, response, data) {
                        if (!error) {
                            payload.amount = Math.ceil(5 * JSON.parse(data).USD_INR);
                            payload.buyer_name = user.info.name;
                            payload.email = user.email;
                            request.post('https://www.instamojo.com/api/1.1/payment-requests/', {
                                form: payload,
                                headers: headers
                            }, function(error, response, body) {
                                if (!error && response.statusCode == 201) {
                                    var data = JSON.parse(body).payment_request;
                                    var payment = new Payment();
                                    payment._id = new mongoose.mongo.ObjectId();
                                    payment.user = user._id;
                                    payment.amount = req.body.amount;
                                    payment.handler = 'instamojo';
                                    payment.handlerId = data.id;
                                    payment.created_at = data.created_at;
                                    payment.modified_at = data.modified_at;
                                    user.payment.push(payment._id);
                                    payment.save();
                                    user.save();
                                    res.json({
                                        status: true,
                                        url: data.longurl
                                    });
                                } else {
                                    uniR(res, false, 'Payment failed try again !!')
                                }
                            });
                        } else {
                            uniR(res, false, 'Payment failed try again !!')
                        }
                    });
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});

app.get('/invoice', function(req, res) {
    if (req.query.authKey && req.query.iId) {
        User.findOne({
                authKey: req.query.authKey
            })
            .populate('payment')
            .select('payment info')
            .then(function(user) {
                if (user && user.payment[0]) {
                    if ((x = user.payment.findIndex(x => x._id == req.query.iId)) >= 0) {
                        res.json({
                            status: true,
                            data: {
                                info: user.info,
                                payment: user.payment[x]
                            }
                        });
                    } else {
                        uniR(res, false, 'Invoice ID not found !!');
                    }
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                console.log(err)
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Field !!');
    }
});

app.get('/instamojo', function(req, res) {
    if (req.query.authKey && req.query.handler && req.query.pid && req.query.prid) {
        User.findOne({
                authKey: req.query.authKey
            })
            .populate('payment', {
                handlerId: req.query.pid
            })
            .select('payment')
            .then(function(user) {
                if (user && user.payment[0]) {
                    res.json({
                        status: true,
                        data: user.payment[user.payment.length - 1]._id
                    })
                } else {
                    uniR(res, false, 'Account not found !!');
                }
            })
            .catch(function(err) {
                console.log(err)
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Field !!');
    }
});

app.post('/instamojo', function(req, res) {
    if (req.body.buyer && req.body.payment_request_id && req.body.status) {
        Payment.findOne({
                handlerId: req.body.payment_request_id
            })
            .then(function(payment) {
                if (payment) {
                    if (req.body.status == 'Credit') {
                        User.findOne({
                                email: req.body.buyer
                            })
                            .select('stats')
                            .then(function(user) {
                                if (user) {
                                    user.stats.credits += payment.amount;
                                    user.save();
                                    payment.status = 'Credited';
                                    payment.save();
                                    uniR(res, true, 'Payment Verified !!')
                                } else {
                                    uniR(res, false, 'Account not found !!');
                                }
                            })
                            .catch(function(err) {
                                uniR(res, false, 'Error when querying');
                            });
                    } else if (req.body.status == 'Failed') {
                        payment.status = 'Failed';
                        payment.save();
                        uniR(res, true, 'Payment Verified !!')
                    } else {
                        uniR(res, false, 'Something went wrong !!')
                    }
                } else {
                    uniR(res, false, 'Payment Id not found !!')
                }
            })
            .catch(function(err) {
                uniR(res, false, 'Error when querying');
            });
    } else {
        uniR(res, false, 'Empty Fields !!');
    }
});


module.exports = app;
