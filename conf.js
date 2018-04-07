module.exports = {
    PORT: 3000,
    MONGOOSE: function(mongoose) {
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://127.0.0.1:27017/optimus')
            .then(function() {
                console.log('Connected to MONGOD !!');
            })
            .catch(function(err) {
                console.log('Failed to establish connection with MONGOD !!');
                console.log(err.message);
            });
    },
    MW: function(app, express, morgan, cors, Raven) {
        app.use(Raven.requestHandler());
        app.use(Raven.errorHandler());
        app.use(morgan('dev'));
        app.use(cors());
        app.use(function(req, res, next) {
            function checkUrl() {
                if (req.url.match('/api') || req.url.match('server/metrics') || req.url.match('tserver/metrics') || req.url.match('instamojo'))
                    return true
                else
                    return false
            }
            if (req.headers.accept)
                if (req.xhr || req.headers.accept.indexOf('json') > -1 || checkUrl())
                    next();
                else
                    res.json(403);
            else
                res.json(403);
        });
    },
    ROUTES: function(app) {
        var routes = require('./routes');
        routes(app);
        app.get('/*', function(req, res) {
            res.json('hello');
        });
    }
};
