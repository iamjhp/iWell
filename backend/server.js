const express = require('express');
const app = express();
var routes = require(__dirname + '/routes/wellRoutes.js')
app.use(express.static(__dirname + '/../frontend/public'));
app.get('/brunnen', routes.getAll);

module.exports = app;

app.listen(5000, () => {
    console.log('server is running on port 5000.');
});
