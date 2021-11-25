const mysql = require('mysql2');

const connection = mysql.createPool({
    host: 'server53.hostfactory.ch',
    user: 'iwell_usr',
    password: '9eQANyTUsyze4aTu',
    database: 'iwell'
});
module.exports = connection;