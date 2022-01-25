const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const createError = require('http-errors');
const cors = require('cors');
const path = require('path');
const http = require('http');
// const mongoose = require('mongoose');
// const { verify } = require('jsonwebtoken');
const morgan = require('morgan');
const sdk = require('node-appwrite');
let client = new sdk.Client();

const winston = require('./config/winston');
const fileRoute = require('./Routes/file.route');

// mongoose
// 	.connect(`${process.env.MONGO}`, {
// 		useCreateIndex: true,
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true,
// 		useFindAndModify: false,
// 	})
// 	.then(() => {
// 		winston.info(`Database connected: ${process.env.MONGO}`);
// 	})
// 	.catch((error) => winston.info(error));

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);

app.use(morgan('combined', { stream: winston.stream }));
app.use(fileUpload({ createParentPath: true }));

app.use(async (req, res, next) => {
	try {
		if (req.headers.authorization) {
			const accessToken = req.headers.authorization.split(' ')[1];

			try {
				let account = new sdk.Account(client);
				client
					.setEndpoint(process.env.APP_WRITE_END_POINT)
					.setProject(process.env.APP_WRITE_PROJECT_ID)
					.setJWT(accessToken)
					.setSelfSigned();

				let promise = await account.get();

				req.currentUser = promise;
				req.jwt = accessToken;
				next();
			} catch (error) {
				console.log(error);
				throw new createError(
					401,
					'Access token has expired, please login to obtain a new one.',
					{ expired: true },
				);
			}
		} else {
			next();
		}
	} catch (error) {
		next(error);
	}
});

app.use('/api', fileRoute);

app.use((err, req, res, _next) => {
	let { status, statusCode, message, expired = false, forbidden = false } = err;
	winston.error(
		`${status || 500} - ${message} - ${req.originalUrl} - ${req.method} - ${
			req.ip
		}`,
	);

	statusCode = statusCode >= 100 && statusCode < 600 ? statusCode : 500;
	if (statusCode === 500) {
		status = 500;
	}

	res.status(statusCode).json({
		status,
		message,
		expired,
		forbidden,
	});
});

const port = process.env.PORT || '4000';
const server = http.createServer(app);

server.listen(port, () => {
	winston.info(`Server running on port: ${port}`);
});
