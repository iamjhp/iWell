const express = require('express');
const app = express();
var routes = require('./routes/wellRoutes.js')
app.use(express.static('../frontend/public'));
app.get('/brunnen', routes.getAll);

module.exports = app;