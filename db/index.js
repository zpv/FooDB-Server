const { Pool } = require('pg')
const pool = new Pool()

module.exports = {
  query: async (text, params) => {
    const start = Date.now()

    let res = await pool.query(text, params)

    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    return res
  }
}