const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '050005',
    database: 'qlsanbong'
})

module.exports = db
