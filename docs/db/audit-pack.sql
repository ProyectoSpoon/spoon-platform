-- SQL Audit Pack for PostgreSQL (Supabase)
-- Schema: change the value below if not using 'public'
-- This script is designed for psql; you can run sections independently.

\echo 'Using schema: public'

-- 1) Tables overview with estimated row counts and sizes
WITH tables AS (
  SELECT
    n.nspname        AS schema,
    c.relname        AS table,
    c.oid            AS oid,
    c.reltuples      AS est_rows
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' AND n.nspname = 'public'
)

| schema | table                          | oid   | est_rows |
| ------ | ------------------------------ | ----- | -------- |
| public | users                          | 17269 | -1       |
| public | restaurants                    | 17285 | -1       |
| public | numeracion_facturas            | 33138 | -1       |
| public | cuisine_types                  | 17600 | -1       |
| public | countries                      | 17648 | -1       |
| public | departments                    | 17663 | -1       |
| public | cities                         | 17681 | 51       |
| public | facturas                       | 33153 | -1       |
| public | universal_categories           | 18458 | -1       |
| public | restaurant_product_usage       | 18542 | -1       |
| public | product_suggestions            | 18502 | -1       |
| public | universal_products             | 18473 | 100      |
| public | product_aliases                | 18566 | -1       |
| public | caja_sesiones                  | 32931 | 2        |
| public | restaurant_mesas               | 29146 | 10       |
| public | daily_menus                    | 20050 | 6        |
| public | generated_combinations         | 20125 | 65       |
| public | daily_menu_selections          | 20074 | 71       |
| public | protein_quantities             | 20100 | -1       |
| public | restaurant_favorites           | 20394 | -1       |
| public | delivery_orders                | 21789 | 1        |
| public | delivery_personnel             | 21773 | -1       |
| public | audit_log                      | 35368 | -1       |
| public | transacciones_caja             | 32972 | -1       |
| public | daily_special_activations      | 22681 | -1       |
| public | security_policies              | 35420 | -1       |
| public | security_alerts                | 35471 | -1       |
| public | authorization_requests         | 35446 | -1       |
| public | gastos_caja                    | 33098 | -1       |
| public | special_dish_selections        | 22587 | -1       |
| public | generated_special_combinations | 22613 | -1       |
| public | special_protein_quantities     | 22655 | -1       |
| public | ordenes_mesa                   | 25070 | 0        |
| public | special_dishes                 | 22798 | -1       |
| public | items_orden_mesa               | 25087 | -1       |


SELECT
  t.schema,
  t.table,
  COALESCE(t.est_rows, 0)::bigint AS est_rows,
  pg_size_pretty(pg_total_relation_size(t.oid)) AS total_size,
  pg_size_pretty(pg_relation_size(t.oid))       AS table_size,
  pg_size_pretty(pg_indexes_size(t.oid))        AS index_size
FROM tables t
ORDER BY total_size DESC, t.table;

ERROR:  42P01: relation "tables" does not exist
LINE 8: FROM tables t
             ^
Note: A limit of 100 was applied to your query. If this was the cause of a syntax error, try selecting "No limit" instead and re-run the query.



-- 2) Columns and defaults
SELECT
  c.table_schema   AS schema,
  c.table_name     AS table,
  c.column_name    AS column,
  c.ordinal_position AS position,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_schema, c.table_name, c.ordinal_position;

| schema | table                          | column                               | position | data_type                   | udt_name    | is_nullable | column_default                                                                        |
| ------ | ------------------------------ | ------------------------------------ | -------- | --------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------- |
| public | audit_log                      | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | audit_log                      | table_name                           | 2        | text                        | text        | NO          | null                                                                                  |
| public | audit_log                      | operation                            | 3        | text                        | text        | NO          | null                                                                                  |
| public | audit_log                      | old_data                             | 4        | jsonb                       | jsonb       | YES         | null                                                                                  |
| public | audit_log                      | new_data                             | 5        | jsonb                       | jsonb       | YES         | null                                                                                  |
| public | audit_log                      | user_id                              | 6        | uuid                        | uuid        | YES         | null                                                                                  |
| public | audit_log                      | timestamp                            | 7        | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | authorization_requests         | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | authorization_requests         | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | authorization_requests         | cajero_id                            | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | authorization_requests         | supervisor_id                        | 4        | uuid                        | uuid        | YES         | null                                                                                  |
| public | authorization_requests         | tipo_autorizacion                    | 5        | text                        | text        | NO          | null                                                                                  |
| public | authorization_requests         | monto_solicitado                     | 6        | integer                     | int4        | YES         | null                                                                                  |
| public | authorization_requests         | orden_id                             | 7        | uuid                        | uuid        | YES         | null                                                                                  |
| public | authorization_requests         | motivo                               | 8        | text                        | text        | YES         | null                                                                                  |
| public | authorization_requests         | justificacion                        | 9        | text                        | text        | YES         | null                                                                                  |
| public | authorization_requests         | estado                               | 10       | text                        | text        | YES         | 'pendiente'::text                                                                     |
| public | authorization_requests         | aprobada_at                          | 11       | timestamp with time zone    | timestamptz | YES         | null                                                                                  |
| public | authorization_requests         | rechazada_at                         | 12       | timestamp with time zone    | timestamptz | YES         | null                                                                                  |
| public | authorization_requests         | motivo_rechazo                       | 13       | text                        | text        | YES         | null                                                                                  |
| public | authorization_requests         | created_at                           | 14       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | caja_sesiones                  | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | caja_sesiones                  | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | caja_sesiones                  | cajero_id                            | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | caja_sesiones                  | monto_inicial                        | 4        | integer                     | int4        | NO          | 0                                                                                     |
| public | caja_sesiones                  | estado                               | 5        | character varying           | varchar     | YES         | 'abierta'::character varying                                                          |
| public | caja_sesiones                  | abierta_at                           | 6        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | caja_sesiones                  | cerrada_at                           | 7        | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | caja_sesiones                  | notas_apertura                       | 8        | text                        | text        | YES         | null                                                                                  |
| public | caja_sesiones                  | notas_cierre                         | 9        | text                        | text        | YES         | null                                                                                  |
| public | cities                         | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | cities                         | name                                 | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | cities                         | department_id                        | 3        | uuid                        | uuid        | YES         | null                                                                                  |
| public | cities                         | latitude                             | 4        | numeric                     | numeric     | YES         | null                                                                                  |
| public | cities                         | longitude                            | 5        | numeric                     | numeric     | YES         | null                                                                                  |
| public | cities                         | population                           | 6        | integer                     | int4        | YES         | null                                                                                  |
| public | cities                         | is_capital                           | 7        | boolean                     | bool        | YES         | false                                                                                 |
| public | cities                         | is_active                            | 8        | boolean                     | bool        | YES         | true                                                                                  |
| public | cities                         | created_at                           | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | cities                         | updated_at                           | 10       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | countries                      | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | countries                      | name                                 | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | countries                      | code                                 | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | countries                      | iso_code                             | 4        | character varying           | varchar     | NO          | null                                                                                  |
| public | countries                      | phone_code                           | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | countries                      | currency                             | 6        | character varying           | varchar     | YES         | null                                                                                  |
| public | countries                      | is_active                            | 7        | boolean                     | bool        | YES         | true                                                                                  |
| public | countries                      | created_at                           | 8        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | countries                      | updated_at                           | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | cuisine_types                  | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | cuisine_types                  | name                                 | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | cuisine_types                  | slug                                 | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | cuisine_types                  | description                          | 4        | text                        | text        | YES         | null                                                                                  |
| public | cuisine_types                  | icon                                 | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | cuisine_types                  | is_active                            | 6        | boolean                     | bool        | YES         | true                                                                                  |
| public | cuisine_types                  | display_order                        | 7        | integer                     | int4        | YES         | 0                                                                                     |
| public | cuisine_types                  | created_at                           | 8        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | cuisine_types                  | updated_at                           | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | daily_menu_selections          | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | daily_menu_selections          | daily_menu_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | daily_menu_selections          | universal_product_id                 | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | daily_menu_selections          | category_id                          | 4        | uuid                        | uuid        | NO          | null                                                                                  |
| public | daily_menu_selections          | category_name                        | 5        | character varying           | varchar     | NO          | null                                                                                  |
| public | daily_menu_selections          | product_name                         | 6        | character varying           | varchar     | NO          | null                                                                                  |
| public | daily_menu_selections          | selected_at                          | 7        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | daily_menu_selections          | selection_order                      | 8        | integer                     | int4        | YES         | 0                                                                                     |
| public | daily_menus                    | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | daily_menus                    | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | daily_menus                    | menu_date                            | 3        | date                        | date        | NO          | CURRENT_DATE                                                                          |
| public | daily_menus                    | menu_price                           | 4        | integer                     | int4        | NO          | null                                                                                  |
| public | daily_menus                    | status                               | 5        | character varying           | varchar     | YES         | 'active'::character varying                                                           |
| public | daily_menus                    | total_combinations_generated         | 6        | integer                     | int4        | YES         | 0                                                                                     |
| public | daily_menus                    | total_products_selected              | 7        | integer                     | int4        | YES         | 0                                                                                     |
| public | daily_menus                    | categories_configured                | 8        | integer                     | int4        | YES         | 0                                                                                     |
| public | daily_menus                    | created_at                           | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | daily_menus                    | updated_at                           | 10       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | daily_menus                    | expires_at                           | 11       | timestamp without time zone | timestamp   | YES         | ((CURRENT_DATE + '1 day'::interval) + ('22:00:00'::time without time zone)::interval) |
| public | daily_special_activations      | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | daily_special_activations      | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | daily_special_activations      | special_dish_id                      | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | daily_special_activations      | activation_date                      | 4        | date                        | date        | NO          | CURRENT_DATE                                                                          |
| public | daily_special_activations      | is_active                            | 5        | boolean                     | bool        | YES         | true                                                                                  |
| public | daily_special_activations      | daily_price_override                 | 6        | integer                     | int4        | YES         | null                                                                                  |
| public | daily_special_activations      | daily_max_quantity                   | 7        | integer                     | int4        | YES         | null                                                                                  |
| public | daily_special_activations      | notes                                | 8        | text                        | text        | YES         | null                                                                                  |
| public | daily_special_activations      | activated_at                         | 9        | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | daily_special_activations      | deactivated_at                       | 10       | timestamp with time zone    | timestamptz | YES         | null                                                                                  |
| public | delivery_orders                | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | delivery_orders                | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | delivery_orders                | daily_menu_id                        | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | delivery_orders                | customer_name                        | 4        | character varying           | varchar     | NO          | null                                                                                  |
| public | delivery_orders                | customer_phone                       | 5        | character varying           | varchar     | NO          | null                                                                                  |
| public | delivery_orders                | delivery_address                     | 6        | text                        | text        | NO          | null                                                                                  |
| public | delivery_orders                | order_items                          | 7        | jsonb                       | jsonb       | NO          | null                                                                                  |
| public | delivery_orders                | total_amount                         | 8        | integer                     | int4        | NO          | null                                                                                  |
| public | delivery_orders                | delivery_fee                         | 9        | integer                     | int4        | YES         | 300000                                                                                |
| public | delivery_orders                | status                               | 10       | character varying           | varchar     | YES         | 'received'::character varying                                                         |
| public | delivery_orders                | assigned_delivery_person_id          | 11       | uuid                        | uuid        | YES         | null                                                                                  |
| public | delivery_orders                | estimated_delivery_minutes           | 12       | integer                     | int4        | YES         | 30                                                                                    |
| public | delivery_orders                | created_at                           | 13       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | delivery_orders                | sent_at                              | 14       | timestamp with time zone    | timestamptz | YES         | null                                                                                  |
| public | delivery_orders                | delivered_at                         | 15       | timestamp with time zone    | timestamptz | YES         | null                                                                                  |
| public | delivery_orders                | paid_at                              | 16       | timestamp with time zone    | timestamptz | YES         | null                                                                                  |
| public | delivery_orders                | special_notes                        | 17       | text                        | text        | YES         | null                                                                                  |
| public | delivery_orders                | pagada_at                            | 18       | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | delivery_personnel             | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | delivery_personnel             | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | delivery_personnel             | name                                 | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | delivery_personnel             | phone                                | 4        | character varying           | varchar     | NO          | null                                                                                  |
| public | delivery_personnel             | is_active                            | 5        | boolean                     | bool        | YES         | true                                                                                  |
| public | delivery_personnel             | status                               | 6        | character varying           | varchar     | YES         | 'available'::character varying                                                        |
| public | delivery_personnel             | created_at                           | 7        | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | delivery_personnel             | updated_at                           | 8        | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | departments                    | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | departments                    | name                                 | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | departments                    | code                                 | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | departments                    | country_id                           | 4        | uuid                        | uuid        | YES         | null                                                                                  |
| public | departments                    | is_active                            | 5        | boolean                     | bool        | YES         | true                                                                                  |
| public | departments                    | created_at                           | 6        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | departments                    | updated_at                           | 7        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | facturas                       | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | facturas                       | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | facturas                       | numero_factura                       | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | facturas                       | transaccion_id                       | 4        | uuid                        | uuid        | YES         | null                                                                                  |
| public | facturas                       | cliente_nombre                       | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | facturas                       | cliente_documento                    | 6        | character varying           | varchar     | YES         | null                                                                                  |
| public | facturas                       | subtotal                             | 7        | integer                     | int4        | NO          | null                                                                                  |
| public | facturas                       | impuestos                            | 8        | integer                     | int4        | YES         | 0                                                                                     |
| public | facturas                       | total                                | 9        | integer                     | int4        | NO          | null                                                                                  |
| public | facturas                       | metodo_pago                          | 10       | character varying           | varchar     | NO          | null                                                                                  |
| public | facturas                       | estado                               | 11       | character varying           | varchar     | YES         | 'emitida'::character varying                                                          |
| public | facturas                       | generada_at                          | 12       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | facturas                       | generada_por                         | 13       | uuid                        | uuid        | NO          | null                                                                                  |
| public | facturas                       | datos_json                           | 14       | jsonb                       | jsonb       | YES         | null                                                                                  |
| public | facturas                       | cliente_email                        | 15       | character varying           | varchar     | YES         | null                                                                                  |
| public | facturas                       | cliente_telefono                     | 16       | character varying           | varchar     | YES         | null                                                                                  |
| public | facturas                       | motivo_anulacion                     | 17       | text                        | text        | YES         | null                                                                                  |
| public | facturas                       | anulada_at                           | 18       | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | facturas                       | anulada_por                          | 19       | uuid                        | uuid        | YES         | null                                                                                  |
| public | facturas                       | created_at                           | 20       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | facturas                       | updated_at                           | 21       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | gastos_caja                    | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | gastos_caja                    | caja_sesion_id                       | 2        | uuid                        | uuid        | YES         | null                                                                                  |
| public | gastos_caja                    | concepto                             | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | gastos_caja                    | monto                                | 4        | integer                     | int4        | NO          | null                                                                                  |
| public | gastos_caja                    | categoria                            | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | gastos_caja                    | comprobante_url                      | 6        | text                        | text        | YES         | null                                                                                  |
| public | gastos_caja                    | registrado_por                       | 7        | uuid                        | uuid        | NO          | null                                                                                  |
| public | gastos_caja                    | registrado_at                        | 8        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | gastos_caja                    | notas                                | 9        | text                        | text        | YES         | null                                                                                  |
| public | generated_combinations         | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | generated_combinations         | daily_menu_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | generated_combinations         | combination_name                     | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | generated_combinations         | combination_description              | 4        | text                        | text        | YES         | null                                                                                  |
| public | generated_combinations         | combination_price                    | 5        | integer                     | int4        | NO          | null                                                                                  |
| public | generated_combinations         | entrada_product_id                   | 6        | uuid                        | uuid        | YES         | null                                                                                  |
| public | generated_combinations         | principio_product_id                 | 7        | uuid                        | uuid        | NO          | null                                                                                  |
| public | generated_combinations         | proteina_product_id                  | 8        | uuid                        | uuid        | NO          | null                                                                                  |
| public | generated_combinations         | acompanamiento_products              | 9        | ARRAY                       | _uuid       | YES         | '{}'::uuid[]                                                                          |
| public | generated_combinations         | bebida_product_id                    | 10       | uuid                        | uuid        | YES         | null                                                                                  |
| public | generated_combinations         | is_available                         | 11       | boolean                     | bool        | YES         | true                                                                                  |
| public | generated_combinations         | is_favorite                          | 12       | boolean                     | bool        | YES         | false                                                                                 |
| public | generated_combinations         | is_special                           | 13       | boolean                     | bool        | YES         | false                                                                                 |
| public | generated_combinations         | generated_at                         | 14       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | generated_combinations         | updated_at                           | 15       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | generated_special_combinations | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | generated_special_combinations | special_dish_id                      | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | generated_special_combinations | combination_name                     | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | generated_special_combinations | combination_description              | 4        | text                        | text        | YES         | null                                                                                  |
| public | generated_special_combinations | combination_price                    | 5        | integer                     | int4        | NO          | null                                                                                  |
| public | generated_special_combinations | entrada_product_id                   | 6        | uuid                        | uuid        | YES         | null                                                                                  |
| public | generated_special_combinations | principio_product_id                 | 7        | uuid                        | uuid        | YES         | null                                                                                  |
| public | generated_special_combinations | proteina_product_id                  | 8        | uuid                        | uuid        | NO          | null                                                                                  |
| public | generated_special_combinations | acompanamiento_products              | 9        | ARRAY                       | _uuid       | YES         | null                                                                                  |
| public | generated_special_combinations | bebida_product_id                    | 10       | uuid                        | uuid        | YES         | null                                                                                  |
| public | generated_special_combinations | is_available                         | 11       | boolean                     | bool        | YES         | true                                                                                  |
| public | generated_special_combinations | is_favorite                          | 12       | boolean                     | bool        | YES         | false                                                                                 |
| public | generated_special_combinations | is_featured                          | 13       | boolean                     | bool        | YES         | false                                                                                 |
| public | generated_special_combinations | available_today                      | 14       | boolean                     | bool        | YES         | false                                                                                 |
| public | generated_special_combinations | max_daily_quantity                   | 15       | integer                     | int4        | YES         | null                                                                                  |
| public | generated_special_combinations | current_sold_quantity                | 16       | integer                     | int4        | YES         | 0                                                                                     |
| public | generated_special_combinations | generated_at                         | 17       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | generated_special_combinations | updated_at                           | 18       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | items_orden_mesa               | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | items_orden_mesa               | orden_mesa_id                        | 2        | uuid                        | uuid        | YES         | null                                                                                  |
| public | items_orden_mesa               | combinacion_id                       | 3        | uuid                        | uuid        | YES         | null                                                                                  |
| public | items_orden_mesa               | combinacion_especial_id              | 4        | uuid                        | uuid        | YES         | null                                                                                  |
| public | items_orden_mesa               | tipo_item                            | 5        | character varying           | varchar     | NO          | null                                                                                  |
| public | items_orden_mesa               | cantidad                             | 6        | integer                     | int4        | YES         | 1                                                                                     |
| public | items_orden_mesa               | precio_unitario                      | 7        | integer                     | int4        | NO          | null                                                                                  |
| public | items_orden_mesa               | precio_total                         | 8        | integer                     | int4        | NO          | null                                                                                  |
| public | items_orden_mesa               | observaciones_item                   | 9        | text                        | text        | YES         | null                                                                                  |
| public | items_orden_mesa               | fecha_creacion                       | 10       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | numeracion_facturas            | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | numeracion_facturas            | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | numeracion_facturas            | prefijo                              | 3        | character varying           | varchar     | YES         | 'FACT'::character varying                                                             |
| public | numeracion_facturas            | numero_actual                        | 4        | integer                     | int4        | YES         | 1                                                                                     |
| public | numeracion_facturas            | ultimo_usado_at                      | 5        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | numeracion_facturas            | created_at                           | 6        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | numeracion_facturas            | updated_at                           | 7        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | ordenes_mesa                   | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | ordenes_mesa                   | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | ordenes_mesa                   | numero_mesa                          | 3        | integer                     | int4        | NO          | null                                                                                  |
| public | ordenes_mesa                   | monto_total                          | 4        | integer                     | int4        | NO          | null                                                                                  |
| public | ordenes_mesa                   | estado                               | 5        | character varying           | varchar     | YES         | 'activa'::character varying                                                           |
| public | ordenes_mesa                   | nombre_mesero                        | 6        | character varying           | varchar     | YES         | null                                                                                  |
| public | ordenes_mesa                   | observaciones                        | 7        | text                        | text        | YES         | null                                                                                  |
| public | ordenes_mesa                   | fecha_creacion                       | 8        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | ordenes_mesa                   | fecha_actualizacion                  | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | ordenes_mesa                   | mesa_id                              | 10       | uuid                        | uuid        | YES         | null                                                                                  |
| public | ordenes_mesa                   | pagada_at                            | 11       | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | product_aliases                | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | product_aliases                | universal_product_id                 | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | product_aliases                | alias                                | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | product_aliases                | alias_type                           | 4        | character varying           | varchar     | YES         | 'regional'::character varying                                                         |
| public | product_aliases                | region                               | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | product_aliases                | is_verified                          | 6        | boolean                     | bool        | YES         | false                                                                                 |
| public | product_aliases                | created_at                           | 7        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | product_suggestions            | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | product_suggestions            | suggested_name                       | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | product_suggestions            | suggested_description                | 3        | text                        | text        | YES         | null                                                                                  |
| public | product_suggestions            | suggested_category_id                | 4        | uuid                        | uuid        | YES         | null                                                                                  |
| public | product_suggestions            | suggested_tags                       | 5        | ARRAY                       | _text       | YES         | '{}'::text[]                                                                          |
| public | product_suggestions            | suggested_regional_names             | 6        | ARRAY                       | _text       | YES         | '{}'::text[]                                                                          |
| public | product_suggestions            | suggested_by_restaurant_id           | 7        | uuid                        | uuid        | YES         | null                                                                                  |
| public | product_suggestions            | suggested_by_user_id                 | 8        | uuid                        | uuid        | YES         | null                                                                                  |
| public | product_suggestions            | suggestion_reason                    | 9        | text                        | text        | YES         | null                                                                                  |
| public | product_suggestions            | is_regional_specialty                | 10       | boolean                     | bool        | YES         | false                                                                                 |
| public | product_suggestions            | estimated_price                      | 11       | integer                     | int4        | YES         | null                                                                                  |
| public | product_suggestions            | preparation_notes                    | 12       | text                        | text        | YES         | null                                                                                  |
| public | product_suggestions            | status                               | 13       | character varying           | varchar     | YES         | 'pending'::character varying                                                          |
| public | product_suggestions            | reviewed_by                          | 14       | uuid                        | uuid        | YES         | null                                                                                  |
| public | product_suggestions            | reviewed_at                          | 15       | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | product_suggestions            | review_notes                         | 16       | text                        | text        | YES         | null                                                                                  |
| public | product_suggestions            | approved_product_id                  | 17       | uuid                        | uuid        | YES         | null                                                                                  |
| public | product_suggestions            | created_at                           | 18       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | product_suggestions            | updated_at                           | 19       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | protein_quantities             | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | protein_quantities             | daily_menu_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | protein_quantities             | protein_product_id                   | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | protein_quantities             | planned_quantity                     | 4        | integer                     | int4        | NO          | 10                                                                                    |
| public | protein_quantities             | unit_type                            | 5        | character varying           | varchar     | YES         | 'units'::character varying                                                            |
| public | protein_quantities             | usage_frequency_score                | 6        | integer                     | int4        | YES         | 1                                                                                     |
| public | protein_quantities             | created_at                           | 7        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | protein_quantities             | updated_at                           | 8        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurant_favorites           | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | restaurant_favorites           | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | restaurant_favorites           | product_id                           | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | restaurant_favorites           | created_at                           | 4        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurant_favorites           | updated_at                           | 5        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurant_mesas               | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | restaurant_mesas               | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | restaurant_mesas               | numero                               | 3        | integer                     | int4        | NO          | null                                                                                  |
| public | restaurant_mesas               | nombre                               | 4        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurant_mesas               | capacidad_personas                   | 6        | integer                     | int4        | YES         | 4                                                                                     |
| public | restaurant_mesas               | estado                               | 7        | character varying           | varchar     | YES         | 'libre'::character varying                                                            |
| public | restaurant_mesas               | notas                                | 8        | text                        | text        | YES         | null                                                                                  |
| public | restaurant_mesas               | created_at                           | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurant_mesas               | updated_at                           | 10       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurant_product_usage       | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | restaurant_product_usage       | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | restaurant_product_usage       | universal_product_id                 | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | restaurant_product_usage       | times_used                           | 4        | integer                     | int4        | YES         | 1                                                                                     |
| public | restaurant_product_usage       | last_used_date                       | 5        | date                        | date        | YES         | CURRENT_DATE                                                                          |
| public | restaurant_product_usage       | first_used_date                      | 6        | date                        | date        | YES         | CURRENT_DATE                                                                          |
| public | restaurant_product_usage       | restaurant_price                     | 7        | integer                     | int4        | YES         | null                                                                                  |
| public | restaurant_product_usage       | avg_rating                           | 8        | numeric                     | numeric     | YES         | null                                                                                  |
| public | restaurant_product_usage       | total_orders                         | 9        | integer                     | int4        | YES         | 0                                                                                     |
| public | restaurant_product_usage       | created_at                           | 10       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurant_product_usage       | updated_at                           | 11       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurants                    | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | restaurants                    | owner_id                             | 2        | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants                    | name                                 | 3        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants                    | description                          | 4        | text                        | text        | YES         | null                                                                                  |
| public | restaurants                    | contact_phone                        | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants                    | contact_email                        | 6        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants                    | cuisine_type                         | 7        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants                    | address                              | 8        | text                        | text        | YES         | null                                                                                  |
| public | restaurants                    | city                                 | 9        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants                    | state                                | 10       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants                    | country                              | 11       | character varying           | varchar     | YES         | 'Colombia'::character varying                                                         |
| public | restaurants                    | latitude                             | 12       | numeric                     | numeric     | YES         | null                                                                                  |
| public | restaurants                    | longitude                            | 13       | numeric                     | numeric     | YES         | null                                                                                  |
| public | restaurants                    | business_hours                       | 14       | jsonb                       | jsonb       | YES         | '{}'::jsonb                                                                           |
| public | restaurants                    | logo_url                             | 15       | text                        | text        | YES         | null                                                                                  |
| public | restaurants                    | cover_image_url                      | 16       | text                        | text        | YES         | null                                                                                  |
| public | restaurants                    | setup_completed                      | 17       | boolean                     | bool        | YES         | false                                                                                 |
| public | restaurants                    | setup_step                           | 18       | integer                     | int4        | YES         | 1                                                                                     |
| public | restaurants                    | status                               | 19       | character varying           | varchar     | YES         | 'configuring'::character varying                                                      |
| public | restaurants                    | created_at                           | 20       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurants                    | updated_at                           | 21       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | restaurants                    | cuisine_type_id                      | 22       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants                    | country_id                           | 23       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants                    | department_id                        | 24       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants                    | city_id                              | 25       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants_with_location      | id                                   | 1        | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants_with_location      | owner_id                             | 2        | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants_with_location      | name                                 | 3        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | description                          | 4        | text                        | text        | YES         | null                                                                                  |
| public | restaurants_with_location      | contact_phone                        | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | contact_email                        | 6        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | cuisine_type                         | 7        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | address                              | 8        | text                        | text        | YES         | null                                                                                  |
| public | restaurants_with_location      | city                                 | 9        | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | state                                | 10       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | country                              | 11       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | latitude                             | 12       | numeric                     | numeric     | YES         | null                                                                                  |
| public | restaurants_with_location      | longitude                            | 13       | numeric                     | numeric     | YES         | null                                                                                  |
| public | restaurants_with_location      | business_hours                       | 14       | jsonb                       | jsonb       | YES         | null                                                                                  |
| public | restaurants_with_location      | logo_url                             | 15       | text                        | text        | YES         | null                                                                                  |
| public | restaurants_with_location      | cover_image_url                      | 16       | text                        | text        | YES         | null                                                                                  |
| public | restaurants_with_location      | setup_completed                      | 17       | boolean                     | bool        | YES         | null                                                                                  |
| public | restaurants_with_location      | setup_step                           | 18       | integer                     | int4        | YES         | null                                                                                  |
| public | restaurants_with_location      | status                               | 19       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | created_at                           | 20       | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | restaurants_with_location      | updated_at                           | 21       | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | restaurants_with_location      | cuisine_type_id                      | 22       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants_with_location      | country_id                           | 23       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants_with_location      | department_id                        | 24       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants_with_location      | city_id                              | 25       | uuid                        | uuid        | YES         | null                                                                                  |
| public | restaurants_with_location      | country_name                         | 26       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | country_code                         | 27       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | department_name                      | 28       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | department_code                      | 29       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | city_name                            | 30       | character varying           | varchar     | YES         | null                                                                                  |
| public | restaurants_with_location      | city_latitude                        | 31       | numeric                     | numeric     | YES         | null                                                                                  |
| public | restaurants_with_location      | city_longitude                       | 32       | numeric                     | numeric     | YES         | null                                                                                  |
| public | security_alerts                | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | security_alerts                | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | security_alerts                | cajero_id                            | 3        | uuid                        | uuid        | YES         | null                                                                                  |
| public | security_alerts                | tipo_alerta                          | 4        | text                        | text        | NO          | null                                                                                  |
| public | security_alerts                | severidad                            | 5        | text                        | text        | YES         | 'media'::text                                                                         |
| public | security_alerts                | descripcion                          | 6        | text                        | text        | NO          | null                                                                                  |
| public | security_alerts                | datos_contexto                       | 7        | jsonb                       | jsonb       | YES         | null                                                                                  |
| public | security_alerts                | revisada                             | 8        | boolean                     | bool        | YES         | false                                                                                 |
| public | security_alerts                | revisada_por                         | 9        | uuid                        | uuid        | YES         | null                                                                                  |
| public | security_alerts                | revisada_at                          | 10       | timestamp with time zone    | timestamptz | YES         | null                                                                                  |
| public | security_alerts                | acciones_tomadas                     | 11       | text                        | text        | YES         | null                                                                                  |
| public | security_alerts                | created_at                           | 12       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | security_policies              | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | security_policies              | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | security_policies              | limite_transaccion_normal            | 3        | integer                     | int4        | YES         | 50000000                                                                              |
| public | security_policies              | limite_transaccion_efectivo          | 4        | integer                     | int4        | YES         | 20000000                                                                              |
| public | security_policies              | limite_autorizacion_supervisor       | 5        | integer                     | int4        | YES         | 100000000                                                                             |
| public | security_policies              | limite_diario_cajero                 | 6        | integer                     | int4        | YES         | 500000000                                                                             |
| public | security_policies              | limite_transacciones_por_hora        | 7        | integer                     | int4        | YES         | 50                                                                                    |
| public | security_policies              | requiere_autorizacion_efectivo_alto  | 8        | boolean                     | bool        | YES         | true                                                                                  |
| public | security_policies              | limite_efectivo_sin_cambio           | 9        | integer                     | int4        | YES         | 10000000                                                                              |
| public | security_policies              | alerta_transacciones_consecutivas    | 10       | integer                     | int4        | YES         | 10                                                                                    |
| public | security_policies              | alerta_monto_inusual_factor          | 11       | numeric                     | numeric     | YES         | 5.0                                                                                   |
| public | security_policies              | requiere_justificacion_montos_altos  | 12       | boolean                     | bool        | YES         | true                                                                                  |
| public | security_policies              | requiere_supervisor_para_anulaciones | 13       | boolean                     | bool        | YES         | true                                                                                  |
| public | security_policies              | created_at                           | 14       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | security_policies              | updated_at                           | 15       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | special_dish_selections        | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | special_dish_selections        | special_dish_id                      | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | special_dish_selections        | universal_product_id                 | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | special_dish_selections        | category_id                          | 4        | uuid                        | uuid        | NO          | null                                                                                  |
| public | special_dish_selections        | category_name                        | 5        | character varying           | varchar     | NO          | null                                                                                  |
| public | special_dish_selections        | product_name                         | 6        | character varying           | varchar     | NO          | null                                                                                  |
| public | special_dish_selections        | selection_order                      | 7        | integer                     | int4        | YES         | 0                                                                                     |
| public | special_dish_selections        | is_required                          | 8        | boolean                     | bool        | YES         | true                                                                                  |
| public | special_dish_selections        | selected_at                          | 9        | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | special_dishes                 | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | special_dishes                 | restaurant_id                        | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | special_dishes                 | dish_name                            | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | special_dishes                 | dish_description                     | 4        | text                        | text        | YES         | null                                                                                  |
| public | special_dishes                 | dish_price                           | 5        | integer                     | int4        | NO          | null                                                                                  |
| public | special_dishes                 | is_active                            | 6        | boolean                     | bool        | YES         | false                                                                                 |
| public | special_dishes                 | is_template                          | 7        | boolean                     | bool        | YES         | true                                                                                  |
| public | special_dishes                 | status                               | 8        | character varying           | varchar     | YES         | 'draft'::character varying                                                            |
| public | special_dishes                 | total_products_selected              | 9        | integer                     | int4        | YES         | 0                                                                                     |
| public | special_dishes                 | categories_configured                | 10       | integer                     | int4        | YES         | 0                                                                                     |
| public | special_dishes                 | setup_completed                      | 11       | boolean                     | bool        | YES         | false                                                                                 |
| public | special_dishes                 | created_at                           | 12       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | special_dishes                 | updated_at                           | 13       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | special_protein_quantities     | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | special_protein_quantities     | special_dish_id                      | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | special_protein_quantities     | protein_product_id                   | 3        | uuid                        | uuid        | NO          | null                                                                                  |
| public | special_protein_quantities     | planned_quantity                     | 4        | integer                     | int4        | NO          | 0                                                                                     |
| public | special_protein_quantities     | available_quantity                   | 5        | integer                     | int4        | NO          | 0                                                                                     |
| public | special_protein_quantities     | reserved_quantity                    | 6        | integer                     | int4        | YES         | 0                                                                                     |
| public | special_protein_quantities     | sold_quantity                        | 7        | integer                     | int4        | YES         | 0                                                                                     |
| public | special_protein_quantities     | unit_type                            | 8        | character varying           | varchar     | YES         | 'units'::character varying                                                            |
| public | special_protein_quantities     | price_override                       | 9        | integer                     | int4        | YES         | null                                                                                  |
| public | special_protein_quantities     | min_preparation_time                 | 10       | integer                     | int4        | YES         | null                                                                                  |
| public | special_protein_quantities     | created_at                           | 11       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | special_protein_quantities     | updated_at                           | 12       | timestamp with time zone    | timestamptz | YES         | now()                                                                                 |
| public | transacciones_caja             | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | transacciones_caja             | caja_sesion_id                       | 2        | uuid                        | uuid        | NO          | null                                                                                  |
| public | transacciones_caja             | orden_id                             | 3        | uuid                        | uuid        | YES         | null                                                                                  |
| public | transacciones_caja             | tipo_orden                           | 4        | character varying           | varchar     | YES         | null                                                                                  |
| public | transacciones_caja             | metodo_pago                          | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | transacciones_caja             | monto_total                          | 6        | integer                     | int4        | NO          | null                                                                                  |
| public | transacciones_caja             | monto_recibido                       | 7        | integer                     | int4        | YES         | null                                                                                  |
| public | transacciones_caja             | monto_cambio                         | 8        | integer                     | int4        | YES         | 0                                                                                     |
| public | transacciones_caja             | procesada_at                         | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | transacciones_caja             | cajero_id                            | 10       | uuid                        | uuid        | NO          | null                                                                                  |
| public | universal_categories           | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | universal_categories           | name                                 | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | universal_categories           | slug                                 | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | universal_categories           | description                          | 4        | text                        | text        | YES         | null                                                                                  |
| public | universal_categories           | icon                                 | 5        | character varying           | varchar     | YES         | null                                                                                  |
| public | universal_categories           | color                                | 6        | character varying           | varchar     | YES         | null                                                                                  |
| public | universal_categories           | display_order                        | 7        | integer                     | int4        | NO          | null                                                                                  |
| public | universal_categories           | is_active                            | 8        | boolean                     | bool        | YES         | true                                                                                  |
| public | universal_categories           | created_at                           | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | universal_categories           | updated_at                           | 10       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | universal_products             | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | universal_products             | name                                 | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | universal_products             | description                          | 3        | text                        | text        | YES         | null                                                                                  |
| public | universal_products             | category_id                          | 4        | uuid                        | uuid        | NO          | null                                                                                  |
| public | universal_products             | search_tags                          | 5        | ARRAY                       | _text       | YES         | '{}'::text[]                                                                          |
| public | universal_products             | regional_names                       | 6        | ARRAY                       | _text       | YES         | '{}'::text[]                                                                          |
| public | universal_products             | preparation_method                   | 7        | character varying           | varchar     | YES         | null                                                                                  |
| public | universal_products             | food_type                            | 8        | character varying           | varchar     | YES         | null                                                                                  |
| public | universal_products             | estimated_calories                   | 9        | integer                     | int4        | YES         | null                                                                                  |
| public | universal_products             | is_vegetarian                        | 10       | boolean                     | bool        | YES         | false                                                                                 |
| public | universal_products             | is_vegan                             | 11       | boolean                     | bool        | YES         | false                                                                                 |
| public | universal_products             | suggested_price_min                  | 12       | integer                     | int4        | YES         | null                                                                                  |
| public | universal_products             | suggested_price_max                  | 13       | integer                     | int4        | YES         | null                                                                                  |
| public | universal_products             | popularity_score                     | 14       | integer                     | int4        | YES         | 0                                                                                     |
| public | universal_products             | common_regions                       | 15       | ARRAY                       | _text       | YES         | '{}'::text[]                                                                          |
| public | universal_products             | is_verified                          | 16       | boolean                     | bool        | YES         | false                                                                                 |
| public | universal_products             | verification_notes                   | 17       | text                        | text        | YES         | null                                                                                  |
| public | universal_products             | image_url                            | 18       | text                        | text        | YES         | null                                                                                  |
| public | universal_products             | image_alt                            | 19       | text                        | text        | YES         | null                                                                                  |
| public | universal_products             | created_by                           | 20       | uuid                        | uuid        | YES         | null                                                                                  |
| public | universal_products             | created_at                           | 21       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | universal_products             | updated_at                           | 22       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | users                          | id                                   | 1        | uuid                        | uuid        | NO          | gen_random_uuid()                                                                     |
| public | users                          | first_name                           | 2        | character varying           | varchar     | NO          | null                                                                                  |
| public | users                          | last_name                            | 3        | character varying           | varchar     | NO          | null                                                                                  |
| public | users                          | email                                | 4        | character varying           | varchar     | NO          | null                                                                                  |
| public | users                          | phone                                | 5        | character varying           | varchar     | NO          | null                                                                                  |
| public | users                          | role                                 | 7        | character varying           | varchar     | YES         | 'restaurant_owner'::character varying                                                 |
| public | users                          | restaurant_id                        | 8        | uuid                        | uuid        | YES         | null                                                                                  |
| public | users                          | created_at                           | 9        | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | users                          | updated_at                           | 10       | timestamp without time zone | timestamp   | YES         | now()                                                                                 |
| public | users                          | last_login                           | 11       | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | users                          | is_active                            | 12       | boolean                     | bool        | YES         | true                                                                                  |
| public | v_active_menus_today           | id                                   | 1        | uuid                        | uuid        | YES         | null                                                                                  |
| public | v_active_menus_today           | restaurant_id                        | 2        | uuid                        | uuid        | YES         | null                                                                                  |
| public | v_active_menus_today           | restaurant_name                      | 3        | character varying           | varchar     | YES         | null                                                                                  |
| public | v_active_menus_today           | menu_price                           | 4        | integer                     | int4        | YES         | null                                                                                  |
| public | v_active_menus_today           | total_combinations_generated         | 5        | integer                     | int4        | YES         | null                                                                                  |
| public | v_active_menus_today           | total_products_selected              | 6        | integer                     | int4        | YES         | null                                                                                  |
| public | v_active_menus_today           | categories_configured                | 7        | integer                     | int4        | YES         | null                                                                                  |
| public | v_active_menus_today           | created_at                           | 8        | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | v_active_menus_today           | expires_at                           | 9        | timestamp without time zone | timestamp   | YES         | null                                                                                  |
| public | v_active_menus_today           | menu_status                          | 10       | text                        | text        | YES         | null                                                                                  |


-- 3) Primary keys
SELECT
  n.nspname  AS schema,
  c.relname  AS table,
  con.conname AS pk_name,
  string_agg(a.attname, ', ' ORDER BY a.attnum) AS columns
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN unnest(con.conkey) WITH ORDINALITY AS cols(attnum, ord) ON true
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = cols.attnum
WHERE con.contype = 'p' AND n.nspname = 'public'
GROUP BY n.nspname, c.relname, con.conname
ORDER BY n.nspname, c.relname;

| schema | table                          | pk_name                             | columns |
| ------ | ------------------------------ | ----------------------------------- | ------- |
| public | audit_log                      | audit_log_pkey                      | id      |
| public | authorization_requests         | authorization_requests_pkey         | id      |
| public | caja_sesiones                  | caja_sesiones_pkey                  | id      |
| public | cities                         | cities_pkey                         | id      |
| public | countries                      | countries_pkey                      | id      |
| public | cuisine_types                  | cuisine_types_pkey                  | id      |
| public | daily_menu_selections          | daily_menu_selections_pkey          | id      |
| public | daily_menus                    | daily_menus_pkey                    | id      |
| public | daily_special_activations      | daily_special_activations_pkey      | id      |
| public | delivery_orders                | delivery_orders_pkey                | id      |
| public | delivery_personnel             | delivery_personnel_pkey             | id      |
| public | departments                    | departments_pkey                    | id      |
| public | facturas                       | facturas_pkey                       | id      |
| public | gastos_caja                    | gastos_caja_pkey                    | id      |
| public | generated_combinations         | generated_combinations_pkey         | id      |
| public | generated_special_combinations | generated_special_combinations_pkey | id      |
| public | items_orden_mesa               | items_orden_mesa_pkey               | id      |
| public | numeracion_facturas            | numeracion_facturas_pkey            | id      |
| public | ordenes_mesa                   | ordenes_mesa_pkey                   | id      |
| public | product_aliases                | product_aliases_pkey                | id      |
| public | product_suggestions            | product_suggestions_pkey            | id      |
| public | protein_quantities             | protein_quantities_pkey             | id      |
| public | restaurant_favorites           | restaurant_favorites_pkey           | id      |
| public | restaurant_mesas               | restaurant_mesas_pkey               | id      |
| public | restaurant_product_usage       | restaurant_product_usage_pkey       | id      |
| public | restaurants                    | restaurants_pkey                    | id      |
| public | security_alerts                | security_alerts_pkey                | id      |
| public | security_policies              | security_policies_pkey              | id      |
| public | special_dish_selections        | special_dish_selections_pkey        | id      |
| public | special_dishes                 | special_dishes_pkey                 | id      |
| public | special_protein_quantities     | special_protein_quantities_pkey     | id      |
| public | transacciones_caja             | transacciones_caja_pkey             | id      |
| public | universal_categories           | universal_categories_pkey           | id      |
| public | universal_products             | universal_products_pkey             | id      |
| public | users                          | users_pkey                          | id      |


-- 4) Foreign keys
SELECT
  n.nspname  AS schema,
  c.relname  AS table,
  con.conname AS fk_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype = 'f' AND n.nspname = 'public'
ORDER BY n.nspname, c.relname, con.conname;

| schema | table                          | fk_name                                                  | definition                                                                                     |
| ------ | ------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| public | authorization_requests         | authorization_requests_cajero_id_fkey                    | FOREIGN KEY (cajero_id) REFERENCES users(id)                                                   |
| public | authorization_requests         | authorization_requests_restaurant_id_fkey                | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |
| public | authorization_requests         | authorization_requests_supervisor_id_fkey                | FOREIGN KEY (supervisor_id) REFERENCES users(id)                                               |
| public | caja_sesiones                  | caja_sesiones_cajero_id_fkey                             | FOREIGN KEY (cajero_id) REFERENCES users(id)                                                   |
| public | caja_sesiones                  | caja_sesiones_restaurant_id_fkey                         | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |
| public | cities                         | cities_department_id_fkey                                | FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE                       |
| public | daily_menu_selections          | daily_menu_selections_category_id_fkey                   | FOREIGN KEY (category_id) REFERENCES universal_categories(id) ON DELETE RESTRICT               |
| public | daily_menu_selections          | daily_menu_selections_daily_menu_id_fkey                 | FOREIGN KEY (daily_menu_id) REFERENCES daily_menus(id) ON DELETE CASCADE                       |
| public | daily_menu_selections          | daily_menu_selections_universal_product_id_fkey          | FOREIGN KEY (universal_product_id) REFERENCES universal_products(id) ON DELETE RESTRICT        |
| public | daily_menus                    | daily_menus_restaurant_id_fkey                           | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | daily_special_activations      | daily_special_activations_restaurant_id_fkey             | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | delivery_orders                | delivery_orders_assigned_delivery_person_id_fkey         | FOREIGN KEY (assigned_delivery_person_id) REFERENCES delivery_personnel(id) ON DELETE SET NULL |
| public | delivery_orders                | delivery_orders_daily_menu_id_fkey                       | FOREIGN KEY (daily_menu_id) REFERENCES daily_menus(id) ON DELETE CASCADE                       |
| public | delivery_orders                | delivery_orders_restaurant_id_fkey                       | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | delivery_personnel             | delivery_personnel_restaurant_id_fkey                    | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | departments                    | departments_country_id_fkey                              | FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE                            |
| public | facturas                       | facturas_anulada_por_fkey                                | FOREIGN KEY (anulada_por) REFERENCES auth.users(id)                                            |
| public | facturas                       | facturas_generada_por_fkey                               | FOREIGN KEY (generada_por) REFERENCES auth.users(id)                                           |
| public | facturas                       | facturas_restaurant_id_fkey                              | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |
| public | facturas                       | facturas_transaccion_id_fkey                             | FOREIGN KEY (transaccion_id) REFERENCES transacciones_caja(id)                                 |
| public | gastos_caja                    | gastos_caja_caja_sesion_id_fkey                          | FOREIGN KEY (caja_sesion_id) REFERENCES caja_sesiones(id)                                      |
| public | gastos_caja                    | gastos_caja_registrado_por_fkey                          | FOREIGN KEY (registrado_por) REFERENCES users(id)                                              |
| public | generated_combinations         | generated_combinations_bebida_product_id_fkey            | FOREIGN KEY (bebida_product_id) REFERENCES universal_products(id)                              |
| public | generated_combinations         | generated_combinations_daily_menu_id_fkey                | FOREIGN KEY (daily_menu_id) REFERENCES daily_menus(id) ON DELETE CASCADE                       |
| public | generated_combinations         | generated_combinations_entrada_product_id_fkey           | FOREIGN KEY (entrada_product_id) REFERENCES universal_products(id)                             |
| public | generated_combinations         | generated_combinations_principio_product_id_fkey         | FOREIGN KEY (principio_product_id) REFERENCES universal_products(id)                           |
| public | generated_combinations         | generated_combinations_proteina_product_id_fkey          | FOREIGN KEY (proteina_product_id) REFERENCES universal_products(id)                            |
| public | generated_special_combinations | generated_special_combinations_bebida_product_id_fkey    | FOREIGN KEY (bebida_product_id) REFERENCES universal_products(id)                              |
| public | generated_special_combinations | generated_special_combinations_entrada_product_id_fkey   | FOREIGN KEY (entrada_product_id) REFERENCES universal_products(id)                             |
| public | generated_special_combinations | generated_special_combinations_principio_product_id_fkey | FOREIGN KEY (principio_product_id) REFERENCES universal_products(id)                           |
| public | generated_special_combinations | generated_special_combinations_proteina_product_id_fkey  | FOREIGN KEY (proteina_product_id) REFERENCES universal_products(id)                            |
| public | items_orden_mesa               | items_orden_mesa_combinacion_especial_id_fkey            | FOREIGN KEY (combinacion_especial_id) REFERENCES generated_special_combinations(id)            |
| public | items_orden_mesa               | items_orden_mesa_combinacion_id_fkey                     | FOREIGN KEY (combinacion_id) REFERENCES generated_combinations(id)                             |
| public | items_orden_mesa               | items_orden_mesa_orden_mesa_id_fkey                      | FOREIGN KEY (orden_mesa_id) REFERENCES ordenes_mesa(id) ON DELETE CASCADE                      |
| public | numeracion_facturas            | numeracion_facturas_restaurant_id_fkey                   | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |
| public | ordenes_mesa                   | ordenes_mesa_mesa_id_fkey                                | FOREIGN KEY (mesa_id) REFERENCES restaurant_mesas(id) ON DELETE SET NULL                       |
| public | ordenes_mesa                   | ordenes_mesa_restaurant_id_fkey                          | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |
| public | product_aliases                | product_aliases_universal_product_id_fkey                | FOREIGN KEY (universal_product_id) REFERENCES universal_products(id) ON DELETE CASCADE         |
| public | product_suggestions            | product_suggestions_approved_product_id_fkey             | FOREIGN KEY (approved_product_id) REFERENCES universal_products(id)                            |
| public | product_suggestions            | product_suggestions_reviewed_by_fkey                     | FOREIGN KEY (reviewed_by) REFERENCES users(id)                                                 |
| public | product_suggestions            | product_suggestions_suggested_by_restaurant_id_fkey      | FOREIGN KEY (suggested_by_restaurant_id) REFERENCES restaurants(id)                            |
| public | product_suggestions            | product_suggestions_suggested_by_user_id_fkey            | FOREIGN KEY (suggested_by_user_id) REFERENCES users(id)                                        |
| public | product_suggestions            | product_suggestions_suggested_category_id_fkey           | FOREIGN KEY (suggested_category_id) REFERENCES universal_categories(id)                        |
| public | protein_quantities             | protein_quantities_daily_menu_id_fkey                    | FOREIGN KEY (daily_menu_id) REFERENCES daily_menus(id) ON DELETE CASCADE                       |
| public | protein_quantities             | protein_quantities_protein_product_id_fkey               | FOREIGN KEY (protein_product_id) REFERENCES universal_products(id) ON DELETE RESTRICT          |
| public | restaurant_favorites           | restaurant_favorites_product_id_fkey                     | FOREIGN KEY (product_id) REFERENCES universal_products(id) ON DELETE CASCADE                   |
| public | restaurant_favorites           | restaurant_favorites_restaurant_id_fkey                  | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | restaurant_mesas               | restaurant_mesas_restaurant_id_fkey                      | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | restaurant_product_usage       | restaurant_product_usage_restaurant_id_fkey              | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | restaurant_product_usage       | restaurant_product_usage_universal_product_id_fkey       | FOREIGN KEY (universal_product_id) REFERENCES universal_products(id) ON DELETE CASCADE         |
| public | restaurants                    | restaurants_city_id_fkey                                 | FOREIGN KEY (city_id) REFERENCES cities(id)                                                    |
| public | restaurants                    | restaurants_country_id_fkey                              | FOREIGN KEY (country_id) REFERENCES countries(id)                                              |
| public | restaurants                    | restaurants_cuisine_type_id_fkey                         | FOREIGN KEY (cuisine_type_id) REFERENCES cuisine_types(id)                                     |
| public | restaurants                    | restaurants_department_id_fkey                           | FOREIGN KEY (department_id) REFERENCES departments(id)                                         |
| public | restaurants                    | restaurants_owner_id_fkey                                | FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE                                  |
| public | security_alerts                | security_alerts_cajero_id_fkey                           | FOREIGN KEY (cajero_id) REFERENCES users(id)                                                   |
| public | security_alerts                | security_alerts_restaurant_id_fkey                       | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |
| public | security_alerts                | security_alerts_revisada_por_fkey                        | FOREIGN KEY (revisada_por) REFERENCES users(id)                                                |
| public | security_policies              | security_policies_restaurant_id_fkey                     | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |
| public | special_dish_selections        | special_dish_selections_category_id_fkey                 | FOREIGN KEY (category_id) REFERENCES universal_categories(id)                                  |
| public | special_dish_selections        | special_dish_selections_universal_product_id_fkey        | FOREIGN KEY (universal_product_id) REFERENCES universal_products(id) ON DELETE CASCADE         |
| public | special_dishes                 | special_dishes_restaurant_id_fkey                        | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE                       |
| public | special_protein_quantities     | special_protein_quantities_protein_product_id_fkey       | FOREIGN KEY (protein_product_id) REFERENCES universal_products(id) ON DELETE CASCADE           |
| public | transacciones_caja             | transacciones_caja_caja_sesion_id_fkey                   | FOREIGN KEY (caja_sesion_id) REFERENCES caja_sesiones(id)                                      |
| public | transacciones_caja             | transacciones_caja_cajero_id_fkey                        | FOREIGN KEY (cajero_id) REFERENCES users(id)                                                   |
| public | universal_products             | universal_products_category_id_fkey                      | FOREIGN KEY (category_id) REFERENCES universal_categories(id) ON DELETE RESTRICT               |
| public | universal_products             | universal_products_created_by_fkey                       | FOREIGN KEY (created_by) REFERENCES users(id)                                                  |
| public | users                          | users_restaurant_id_fkey                                 | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)                                         |



-- 5) Unique and check constraints
SELECT
  n.nspname  AS schema,
  c.relname  AS table,
  con.conname AS constraint_name,
  con.contype,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE con.contype IN ('u','c') AND n.nspname = 'public'
ORDER BY n.nspname, c.relname, con.conname;

| schema | table                          | constraint_name                                                 | contype | definition                                                                                                                                                                                                                      |
| ------ | ------------------------------ | --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public | cities                         | cities_department_id_name_key                                   | u       | UNIQUE (department_id, name)                                                                                                                                                                                                    |
| public | countries                      | countries_code_key                                              | u       | UNIQUE (code)                                                                                                                                                                                                                   |
| public | countries                      | countries_iso_code_key                                          | u       | UNIQUE (iso_code)                                                                                                                                                                                                               |
| public | countries                      | countries_name_key                                              | u       | UNIQUE (name)                                                                                                                                                                                                                   |
| public | cuisine_types                  | cuisine_types_name_key                                          | u       | UNIQUE (name)                                                                                                                                                                                                                   |
| public | cuisine_types                  | cuisine_types_slug_key                                          | u       | UNIQUE (slug)                                                                                                                                                                                                                   |
| public | daily_menu_selections          | check_selection_order                                           | c       | CHECK ((selection_order >= 0))                                                                                                                                                                                                  |
| public | daily_menu_selections          | daily_menu_selections_daily_menu_id_universal_product_id_key    | u       | UNIQUE (daily_menu_id, universal_product_id)                                                                                                                                                                                    |
| public | daily_menus                    | check_future_expiration                                         | c       | CHECK ((expires_at > created_at))                                                                                                                                                                                               |
| public | daily_menus                    | check_positive_price                                            | c       | CHECK ((menu_price > 0))                                                                                                                                                                                                        |
| public | daily_menus                    | daily_menus_restaurant_id_menu_date_key                         | u       | UNIQUE (restaurant_id, menu_date)                                                                                                                                                                                               |
| public | daily_menus                    | daily_menus_status_check                                        | c       | CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'draft'::character varying])::text[])))                                                                                         |
| public | daily_special_activations      | unique_special_activation_per_day                               | u       | UNIQUE (restaurant_id, special_dish_id, activation_date)                                                                                                                                                                        |
| public | delivery_orders                | delivery_orders_status_check                                    | c       | CHECK (((status)::text = ANY ((ARRAY['received'::character varying, 'cooking'::character varying, 'ready'::character varying, 'sent'::character varying, 'delivered'::character varying, 'paid'::character varying])::text[]))) |
| public | delivery_personnel             | delivery_personnel_status_check                                 | c       | CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'busy'::character varying, 'offline'::character varying])::text[])))                                                                                       |
| public | departments                    | departments_country_id_code_key                                 | u       | UNIQUE (country_id, code)                                                                                                                                                                                                       |
| public | departments                    | departments_country_id_name_key                                 | u       | UNIQUE (country_id, name)                                                                                                                                                                                                       |
| public | facturas                       | uk_numero_factura_por_restaurant                                | u       | UNIQUE (restaurant_id, numero_factura)                                                                                                                                                                                          |
| public | generated_combinations         | check_combination_price                                         | c       | CHECK ((combination_price > 0))                                                                                                                                                                                                 |
| public | generated_special_combinations | special_combinations_price_positive                             | c       | CHECK ((combination_price > 0))                                                                                                                                                                                                 |
| public | generated_special_combinations | special_combinations_sold_not_negative                          | c       | CHECK ((current_sold_quantity >= 0))                                                                                                                                                                                            |
| public | items_orden_mesa               | items_orden_mesa_cantidad_check                                 | c       | CHECK ((cantidad > 0))                                                                                                                                                                                                          |
| public | items_orden_mesa               | items_orden_mesa_tipo_item_check                                | c       | CHECK (((tipo_item)::text = ANY ((ARRAY['menu_dia'::character varying, 'especial'::character varying])::text[])))                                                                                                               |
| public | ordenes_mesa                   | ordenes_mesa_estado_check                                       | c       | CHECK (((estado)::text = ANY ((ARRAY['activa'::character varying, 'pagada'::character varying, 'completada'::character varying])::text[])))                                                                                     |
| public | product_suggestions            | product_suggestions_status_check                                | c       | CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'duplicate'::character varying])::text[])))                                                    |
| public | protein_quantities             | check_protein_quantity                                          | c       | CHECK (((planned_quantity > 0) AND (planned_quantity <= 1000)))                                                                                                                                                                 |
| public | protein_quantities             | check_valid_frequency                                           | c       | CHECK (((usage_frequency_score >= 1) AND (usage_frequency_score <= 10)))                                                                                                                                                        |
| public | protein_quantities             | protein_quantities_daily_menu_id_protein_product_id_key         | u       | UNIQUE (daily_menu_id, protein_product_id)                                                                                                                                                                                      |
| public | restaurant_favorites           | restaurant_favorites_restaurant_id_product_id_key               | u       | UNIQUE (restaurant_id, product_id)                                                                                                                                                                                              |
| public | restaurant_mesas               | restaurant_mesas_capacidad_personas_check                       | c       | CHECK (((capacidad_personas > 0) AND (capacidad_personas <= 50)))                                                                                                                                                               |
| public | restaurant_mesas               | restaurant_mesas_estado_check                                   | c       | CHECK (((estado)::text = ANY ((ARRAY['libre'::character varying, 'ocupada'::character varying, 'reservada'::character varying, 'inactiva'::character varying, 'mantenimiento'::character varying])::text[])))                   |
| public | restaurant_mesas               | restaurant_mesas_numero_check                                   | c       | CHECK (((numero > 0) AND (numero <= 999)))                                                                                                                                                                                      |
| public | restaurant_mesas               | restaurant_mesas_restaurant_id_numero_key                       | u       | UNIQUE (restaurant_id, numero)                                                                                                                                                                                                  |
| public | restaurant_product_usage       | restaurant_product_usage_restaurant_id_universal_product_id_key | u       | UNIQUE (restaurant_id, universal_product_id)                                                                                                                                                                                    |
| public | restaurants                    | restaurants_owner_consistency                                   | c       | CHECK ((owner_id IS NOT NULL))                                                                                                                                                                                                  |
| public | restaurants                    | restaurants_setup_step_valid                                    | c       | CHECK (((setup_step >= 1) AND (setup_step <= 4)))                                                                                                                                                                               |
| public | special_dish_selections        | unique_product_per_special_dish                                 | u       | UNIQUE (special_dish_id, universal_product_id)                                                                                                                                                                                  |
| public | special_dishes                 | special_dishes_name_not_empty                                   | c       | CHECK (((dish_name)::text <> ''::text))                                                                                                                                                                                         |
| public | special_dishes                 | special_dishes_price_positive                                   | c       | CHECK ((dish_price > 0))                                                                                                                                                                                                        |
| public | special_protein_quantities     | special_protein_quantities_positive                             | c       | CHECK ((planned_quantity >= 0))                                                                                                                                                                                                 |
| public | special_protein_quantities     | unique_protein_per_special_dish                                 | u       | UNIQUE (special_dish_id, protein_product_id)                                                                                                                                                                                    |
| public | universal_categories           | universal_categories_name_key                                   | u       | UNIQUE (name)                                                                                                                                                                                                                   |
| public | universal_categories           | universal_categories_slug_key                                   | u       | UNIQUE (slug)                                                                                                                                                                                                                   |
| public | universal_products             | check_popularity_score                                          | c       | CHECK (((popularity_score >= 0) AND (popularity_score <= 100)))                                                                                                                                                                 |
| public | universal_products             | check_price_range                                               | c       | CHECK ((suggested_price_min <= suggested_price_max))                                                                                                                                                                            |
| public | users                          | users_email_key                                                 | u       | UNIQUE (email)                                                                                                                                                                                                                  |
| public | users                          | users_restaurant_id_key                                         | u       | UNIQUE (restaurant_id)                                                                                                                                                                                                          |



-- 6) Indexes (including expressions and partial indexes)
SELECT
  schemaname AS schema,
  tablename  AS table,
  indexname  AS index_name,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY schemaname, tablename, indexname;

| schema | table                          | index_name                                                      | indexdef                                                                                                                                                                 |
| ------ | ------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| public | audit_log                      | audit_log_pkey                                                  | CREATE UNIQUE INDEX audit_log_pkey ON public.audit_log USING btree (id)                                                                                                  |
| public | authorization_requests         | authorization_requests_pkey                                     | CREATE UNIQUE INDEX authorization_requests_pkey ON public.authorization_requests USING btree (id)                                                                        |
| public | caja_sesiones                  | caja_sesiones_pkey                                              | CREATE UNIQUE INDEX caja_sesiones_pkey ON public.caja_sesiones USING btree (id)                                                                                          |
| public | caja_sesiones                  | idx_caja_sesiones_restaurant_estado                             | CREATE INDEX idx_caja_sesiones_restaurant_estado ON public.caja_sesiones USING btree (restaurant_id, estado)                                                             |
| public | caja_sesiones                  | idx_una_caja_abierta_por_restaurant                             | CREATE UNIQUE INDEX idx_una_caja_abierta_por_restaurant ON public.caja_sesiones USING btree (restaurant_id) WHERE ((estado)::text = 'abierta'::text)                     |
| public | cities                         | cities_department_id_name_key                                   | CREATE UNIQUE INDEX cities_department_id_name_key ON public.cities USING btree (department_id, name)                                                                     |
| public | cities                         | cities_pkey                                                     | CREATE UNIQUE INDEX cities_pkey ON public.cities USING btree (id)                                                                                                        |
| public | cities                         | idx_cities_active                                               | CREATE INDEX idx_cities_active ON public.cities USING btree (is_active)                                                                                                  |
| public | cities                         | idx_cities_department                                           | CREATE INDEX idx_cities_department ON public.cities USING btree (department_id)                                                                                          |
| public | cities                         | idx_cities_location                                             | CREATE INDEX idx_cities_location ON public.cities USING btree (latitude, longitude)                                                                                      |
| public | countries                      | countries_code_key                                              | CREATE UNIQUE INDEX countries_code_key ON public.countries USING btree (code)                                                                                            |
| public | countries                      | countries_iso_code_key                                          | CREATE UNIQUE INDEX countries_iso_code_key ON public.countries USING btree (iso_code)                                                                                    |
| public | countries                      | countries_name_key                                              | CREATE UNIQUE INDEX countries_name_key ON public.countries USING btree (name)                                                                                            |
| public | countries                      | countries_pkey                                                  | CREATE UNIQUE INDEX countries_pkey ON public.countries USING btree (id)                                                                                                  |
| public | countries                      | idx_countries_active                                            | CREATE INDEX idx_countries_active ON public.countries USING btree (is_active)                                                                                            |
| public | countries                      | idx_countries_code                                              | CREATE INDEX idx_countries_code ON public.countries USING btree (code)                                                                                                   |
| public | cuisine_types                  | cuisine_types_name_key                                          | CREATE UNIQUE INDEX cuisine_types_name_key ON public.cuisine_types USING btree (name)                                                                                    |
| public | cuisine_types                  | cuisine_types_pkey                                              | CREATE UNIQUE INDEX cuisine_types_pkey ON public.cuisine_types USING btree (id)                                                                                          |
| public | cuisine_types                  | cuisine_types_slug_key                                          | CREATE UNIQUE INDEX cuisine_types_slug_key ON public.cuisine_types USING btree (slug)                                                                                    |
| public | cuisine_types                  | idx_cuisine_types_active                                        | CREATE INDEX idx_cuisine_types_active ON public.cuisine_types USING btree (is_active)                                                                                    |
| public | cuisine_types                  | idx_cuisine_types_order                                         | CREATE INDEX idx_cuisine_types_order ON public.cuisine_types USING btree (display_order)                                                                                 |
| public | daily_menu_selections          | daily_menu_selections_daily_menu_id_universal_product_id_key    | CREATE UNIQUE INDEX daily_menu_selections_daily_menu_id_universal_product_id_key ON public.daily_menu_selections USING btree (daily_menu_id, universal_product_id)       |
| public | daily_menu_selections          | daily_menu_selections_pkey                                      | CREATE UNIQUE INDEX daily_menu_selections_pkey ON public.daily_menu_selections USING btree (id)                                                                          |
| public | daily_menu_selections          | idx_menu_selections_menu_category                               | CREATE INDEX idx_menu_selections_menu_category ON public.daily_menu_selections USING btree (daily_menu_id, category_id)                                                  |
| public | daily_menu_selections          | idx_menu_selections_product                                     | CREATE INDEX idx_menu_selections_product ON public.daily_menu_selections USING btree (universal_product_id, selected_at DESC)                                            |
| public | daily_menus                    | daily_menus_pkey                                                | CREATE UNIQUE INDEX daily_menus_pkey ON public.daily_menus USING btree (id)                                                                                              |
| public | daily_menus                    | daily_menus_restaurant_id_menu_date_key                         | CREATE UNIQUE INDEX daily_menus_restaurant_id_menu_date_key ON public.daily_menus USING btree (restaurant_id, menu_date)                                                 |
| public | daily_menus                    | idx_daily_menus_active_restaurant                               | CREATE INDEX idx_daily_menus_active_restaurant ON public.daily_menus USING btree (restaurant_id, status, menu_date DESC) WHERE ((status)::text = 'active'::text)         |
| public | daily_menus                    | idx_daily_menus_restaurant_date                                 | CREATE INDEX idx_daily_menus_restaurant_date ON public.daily_menus USING btree (restaurant_id, menu_date DESC)                                                           |
| public | daily_menus                    | idx_daily_menus_status                                          | CREATE INDEX idx_daily_menus_status ON public.daily_menus USING btree (status)                                                                                           |
| public | daily_special_activations      | daily_special_activations_pkey                                  | CREATE UNIQUE INDEX daily_special_activations_pkey ON public.daily_special_activations USING btree (id)                                                                  |
| public | daily_special_activations      | idx_daily_special_activations_restaurant_date                   | CREATE INDEX idx_daily_special_activations_restaurant_date ON public.daily_special_activations USING btree (restaurant_id, activation_date)                              |
| public | daily_special_activations      | unique_special_activation_per_day                               | CREATE UNIQUE INDEX unique_special_activation_per_day ON public.daily_special_activations USING btree (restaurant_id, special_dish_id, activation_date)                  |
| public | delivery_orders                | delivery_orders_pkey                                            | CREATE UNIQUE INDEX delivery_orders_pkey ON public.delivery_orders USING btree (id)                                                                                      |
| public | delivery_orders                | idx_delivery_orders_delivery_person                             | CREATE INDEX idx_delivery_orders_delivery_person ON public.delivery_orders USING btree (assigned_delivery_person_id)                                                     |
| public | delivery_orders                | idx_delivery_orders_pagada                                      | CREATE INDEX idx_delivery_orders_pagada ON public.delivery_orders USING btree (pagada_at) WHERE (pagada_at IS NOT NULL)                                                  |
| public | delivery_orders                | idx_delivery_orders_restaurant_date                             | CREATE INDEX idx_delivery_orders_restaurant_date ON public.delivery_orders USING btree (restaurant_id, created_at)                                                       |
| public | delivery_orders                | idx_delivery_orders_status                                      | CREATE INDEX idx_delivery_orders_status ON public.delivery_orders USING btree (status)                                                                                   |
| public | delivery_personnel             | delivery_personnel_pkey                                         | CREATE UNIQUE INDEX delivery_personnel_pkey ON public.delivery_personnel USING btree (id)                                                                                |
| public | delivery_personnel             | idx_delivery_personnel_restaurant                               | CREATE INDEX idx_delivery_personnel_restaurant ON public.delivery_personnel USING btree (restaurant_id, is_active)                                                       |
| public | departments                    | departments_country_id_code_key                                 | CREATE UNIQUE INDEX departments_country_id_code_key ON public.departments USING btree (country_id, code)                                                                 |
| public | departments                    | departments_country_id_name_key                                 | CREATE UNIQUE INDEX departments_country_id_name_key ON public.departments USING btree (country_id, name)                                                                 |
| public | departments                    | departments_pkey                                                | CREATE UNIQUE INDEX departments_pkey ON public.departments USING btree (id)                                                                                              |
| public | departments                    | idx_departments_active                                          | CREATE INDEX idx_departments_active ON public.departments USING btree (is_active)                                                                                        |
| public | departments                    | idx_departments_country                                         | CREATE INDEX idx_departments_country ON public.departments USING btree (country_id)                                                                                      |
| public | facturas                       | facturas_pkey                                                   | CREATE UNIQUE INDEX facturas_pkey ON public.facturas USING btree (id)                                                                                                    |
| public | facturas                       | idx_facturas_estado                                             | CREATE INDEX idx_facturas_estado ON public.facturas USING btree (estado)                                                                                                 |
| public | facturas                       | idx_facturas_generada_at                                        | CREATE INDEX idx_facturas_generada_at ON public.facturas USING btree (generada_at DESC)                                                                                  |
| public | facturas                       | idx_facturas_restaurant_estado                                  | CREATE INDEX idx_facturas_restaurant_estado ON public.facturas USING btree (restaurant_id, estado)                                                                       |
| public | facturas                       | idx_facturas_restaurant_fecha                                   | CREATE INDEX idx_facturas_restaurant_fecha ON public.facturas USING btree (restaurant_id, generada_at DESC)                                                              |
| public | facturas                       | idx_facturas_restaurant_id                                      | CREATE INDEX idx_facturas_restaurant_id ON public.facturas USING btree (restaurant_id)                                                                                   |
| public | facturas                       | idx_facturas_restaurant_numero                                  | CREATE INDEX idx_facturas_restaurant_numero ON public.facturas USING btree (restaurant_id, numero_factura)                                                               |
| public | facturas                       | idx_facturas_transaccion_id                                     | CREATE INDEX idx_facturas_transaccion_id ON public.facturas USING btree (transaccion_id)                                                                                 |
| public | facturas                       | uk_numero_factura_por_restaurant                                | CREATE UNIQUE INDEX uk_numero_factura_por_restaurant ON public.facturas USING btree (restaurant_id, numero_factura)                                                      |
| public | gastos_caja                    | gastos_caja_pkey                                                | CREATE UNIQUE INDEX gastos_caja_pkey ON public.gastos_caja USING btree (id)                                                                                              |
| public | generated_combinations         | generated_combinations_pkey                                     | CREATE UNIQUE INDEX generated_combinations_pkey ON public.generated_combinations USING btree (id)                                                                        |
| public | generated_combinations         | idx_combinations_menu_available                                 | CREATE INDEX idx_combinations_menu_available ON public.generated_combinations USING btree (daily_menu_id, is_available)                                                  |
| public | generated_combinations         | idx_combinations_products                                       | CREATE INDEX idx_combinations_products ON public.generated_combinations USING btree (principio_product_id, proteina_product_id)                                          |
| public | generated_special_combinations | generated_special_combinations_pkey                             | CREATE UNIQUE INDEX generated_special_combinations_pkey ON public.generated_special_combinations USING btree (id)                                                        |
| public | generated_special_combinations | idx_special_combinations_available_today                        | CREATE INDEX idx_special_combinations_available_today ON public.generated_special_combinations USING btree (available_today)                                             |
| public | generated_special_combinations | idx_special_combinations_dish_id                                | CREATE INDEX idx_special_combinations_dish_id ON public.generated_special_combinations USING btree (special_dish_id)                                                     |
| public | items_orden_mesa               | idx_items_orden_mesa_orden_id                                   | CREATE INDEX idx_items_orden_mesa_orden_id ON public.items_orden_mesa USING btree (orden_mesa_id)                                                                        |
| public | items_orden_mesa               | items_orden_mesa_pkey                                           | CREATE UNIQUE INDEX items_orden_mesa_pkey ON public.items_orden_mesa USING btree (id)                                                                                    |
| public | numeracion_facturas            | numeracion_facturas_pkey                                        | CREATE UNIQUE INDEX numeracion_facturas_pkey ON public.numeracion_facturas USING btree (id)                                                                              |
| public | ordenes_mesa                   | idx_ordenes_mesa_activas                                        | CREATE INDEX idx_ordenes_mesa_activas ON public.ordenes_mesa USING btree (restaurant_id, estado) WHERE ((estado)::text = 'activa'::text)                                 |
| public | ordenes_mesa                   | idx_ordenes_mesa_mesa_id                                        | CREATE INDEX idx_ordenes_mesa_mesa_id ON public.ordenes_mesa USING btree (mesa_id)                                                                                       |
| public | ordenes_mesa                   | idx_ordenes_mesa_numero_estado                                  | CREATE INDEX idx_ordenes_mesa_numero_estado ON public.ordenes_mesa USING btree (numero_mesa, estado)                                                                     |
| public | ordenes_mesa                   | idx_ordenes_mesa_pagada                                         | CREATE INDEX idx_ordenes_mesa_pagada ON public.ordenes_mesa USING btree (pagada_at) WHERE (pagada_at IS NOT NULL)                                                        |
| public | ordenes_mesa                   | idx_ordenes_mesa_restaurant_fecha                               | CREATE INDEX idx_ordenes_mesa_restaurant_fecha ON public.ordenes_mesa USING btree (restaurant_id, fecha_creacion DESC)                                                   |
| public | ordenes_mesa                   | idx_ordenes_mesa_restaurant_mesa                                | CREATE INDEX idx_ordenes_mesa_restaurant_mesa ON public.ordenes_mesa USING btree (restaurant_id, mesa_id)                                                                |
| public | ordenes_mesa                   | ordenes_mesa_pkey                                               | CREATE UNIQUE INDEX ordenes_mesa_pkey ON public.ordenes_mesa USING btree (id)                                                                                            |
| public | product_aliases                | idx_product_aliases_search                                      | CREATE INDEX idx_product_aliases_search ON public.product_aliases USING btree (alias)                                                                                    |
| public | product_aliases                | product_aliases_pkey                                            | CREATE UNIQUE INDEX product_aliases_pkey ON public.product_aliases USING btree (id)                                                                                      |
| public | product_suggestions            | product_suggestions_pkey                                        | CREATE UNIQUE INDEX product_suggestions_pkey ON public.product_suggestions USING btree (id)                                                                              |
| public | protein_quantities             | idx_protein_quantities_menu                                     | CREATE INDEX idx_protein_quantities_menu ON public.protein_quantities USING btree (daily_menu_id)                                                                        |
| public | protein_quantities             | idx_protein_quantities_product                                  | CREATE INDEX idx_protein_quantities_product ON public.protein_quantities USING btree (protein_product_id, planned_quantity)                                              |
| public | protein_quantities             | protein_quantities_daily_menu_id_protein_product_id_key         | CREATE UNIQUE INDEX protein_quantities_daily_menu_id_protein_product_id_key ON public.protein_quantities USING btree (daily_menu_id, protein_product_id)                 |
| public | protein_quantities             | protein_quantities_pkey                                         | CREATE UNIQUE INDEX protein_quantities_pkey ON public.protein_quantities USING btree (id)                                                                                |
| public | restaurant_favorites           | idx_restaurant_favorites_product                                | CREATE INDEX idx_restaurant_favorites_product ON public.restaurant_favorites USING btree (product_id)                                                                    |
| public | restaurant_favorites           | idx_restaurant_favorites_restaurant                             | CREATE INDEX idx_restaurant_favorites_restaurant ON public.restaurant_favorites USING btree (restaurant_id)                                                              |
| public | restaurant_favorites           | restaurant_favorites_pkey                                       | CREATE UNIQUE INDEX restaurant_favorites_pkey ON public.restaurant_favorites USING btree (id)                                                                            |
| public | restaurant_favorites           | restaurant_favorites_restaurant_id_product_id_key               | CREATE UNIQUE INDEX restaurant_favorites_restaurant_id_product_id_key ON public.restaurant_favorites USING btree (restaurant_id, product_id)                             |
| public | restaurant_mesas               | idx_restaurant_mesas_numero                                     | CREATE INDEX idx_restaurant_mesas_numero ON public.restaurant_mesas USING btree (restaurant_id, numero)                                                                  |
| public | restaurant_mesas               | idx_restaurant_mesas_restaurant_estado                          | CREATE INDEX idx_restaurant_mesas_restaurant_estado ON public.restaurant_mesas USING btree (restaurant_id, estado)                                                       |
| public | restaurant_mesas               | idx_restaurant_mesas_restaurant_id                              | CREATE INDEX idx_restaurant_mesas_restaurant_id ON public.restaurant_mesas USING btree (restaurant_id)                                                                   |
| public | restaurant_mesas               | restaurant_mesas_pkey                                           | CREATE UNIQUE INDEX restaurant_mesas_pkey ON public.restaurant_mesas USING btree (id)                                                                                    |
| public | restaurant_mesas               | restaurant_mesas_restaurant_id_numero_key                       | CREATE UNIQUE INDEX restaurant_mesas_restaurant_id_numero_key ON public.restaurant_mesas USING btree (restaurant_id, numero)                                             |
| public | restaurant_product_usage       | idx_restaurant_usage_product                                    | CREATE INDEX idx_restaurant_usage_product ON public.restaurant_product_usage USING btree (universal_product_id, total_orders DESC)                                       |
| public | restaurant_product_usage       | idx_restaurant_usage_restaurant                                 | CREATE INDEX idx_restaurant_usage_restaurant ON public.restaurant_product_usage USING btree (restaurant_id, last_used_date DESC)                                         |
| public | restaurant_product_usage       | restaurant_product_usage_pkey                                   | CREATE UNIQUE INDEX restaurant_product_usage_pkey ON public.restaurant_product_usage USING btree (id)                                                                    |
| public | restaurant_product_usage       | restaurant_product_usage_restaurant_id_universal_product_id_key | CREATE UNIQUE INDEX restaurant_product_usage_restaurant_id_universal_product_id_key ON public.restaurant_product_usage USING btree (restaurant_id, universal_product_id) |
| public | restaurants                    | idx_restaurants_location                                        | CREATE INDEX idx_restaurants_location ON public.restaurants USING btree (latitude, longitude)                                                                            |
| public | restaurants                    | idx_restaurants_owner                                           | CREATE INDEX idx_restaurants_owner ON public.restaurants USING btree (owner_id)                                                                                          |
| public | restaurants                    | idx_restaurants_setup                                           | CREATE INDEX idx_restaurants_setup ON public.restaurants USING btree (setup_completed, setup_step)                                                                       |
| public | restaurants                    | restaurants_pkey                                                | CREATE UNIQUE INDEX restaurants_pkey ON public.restaurants USING btree (id)                                                                                              |
| public | security_alerts                | security_alerts_pkey                                            | CREATE UNIQUE INDEX security_alerts_pkey ON public.security_alerts USING btree (id)                                                                                      |
| public | security_policies              | security_policies_pkey                                          | CREATE UNIQUE INDEX security_policies_pkey ON public.security_policies USING btree (id)                                                                                  |
| public | special_dish_selections        | idx_special_dish_selections_dish_id                             | CREATE INDEX idx_special_dish_selections_dish_id ON public.special_dish_selections USING btree (special_dish_id)                                                         |
| public | special_dish_selections        | idx_special_dish_selections_product_id                          | CREATE INDEX idx_special_dish_selections_product_id ON public.special_dish_selections USING btree (universal_product_id)                                                 |
| public | special_dish_selections        | special_dish_selections_pkey                                    | CREATE UNIQUE INDEX special_dish_selections_pkey ON public.special_dish_selections USING btree (id)                                                                      |


-- 7) Triggers
SELECT
  event_object_schema AS schema,
  event_object_table  AS table,
  trigger_name,
  event_manipulation  AS event,
  action_timing       AS timing,
  action_statement    AS definition
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_schema, event_object_table, trigger_name;


| schema | table                          | trigger_name                                         | event  | timing | definition                                                      |
| ------ | ------------------------------ | ---------------------------------------------------- | ------ | ------ | --------------------------------------------------------------- |
| public | cities                         | update_cities_updated_at                             | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |
| public | countries                      | update_countries_updated_at                          | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |
| public | cuisine_types                  | update_cuisine_types_updated_at                      | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |
| public | daily_menu_selections          | trigger_update_menu_stats                            | UPDATE | AFTER  | EXECUTE FUNCTION update_daily_menu_stats()                      |
| public | daily_menu_selections          | trigger_update_menu_stats                            | DELETE | AFTER  | EXECUTE FUNCTION update_daily_menu_stats()                      |
| public | daily_menu_selections          | trigger_update_menu_stats                            | INSERT | AFTER  | EXECUTE FUNCTION update_daily_menu_stats()                      |
| public | daily_special_activations      | trigger_sync_special_availability                    | DELETE | AFTER  | EXECUTE FUNCTION sync_special_availability()                    |
| public | daily_special_activations      | trigger_sync_special_availability                    | UPDATE | AFTER  | EXECUTE FUNCTION sync_special_availability()                    |
| public | daily_special_activations      | trigger_sync_special_availability                    | INSERT | AFTER  | EXECUTE FUNCTION sync_special_availability()                    |
| public | departments                    | update_departments_updated_at                        | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |
| public | facturas                       | update_facturas_updated_at                           | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |
| public | generated_combinations         | trigger_update_combinations_count                    | UPDATE | AFTER  | EXECUTE FUNCTION update_combinations_count()                    |
| public | generated_combinations         | trigger_update_combinations_count                    | INSERT | AFTER  | EXECUTE FUNCTION update_combinations_count()                    |
| public | generated_combinations         | trigger_update_combinations_count                    | DELETE | AFTER  | EXECUTE FUNCTION update_combinations_count()                    |
| public | generated_special_combinations | trigger_update_special_combinations_updated_at       | UPDATE | BEFORE | EXECUTE FUNCTION update_special_combinations_updated_at()       |
| public | items_orden_mesa               | trigger_recalcular_total_orden                       | UPDATE | AFTER  | EXECUTE FUNCTION actualizar_monto_total_orden()                 |
| public | items_orden_mesa               | trigger_recalcular_total_orden                       | INSERT | AFTER  | EXECUTE FUNCTION actualizar_monto_total_orden()                 |
| public | items_orden_mesa               | trigger_recalcular_total_orden                       | DELETE | AFTER  | EXECUTE FUNCTION actualizar_monto_total_orden()                 |
| public | numeracion_facturas            | update_numeracion_facturas_updated_at                | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |
| public | ordenes_mesa                   | trigger_actualizar_estado_mesa                       | UPDATE | AFTER  | EXECUTE FUNCTION actualizar_estado_mesa()                       |
| public | ordenes_mesa                   | trigger_actualizar_estado_mesa                       | INSERT | AFTER  | EXECUTE FUNCTION actualizar_estado_mesa()                       |
| public | ordenes_mesa                   | trigger_actualizar_ordenes_mesa                      | UPDATE | BEFORE | EXECUTE FUNCTION actualizar_fecha_actualizacion()               |
| public | restaurant_product_usage       | trigger_update_product_popularity                    | UPDATE | AFTER  | EXECUTE FUNCTION update_product_popularity()                    |
| public | restaurant_product_usage       | trigger_update_product_popularity                    | INSERT | AFTER  | EXECUTE FUNCTION update_product_popularity()                    |
| public | restaurants                    | restaurant_owner_trigger                             | INSERT | BEFORE | EXECUTE FUNCTION set_restaurant_owner()                         |
| public | restaurants                    | restaurant_owner_trigger                             | UPDATE | BEFORE | EXECUTE FUNCTION set_restaurant_owner()                         |
| public | restaurants                    | sync_user_restaurant_trigger                         | INSERT | AFTER  | EXECUTE FUNCTION update_user_restaurant_id()                    |
| public | restaurants                    | sync_user_restaurant_trigger                         | DELETE | AFTER  | EXECUTE FUNCTION update_user_restaurant_id()                    |
| public | restaurants                    | update_restaurants_updated_at                        | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |
| public | special_dish_selections        | trigger_update_special_dish_stats                    | DELETE | AFTER  | EXECUTE FUNCTION update_special_dish_stats()                    |
| public | special_dish_selections        | trigger_update_special_dish_stats                    | UPDATE | AFTER  | EXECUTE FUNCTION update_special_dish_stats()                    |
| public | special_dish_selections        | trigger_update_special_dish_stats                    | INSERT | AFTER  | EXECUTE FUNCTION update_special_dish_stats()                    |
| public | special_dishes                 | trigger_update_special_dishes_updated_at             | UPDATE | BEFORE | EXECUTE FUNCTION update_special_dishes_updated_at()             |
| public | special_protein_quantities     | trigger_update_special_protein_quantities_updated_at | UPDATE | BEFORE | EXECUTE FUNCTION update_special_protein_quantities_updated_at() |
| public | users                          | update_users_updated_at                              | UPDATE | BEFORE | EXECUTE FUNCTION update_updated_at_column()                     |


-- 8) Views
SELECT
  table_schema AS schema,
  table_name   AS view,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_schema, table_name;
| schema | view                      | view_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public | restaurants_with_location |  SELECT r.id,
    r.owner_id,
    r.name,
    r.description,
    r.contact_phone,
    r.contact_email,
    r.cuisine_type,
    r.address,
    r.city,
    r.state,
    r.country,
    r.latitude,
    r.longitude,
    r.business_hours,
    r.logo_url,
    r.cover_image_url,
    r.setup_completed,
    r.setup_step,
    r.status,
    r.created_at,
    r.updated_at,
    r.cuisine_type_id,
    r.country_id,
    r.department_id,
    r.city_id,
    c.name AS country_name,
    c.code AS country_code,
    d.name AS department_name,
    d.code AS department_code,
    ct.name AS city_name,
    ct.latitude AS city_latitude,
    ct.longitude AS city_longitude
   FROM (((restaurants r
     LEFT JOIN countries c ON ((r.country_id = c.id)))
     LEFT JOIN departments d ON ((r.department_id = d.id)))
     LEFT JOIN cities ct ON ((r.city_id = ct.id))); |
| public | v_active_menus_today      |  SELECT dm.id,
    dm.restaurant_id,
    r.name AS restaurant_name,
    dm.menu_price,
    dm.total_combinations_generated,
    dm.total_products_selected,
    dm.categories_configured,
    dm.created_at,
    dm.expires_at,
        CASE
            WHEN (dm.expires_at <= now()) THEN 'expired'::text
            WHEN (dm.expires_at <= (now() + '02:00:00'::interval)) THEN 'expiring_soon'::text
            ELSE 'active'::text
        END AS menu_status
   FROM (daily_menus dm
     JOIN restaurants r ON ((dm.restaurant_id = r.id)))
  WHERE (((dm.status)::text = 'active'::text) AND (dm.menu_date = CURRENT_DATE));                                                                                                                                                                                                                                       |



-- 9) Materialized views
SELECT
  n.nspname AS schema,
  c.relname AS matview,
  pg_get_viewdef(c.oid) AS definition
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'm' AND n.nspname = 'public'
ORDER BY n.nspname, c.relname;

Success. No rows returned

-- 10) Policies (RLS)
SELECT
  schemaname AS schema,
  tablename  AS table,
  policyname AS policy,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY schemaname, tablename, policyname;

| schema | table                          | policy                                                          | permissive | roles           | cmd    | qual                                                                                                                                                                                                                      | with_check                                                                                                                                                                                                                             |
| ------ | ------------------------------ | --------------------------------------------------------------- | ---------- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public | audit_log                      | Admins can view all audit logs                                  | PERMISSIVE | {public}        | SELECT | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | audit_log                      | System can insert audit logs                                    | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | true                                                                                                                                                                                                                                   |
| public | audit_log                      | Users can view their restaurant audit logs                      | PERMISSIVE | {public}        | SELECT | (((new_data ->> 'restaurant_id'::text))::uuid IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                             | null                                                                                                                                                                                                                                   |
| public | authorization_requests         | Supervisors can update authorization requests                   | PERMISSIVE | {public}        | UPDATE | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = ANY ((ARRAY['restaurant_owner'::character varying, 'supervisor'::character varying])::text[]))))) | null                                                                                                                                                                                                                                   |
| public | authorization_requests         | Users can create authorization requests for their restaurant    | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid()))) AND (cajero_id = auth.uid()))                                                                                                          |
| public | authorization_requests         | Users can view their restaurant authorization requests          | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | caja_sesiones                  | Users can create caja sesiones for their restaurant             | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid()))) AND (cajero_id = auth.uid()))                                                                                                          |
| public | caja_sesiones                  | Users can update their restaurant's caja sesiones               | PERMISSIVE | {public}        | UPDATE | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | caja_sesiones                  | Users can view their restaurant's caja sesiones                 | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | cities                         | cities_admin_write                                              | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | cities                         | cities_public_read                                              | PERMISSIVE | {public}        | SELECT | (is_active = true)                                                                                                                                                                                                        | null                                                                                                                                                                                                                                   |
| public | countries                      | countries_admin_write                                           | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | countries                      | countries_public_read                                           | PERMISSIVE | {public}        | SELECT | (is_active = true)                                                                                                                                                                                                        | null                                                                                                                                                                                                                                   |
| public | cuisine_types                  | cuisine_types_admin_write                                       | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | cuisine_types                  | cuisine_types_public_read                                       | PERMISSIVE | {public}        | SELECT | (is_active = true)                                                                                                                                                                                                        | null                                                                                                                                                                                                                                   |
| public | daily_menu_selections          | Users can manage their restaurant daily menu selections         | PERMISSIVE | {public}        | ALL    | (daily_menu_id IN ( SELECT dm.id
   FROM (daily_menus dm
     JOIN users u ON ((u.restaurant_id = dm.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                       | null                                                                                                                                                                                                                                   |
| public | daily_menu_selections          | Users can view their restaurant daily menu selections           | PERMISSIVE | {public}        | SELECT | (daily_menu_id IN ( SELECT dm.id
   FROM (daily_menus dm
     JOIN users u ON ((u.restaurant_id = dm.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                       | null                                                                                                                                                                                                                                   |
| public | daily_menus                    | Users can manage their restaurant daily menus                   | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | daily_menus                    | Users can view their restaurant daily menus                     | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | daily_special_activations      | Users can manage their restaurant special activations           | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | daily_special_activations      | Users can view their restaurant special activations             | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | delivery_orders                | Users can manage orders from their restaurant                   | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | delivery_orders                | Users can view orders from their restaurant                     | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | delivery_personnel             | Users can manage delivery personnel from their restaurant       | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | delivery_personnel             | Users can view delivery personnel from their restaurant         | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | departments                    | departments_admin_write                                         | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | departments                    | departments_public_read                                         | PERMISSIVE | {public}        | SELECT | (is_active = true)                                                                                                                                                                                                        | null                                                                                                                                                                                                                                   |
| public | facturas                       | Users can create facturas for their restaurant                  | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid()))) AND (generada_por = auth.uid()))                                                                                                       |
| public | facturas                       | Users can update their restaurant's facturas                    | PERMISSIVE | {public}        | UPDATE | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | facturas                       | Users can view their restaurant's facturas                      | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | gastos_caja                    | Users can create expenses for their restaurant                  | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((caja_sesion_id IN ( SELECT cs.id
   FROM (caja_sesiones cs
     JOIN users u ON ((u.restaurant_id = cs.restaurant_id)))
  WHERE ((u.id = auth.uid()) AND ((cs.estado)::text = 'abierta'::text)))) AND (registrado_por = auth.uid())) |
| public | gastos_caja                    | Users can delete their own recent expenses                      | PERMISSIVE | {public}        | DELETE | ((registrado_por = auth.uid()) AND (registrado_at > (now() - '24:00:00'::interval)))                                                                                                                                      | null                                                                                                                                                                                                                                   |
| public | gastos_caja                    | Users can view their restaurant expenses                        | PERMISSIVE | {public}        | SELECT | (caja_sesion_id IN ( SELECT cs.id
   FROM (caja_sesiones cs
     JOIN users u ON ((u.restaurant_id = cs.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                    | null                                                                                                                                                                                                                                   |
| public | generated_combinations         | Users can manage their restaurant combinations                  | PERMISSIVE | {public}        | ALL    | (daily_menu_id IN ( SELECT dm.id
   FROM (daily_menus dm
     JOIN users u ON ((u.restaurant_id = dm.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                       | null                                                                                                                                                                                                                                   |
| public | generated_combinations         | Users can view their restaurant combinations                    | PERMISSIVE | {public}        | SELECT | (daily_menu_id IN ( SELECT dm.id
   FROM (daily_menus dm
     JOIN users u ON ((u.restaurant_id = dm.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                       | null                                                                                                                                                                                                                                   |
| public | generated_special_combinations | Users can manage their restaurant special combinations          | PERMISSIVE | {public}        | ALL    | (special_dish_id IN ( SELECT sd.id
   FROM (special_dishes sd
     JOIN users u ON ((u.restaurant_id = sd.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                  | null                                                                                                                                                                                                                                   |
| public | generated_special_combinations | Users can view their restaurant special combinations            | PERMISSIVE | {public}        | SELECT | (special_dish_id IN ( SELECT sd.id
   FROM (special_dishes sd
     JOIN users u ON ((u.restaurant_id = sd.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                  | null                                                                                                                                                                                                                                   |
| public | items_orden_mesa               | Usuarios solo ven items de su restaurante                       | PERMISSIVE | {public}        | ALL    | (orden_mesa_id IN ( SELECT om.id
   FROM (ordenes_mesa om
     JOIN users u ON ((u.restaurant_id = om.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                      | null                                                                                                                                                                                                                                   |
| public | numeracion_facturas            | Users can manage their restaurant's factura numbering           | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | numeracion_facturas            | Users can view their restaurant's factura numbering             | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | ordenes_mesa                   | Usuarios solo ven órdenes de su restaurante                     | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | product_aliases                | All authenticated users can view product aliases                | PERMISSIVE | {public}        | SELECT | (auth.uid() IS NOT NULL)                                                                                                                                                                                                  | null                                                                                                                                                                                                                                   |
| public | product_aliases                | Only admins can manage product aliases                          | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | product_suggestions            | Users can create product suggestions for their restaurant       | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((suggested_by_restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid()))) AND (suggested_by_user_id = auth.uid()))                                                                                  |
| public | product_suggestions            | Users can update their own product suggestions                  | PERMISSIVE | {public}        | UPDATE | (suggested_by_user_id = auth.uid())                                                                                                                                                                                       | null                                                                                                                                                                                                                                   |
| public | product_suggestions            | Users can view their restaurant product suggestions             | PERMISSIVE | {public}        | SELECT | (suggested_by_restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                               | null                                                                                                                                                                                                                                   |
| public | protein_quantities             | Users can manage their restaurant protein quantities            | PERMISSIVE | {public}        | ALL    | (daily_menu_id IN ( SELECT dm.id
   FROM (daily_menus dm
     JOIN users u ON ((u.restaurant_id = dm.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                       | null                                                                                                                                                                                                                                   |
| public | protein_quantities             | Users can view their restaurant protein quantities              | PERMISSIVE | {public}        | SELECT | (daily_menu_id IN ( SELECT dm.id
   FROM (daily_menus dm
     JOIN users u ON ((u.restaurant_id = dm.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                       | null                                                                                                                                                                                                                                   |
| public | restaurant_favorites           | Users can manage their restaurant favorites                     | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | restaurant_favorites           | Users can view their restaurant favorites                       | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | restaurant_mesas               | Users can manage their restaurant tables                        | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | restaurant_mesas               | Users can view their restaurant tables                          | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | restaurant_product_usage       | Users can manage their restaurant product usage                 | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | restaurant_product_usage       | Users can view their restaurant product usage                   | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | restaurants                    | restaurant_owners_only                                          | PERMISSIVE | {authenticated} | ALL    | (auth.uid() = owner_id)                                                                                                                                                                                                   | null                                                                                                                                                                                                                                   |
| public | restaurants                    | restaurants_can_create_one                                      | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((auth.uid() = owner_id) AND (NOT (EXISTS ( SELECT 1
   FROM restaurants restaurants_1
  WHERE (restaurants_1.owner_id = auth.uid())))))                                                                                               |
| public | restaurants                    | restaurants_can_delete_own                                      | PERMISSIVE | {public}        | DELETE | (auth.uid() = owner_id)                                                                                                                                                                                                   | null                                                                                                                                                                                                                                   |
| public | restaurants                    | restaurants_can_update_own                                      | PERMISSIVE | {public}        | UPDATE | (auth.uid() = owner_id)                                                                                                                                                                                                   | null                                                                                                                                                                                                                                   |
| public | restaurants                    | restaurants_own_restaurant                                      | PERMISSIVE | {public}        | SELECT | (auth.uid() = owner_id)                                                                                                                                                                                                   | null                                                                                                                                                                                                                                   |
| public | security_alerts                | System can create security alerts                               | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid()))) OR (auth.uid() IS NULL))                                                                                                               |
| public | security_alerts                | Users can update their restaurant security alerts               | PERMISSIVE | {public}        | UPDATE | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | security_alerts                | Users can view their restaurant security alerts                 | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | security_policies              | Users can create security policies for their restaurant         | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                                         |
| public | security_policies              | Users can update their restaurant security policies             | PERMISSIVE | {public}        | UPDATE | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | security_policies              | Users can view their restaurant security policies               | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | special_dish_selections        | Users can manage their restaurant special dish selections       | PERMISSIVE | {public}        | ALL    | (special_dish_id IN ( SELECT sd.id
   FROM (special_dishes sd
     JOIN users u ON ((u.restaurant_id = sd.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                  | null                                                                                                                                                                                                                                   |
| public | special_dish_selections        | Users can view their restaurant special dish selections         | PERMISSIVE | {public}        | SELECT | (special_dish_id IN ( SELECT sd.id
   FROM (special_dishes sd
     JOIN users u ON ((u.restaurant_id = sd.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                  | null                                                                                                                                                                                                                                   |
| public | special_dishes                 | Users can manage their restaurant special dishes                | PERMISSIVE | {public}        | ALL    | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | special_dishes                 | Users can view their restaurant special dishes                  | PERMISSIVE | {public}        | SELECT | (restaurant_id IN ( SELECT users.restaurant_id
   FROM users
  WHERE (users.id = auth.uid())))                                                                                                                            | null                                                                                                                                                                                                                                   |
| public | special_protein_quantities     | Users can manage their restaurant special protein quantities    | PERMISSIVE | {public}        | ALL    | (special_dish_id IN ( SELECT sd.id
   FROM (special_dishes sd
     JOIN users u ON ((u.restaurant_id = sd.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                  | null                                                                                                                                                                                                                                   |
| public | special_protein_quantities     | Users can view their restaurant special protein quantities      | PERMISSIVE | {public}        | SELECT | (special_dish_id IN ( SELECT sd.id
   FROM (special_dishes sd
     JOIN users u ON ((u.restaurant_id = sd.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                  | null                                                                                                                                                                                                                                   |
| public | transacciones_caja             | Authenticated users can create transactions for their restauran | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | ((caja_sesion_id IN ( SELECT cs.id
   FROM (caja_sesiones cs
     JOIN users u ON ((u.restaurant_id = cs.restaurant_id)))
  WHERE ((u.id = auth.uid()) AND ((cs.estado)::text = 'abierta'::text)))) AND (cajero_id = auth.uid()))      |
| public | transacciones_caja             | Users can view their restaurant transactions                    | PERMISSIVE | {public}        | SELECT | (caja_sesion_id IN ( SELECT cs.id
   FROM (caja_sesiones cs
     JOIN users u ON ((u.restaurant_id = cs.restaurant_id)))
  WHERE (u.id = auth.uid())))                                                                    | null                                                                                                                                                                                                                                   |
| public | universal_categories           | All authenticated users can view universal categories           | PERMISSIVE | {public}        | SELECT | (auth.uid() IS NOT NULL)                                                                                                                                                                                                  | null                                                                                                                                                                                                                                   |
| public | universal_categories           | Only admins can manage universal categories                     | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | universal_products             | All authenticated users can view universal products             | PERMISSIVE | {public}        | SELECT | (auth.uid() IS NOT NULL)                                                                                                                                                                                                  | null                                                                                                                                                                                                                                   |
| public | universal_products             | Only admins can manage universal products                       | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text))))                                                                                                             | null                                                                                                                                                                                                                                   |
| public | users                          | users_can_signup                                                | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                                                                      | (auth.uid() = id)                                                                                                                                                                                                                      |
| public | users                          | users_can_update_own                                            | PERMISSIVE | {public}        | UPDATE | (auth.uid() = id)                                                                                                                                                                                                         | null                                                                                                                                                                                                                                   |
| public | users                          | users_own_data                                                  | PERMISSIVE | {authenticated} | ALL    | (auth.uid() = id)                                                                                                                                                                                                         | null                                                                                                                                                                                                                                   |
| public | users                          | users_own_profile                                               | PERMISSIVE | {public}        | ALL    | (auth.uid() = id)                                                                                                                                                                                                         | null                                                                                                                                                                                                                                   |


-- 11) Tables with RLS enabled/forced
SELECT
  n.nspname AS schema,
  c.relname AS table,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname = 'public'
ORDER BY n.nspname, c.relname;

| schema | table                          | rls_enabled | rls_forced |
| ------ | ------------------------------ | ----------- | ---------- |
| public | audit_log                      | true        | false      |
| public | authorization_requests         | true        | false      |
| public | caja_sesiones                  | false       | false      |
| public | cities                         | true        | false      |
| public | countries                      | true        | false      |
| public | cuisine_types                  | true        | false      |
| public | daily_menu_selections          | true        | false      |
| public | daily_menus                    | true        | false      |
| public | daily_special_activations      | true        | false      |
| public | delivery_orders                | true        | false      |
| public | delivery_personnel             | true        | false      |
| public | departments                    | true        | false      |
| public | facturas                       | true        | false      |
| public | gastos_caja                    | true        | false      |
| public | generated_combinations         | true        | false      |
| public | generated_special_combinations | true        | false      |
| public | items_orden_mesa               | true        | false      |
| public | numeracion_facturas            | true        | false      |
| public | ordenes_mesa                   | true        | false      |
| public | product_aliases                | true        | false      |
| public | product_suggestions            | true        | false      |
| public | protein_quantities             | true        | false      |
| public | restaurant_favorites           | true        | false      |
| public | restaurant_mesas               | true        | false      |
| public | restaurant_product_usage       | true        | false      |
| public | restaurants                    | true        | false      |
| public | security_alerts                | true        | false      |
| public | security_policies              | true        | false      |
| public | special_dish_selections        | true        | false      |
| public | special_dishes                 | true        | false      |
| public | special_protein_quantities     | true        | false      |
| public | transacciones_caja             | true        | false      |
| public | universal_categories           | true        | false      |
| public | universal_products             | true        | false      |
| public | users                          | true        | false      |



-- 12) Sequences and ownership
SELECT
  sequence_schema AS schema,
  sequence_name   AS sequence,
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment,
  cycle_option
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_schema, sequence_name;

Success. No rows returned

-- 13) Functions
SELECT
  n.nspname AS schema,
  p.proname AS function,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS result_type,
  l.lanname AS language,
  p.prokind AS kind -- f=function, a=aggregate, p=procedure, w=window
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_language l ON l.oid = p.prolang
WHERE n.nspname = 'public'
ORDER BY n.nspname, p.proname;

| schema | function                                     | args                                                                                                                                             | result_type                                                                                                                                                                                                           | language | kind |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---- |
| public | abrir_caja_atomico                           | p_restaurant_id uuid, p_cajero_id uuid, p_monto_inicial integer, p_notas text                                                                    | json                                                                                                                                                                                                                  | plpgsql  | f    |
| public | actualizar_estado_mesa                       |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | actualizar_fecha_actualizacion               |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | actualizar_monto_total_orden                 |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | expire_old_menus                             |                                                                                                                                                  | void                                                                                                                                                                                                                  | plpgsql  | f    |
| public | generar_numero_factura                       | p_restaurant_id uuid                                                                                                                             | text                                                                                                                                                                                                                  | plpgsql  | f    |
| public | get_available_specials_today                 | p_restaurant_id uuid                                                                                                                             | TABLE(special_dish_id uuid, dish_name character varying, dish_description text, dish_price integer, daily_price_override integer, max_quantity integer, current_sold integer, notes text, combinations_count integer) | plpgsql  | f    |
| public | get_current_user_id                          |                                                                                                                                                  | uuid                                                                                                                                                                                                                  | plpgsql  | f    |
| public | get_menu_with_products                       | menu_id uuid                                                                                                                                     | json                                                                                                                                                                                                                  | plpgsql  | f    |
| public | get_security_limits                          | p_restaurant_id uuid                                                                                                                             | json                                                                                                                                                                                                                  | plpgsql  | f    |
| public | procesar_pago_atomico                        | p_caja_sesion_id uuid, p_orden_id uuid, p_tipo_orden text, p_metodo_pago text, p_monto_total integer, p_monto_recibido integer, p_cajero_id uuid | json                                                                                                                                                                                                                  | plpgsql  | f    |
| public | search_universal_products                    | search_query text, category_filter uuid, region_filter text, limit_results integer                                                               | TABLE(product_id uuid, product_name character varying, product_description text, category_name character varying, popularity_score integer, search_rank real)                                                         | plpgsql  | f    |
| public | set_restaurant_owner                         |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | sync_special_availability                    |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | toggle_special_today                         | p_restaurant_id uuid, p_special_dish_id uuid, p_activate boolean, p_max_quantity integer, p_notes text                                           | TABLE(success boolean, message text, activation_id uuid)                                                                                                                                                              | plpgsql  | f    |
| public | update_combinations_count                    |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_daily_menu_stats                      |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_product_popularity                    |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_special_combinations_updated_at       |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_special_dish_stats                    |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_special_dishes_updated_at             |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_special_protein_quantities_updated_at |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_updated_at_column                     |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | update_user_restaurant_id                    |                                                                                                                                                  | trigger                                                                                                                                                                                                               | plpgsql  | f    |
| public | validar_seguridad_transaccion                | p_restaurant_id uuid, p_cajero_id uuid, p_monto_total integer, p_metodo_pago text, p_monto_recibido integer                                      | json                                                                                                                                                                                                                  | plpgsql  | f    |



-- 14) Table sizes detailed
SELECT
  n.nspname AS schema,
  c.relname AS table,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
  pg_size_pretty(pg_relation_size(c.oid))       AS data_size,
  pg_size_pretty(pg_indexes_size(c.oid))        AS indexes_size,
  pg_size_pretty(pg_total_relation_size(reltoastrelid)) AS toast_size
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname = 'public'
ORDER BY pg_total_relation_size(c.oid) DESC;

| schema | table                          | total_size | data_size  | indexes_size | toast_size |
| ------ | ------------------------------ | ---------- | ---------- | ------------ | ---------- |
| public | universal_products             | 408 kB     | 80 kB      | 288 kB       | 8192 bytes |
| public | restaurant_mesas               | 128 kB     | 8192 bytes | 80 kB        | 8192 bytes |
| public | ordenes_mesa                   | 120 kB     | 8192 bytes | 104 kB       | 8192 bytes |
| public | daily_menus                    | 120 kB     | 8192 bytes | 80 kB        | null       |
| public | countries                      | 104 kB     | 8192 bytes | 96 kB        | null       |
| public | generated_combinations         | 104 kB     | 24 kB      | 48 kB        | 8192 bytes |
| public | daily_menu_selections          | 104 kB     | 16 kB      | 64 kB        | null       |
| public | users                          | 96 kB      | 8192 bytes | 80 kB        | 8192 bytes |
| public | cuisine_types                  | 96 kB      | 8192 bytes | 80 kB        | 8192 bytes |
| public | delivery_orders                | 96 kB      | 8192 bytes | 80 kB        | 8192 bytes |
| public | cities                         | 88 kB      | 8192 bytes | 80 kB        | null       |
| public | departments                    | 88 kB      | 8192 bytes | 80 kB        | null       |
| public | restaurants                    | 80 kB      | 8192 bytes | 64 kB        | 8192 bytes |
| public | facturas                       | 80 kB      | 0 bytes    | 72 kB        | 8192 bytes |
| public | special_dish_selections        | 72 kB      | 8192 bytes | 64 kB        | null       |
| public | protein_quantities             | 72 kB      | 8192 bytes | 64 kB        | null       |
| public | universal_categories           | 64 kB      | 8192 bytes | 48 kB        | 8192 bytes |
| public | generated_special_combinations | 64 kB      | 8192 bytes | 48 kB        | 8192 bytes |
| public | daily_special_activations      | 64 kB      | 8192 bytes | 48 kB        | 8192 bytes |
| public | caja_sesiones                  | 64 kB      | 8192 bytes | 48 kB        | 8192 bytes |
| public | transacciones_caja             | 56 kB      | 8192 bytes | 48 kB        | null       |
| public | items_orden_mesa               | 48 kB      | 8192 bytes | 32 kB        | 8192 bytes |
| public | delivery_personnel             | 40 kB      | 8192 bytes | 32 kB        | null       |
| public | restaurant_product_usage       | 32 kB      | 0 bytes    | 32 kB        | null       |
| public | restaurant_favorites           | 32 kB      | 0 bytes    | 32 kB        | null       |
| public | audit_log                      | 32 kB      | 8192 bytes | 16 kB        | 8192 bytes |
| public | security_policies              | 32 kB      | 8192 bytes | 16 kB        | 8192 bytes |
| public | gastos_caja                    | 32 kB      | 8192 bytes | 16 kB        | 8192 bytes |
| public | special_dishes                 | 32 kB      | 8192 bytes | 16 kB        | 8192 bytes |
| public | special_protein_quantities     | 24 kB      | 0 bytes    | 24 kB        | null       |
| public | security_alerts                | 16 kB      | 0 bytes    | 8192 bytes   | 8192 bytes |
| public | product_aliases                | 16 kB      | 0 bytes    | 16 kB        | null       |
| public | authorization_requests         | 16 kB      | 0 bytes    | 8192 bytes   | 8192 bytes |
| public | product_suggestions            | 16 kB      | 0 bytes    | 8192 bytes   | 8192 bytes |
| public | numeracion_facturas            | 8192 bytes | 0 bytes    | 8192 bytes   | null       |

-- 15) Orphans: FKs referencing non-existent rows (expensive; run selectively)
-- Replace table/fk/col names as needed for targeted checks.
-- SELECT child.*
-- FROM child_table child
-- LEFT JOIN parent_table parent ON child.parent_id = parent.id
-- WHERE parent.id IS NULL;

-- End of Audit Pack
