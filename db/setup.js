const db = require('./index.js')

module.exports = async () => {
  await db.query(`DROP TABLE IF EXISTS "user", "restaurant"`)

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

  await db.query(`CREATE TABLE "restaurant"
    (
      restaurant_id	INTEGER NOT NULL,
      address	VARCHAR(45),
      owner		VARCHAR(45),
      category VARCHAR(45),
      rating DECIMAL(3,2),
      lat	DECIMAL(9,6),
      lon		DECIMAL(9,6),
    
      PRIMARY KEY (restaurant_id)
    );
  `)

  await db.query(`INSERT INTO "restaurant" (restaurant_id, address, owner, category, rating, lat, lon)
    VALUES  ('1', '4779 Gothard St', 'Steven', 'Fast Food', 4.54, 0, 0)
`)
}