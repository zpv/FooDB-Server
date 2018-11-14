const db = require('./index.js')

module.exports = async () => {
  await db.query(`DROP TABLE IF EXISTS "user", "restaurant", "menu_item", "driver", "drives", \
  "vehicle", "order", "order_item", "payment_info", "restaurant_review", "driver_review"`)


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


  await db.query(`CREATE TABLE "driver"
    (
      driver_id INTEGER NOT NULL,
      name      VARCHAR(45),
      phone_num VARCHAR(45),
      lat DECIMAL(9,6),
      lon DECIMAL(9,6),

      PRIMARY KEY (driver_id)
    );`)

  // TODO: string makes more sense, made changes to vehicle table, had to add UNIQUE for some reason
  await db.query(`CREATE TABLE "vehicle"
    (
      driver_id    INTEGER NOT NULL,
      vin             VARCHAR(45),
      license_plate   VARCHAR(45),
      make            VARCHAR(45),
      model           VARCHAR(45),
      color           VARCHAR(45),
      year            VARCHAR(45),

      PRIMARY KEY (driver_id, vin),
      UNIQUE(vin),
      FOREIGN KEY (driver_id)
        REFERENCES "driver"(driver_id)
        ON DELETE CASCADE
    );`)

  // TODO: changed datatype for vin, string makes more sense
  await db.query(`CREATE TABLE "drives"
    (
      driver_id INTEGER NOT NULL,
      vin       VARCHAR(45),
      since     TIMESTAMP,

      PRIMARY KEY (driver_id),
      FOREIGN KEY (driver_id)
        REFERENCES "driver"(driver_id)
        ON DELETE CASCADE,
      FOREIGN KEY (vin)
        REFERENCES "vehicle"(vin)
    );`)

  await db.query(`CREATE TABLE "order"
    (
      order_id          INTEGER NOT NULL,
      driver_id         INTEGER,
      user_id           INTEGER NOT NULL,
      restaurant_id     INTEGER,
      address           VARCHAR(45),
      placed_datetime   TIMESTAMP,
      delivered_datetime   TIMESTAMP,
      received_datetime   TIMESTAMP,
      special_instructions VARCHAR(300),

      PRIMARY KEY (order_id),
      FOREIGN KEY (driver_id)
        REFERENCES "driver"(driver_id),
      FOREIGN KEY (user_id)
        REFERENCES "user"(user_id)
        ON DELETE CASCADE,
      FOREIGN KEY (restaurant_id)
        REFERENCES "restaurant"(restaurant_id)
    );`)

  await db.query(`CREATE TABLE "order_item"
    (
      line_number 			INTEGER NOT NULL,
      order_id			INTEGER NOT NULL,
      restaurant_id			INTEGER NOT NULL,
      menuitem_name 		VARCHAR(45),	
      quantity 			INTEGER,
      discount 			INTEGER,


      PRIMARY KEY (line_number, order_id),
      FOREIGN KEY (order_id)
        REFERENCES "order"(order_id)
        ON DELETE CASCADE,
      FOREIGN KEY (menuitem_name, restaurant_id)
        REFERENCES "menu_item"(name, restaurant_id)
    );`)

  await db.query(`CREATE TABLE "payment_info"
    (
      card_num 			VARCHAR(45) NOT NULL,
      user_id					INTEGER NOT NULL,
      name  					VARCHAR(45),	
      exp_date 				TIMESTAMP,
      cvc 					VARCHAR(4),


      PRIMARY KEY (card_num, user_id),
      FOREIGN KEY (user_id)
        REFERENCES "user"(user_id)
        ON DELETE CASCADE
    );`)

  await db.query(`CREATE TABLE "restaurant_review"
    (
      review_id 		  INTEGER NOT NULL,
      restaurant_id   INTEGER NOT NULL,
      user_id   		INTEGER NOT NULL,
      stars   			SMALLINT NOT NULL,
      content       	VARCHAR(300),
      review_datetime	TIMESTAMP,


      PRIMARY KEY (restaurant_id, review_id),
      FOREIGN KEY (restaurant_id)
        REFERENCES "restaurant"(restaurant_id)
        ON DELETE CASCADE,
      FOREIGN KEY (user_id)
        REFERENCES "user"(user_id)
    );`)

  await db.query(`CREATE TABLE "driver_review"
    (
      driver_id   INTEGER NOT NULL,
      review_id 		  INTEGER NOT NULL,
      user_id   		INTEGER NOT NULL,
      stars   			SMALLINT NOT NULL,
      review_datetime	TIMESTAMP,

      PRIMARY KEY (driver_id, review_id),
      FOREIGN KEY (driver_id)
        REFERENCES "driver"(driver_id)
        ON DELETE CASCADE,
      FOREIGN KEY (user_id)
        REFERENCES "user"(user_id)
    );`)


  await db.query(`INSERT INTO "restaurant" (restaurant_id, name, address, owner, category, rating, lat, lon)
    VALUES  ('1',  'Steveston Fisher', '4779 Gothard St','Steven', 'Fast Food', 4.54, 0, 0),
            ('2', 'Mercante' ,'6388 University Blvd', 'UBCFood', 'Fast Food', 3.10, 0, 0);`)

  await db.query(`INSERT INTO "driver" (driver_id, name, phone_num, lat, lon)
    VALUES  ('1', 'Josh', '7789195177', '0', '0'),
            ('2', 'James', '6043211123', '0', '0');`)

  await db.query(`INSERT INTO "vehicle" (driver_id, vin, license_plate, make, model, color, year)
    VALUES  ('1', '123456-0', 'AB1234', 'Toyota', 'Corrola', 'Red', '2007'),
            ('1', '123456-1', 'AB1235', 'Honda', 'Accord', 'Black', '2009'),
            ('2', '223456-0', 'CB1235', 'Audi', 'A4', 'White', '2017');`)

  await db.query(`INSERT INTO "menu_item" (name, restaurant_id, availability, has_allergens, description, price, type)
    VALUES  ('Fish Filet', 1, true, true, 'Delicious fish filet', 24.54, 'Seafood'),
            ('Fish Sticks', 1, true, true, 'Delicious sticks of fish', 13.21, 'Seafood'),
            ('Fish Food', 1, true, true, 'Delicious food for fish', 6.56, 'Seafood'),
            ('Salmon Sashimi', 1, true, true, 'Delicious sashimi', 21.50, 'Seafood'),
            ('Crepe', 1, true, true, 'Delicious crepe', 2.54, 'Pastries'),
            ('Fancy Pizza', 2, true, true, 'Overpriced pizza', 12.10, 'Pizza'),
            ('Fancy Pizza 2', 2, true, true, 'Overpriced pizza 2', 15.60, 'Pizza')`)

  await db.query(`INSERT INTO "user" (name, email, password) VALUES ('Steven Zhao', 'steven@zhao.io', '$2a$08$undNp20HMxGoZix1k79uMODYeKE7Z7CDkfmkGKe7HfagyRbbryJQq')`)

  await db.query(`INSERT INTO "restaurant_review" (review_id, restaurant_id, user_id, stars, content)
    VALUES  (1, 1, 1, 2.5, 'It is an okay restaurant with okay food.')`)
}