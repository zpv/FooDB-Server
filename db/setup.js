const db = require('./index.js')

module.exports = async () => {
  await db.query(`DROP TABLE IF EXISTS "user", "restaurant", "menu_item", "deliverer", "drone"`)

  await db.query(`CREATE TABLE "user"
    (
      user_id	SERIAL,
      address	VARCHAR(45),
      name		VARCHAR(45),
      email VARCHAR(45) NOT NULL UNIQUE,
      password CHAR(60) NOT NULL,
      phone_num	VARCHAR(10),
      lat		DECIMAL(9,6),
      lon		DECIMAL(9,6),
    
      PRIMARY KEY (user_id)
    );
  `)

  await db.query(`CREATE TABLE "restaurant"
    (
      restaurant_id	INTEGER NOT NULL,
      name  VARCHAR(45),
      address	VARCHAR(45),
      owner		VARCHAR(45),
      category VARCHAR(45),
      rating DECIMAL(3,2),
      lat	DECIMAL(9,6),
      lon		DECIMAL(9,6),
    
      PRIMARY KEY (restaurant_id)
    );
  `)

  await db.query(`CREATE TABLE "menu_item"
    (
      name  VARCHAR(45) NOT NULL,
      restaurant_id INTEGER NOT NULL,
      availability BOOLEAN,
      has_allergens BOOLEAN,
      description TEXT,
      price DECIMAL(5,2),
      type  VARCHAR(45),

      PRIMARY KEY (name, restaurant_id),
      FOREIGN KEY (restaurant_id)
        REFERENCES "restaurant"(restaurant_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );`)

  await db.query(`CREATE TABLE "deliverer"
    (
      deliverer_id INTEGER NOT NULL,
      lat DECIMAL(9,6),
      lon DECIMAL(9,6),
    
      PRIMARY KEY (deliverer_id)
    );
  `)

  await db.query(`CREATE TABLE "drone"
    (
      deliverer_id INTEGER NOT NULL,
      model   VARCHAR(45),
      battery INTEGER,

      PRIMARY KEY (deliverer_id),
      FOREIGN KEY (deliverer_id)
        REFERENCES "restaurant"(restaurant_id)
        ON DELETE CASCADE
    );`)



  await db.query(`INSERT INTO "restaurant" (restaurant_id, name, address, owner, category, rating, lat, lon)
    VALUES  ('1',  'Steveston Fisher', '4779 Gothard St','Steven', 'Fast Food', 4.54, 0, 0),
            ('2', 'Mercante' ,'6388 University Blvd', 'UBCFood', 'Fast Food', 3.10, 0, 0);`)

  await db.query(`INSERT INTO "menu_item" (name, restaurant_id, availability, has_allergens, description, price, type)
    VALUES  ('Fish Filet', 1, true, true, 'Delicious fish filet', 24.54, 'Seafood'),
            ('Fish Sticks', 1, true, true, 'Delicious sticks of fish', 13.21, 'Seafood'),
            ('Fish Food', 1, true, true, 'Delicious food for fish', 6.56, 'Seafood'),
            ('Salmon Sashimi', 1, true, true, 'Delicious sashimi', 21.50, 'Seafood'),
            ('Crepe', 1, true, true, 'Delicious crepe', 2.54, 'Pastries'),
            ('Fancy Pizza', 2, true, true, 'Overpriced pizza', 12.10, 'Pizza'),
            ('Fancy Pizza 2', 2, true, true, 'Overpriced pizza 2', 15.60, 'Pizza')`)
}