module.exports = {
	PORT: 3000,
	MONGOOSE: function (mongoose) {
		mongoose.Promise = global.Promise;
		mongoose.connect('mongodb://127.0.0.1:27017/optimus')
			.then(function () {
				console.log('Connected to MONGOD !!');
			}).catch(function (err) {
				console.log('Failed to establish connection with MONGOD !!');
				console.log(err.message);
			});
	},
	MW: function (app, express, morgan, path, fs, rfs, cors) {
		var logDirectory = path.join(__dirname, 'log');
		fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
		var accessLogStream = rfs('access.log', {
			interval: '1d',
			path: logDirectory
		});
		app.use(morgan('common', {
			stream: accessLogStream
		}));
		app.use(express.static('public'));
		app.use(morgan('dev'));
		app.use(cors());
		app.use(function (req, res, next) {
			if ((req.get('origin') == 'http://localhost' || req.get('origin') == 'https://optimuscp.io') || req.url.match('api') || req.url.match('server/metrics'))
				next();
			else
				res.json(403);
		});
	},
	ROUTES: function (app) {
		var routes = require('./routes');
		routes(app);
		app.get('/*', function (req, res) {
			res.json('hello');
		});
	}
};
