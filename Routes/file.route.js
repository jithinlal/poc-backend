const express = require('express');
const Router = express.Router();

const fileController = require('../Controllers/file.controller');

Router.post('/upload/:folder', fileController.upload);
Router.get('/files/:folder', fileController.files);

module.exports = Router;
