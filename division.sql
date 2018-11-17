  /* Get all menu items from restaurant 1 */
  (SELECT name
    FROM menu_item m
    WHERE m.restaurant_id = 1)
EXCEPT /* Subtract bad items (items which did not appear in all orders) */
  (SELECT name
   FROM (
           (SELECT order_id, name /* Cross product of all orders and possible menu item choices */
            FROM menu_item m2, "order" o2
            WHERE m2.restaurant_id = 1
              AND o2.restaurant_id = m2.restaurant_id)
          EXCEPT
           (SELECT order_id, name /* All orders and menu items actually ordered */
            FROM menu_item m3, order_item oi1
            WHERE m3.restaurant_id = 1
              AND oi1.restaurant_id = m3.restaurant_id
              AND oi1.menuitem_name = m3.name))
          AS bad)