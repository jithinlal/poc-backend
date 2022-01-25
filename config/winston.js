const appRoot = require('app-root-path');
const winston = require('winston');

let options = {
	file: {
		level: 'info',
		filename: `${appRoot}/logs/app.log`,
		handleExceptions: true,
		json: true,
		maxsize: 5242880,
		maxFiles: 5,
		colorize: false,
		datePattern: 'DD-YYYY-MM',
		timestamp: true,
		humanReadableUnhandledException: true,
		prettyPrint: true,
	},
	console: {
		level: 'debug',
		handleExceptions: true,
		json: false,
		colorize: true,
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.simple(),
		),
	},
};

const logger = new winston.createLogger({
	transports: [
		// new winston.transports.File(options.file)
		new winston.transports.Console(options.console),
	],
	exitOnError: false,
});

logger.stream = {
	write: function (message, encoding) {
		logger.info(message);
	},
};

module.exports = logger;
