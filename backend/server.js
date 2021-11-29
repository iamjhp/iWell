//const app = require('./backend/app');

const express = require('express');
const app = express();
var routes = require(__dirname + '/routes/wellRoutes.js')
app.use(express.static(__dirname + '/../frontend/public'));
app.get('/brunnen', routes.getAll);
const PORT  = process.env.PORT || 5000;

module.exports = app;

app.listen(PORT, () => {
    console.log('server is running on port 5000.');
});
