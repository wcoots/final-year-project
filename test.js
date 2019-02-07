const db = require('./db')

// const a = async () => {
//     const i = await db.qry('SELECT * FROM _test WHERE last_name = "Cooter" AND first_name = "Will"')
//     console.log('\n')
//     console.log(i)
//     console.log('\n')
// }

// const a = async () => {
//     const i = await db.qry('SELECT MAX(id) AS value FROM users')
//     console.log('\n')
//     console.log(i)
//     console.log('\n')
// }

// a()

// const b = async () => {
//     const i = await db.qry('SELECT * FROM _test WHERE first_name = ? AND last_name = ?', [
//         'Will',
//         'Cooter',
//     ])
//     console.log('\n')
//     console.log(i)
//     console.log('\n')
// }

// const bcrypt = require('bcrypt')
// const saltRounds = 10
const req = {
    body: {
        name: 'Bill',
        email: 'will@cooters.co.uk',
        company_name: 'opteo',
        password: 'test123',
    },
}

// function isEmpty(str) {
//     return !str || 0 === str.length
// }

// const a = async () => {
//     if (
//         isEmpty(req.body.name) ||
//         isEmpty(req.body.email) ||
//         isEmpty(req.body.company_name) ||
//         isEmpty(req.body.password)
//     ) {
//         console.log('oh no')
//     }

//     const hash = await bcrypt.hash(req.body.password, saltRounds)

//     const prev_id = await db.qry('SELECT MAX(id) AS value FROM users')

//     await db.qry('INSERT INTO users(id,name,email,company_name,password) VALUES(?, ?, ?, ?, ?)', [
//         prev_id[0].value + 1,
//         req.body.name,
//         req.body.email,
//         req.body.company_name,
//         hash,
//     ])
// }

const a = async () => {
    const previous = await db.qry('SELECT COUNT(*) AS count FROM users WHERE email = ?', [
        req.body.email,
    ])
    console.log(previous[0].count)
}

a()
