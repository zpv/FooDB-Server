const db = require('./index.js')

module.exports = async () => {
  await db.query(`CREATE TABLE "user"
    (
      user_id	INTEGER NOT NULL,
      address	VARCHAR(45),
      name		VARCHAR(45),
      email VARCHAR(45),
      password CHAR(60),
      phone_num	INTEGER NOT NULL,
      lat		DECIMAL(9,6),
      lon		DECIMAL(9,6),
    
      PRIMARY KEY (user_id)
    );
  `)
}