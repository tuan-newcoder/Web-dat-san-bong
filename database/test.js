const db = require('./db')

async function test() {
    const [rows] = await db.query("SELECT * FROM user")
    console.log(rows)
}

test()
