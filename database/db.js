const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'qlsanbong'
})

module.exports = db
