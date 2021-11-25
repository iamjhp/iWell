const connection = require('../config/dbConnection.js')

async function getAll() {
    const sql = 'SELECT * FROM Brunnen';
    const [rows] = await connection.promise().query(sql);
    //console.log(rows)
    return rows;
}
exports.getAll = getAll;

/*
function test2() {
    console.log("hhhh")
}
exports.test2 = test2;
*/