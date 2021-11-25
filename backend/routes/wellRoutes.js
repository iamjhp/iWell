var db = require('../models/well.js')

exports.getAll = async function(req, res) {
    res.send(await db.getAll());
};