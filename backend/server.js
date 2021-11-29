const express = require('express');
const app = express();
const port = Process.env.PORT || 5000
var routes = require(__dirname + '/routes/wellRoutes.js')
app.use(express.static(__dirname + '/../frontend/public'));
app.get('/brunnen', routes.getAll);

module.exports = app;

app.listen(port, () => {
    console.log('server is running on port 5000.');
});
