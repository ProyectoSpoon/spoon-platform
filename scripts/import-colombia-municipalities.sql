-- ========================================
-- IMPORTACIÓN DE MUNICIPIOS DE COLOMBIA
-- Generado automáticamente desde CSV
-- ========================================


-- BOGOTÁ D.C. (11)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '11';
    
    IF dept_id IS NOT NULL THEN

        -- BOGOTÁ D.C.
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOGOTÁ D.C.',
            dept_id,
            4.649251,
            -74.106992,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- BOLÍVAR (13)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '13';
    
    IF dept_id IS NOT NULL THEN

        -- CARTAGENA DE INDIAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARTAGENA DE INDIAS',
            dept_id,
            10.385126,
            -75.496269,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ACHÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ACHÍ',
            dept_id,
            8.570107,
            -74.557676,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALTOS DEL ROSARIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALTOS DEL ROSARIO',
            dept_id,
            8.791865,
            -74.164905,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARENAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARENAL',
            dept_id,
            8.458865,
            -73.941099,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARJONA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARJONA',
            dept_id,
            10.25666,
            -75.344332,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARROYOHONDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARROYOHONDO',
            dept_id,
            10.250075,
            -75.019215,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARRANCO DE LOBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARRANCO DE LOBA',
            dept_id,
            8.947787,
            -74.104391,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALAMAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALAMAR',
            dept_id,
            10.250431,
            -74.916144,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CANTAGALLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CANTAGALLO',
            dept_id,
            7.378678,
            -73.914605,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CICUCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CICUCO',
            dept_id,
            9.274281,
            -74.645981,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÓRDOBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÓRDOBA',
            dept_id,
            9.586942,
            -74.827399,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CLEMENCIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CLEMENCIA',
            dept_id,
            10.567452,
            -75.328469,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CARMEN DE BOLÍVAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CARMEN DE BOLÍVAR',
            dept_id,
            9.718653,
            -75.121178,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL GUAMO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL GUAMO',
            dept_id,
            10.030958,
            -74.976084,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PE�ÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PE�ÍN',
            dept_id,
            8.988271,
            -73.949274,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HATILLO DE LOBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HATILLO DE LOBA',
            dept_id,
            8.956014,
            -74.077912,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MAGANGU�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MAGANGU�',
            dept_id,
            9.263799,
            -74.766742,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MAHATES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MAHATES',
            dept_id,
            10.233285,
            -75.191643,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARGARITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARGARITA',
            dept_id,
            9.15784,
            -74.285137,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARÍA LA BAJA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARÍA LA BAJA',
            dept_id,
            9.982402,
            -75.300516,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONTECRISTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONTECRISTO',
            dept_id,
            8.297234,
            -74.471176,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA CRUZ DE MOMPOX
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA CRUZ DE MOMPOX',
            dept_id,
            9.244241,
            -74.42818,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MORALES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MORALES',
            dept_id,
            8.276558,
            -73.868172,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NOROSÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NOROSÍ',
            dept_id,
            8.526259,
            -74.038003,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PINILLOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PINILLOS',
            dept_id,
            8.914947,
            -74.462279,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- REGIDOR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'REGIDOR',
            dept_id,
            8.666258,
            -73.821638,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RÍO VIEJO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RÍO VIEJO',
            dept_id,
            8.58795,
            -73.840466,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN CRISTÍBAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN CRISTÍBAL',
            dept_id,
            10.392836,
            -75.065076,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ESTANISLAO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ESTANISLAO',
            dept_id,
            10.398602,
            -75.153101,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN FERNANDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN FERNANDO',
            dept_id,
            9.214183,
            -74.323811,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JACINTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JACINTO',
            dept_id,
            9.830275,
            -75.12105,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JACINTO DEL CAUCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JACINTO DEL CAUCA',
            dept_id,
            8.25158,
            -74.721156,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JUAN NEPOMUCENO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JUAN NEPOMUCENO',
            dept_id,
            9.953751,
            -75.081761,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MARTÍN DE LOBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MARTÍN DE LOBA',
            dept_id,
            8.937485,
            -74.039134,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PABLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PABLO',
            dept_id,
            7.476747,
            -73.924602,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA CATALINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA CATALINA',
            dept_id,
            10.605294,
            -75.287855,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ROSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ROSA',
            dept_id,
            10.444396,
            -75.369824,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ROSA DEL SUR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ROSA DEL SUR',
            dept_id,
            7.963938,
            -74.052243,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SIMITÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SIMITÍ',
            dept_id,
            7.953916,
            -73.947264,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOPLAVIENTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOPLAVIENTO',
            dept_id,
            10.38839,
            -75.136404,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TALAIGUA NUEVO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TALAIGUA NUEVO',
            dept_id,
            9.30403,
            -74.567479,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIQUISIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIQUISIO',
            dept_id,
            8.558666,
            -74.262922,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TURBACO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TURBACO',
            dept_id,
            10.348316,
            -75.427249,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TURBANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TURBANÍ',
            dept_id,
            10.274585,
            -75.44265,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLANUEVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLANUEVA',
            dept_id,
            10.444089,
            -75.275613,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZAMBRANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZAMBRANO',
            dept_id,
            9.746306,
            -74.817879,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- BOYACÁ (15)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '15';
    
    IF dept_id IS NOT NULL THEN

        -- TUNJA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TUNJA',
            dept_id,
            5.53988,
            -73.355539,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALMEIDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALMEIDA',
            dept_id,
            4.970857,
            -73.378933,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AQUITANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AQUITANIA',
            dept_id,
            5.518602,
            -72.88399,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARCABUCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARCABUCO',
            dept_id,
            5.755673,
            -73.437503,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BEL�N
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BEL�N',
            dept_id,
            5.98923,
            -72.911641,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BERBEO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BERBEO',
            dept_id,
            5.227451,
            -73.12721,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BET�ITIVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BET�ITIVA',
            dept_id,
            5.909978,
            -72.809014,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOAVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOAVITA',
            dept_id,
            6.330703,
            -72.584905,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOYACÁ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOYACÁ',
            dept_id,
            5.454578,
            -73.361945,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BRICE�O
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BRICE�O',
            dept_id,
            5.690879,
            -73.92326,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUENAVISTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUENAVISTA',
            dept_id,
            5.512594,
            -73.94217,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUSBANZÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUSBANZÍ',
            dept_id,
            5.831393,
            -72.884158,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALDAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALDAS',
            dept_id,
            5.55458,
            -73.865553,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAMPOHERMOSO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAMPOHERMOSO',
            dept_id,
            5.031676,
            -73.104173,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CERINZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CERINZA',
            dept_id,
            5.955939,
            -72.947918,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHINAVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHINAVITA',
            dept_id,
            5.167486,
            -73.368476,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIQUINQUIRÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIQUINQUIRÍ',
            dept_id,
            5.61379,
            -73.818745,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHISCAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHISCAS',
            dept_id,
            6.553136,
            -72.500957,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHITA',
            dept_id,
            6.187083,
            -72.471892,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHITARAQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHITARAQUE',
            dept_id,
            6.027425,
            -73.4471,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIVATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIVATÍ',
            dept_id,
            5.558949,
            -73.282529,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CI�NEGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CI�NEGA',
            dept_id,
            5.408694,
            -73.296049,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÍMBITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÍMBITA',
            dept_id,
            5.634545,
            -73.323957,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COPER
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COPER',
            dept_id,
            5.475074,
            -74.045636,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CORRALES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CORRALES',
            dept_id,
            5.828064,
            -72.844795,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COVARACHÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COVARACHÍA',
            dept_id,
            6.500177,
            -72.738978,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUBARÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUBARÍ',
            dept_id,
            6.997275,
            -72.107939,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUCAITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUCAITA',
            dept_id,
            5.544452,
            -73.454338,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUÍTIVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUÍTIVA',
            dept_id,
            5.580367,
            -72.965923,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHÍQUIZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHÍQUIZA',
            dept_id,
            5.639834,
            -73.449463,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIVOR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIVOR',
            dept_id,
            4.888173,
            -73.368398,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DUITAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DUITAMA',
            dept_id,
            5.822964,
            -73.03063,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL COCUY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL COCUY',
            dept_id,
            6.407738,
            -72.444537,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL ESPINO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL ESPINO',
            dept_id,
            6.483027,
            -72.497007,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FIRAVITOBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FIRAVITOBA',
            dept_id,
            5.668885,
            -72.993392,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FLORESTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FLORESTA',
            dept_id,
            5.859519,
            -72.918111,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GACHANTIVÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GACHANTIVÍ',
            dept_id,
            5.751891,
            -73.549092,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GÍMEZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GÍMEZA',
            dept_id,
            5.802333,
            -72.80553,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GARAGOA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GARAGOA',
            dept_id,
            5.083234,
            -73.364413,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUACAMAYAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUACAMAYAS',
            dept_id,
            6.459667,
            -72.500812,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUATEQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUATEQUE',
            dept_id,
            5.007321,
            -73.471207,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAYATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAYATÍ',
            dept_id,
            4.967122,
            -73.489698,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- G�ICÍN DE LA SIERRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'G�ICÍN DE LA SIERRA',
            dept_id,
            6.462864,
            -72.411763,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- IZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'IZA',
            dept_id,
            5.611577,
            -72.979559,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JENESANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JENESANO',
            dept_id,
            5.385813,
            -73.363738,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JERICÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JERICÍ',
            dept_id,
            6.145735,
            -72.571122,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LABRANZAGRANDE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LABRANZAGRANDE',
            dept_id,
            5.562687,
            -72.57777,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA CAPILLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA CAPILLA',
            dept_id,
            5.095687,
            -73.444347,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA VICTORIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA VICTORIA',
            dept_id,
            5.523792,
            -74.234393,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA UVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA UVITA',
            dept_id,
            6.31616,
            -72.559982,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLA DE LEYVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLA DE LEYVA',
            dept_id,
            5.632455,
            -73.524948,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MACANAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MACANAL',
            dept_id,
            4.972464,
            -73.319593,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARIPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARIPÍ',
            dept_id,
            5.550091,
            -74.00405,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MIRAFLORES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MIRAFLORES',
            dept_id,
            5.196515,
            -73.14563,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONGUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONGUA',
            dept_id,
            5.754242,
            -72.79809,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONGUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONGUÍ',
            dept_id,
            5.723486,
            -72.849292,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONIQUIRÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONIQUIRÍ',
            dept_id,
            5.876331,
            -73.573374,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MOTAVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MOTAVITA',
            dept_id,
            5.5777,
            -73.367841,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MUZO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MUZO',
            dept_id,
            5.532758,
            -74.10269,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NOBSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NOBSA',
            dept_id,
            5.768046,
            -72.937042,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NUEVO COLÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NUEVO COLÍN',
            dept_id,
            5.355317,
            -73.456759,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OICATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OICATÍ',
            dept_id,
            5.595235,
            -73.308399,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OTANCHE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OTANCHE',
            dept_id,
            5.657536,
            -74.180965,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PACHAVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PACHAVITA',
            dept_id,
            5.140065,
            -73.396953,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PÍEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PÍEZ',
            dept_id,
            5.097319,
            -73.052737,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAIPA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAIPA',
            dept_id,
            5.779894,
            -73.11782,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAJARITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAJARITO',
            dept_id,
            5.293783,
            -72.703231,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PANQUEBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PANQUEBA',
            dept_id,
            6.443416,
            -72.459424,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAUNA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAUNA',
            dept_id,
            5.656323,
            -73.978449,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAYA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAYA',
            dept_id,
            5.625699,
            -72.423775,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAZ DE RÍO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAZ DE RÍO',
            dept_id,
            5.987645,
            -72.749137,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PESCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PESCA',
            dept_id,
            5.558808,
            -73.050872,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PISBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PISBA',
            dept_id,
            5.72141,
            -72.486023,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO BOYACÁ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO BOYACÁ',
            dept_id,
            5.976646,
            -74.587782,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- QUÍPAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'QUÍPAMA',
            dept_id,
            5.52055,
            -74.180033,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RAMIRIQUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RAMIRIQUÍ',
            dept_id,
            5.400303,
            -73.334839,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RÍQUIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RÍQUIRA',
            dept_id,
            5.539136,
            -73.632543,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RONDÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RONDÍN',
            dept_id,
            5.357378,
            -73.208474,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABOYÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABOYÍ',
            dept_id,
            5.697756,
            -73.764456,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SÍCHICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SÍCHICA',
            dept_id,
            5.584305,
            -73.542539,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAMACÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAMACÍ',
            dept_id,
            5.492161,
            -73.485589,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN EDUARDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN EDUARDO',
            dept_id,
            5.22401,
            -73.077747,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS� DE PARE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DE PARE',
            dept_id,
            6.018924,
            -73.545397,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN LUIS DE GACENO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN LUIS DE GACENO',
            dept_id,
            4.81976,
            -73.168076,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MATEO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MATEO',
            dept_id,
            6.401683,
            -72.555264,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MIGUEL DE SEMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MIGUEL DE SEMA',
            dept_id,
            5.518083,
            -73.722009,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PABLO DE BORBUR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PABLO DE BORBUR',
            dept_id,
            5.650743,
            -74.069963,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTANA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTANA',
            dept_id,
            6.056866,
            -73.481639,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA MARÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA MARÍA',
            dept_id,
            4.857193,
            -73.263518,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ROSA DE VITERBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ROSA DE VITERBO',
            dept_id,
            5.874547,
            -72.982461,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA SOFÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA SOFÍA',
            dept_id,
            5.713269,
            -73.602707,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SATIVANORTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SATIVANORTE',
            dept_id,
            6.131132,
            -72.708458,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SATIVASUR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SATIVASUR',
            dept_id,
            6.093183,
            -72.712435,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SIACHOQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SIACHOQUE',
            dept_id,
            5.511811,
            -73.24466,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOATÍ',
            dept_id,
            6.331945,
            -72.684051,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOCOTÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOCOTÍ',
            dept_id,
            6.041162,
            -72.636653,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOCHA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOCHA',
            dept_id,
            5.996717,
            -72.691963,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOGAMOSO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOGAMOSO',
            dept_id,
            5.723976,
            -72.924355,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOMONDOCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOMONDOCO',
            dept_id,
            4.985726,
            -73.433393,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SORA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SORA',
            dept_id,
            5.56684,
            -73.450153,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOTAQUIRÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOTAQUIRÍ',
            dept_id,
            5.764986,
            -73.246585,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SORACÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SORACÍ',
            dept_id,
            5.500898,
            -73.332804,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUSACÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUSACÍN',
            dept_id,
            6.230332,
            -72.690289,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUTAMARCHÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUTAMARCHÍN',
            dept_id,
            5.619781,
            -73.620536,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUTATENZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUTATENZA',
            dept_id,
            5.022989,
            -73.452317,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TASCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TASCO',
            dept_id,
            5.909821,
            -72.781011,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TENZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TENZA',
            dept_id,
            5.076781,
            -73.421176,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIBANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIBANÍ',
            dept_id,
            5.317251,
            -73.396457,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIBASOSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIBASOSA',
            dept_id,
            5.74723,
            -72.999449,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TINJACÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TINJACÍ',
            dept_id,
            5.579713,
            -73.646847,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIPACOQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIPACOQUE',
            dept_id,
            6.419203,
            -72.691729,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOCA',
            dept_id,
            5.566464,
            -73.184794,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOG�Í
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOG�Í',
            dept_id,
            5.937438,
            -73.513655,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TÍPAGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TÍPAGA',
            dept_id,
            5.768201,
            -72.832245,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOTA',
            dept_id,
            5.560497,
            -72.985898,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TUNUNGUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TUNUNGUÍ',
            dept_id,
            5.730582,
            -73.933155,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TURMEQU�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TURMEQU�',
            dept_id,
            5.323261,
            -73.491825,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TUTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TUTA',
            dept_id,
            5.689082,
            -73.230285,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TUTAZÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TUTAZÍ',
            dept_id,
            6.032608,
            -72.856035,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ÍMBITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ÍMBITA',
            dept_id,
            5.221176,
            -73.456917,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VENTAQUEMADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VENTAQUEMADA',
            dept_id,
            5.368739,
            -73.522368,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VIRACACHÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VIRACACHÍ',
            dept_id,
            5.436833,
            -73.296894,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZETAQUIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZETAQUIRA',
            dept_id,
            5.283443,
            -73.17098,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CALDAS (17)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '17';
    
    IF dept_id IS NOT NULL THEN

        -- MANIZALES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MANIZALES',
            dept_id,
            5.057657,
            -75.491025,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AGUADAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AGUADAS',
            dept_id,
            5.610244,
            -75.45487,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANSERMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANSERMA',
            dept_id,
            5.236471,
            -75.784343,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARANZAZU
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARANZAZU',
            dept_id,
            5.271195,
            -75.49129,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BELALCÍZAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BELALCÍZAR',
            dept_id,
            4.993785,
            -75.811918,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHINCHINÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHINCHINÍ',
            dept_id,
            4.985227,
            -75.607529,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FILADELFIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FILADELFIA',
            dept_id,
            5.297091,
            -75.562474,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA DORADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA DORADA',
            dept_id,
            5.460834,
            -74.668819,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA MERCED
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA MERCED',
            dept_id,
            5.39647,
            -75.546486,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MANZANARES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MANZANARES',
            dept_id,
            5.255699,
            -75.152829,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARMATO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARMATO',
            dept_id,
            5.47422,
            -75.600049,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARQUETALIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARQUETALIA',
            dept_id,
            5.297525,
            -75.053097,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARULANDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARULANDA',
            dept_id,
            5.284304,
            -75.259721,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NEIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NEIRA',
            dept_id,
            5.166895,
            -75.520006,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NORCASIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NORCASIA',
            dept_id,
            5.574796,
            -74.889543,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PÍCORA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PÍCORA',
            dept_id,
            5.527172,
            -75.459621,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALESTINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALESTINA',
            dept_id,
            5.017879,
            -75.624577,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PENSILVANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PENSILVANIA',
            dept_id,
            5.383281,
            -75.160299,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RIOSUCIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIOSUCIO',
            dept_id,
            5.423673,
            -75.702104,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RISARALDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RISARALDA',
            dept_id,
            5.164509,
            -75.76722,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SALAMINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SALAMINA',
            dept_id,
            5.403025,
            -75.487223,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAMANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAMANÍ',
            dept_id,
            5.41308,
            -74.992263,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS�',
            dept_id,
            5.08231,
            -75.792063,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUPÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUPÍA',
            dept_id,
            5.446843,
            -75.64966,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VICTORIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VICTORIA',
            dept_id,
            5.317437,
            -74.911239,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLAMARÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLAMARÍA',
            dept_id,
            5.038925,
            -75.502487,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VITERBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VITERBO',
            dept_id,
            5.062664,
            -75.87061,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CAQUETÁ (18)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '18';
    
    IF dept_id IS NOT NULL THEN

        -- FLORENCIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FLORENCIA',
            dept_id,
            1.618196,
            -75.609831,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALBANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALBANIA',
            dept_id,
            1.328526,
            -75.878375,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BEL�N DE LOS ANDAQUÍES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BEL�N DE LOS ANDAQUÍES',
            dept_id,
            1.415812,
            -75.872405,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARTAGENA DEL CHAIRÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARTAGENA DEL CHAIRÍ',
            dept_id,
            1.332371,
            -74.847867,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CURILLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CURILLO',
            dept_id,
            1.033473,
            -75.919205,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL DONCELLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL DONCELLO',
            dept_id,
            1.679951,
            -75.283631,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PAUJÍL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PAUJÍL',
            dept_id,
            1.570226,
            -75.326093,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA MONTA�ITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA MONTA�ITA',
            dept_id,
            1.479173,
            -75.436408,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MILÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MILÍN',
            dept_id,
            1.29021,
            -75.506926,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MORELIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MORELIA',
            dept_id,
            1.486611,
            -75.724146,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO RICO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO RICO',
            dept_id,
            1.909063,
            -75.157604,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS� DEL FRAGUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DEL FRAGUA',
            dept_id,
            1.330266,
            -75.973796,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN VICENTE DEL CAGUÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN VICENTE DEL CAGUÍN',
            dept_id,
            2.119413,
            -74.767894,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOLANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOLANO',
            dept_id,
            0.699077,
            -75.253702,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOLITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOLITA',
            dept_id,
            0.87654,
            -75.619902,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VALPARAÍSO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALPARAÍSO',
            dept_id,
            1.194619,
            -75.70671,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CAUCA (19)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '19';
    
    IF dept_id IS NOT NULL THEN

        -- POPAYÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'POPAYÍN',
            dept_id,
            2.459641,
            -76.599377,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALMAGUER
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALMAGUER',
            dept_id,
            1.913429,
            -76.85607,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARGELIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARGELIA',
            dept_id,
            2.257427,
            -77.24905,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BALBOA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BALBOA',
            dept_id,
            2.040998,
            -77.215773,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOLÍVAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOLÍVAR',
            dept_id,
            1.837538,
            -76.966215,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUENOS AIRES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUENOS AIRES',
            dept_id,
            3.015382,
            -76.642238,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAJIBÍO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAJIBÍO',
            dept_id,
            2.623371,
            -76.570682,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALDONO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALDONO',
            dept_id,
            2.798059,
            -76.484319,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALOTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALOTO',
            dept_id,
            3.034531,
            -76.408941,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CORINTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CORINTO',
            dept_id,
            3.173854,
            -76.261866,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL TAMBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL TAMBO',
            dept_id,
            2.451409,
            -76.810911,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FLORENCIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FLORENCIA',
            dept_id,
            1.682535,
            -77.072547,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUACHEN�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUACHEN�',
            dept_id,
            3.134153,
            -76.392189,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAPI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAPI',
            dept_id,
            2.571337,
            -77.88797,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- INZÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'INZÍ',
            dept_id,
            2.549183,
            -76.063503,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JAMBALÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JAMBALÍ',
            dept_id,
            2.777834,
            -76.323877,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA SIERRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA SIERRA',
            dept_id,
            2.179383,
            -76.763278,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA VEGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA VEGA',
            dept_id,
            2.001803,
            -76.778771,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LÍPEZ DE MICAY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LÍPEZ DE MICAY',
            dept_id,
            2.846788,
            -77.247803,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MERCADERES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MERCADERES',
            dept_id,
            1.789193,
            -77.164319,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MIRANDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MIRANDA',
            dept_id,
            3.254651,
            -76.228722,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MORALES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MORALES',
            dept_id,
            2.754684,
            -76.629106,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PADILLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PADILLA',
            dept_id,
            3.220984,
            -76.313265,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PÍEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PÍEZ',
            dept_id,
            2.645724,
            -75.970685,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PATÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PATÍA',
            dept_id,
            2.115875,
            -76.981075,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIAMONTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIAMONTE',
            dept_id,
            1.11754,
            -76.327588,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIENDAMÍ - TUNÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIENDAMÍ - TUNÍA',
            dept_id,
            2.64228,
            -76.528615,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO TEJADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO TEJADA',
            dept_id,
            3.233254,
            -76.417673,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PURAC�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PURAC�',
            dept_id,
            2.341507,
            -76.496698,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ROSAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ROSAS',
            dept_id,
            2.260941,
            -76.740336,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN SEBASTIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN SEBASTIÍN',
            dept_id,
            1.838451,
            -76.769467,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTANDER DE QUILICHAO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTANDER DE QUILICHAO',
            dept_id,
            3.015008,
            -76.485141,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ROSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ROSA',
            dept_id,
            1.700916,
            -76.573252,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SILVIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SILVIA',
            dept_id,
            2.611927,
            -76.379753,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOTARÍ - PAISPAMBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOTARÍ - PAISPAMBA',
            dept_id,
            2.253156,
            -76.613365,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUÍREZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUÍREZ',
            dept_id,
            2.959785,
            -76.69357,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUCRE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUCRE',
            dept_id,
            2.038237,
            -76.926279,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIMBÍO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIMBÍO',
            dept_id,
            2.349686,
            -76.684476,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIMBIQUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIMBIQUÍ',
            dept_id,
            2.777312,
            -77.667541,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TORIBÍO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TORIBÍO',
            dept_id,
            2.953017,
            -76.270284,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOTORÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOTORÍ',
            dept_id,
            2.510252,
            -76.403628,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLA RICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLA RICA',
            dept_id,
            3.17762,
            -76.458025,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CESAR (20)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '20';
    
    IF dept_id IS NOT NULL THEN

        -- VALLEDUPAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALLEDUPAR',
            dept_id,
            10.460472,
            -73.259398,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AGUACHICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AGUACHICA',
            dept_id,
            8.306811,
            -73.614027,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AGUSTÍN CODAZZI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AGUSTÍN CODAZZI',
            dept_id,
            10.040454,
            -73.238389,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ASTREA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ASTREA',
            dept_id,
            9.498062,
            -73.975842,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BECERRIL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BECERRIL',
            dept_id,
            9.704404,
            -73.278707,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOSCONIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOSCONIA',
            dept_id,
            9.975098,
            -73.888761,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIMICHAGUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIMICHAGUA',
            dept_id,
            9.25875,
            -73.813278,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIRIGUANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIRIGUANÍ',
            dept_id,
            9.361058,
            -73.599913,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CURUMANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CURUMANÍ',
            dept_id,
            9.201716,
            -73.540843,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL COPEY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL COPEY',
            dept_id,
            10.149883,
            -73.962703,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PASO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PASO',
            dept_id,
            9.668461,
            -73.742012,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GAMARRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GAMARRA',
            dept_id,
            8.324793,
            -73.737558,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GONZÍLEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GONZÍLEZ',
            dept_id,
            8.389604,
            -73.38004,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA GLORIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA GLORIA',
            dept_id,
            8.619298,
            -73.80321,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA JAGUA DE IBIRICO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA JAGUA DE IBIRICO',
            dept_id,
            9.563752,
            -73.334143,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MANAURE BALCÍN DEL CESAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MANAURE BALCÍN DEL CESAR',
            dept_id,
            10.390776,
            -73.029472,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAILITAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAILITAS',
            dept_id,
            8.959399,
            -73.625825,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PELAYA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PELAYA',
            dept_id,
            8.689451,
            -73.666735,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUEBLO BELLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUEBLO BELLO',
            dept_id,
            10.417321,
            -73.586211,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RÍO DE ORO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RÍO DE ORO',
            dept_id,
            8.292292,
            -73.386393,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PAZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PAZ',
            dept_id,
            10.387552,
            -73.171365,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ALBERTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ALBERTO',
            dept_id,
            7.76111,
            -73.393889,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN DIEGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN DIEGO',
            dept_id,
            10.333039,
            -73.181208,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MARTÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MARTÍN',
            dept_id,
            7.999855,
            -73.510914,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TAMALAMEQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TAMALAMEQUE',
            dept_id,
            8.861725,
            -73.812172,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CÓRDOBA (23)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '23';
    
    IF dept_id IS NOT NULL THEN

        -- MONTERÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONTERÍA',
            dept_id,
            8.759789,
            -75.873096,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AYAPEL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AYAPEL',
            dept_id,
            8.313838,
            -75.146048,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUENAVISTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUENAVISTA',
            dept_id,
            8.221187,
            -75.480897,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CANALETE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CANALETE',
            dept_id,
            8.786939,
            -76.241476,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CERET�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CERET�',
            dept_id,
            8.888532,
            -75.796093,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIMÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIMÍ',
            dept_id,
            9.149698,
            -75.626886,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHINÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHINÍ',
            dept_id,
            9.105473,
            -75.399633,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CI�NAGA DE ORO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CI�NAGA DE ORO',
            dept_id,
            8.875794,
            -75.620807,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COTORRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COTORRA',
            dept_id,
            9.037163,
            -75.799216,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA APARTADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA APARTADA',
            dept_id,
            8.050125,
            -75.336031,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LORICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LORICA',
            dept_id,
            9.240789,
            -75.816084,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LOS CÓRDOBAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LOS CÓRDOBAS',
            dept_id,
            8.892098,
            -76.35518,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MOMIL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MOMIL',
            dept_id,
            9.240707,
            -75.67796,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONTELÍBANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONTELÍBANO',
            dept_id,
            7.973777,
            -75.416818,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MO�ITOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MO�ITOS',
            dept_id,
            9.245223,
            -76.1291,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PLANETA RICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PLANETA RICA',
            dept_id,
            8.4082,
            -75.583241,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUEBLO NUEVO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUEBLO NUEVO',
            dept_id,
            8.504099,
            -75.508035,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO ESCONDIDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO ESCONDIDO',
            dept_id,
            9.005372,
            -76.260411,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO LIBERTADOR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO LIBERTADOR',
            dept_id,
            7.888859,
            -75.671761,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PURÍSIMA DE LA CONCEPCIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PURÍSIMA DE LA CONCEPCIÍN',
            dept_id,
            9.239295,
            -75.724987,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAHAGÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAHAGÍN',
            dept_id,
            8.943048,
            -75.445834,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ANDR�S DE SOTAVENTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANDR�S DE SOTAVENTO',
            dept_id,
            9.145448,
            -75.50879,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ANTERO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANTERO',
            dept_id,
            9.376434,
            -75.76112,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN BERNARDO DEL VIENTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN BERNARDO DEL VIENTO',
            dept_id,
            9.35247,
            -75.955107,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN CARLOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN CARLOS',
            dept_id,
            8.799282,
            -75.698799,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS� DE UR�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DE UR�',
            dept_id,
            7.787303,
            -75.533476,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PELAYO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PELAYO',
            dept_id,
            8.958436,
            -75.835615,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIERRALTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIERRALTA',
            dept_id,
            8.170612,
            -76.059797,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TUCHÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TUCHÍN',
            dept_id,
            9.186625,
            -75.553962,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VALENCIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALENCIA',
            dept_id,
            8.255016,
            -76.150756,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CUNDINAMARCA (25)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '25';
    
    IF dept_id IS NOT NULL THEN

        -- AGUA DE DIOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AGUA DE DIOS',
            dept_id,
            4.375309,
            -74.669221,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALBÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALBÍN',
            dept_id,
            4.878022,
            -74.438261,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANAPOIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANAPOIMA',
            dept_id,
            4.562737,
            -74.528676,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANOLAIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANOLAIMA',
            dept_id,
            4.7617,
            -74.46384,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARBELÍEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARBELÍEZ',
            dept_id,
            4.272534,
            -74.414901,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BELTRÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BELTRÍN',
            dept_id,
            4.802832,
            -74.741666,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BITUIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BITUIMA',
            dept_id,
            4.872171,
            -74.539609,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOJACÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOJACÍ',
            dept_id,
            4.737205,
            -74.344594,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CABRERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CABRERA',
            dept_id,
            3.985164,
            -74.484549,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CACHIPAY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CACHIPAY',
            dept_id,
            4.730957,
            -74.435711,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAJICÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAJICÍ',
            dept_id,
            4.920009,
            -74.02298,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAPARRAPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAPARRAPÍ',
            dept_id,
            5.34758,
            -74.491045,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÍQUEZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÍQUEZA',
            dept_id,
            4.404112,
            -73.946473,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARMEN DE CARUPA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARMEN DE CARUPA',
            dept_id,
            5.349119,
            -73.901357,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHAGUANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHAGUANÍ',
            dept_id,
            4.948916,
            -74.593455,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHÍA',
            dept_id,
            4.866508,
            -74.05,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIPAQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIPAQUE',
            dept_id,
            4.442671,
            -74.044876,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHOACHÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHOACHÍ',
            dept_id,
            4.527048,
            -73.922894,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHOCONTÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHOCONTÍ',
            dept_id,
            5.145224,
            -73.683533,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COGUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COGUA',
            dept_id,
            5.061842,
            -73.978497,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COTA',
            dept_id,
            4.812564,
            -74.102569,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUCUNUBÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUCUNUBÍ',
            dept_id,
            5.249795,
            -73.766113,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL COLEGIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL COLEGIO',
            dept_id,
            4.577951,
            -74.442261,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PE�ÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PE�ÍN',
            dept_id,
            5.248747,
            -74.290207,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL ROSAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL ROSAL',
            dept_id,
            4.850589,
            -74.263103,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FACATATIVÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FACATATIVÍ',
            dept_id,
            4.813353,
            -74.350085,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FÍMEQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FÍMEQUE',
            dept_id,
            4.485474,
            -73.892523,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FOSCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FOSCA',
            dept_id,
            4.339093,
            -73.93902,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FUNZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FUNZA',
            dept_id,
            4.710412,
            -74.201528,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FÍQUENE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FÍQUENE',
            dept_id,
            5.403997,
            -73.795855,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FUSAGASUGÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FUSAGASUGÍ',
            dept_id,
            4.336723,
            -74.37543,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GACHALÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GACHALÍ',
            dept_id,
            4.693579,
            -73.520161,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GACHANCIPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GACHANCIPÍ',
            dept_id,
            4.990947,
            -73.873464,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GACHETÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GACHETÍ',
            dept_id,
            4.816411,
            -73.636377,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GAMA',
            dept_id,
            4.763325,
            -73.611037,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GIRARDOT
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GIRARDOT',
            dept_id,
            4.313069,
            -74.798201,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GRANADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GRANADA',
            dept_id,
            4.519763,
            -74.350766,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUACHETÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUACHETÍ',
            dept_id,
            5.383378,
            -73.686972,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUADUAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUADUAS',
            dept_id,
            5.072076,
            -74.603402,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUASCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUASCA',
            dept_id,
            4.866719,
            -73.877143,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUATAQUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUATAQUÍ',
            dept_id,
            4.517517,
            -74.790058,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUATAVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUATAVITA',
            dept_id,
            4.935211,
            -73.83293,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAYABAL DE SÍQUIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAYABAL DE SÍQUIMA',
            dept_id,
            4.877968,
            -74.467437,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAYABETAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAYABETAL',
            dept_id,
            4.215306,
            -73.815107,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUTI�RREZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUTI�RREZ',
            dept_id,
            4.254679,
            -74.003042,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JERUSAL�N
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JERUSAL�N',
            dept_id,
            4.562273,
            -74.695474,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JUNÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JUNÍN',
            dept_id,
            4.79057,
            -73.662961,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA CALERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA CALERA',
            dept_id,
            4.721104,
            -73.968161,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA MESA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA MESA',
            dept_id,
            4.631028,
            -74.461588,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PALMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PALMA',
            dept_id,
            5.358816,
            -74.391022,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PE�A
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PE�A',
            dept_id,
            5.198945,
            -74.394105,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA VEGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA VEGA',
            dept_id,
            4.997768,
            -74.336885,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LENGUAZAQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LENGUAZAQUE',
            dept_id,
            5.306131,
            -73.711512,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MACHETÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MACHETÍ',
            dept_id,
            5.08007,
            -73.608226,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MADRID
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MADRID',
            dept_id,
            4.732791,
            -74.265854,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MANTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MANTA',
            dept_id,
            5.009008,
            -73.540444,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MEDINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MEDINA',
            dept_id,
            4.506298,
            -73.348449,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MOSQUERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MOSQUERA',
            dept_id,
            4.70653,
            -74.221154,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NARI�O
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NARI�O',
            dept_id,
            4.399837,
            -74.824732,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NEMOCÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NEMOCÍN',
            dept_id,
            5.068705,
            -73.877888,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NILO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NILO',
            dept_id,
            4.305838,
            -74.620009,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NIMAIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NIMAIMA',
            dept_id,
            5.125992,
            -74.38604,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NOCAIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NOCAIMA',
            dept_id,
            5.069466,
            -74.379093,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VENECIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VENECIA',
            dept_id,
            4.089056,
            -74.478301,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PACHO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PACHO',
            dept_id,
            5.136907,
            -74.156132,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAIME
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAIME',
            dept_id,
            5.370487,
            -74.152213,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PANDI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PANDI',
            dept_id,
            4.190393,
            -74.486641,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PARATEBUENO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PARATEBUENO',
            dept_id,
            4.374832,
            -73.212825,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PASCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PASCA',
            dept_id,
            4.308979,
            -74.302276,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO SALGAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO SALGAR',
            dept_id,
            5.465413,
            -74.653695,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PULÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PULÍ',
            dept_id,
            4.682022,
            -74.71438,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- QUEBRADANEGRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'QUEBRADANEGRA',
            dept_id,
            5.118076,
            -74.48014,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- QUETAME
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'QUETAME',
            dept_id,
            4.329884,
            -73.863214,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- QUIPILE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'QUIPILE',
            dept_id,
            4.74481,
            -74.533705,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- APULO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'APULO',
            dept_id,
            4.520304,
            -74.593926,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RICAURTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RICAURTE',
            dept_id,
            4.282113,
            -74.772861,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ANTONIO DEL TEQUENDAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANTONIO DEL TEQUENDAMA',
            dept_id,
            4.616138,
            -74.351443,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN BERNARDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN BERNARDO',
            dept_id,
            4.179433,
            -74.42296,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN CAYETANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN CAYETANO',
            dept_id,
            5.332938,
            -74.024754,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN FRANCISCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN FRANCISCO',
            dept_id,
            4.972917,
            -74.289672,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JUAN DE RIOSECO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JUAN DE RIOSECO',
            dept_id,
            4.847575,
            -74.621919,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SASAIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SASAIMA',
            dept_id,
            4.962167,
            -74.432628,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SESQUIL�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SESQUIL�',
            dept_id,
            5.04476,
            -73.796099,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SIBAT�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SIBAT�',
            dept_id,
            4.492625,
            -74.257874,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SILVANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SILVANIA',
            dept_id,
            4.381981,
            -74.405534,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SIMIJACA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SIMIJACA',
            dept_id,
            5.505231,
            -73.850703,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOACHA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOACHA',
            dept_id,
            4.579268,
            -74.215463,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOPÍ',
            dept_id,
            4.915395,
            -73.943328,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUBACHOQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUBACHOQUE',
            dept_id,
            4.929118,
            -74.172773,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUESCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUESCA',
            dept_id,
            5.103495,
            -73.798227,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUPATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUPATÍ',
            dept_id,
            5.06162,
            -74.235403,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUSA',
            dept_id,
            5.455291,
            -73.813938,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUTATAUSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUTATAUSA',
            dept_id,
            5.247482,
            -73.853159,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TABIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TABIO',
            dept_id,
            4.916832,
            -74.096461,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TAUSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TAUSA',
            dept_id,
            5.196333,
            -73.887813,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TENA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TENA',
            dept_id,
            4.655286,
            -74.389193,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TENJO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TENJO',
            dept_id,
            4.872014,
            -74.143724,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIBACUY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIBACUY',
            dept_id,
            4.348605,
            -74.452662,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIBIRITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIBIRITA',
            dept_id,
            5.052278,
            -73.504514,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOCAIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOCAIMA',
            dept_id,
            4.459279,
            -74.636296,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOCANCIPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOCANCIPÍ',
            dept_id,
            4.964641,
            -73.91207,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOPAIPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOPAIPÍ',
            dept_id,
            5.336224,
            -74.300626,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- UBALÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'UBALÍ',
            dept_id,
            4.74762,
            -73.531489,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- UBAQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'UBAQUE',
            dept_id,
            4.483788,
            -73.933477,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLA DE SAN DIEGO DE UBAT�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLA DE SAN DIEGO DE UBAT�',
            dept_id,
            5.307463,
            -73.814367,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- UNE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'UNE',
            dept_id,
            4.40245,
            -74.025183,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ÍTICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ÍTICA',
            dept_id,
            5.19055,
            -74.483154,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VERGARA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VERGARA',
            dept_id,
            5.117258,
            -74.346163,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VIANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VIANÍ',
            dept_id,
            4.875208,
            -74.56132,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLAGÍMEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLAGÍMEZ',
            dept_id,
            5.273024,
            -74.195145,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLAPINZÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLAPINZÍN',
            dept_id,
            5.216393,
            -73.595704,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLETA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLETA',
            dept_id,
            5.012754,
            -74.469686,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VIOTÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VIOTÍ',
            dept_id,
            4.43935,
            -74.523131,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YACOPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YACOPÍ',
            dept_id,
            5.459272,
            -74.33806,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZIPACÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZIPACÍN',
            dept_id,
            4.759932,
            -74.379566,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZIPAQUIRÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZIPAQUIRÍ',
            dept_id,
            5.025477,
            -73.994444,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CHOCÓ (27)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '27';
    
    IF dept_id IS NOT NULL THEN

        -- QUIBDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'QUIBDÍ',
            dept_id,
            5.682166,
            -76.638144,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ACANDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ACANDÍ',
            dept_id,
            8.512178,
            -77.279951,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALTO BAUDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALTO BAUDÍ',
            dept_id,
            5.516221,
            -76.974373,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ATRATO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ATRATO',
            dept_id,
            5.531419,
            -76.635674,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BAGADÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BAGADÍ',
            dept_id,
            5.409681,
            -76.416063,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BAHÍA SOLANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BAHÍA SOLANO',
            dept_id,
            6.222807,
            -77.401359,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BAJO BAUDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BAJO BAUDÍ',
            dept_id,
            4.954576,
            -77.365717,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOJAYÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOJAYÍ',
            dept_id,
            6.559708,
            -76.886773,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CANTÍN DEL SAN PABLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CANTÍN DEL SAN PABLO',
            dept_id,
            5.335321,
            -76.726844,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARMEN DEL DARI�N
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARMEN DEL DARI�N',
            dept_id,
            7.158294,
            -76.970798,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- C�RTEGUI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'C�RTEGUI',
            dept_id,
            5.371373,
            -76.607619,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONDOTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONDOTO',
            dept_id,
            5.091003,
            -76.650683,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CARMEN DE ATRATO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CARMEN DE ATRATO',
            dept_id,
            5.899789,
            -76.142112,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL LITORAL DEL SAN JUAN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL LITORAL DEL SAN JUAN',
            dept_id,
            4.259564,
            -77.363702,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ISTMINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ISTMINA',
            dept_id,
            5.153946,
            -76.68518,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JURADÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JURADÍ',
            dept_id,
            7.103619,
            -77.762751,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LLORÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LLORÍ',
            dept_id,
            5.49789,
            -76.545147,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MEDIO ATRATO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MEDIO ATRATO',
            dept_id,
            5.994935,
            -76.783042,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MEDIO BAUDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MEDIO BAUDÍ',
            dept_id,
            5.192471,
            -76.950891,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MEDIO SAN JUAN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MEDIO SAN JUAN',
            dept_id,
            5.098291,
            -76.694409,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NÍVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NÍVITA',
            dept_id,
            4.956063,
            -76.609467,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NUEVO BEL�N DE BAJIRÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NUEVO BEL�N DE BAJIRÍ',
            dept_id,
            7.3719,
            -76.71727,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NUQUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NUQUÍ',
            dept_id,
            5.709812,
            -77.265507,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RÍO IRÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RÍO IRÍ',
            dept_id,
            5.1863,
            -76.472925,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RÍO QUITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RÍO QUITO',
            dept_id,
            5.483667,
            -76.740684,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RIOSUCIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIOSUCIO',
            dept_id,
            7.436704,
            -77.113156,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS� DEL PALMAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DEL PALMAR',
            dept_id,
            4.896954,
            -76.234227,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SIPÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SIPÍ',
            dept_id,
            4.65262,
            -76.643453,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TADÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TADÍ',
            dept_id,
            5.264873,
            -76.558571,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- UNGUÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'UNGUÍA',
            dept_id,
            8.04406,
            -77.092538,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- UNIÍN PANAMERICANA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'UNIÍN PANAMERICANA',
            dept_id,
            5.281108,
            -76.630143,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- HUILA (41)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '41';
    
    IF dept_id IS NOT NULL THEN

        -- NEIVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NEIVA',
            dept_id,
            2.935432,
            -75.277327,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ACEVEDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ACEVEDO',
            dept_id,
            1.805173,
            -75.888706,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AGRADO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AGRADO',
            dept_id,
            2.25987,
            -75.772022,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AIPE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AIPE',
            dept_id,
            3.223996,
            -75.239017,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALGECIRAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALGECIRAS',
            dept_id,
            2.521674,
            -75.315389,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALTAMIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALTAMIRA',
            dept_id,
            2.063841,
            -75.788471,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARAYA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARAYA',
            dept_id,
            3.152204,
            -75.054843,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAMPOALEGRE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAMPOALEGRE',
            dept_id,
            2.686767,
            -75.325748,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COLOMBIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COLOMBIA',
            dept_id,
            3.376745,
            -74.802815,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ELÍAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ELÍAS',
            dept_id,
            2.012854,
            -75.938301,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GARZÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GARZÍN',
            dept_id,
            2.196493,
            -75.627057,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GIGANTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GIGANTE',
            dept_id,
            2.384031,
            -75.547681,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUADALUPE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUADALUPE',
            dept_id,
            2.02426,
            -75.757185,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HOBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HOBO',
            dept_id,
            2.580812,
            -75.447697,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ÍQUIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ÍQUIRA',
            dept_id,
            2.649359,
            -75.634497,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ISNOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ISNOS',
            dept_id,
            1.929467,
            -76.217637,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA ARGENTINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA ARGENTINA',
            dept_id,
            2.198496,
            -75.979763,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PLATA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PLATA',
            dept_id,
            2.389263,
            -75.891254,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NÍTAGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NÍTAGA',
            dept_id,
            2.5451,
            -75.808756,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OPORAPA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OPORAPA',
            dept_id,
            2.025088,
            -75.995165,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAICOL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAICOL',
            dept_id,
            2.449651,
            -75.773158,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALERMO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALERMO',
            dept_id,
            2.889649,
            -75.435296,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALESTINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALESTINA',
            dept_id,
            1.723725,
            -76.133251,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PITAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PITAL',
            dept_id,
            2.266618,
            -75.804544,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PITALITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PITALITO',
            dept_id,
            1.852631,
            -76.049441,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RIVERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIVERA',
            dept_id,
            2.777586,
            -75.258753,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SALADOBLANCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SALADOBLANCO',
            dept_id,
            1.9934,
            -76.044747,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN AGUSTÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN AGUSTÍN',
            dept_id,
            1.881081,
            -76.27036,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA MARÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA MARÍA',
            dept_id,
            2.939603,
            -75.586223,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUAZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUAZA',
            dept_id,
            1.976051,
            -75.79525,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TARQUI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TARQUI',
            dept_id,
            2.111325,
            -75.823976,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TESALIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TESALIA',
            dept_id,
            2.486364,
            -75.730271,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TELLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TELLO',
            dept_id,
            3.067538,
            -75.138773,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TERUEL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TERUEL',
            dept_id,
            2.740968,
            -75.567034,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIMANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIMANÍ',
            dept_id,
            1.974539,
            -75.932167,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLAVIEJA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLAVIEJA',
            dept_id,
            3.218822,
            -75.217174,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YAGUARÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YAGUARÍ',
            dept_id,
            2.664694,
            -75.518023,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- LA GUAJIRA (44)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '44';
    
    IF dept_id IS NOT NULL THEN

        -- RIOHACHA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIOHACHA',
            dept_id,
            11.528588,
            -72.911795,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALBANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALBANIA',
            dept_id,
            11.151628,
            -72.61232,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARRANCAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARRANCAS',
            dept_id,
            10.958669,
            -72.793639,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DIBULLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DIBULLA',
            dept_id,
            11.27155,
            -73.307598,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DISTRACCIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DISTRACCIÍN',
            dept_id,
            10.898414,
            -72.887405,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL MOLINO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL MOLINO',
            dept_id,
            10.653505,
            -72.92673,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FONSECA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FONSECA',
            dept_id,
            10.886734,
            -72.846319,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HATONUEVO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HATONUEVO',
            dept_id,
            11.068864,
            -72.75904,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA JAGUA DEL PILAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA JAGUA DEL PILAR',
            dept_id,
            10.511862,
            -73.072638,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MAICAO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MAICAO',
            dept_id,
            11.378535,
            -72.242738,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MANAURE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MANAURE',
            dept_id,
            11.773767,
            -72.438739,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JUAN DEL CESAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JUAN DEL CESAR',
            dept_id,
            10.769546,
            -73.000629,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- URIBIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'URIBIA',
            dept_id,
            11.711904,
            -72.265906,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- URUMITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'URUMITA',
            dept_id,
            10.560169,
            -73.012507,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLANUEVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLANUEVA',
            dept_id,
            10.608774,
            -72.977583,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- MAGDALENA (47)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '47';
    
    IF dept_id IS NOT NULL THEN

        -- SANTA MARTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA MARTA',
            dept_id,
            11.204679,
            -74.199829,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALGARROBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALGARROBO',
            dept_id,
            10.188059,
            -74.061132,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARACATACA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARACATACA',
            dept_id,
            10.589791,
            -74.186702,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARIGUANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARIGUANÍ',
            dept_id,
            9.847047,
            -74.236515,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CERRO DE SAN ANTONIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CERRO DE SAN ANTONIO',
            dept_id,
            10.325531,
            -74.868474,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIVOLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIVOLO',
            dept_id,
            10.026631,
            -74.622242,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CI�NAGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CI�NAGA',
            dept_id,
            11.006654,
            -74.241286,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONCORDIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONCORDIA',
            dept_id,
            10.257314,
            -74.83303,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL BANCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL BANCO',
            dept_id,
            9.008503,
            -73.97437,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PI�ÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PI�ÍN',
            dept_id,
            10.402781,
            -74.823094,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL RET�N
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL RET�N',
            dept_id,
            10.610488,
            -74.268444,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FUNDACIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FUNDACIÍN',
            dept_id,
            10.514146,
            -74.191453,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAMAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAMAL',
            dept_id,
            9.144354,
            -74.223689,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NUEVA GRANADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NUEVA GRANADA',
            dept_id,
            9.80186,
            -74.391841,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PEDRAZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PEDRAZA',
            dept_id,
            10.18825,
            -74.9154,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIJI�O DEL CARMEN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIJI�O DEL CARMEN',
            dept_id,
            9.331922,
            -74.459034,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIVIJAY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIVIJAY',
            dept_id,
            10.460707,
            -74.613312,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PLATO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PLATO',
            dept_id,
            9.796713,
            -74.784549,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUEBLOVIEJO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUEBLOVIEJO',
            dept_id,
            10.994766,
            -74.28253,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- REMOLINO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'REMOLINO',
            dept_id,
            10.701952,
            -74.716172,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABANAS DE SAN ÍNGEL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABANAS DE SAN ÍNGEL',
            dept_id,
            10.032536,
            -74.213946,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SALAMINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SALAMINA',
            dept_id,
            10.491229,
            -74.794189,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN SEBASTIÍN DE BUENAVISTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN SEBASTIÍN DE BUENAVISTA',
            dept_id,
            9.241656,
            -74.351498,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ZENÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ZENÍN',
            dept_id,
            9.245061,
            -74.498992,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ANA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ANA',
            dept_id,
            9.324294,
            -74.566845,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA BÍRBARA DE PINTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA BÍRBARA DE PINTO',
            dept_id,
            9.432263,
            -74.704667,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SITIONUEVO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SITIONUEVO',
            dept_id,
            10.775285,
            -74.720021,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TENERIFE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TENERIFE',
            dept_id,
            9.898273,
            -74.859783,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZAPAYÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZAPAYÍN',
            dept_id,
            10.168297,
            -74.716878,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZONA BANANERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZONA BANANERA',
            dept_id,
            10.763024,
            -74.140091,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- META (50)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '50';
    
    IF dept_id IS NOT NULL THEN

        -- VILLAVICENCIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLAVICENCIO',
            dept_id,
            4.126369,
            -73.622601,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ACACÍAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ACACÍAS',
            dept_id,
            3.990413,
            -73.766034,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARRANCA DE UPÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARRANCA DE UPÍA',
            dept_id,
            4.566225,
            -72.961083,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CABUYARO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CABUYARO',
            dept_id,
            4.286705,
            -72.791768,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CASTILLA LA NUEVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CASTILLA LA NUEVA',
            dept_id,
            3.830005,
            -73.687302,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUBARRAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUBARRAL',
            dept_id,
            3.793653,
            -73.837999,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUMARAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUMARAL',
            dept_id,
            4.270042,
            -73.487052,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CALVARIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CALVARIO',
            dept_id,
            4.352665,
            -73.713325,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CASTILLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CASTILLO',
            dept_id,
            3.563907,
            -73.794225,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL DORADO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL DORADO',
            dept_id,
            3.739984,
            -73.835264,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FUENTE DE ORO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FUENTE DE ORO',
            dept_id,
            3.462875,
            -73.618121,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GRANADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GRANADA',
            dept_id,
            3.547147,
            -73.705815,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAMAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAMAL',
            dept_id,
            3.879657,
            -73.768815,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MAPIRIPÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MAPIRIPÍN',
            dept_id,
            2.896617,
            -72.135509,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MESETAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MESETAS',
            dept_id,
            3.382732,
            -74.044328,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA MACARENA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA MACARENA',
            dept_id,
            2.177143,
            -73.78661,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- URIBE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'URIBE',
            dept_id,
            3.239634,
            -74.351508,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LEJANÍAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LEJANÍAS',
            dept_id,
            3.525115,
            -74.023514,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO CONCORDIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO CONCORDIA',
            dept_id,
            2.624006,
            -72.760209,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO GAITÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO GAITÍN',
            dept_id,
            4.314905,
            -72.087649,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO LÍPEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO LÍPEZ',
            dept_id,
            4.09349,
            -72.957324,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO LLERAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO LLERAS',
            dept_id,
            3.272117,
            -73.37385,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO RICO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO RICO',
            dept_id,
            2.939621,
            -73.206314,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RESTREPO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RESTREPO',
            dept_id,
            4.259556,
            -73.565408,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN CARLOS DE GUAROA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN CARLOS DE GUAROA',
            dept_id,
            3.71065,
            -73.242253,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JUAN DE ARAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JUAN DE ARAMA',
            dept_id,
            3.373728,
            -73.875832,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JUANITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JUANITO',
            dept_id,
            4.458181,
            -73.676699,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MARTÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MARTÍN',
            dept_id,
            3.701899,
            -73.695812,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VISTAHERMOSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VISTAHERMOSA',
            dept_id,
            3.125579,
            -73.750966,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- NARI�O (52)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '52';
    
    IF dept_id IS NOT NULL THEN

        -- PASTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PASTO',
            dept_id,
            1.212352,
            -77.278795,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALBÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALBÍN',
            dept_id,
            1.474978,
            -77.080712,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALDANA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALDANA',
            dept_id,
            0.882381,
            -77.700564,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANCUYA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANCUYA',
            dept_id,
            1.263276,
            -77.514512,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARBOLEDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARBOLEDA',
            dept_id,
            1.503418,
            -77.135467,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARBACOAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARBACOAS',
            dept_id,
            1.671733,
            -78.13765,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BEL�N
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BEL�N',
            dept_id,
            1.595681,
            -77.015619,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUESACO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUESACO',
            dept_id,
            1.381453,
            -77.156463,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COLÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COLÍN',
            dept_id,
            1.643878,
            -77.019777,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONSACÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONSACÍ',
            dept_id,
            1.207854,
            -77.466136,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONTADERO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONTADERO',
            dept_id,
            0.910458,
            -77.549409,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÓRDOBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÓRDOBA',
            dept_id,
            0.854564,
            -77.517897,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUASPUD CARLOSAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUASPUD CARLOSAMA',
            dept_id,
            0.862978,
            -77.728947,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUMBAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUMBAL',
            dept_id,
            0.906367,
            -77.792505,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUMBITARA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUMBITARA',
            dept_id,
            1.647163,
            -77.578616,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHACHAG�Í
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHACHAG�Í',
            dept_id,
            1.360545,
            -77.281869,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CHARCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CHARCO',
            dept_id,
            2.479688,
            -78.110217,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PE�OL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PE�OL',
            dept_id,
            1.453567,
            -77.438522,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL ROSARIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL ROSARIO',
            dept_id,
            1.745309,
            -77.33417,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL TABLÍN DE GÍMEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL TABLÍN DE GÍMEZ',
            dept_id,
            1.427277,
            -77.097101,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL TAMBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL TAMBO',
            dept_id,
            1.407913,
            -77.390772,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FUNES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FUNES',
            dept_id,
            1.001159,
            -77.448913,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUACHUCAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUACHUCAL',
            dept_id,
            0.959744,
            -77.731589,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAITARILLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAITARILLA',
            dept_id,
            1.129574,
            -77.549824,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUALMATÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUALMATÍN',
            dept_id,
            0.919652,
            -77.568701,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ILES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ILES',
            dept_id,
            0.96952,
            -77.521227,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- IMU�S
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'IMU�S',
            dept_id,
            1.05506,
            -77.496339,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- IPIALES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'IPIALES',
            dept_id,
            0.827732,
            -77.646367,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA CRUZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA CRUZ',
            dept_id,
            1.601318,
            -76.970504,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA FLORIDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA FLORIDA',
            dept_id,
            1.29753,
            -77.402882,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA LLANADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA LLANADA',
            dept_id,
            1.472892,
            -77.58091,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA TOLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA TOLA',
            dept_id,
            2.398999,
            -78.189725,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA UNIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA UNIÍN',
            dept_id,
            1.600219,
            -77.131316,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LEIVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LEIVA',
            dept_id,
            1.934453,
            -77.306135,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LINARES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LINARES',
            dept_id,
            1.350814,
            -77.523953,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LOS ANDES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LOS ANDES',
            dept_id,
            1.494587,
            -77.521303,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MAG�Í
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MAG�Í',
            dept_id,
            1.765633,
            -78.182924,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MALLAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MALLAMA',
            dept_id,
            1.141037,
            -77.864549,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MOSQUERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MOSQUERA',
            dept_id,
            2.507139,
            -78.452992,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NARI�O
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NARI�O',
            dept_id,
            1.288979,
            -77.357972,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OLAYA HERRERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OLAYA HERRERA',
            dept_id,
            2.347457,
            -78.325814,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OSPINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OSPINA',
            dept_id,
            1.058433,
            -77.566082,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FRANCISCO PIZARRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FRANCISCO PIZARRO',
            dept_id,
            2.040629,
            -78.658361,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- POLICARPA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'POLICARPA',
            dept_id,
            1.627196,
            -77.458686,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- POTOSÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'POTOSÍ',
            dept_id,
            0.806639,
            -77.573003,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PROVIDENCIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PROVIDENCIA',
            dept_id,
            1.237814,
            -77.596794,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERRES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERRES',
            dept_id,
            0.885125,
            -77.504211,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUPIALES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUPIALES',
            dept_id,
            0.870442,
            -77.636042,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RICAURTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RICAURTE',
            dept_id,
            1.212492,
            -77.995153,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ROBERTO PAYÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ROBERTO PAYÍN',
            dept_id,
            1.697492,
            -78.245716,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAMANIEGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAMANIEGO',
            dept_id,
            1.335438,
            -77.594341,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANDONÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANDONÍ',
            dept_id,
            1.283438,
            -77.47313,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN BERNARDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN BERNARDO',
            dept_id,
            1.513762,
            -77.0475,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN LORENZO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN LORENZO',
            dept_id,
            1.503362,
            -77.21542,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PABLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PABLO',
            dept_id,
            1.669429,
            -77.013984,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PEDRO DE CARTAGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PEDRO DE CARTAGO',
            dept_id,
            1.551572,
            -77.11941,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA BÍRBARA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA BÍRBARA',
            dept_id,
            2.449653,
            -77.979916,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTACRUZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTACRUZ',
            dept_id,
            1.222589,
            -77.677035,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAPUYES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAPUYES',
            dept_id,
            1.037536,
            -77.62028,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TAMINANGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TAMINANGO',
            dept_id,
            1.570358,
            -77.2808,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TANGUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TANGUA',
            dept_id,
            1.09482,
            -77.393735,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ANDR�S DE TUMACO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANDR�S DE TUMACO',
            dept_id,
            1.807399,
            -78.764073,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TÍQUERRES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TÍQUERRES',
            dept_id,
            1.085044,
            -77.61672,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YACUANQUER
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YACUANQUER',
            dept_id,
            1.115937,
            -77.400169,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- NORTE DE SANTANDER (54)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '54';
    
    IF dept_id IS NOT NULL THEN

        -- SAN JOS� DE CÍCUTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DE CÍCUTA',
            dept_id,
            7.905725,
            -72.508178,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ÍBREGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ÍBREGO',
            dept_id,
            8.081616,
            -73.221722,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARBOLEDAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARBOLEDAS',
            dept_id,
            7.642985,
            -72.798952,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOCHALEMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOCHALEMA',
            dept_id,
            7.612192,
            -72.64701,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUCARASICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUCARASICA',
            dept_id,
            8.041299,
            -72.868231,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÍCOTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÍCOTA',
            dept_id,
            7.268705,
            -72.642059,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÍCHIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÍCHIRA',
            dept_id,
            7.741248,
            -73.048983,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHINÍCOTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHINÍCOTA',
            dept_id,
            7.603112,
            -72.601162,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHITAGÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHITAGÍ',
            dept_id,
            7.138187,
            -72.665468,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONVENCIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONVENCIÍN',
            dept_id,
            8.470374,
            -73.3372,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUCUTILLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUCUTILLA',
            dept_id,
            7.539633,
            -72.772816,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DURANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DURANIA',
            dept_id,
            7.714804,
            -72.658491,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CARMEN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CARMEN',
            dept_id,
            8.510579,
            -73.446687,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL TARRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL TARRA',
            dept_id,
            8.574281,
            -73.09614,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL ZULIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL ZULIA',
            dept_id,
            7.938572,
            -72.604717,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GRAMALOTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GRAMALOTE',
            dept_id,
            7.916946,
            -72.787233,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HACARÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HACARÍ',
            dept_id,
            8.321506,
            -73.145997,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HERRÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HERRÍN',
            dept_id,
            7.506541,
            -72.483519,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LABATECA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LABATECA',
            dept_id,
            7.298414,
            -72.495983,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA ESPERANZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA ESPERANZA',
            dept_id,
            7.639839,
            -73.328126,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PLAYA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PLAYA',
            dept_id,
            8.21124,
            -73.239986,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LOS PATIOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LOS PATIOS',
            dept_id,
            7.833186,
            -72.505612,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LOURDES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LOURDES',
            dept_id,
            7.945631,
            -72.832376,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MUTISCUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MUTISCUA',
            dept_id,
            7.300469,
            -72.747169,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OCA�A
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OCA�A',
            dept_id,
            8.248574,
            -73.35607,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAMPLONA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAMPLONA',
            dept_id,
            7.372802,
            -72.647714,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAMPLONITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAMPLONITA',
            dept_id,
            7.436745,
            -72.639111,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO SANTANDER
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO SANTANDER',
            dept_id,
            8.359993,
            -72.411363,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RAGONVALIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RAGONVALIA',
            dept_id,
            7.577861,
            -72.476708,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SALAZAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SALAZAR',
            dept_id,
            7.773683,
            -72.813064,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN CALIXTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN CALIXTO',
            dept_id,
            8.40214,
            -73.208622,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN CAYETANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN CAYETANO',
            dept_id,
            7.875695,
            -72.625459,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTIAGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTIAGO',
            dept_id,
            7.865856,
            -72.716203,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SARDINATA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SARDINATA',
            dept_id,
            8.082105,
            -72.800577,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SILOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SILOS',
            dept_id,
            7.204736,
            -72.757128,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TEORAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TEORAMA',
            dept_id,
            8.438134,
            -73.28707,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TIBÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TIBÍ',
            dept_id,
            8.639891,
            -72.734496,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOLEDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOLEDO',
            dept_id,
            7.307692,
            -72.481915,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLA CARO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLA CARO',
            dept_id,
            7.914244,
            -72.973601,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLA DEL ROSARIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLA DEL ROSARIO',
            dept_id,
            7.847672,
            -72.469758,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- QUINDÍO (63)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '63';
    
    IF dept_id IS NOT NULL THEN

        -- ARMENIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARMENIA',
            dept_id,
            4.53598,
            -75.680786,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUENAVISTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUENAVISTA',
            dept_id,
            4.360029,
            -75.739572,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALARCÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALARCÍ',
            dept_id,
            4.520982,
            -75.646085,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CIRCASIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CIRCASIA',
            dept_id,
            4.617759,
            -75.636533,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÓRDOBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÓRDOBA',
            dept_id,
            4.392485,
            -75.687866,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FILANDIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FILANDIA',
            dept_id,
            4.674338,
            -75.658387,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- G�NOVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'G�NOVA',
            dept_id,
            4.206641,
            -75.790402,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA TEBAIDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA TEBAIDA',
            dept_id,
            4.453755,
            -75.786887,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONTENEGRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONTENEGRO',
            dept_id,
            4.565057,
            -75.749827,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIJAO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIJAO',
            dept_id,
            4.335036,
            -75.703329,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- QUIMBAYA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'QUIMBAYA',
            dept_id,
            4.624387,
            -75.765074,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SALENTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SALENTO',
            dept_id,
            4.637157,
            -75.570844,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- RISARALDA (66)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '66';
    
    IF dept_id IS NOT NULL THEN

        -- PEREIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PEREIRA',
            dept_id,
            4.804985,
            -75.719711,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- APÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'APÍA',
            dept_id,
            5.106526,
            -75.942356,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BALBOA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BALBOA',
            dept_id,
            4.949096,
            -75.958663,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BEL�N DE UMBRÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BEL�N DE UMBRÍA',
            dept_id,
            5.200793,
            -75.868334,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DOSQUEBRADAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DOSQUEBRADAS',
            dept_id,
            4.833131,
            -75.675371,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUÍTICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUÍTICA',
            dept_id,
            5.315367,
            -75.799005,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA CELIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA CELIA',
            dept_id,
            5.002787,
            -76.0032,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA VIRGINIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA VIRGINIA',
            dept_id,
            4.896624,
            -75.880394,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARSELLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARSELLA',
            dept_id,
            4.935771,
            -75.73879,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MISTRATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MISTRATÍ',
            dept_id,
            5.297039,
            -75.882886,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUEBLO RICO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUEBLO RICO',
            dept_id,
            5.222043,
            -76.030801,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- QUINCHÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'QUINCHÍA',
            dept_id,
            5.340456,
            -75.730431,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ROSA DE CABAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ROSA DE CABAL',
            dept_id,
            4.876271,
            -75.623268,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTUARIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTUARIO',
            dept_id,
            5.074911,
            -75.964628,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- SANTANDER (68)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '68';
    
    IF dept_id IS NOT NULL THEN

        -- BUCARAMANGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUCARAMANGA',
            dept_id,
            7.11647,
            -73.132562,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AGUADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AGUADA',
            dept_id,
            6.162355,
            -73.523132,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALBANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALBANIA',
            dept_id,
            5.759166,
            -73.91336,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARATOCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARATOCA',
            dept_id,
            6.694418,
            -73.01786,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARBOSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARBOSA',
            dept_id,
            5.932531,
            -73.615965,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARICHARA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARICHARA',
            dept_id,
            6.634111,
            -73.223047,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARRANCABERMEJA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARRANCABERMEJA',
            dept_id,
            7.064857,
            -73.849243,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BETULIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BETULIA',
            dept_id,
            6.899525,
            -73.283669,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOLÍVAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOLÍVAR',
            dept_id,
            5.988953,
            -73.771346,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CABRERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CABRERA',
            dept_id,
            6.592118,
            -73.246475,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALIFORNIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALIFORNIA',
            dept_id,
            7.347989,
            -72.946491,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAPITANEJO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAPITANEJO',
            dept_id,
            6.527394,
            -72.695427,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARCASÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARCASÍ',
            dept_id,
            6.629016,
            -72.627099,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CEPITÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CEPITÍ',
            dept_id,
            6.753518,
            -72.973536,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CERRITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CERRITO',
            dept_id,
            6.840405,
            -72.694851,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHARALÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHARALÍ',
            dept_id,
            6.284339,
            -73.146873,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHARTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHARTA',
            dept_id,
            7.28082,
            -72.968798,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIMA',
            dept_id,
            6.344348,
            -73.373656,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIPATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIPATÍ',
            dept_id,
            6.062521,
            -73.637111,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CIMITARRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CIMITARRA',
            dept_id,
            6.320886,
            -73.953011,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONCEPCIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONCEPCIÍN',
            dept_id,
            6.768908,
            -72.694567,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONFINES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONFINES',
            dept_id,
            6.357327,
            -73.240554,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONTRATACIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONTRATACIÍN',
            dept_id,
            6.290561,
            -73.474426,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COROMORO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COROMORO',
            dept_id,
            6.294999,
            -73.040816,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CURITÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CURITÍ',
            dept_id,
            6.605099,
            -73.069383,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CARMEN DE CHUCURÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CARMEN DE CHUCURÍ',
            dept_id,
            6.700038,
            -73.51066,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL GUACAMAYO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL GUACAMAYO',
            dept_id,
            6.245111,
            -73.496908,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PE�ÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PE�ÍN',
            dept_id,
            6.05537,
            -73.815532,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL PLAYÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL PLAYÍN',
            dept_id,
            7.470715,
            -73.20287,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ENCINO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ENCINO',
            dept_id,
            6.137429,
            -73.098749,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ENCISO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ENCISO',
            dept_id,
            6.668034,
            -72.699647,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FLORIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FLORIÍN',
            dept_id,
            5.804659,
            -73.97143,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FLORIDABLANCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FLORIDABLANCA',
            dept_id,
            7.072329,
            -73.099104,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GALÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GALÍN',
            dept_id,
            6.638423,
            -73.287769,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GÍMBITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GÍMBITA',
            dept_id,
            5.945998,
            -73.344185,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GIRÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GIRÍN',
            dept_id,
            7.070432,
            -73.166832,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUACA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUACA',
            dept_id,
            6.876563,
            -72.856322,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUADALUPE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUADALUPE',
            dept_id,
            6.245847,
            -73.419292,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAPOTÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAPOTÍ',
            dept_id,
            6.308635,
            -73.320732,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAVATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAVATÍ',
            dept_id,
            5.954348,
            -73.700906,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- G�EPSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'G�EPSA',
            dept_id,
            6.025013,
            -73.575146,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HATO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HATO',
            dept_id,
            6.543957,
            -73.308399,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JESÍS MARÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JESÍS MARÍA',
            dept_id,
            5.876497,
            -73.783396,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JORDÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JORDÍN',
            dept_id,
            6.732727,
            -73.096053,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA BELLEZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA BELLEZA',
            dept_id,
            5.85925,
            -73.965494,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LANDÍZURI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LANDÍZURI',
            dept_id,
            6.218812,
            -73.811359,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PAZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PAZ',
            dept_id,
            6.178509,
            -73.58959,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LEBRIJA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LEBRIJA',
            dept_id,
            7.113351,
            -73.219524,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LOS SANTOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LOS SANTOS',
            dept_id,
            6.755203,
            -73.102739,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MACARAVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MACARAVITA',
            dept_id,
            6.50658,
            -72.593105,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MÍLAGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MÍLAGA',
            dept_id,
            6.703081,
            -72.732089,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MATANZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MATANZA',
            dept_id,
            7.323175,
            -73.015566,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MOGOTES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MOGOTES',
            dept_id,
            6.475246,
            -72.969807,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MOLAGAVITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MOLAGAVITA',
            dept_id,
            6.67432,
            -72.809175,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OCAMONTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OCAMONTE',
            dept_id,
            6.339988,
            -73.122563,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OIBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OIBA',
            dept_id,
            6.26521,
            -73.299791,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ONZAGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ONZAGA',
            dept_id,
            6.344104,
            -72.816766,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALMAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALMAR',
            dept_id,
            6.537789,
            -73.29109,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALMAS DEL SOCORRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALMAS DEL SOCORRO',
            dept_id,
            6.406139,
            -73.287764,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PÍRAMO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PÍRAMO',
            dept_id,
            6.416811,
            -73.17022,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIEDECUESTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIEDECUESTA',
            dept_id,
            6.997245,
            -73.054795,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PINCHOTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PINCHOTE',
            dept_id,
            6.531552,
            -73.174209,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUENTE NACIONAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUENTE NACIONAL',
            dept_id,
            5.878381,
            -73.677567,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO PARRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO PARRA',
            dept_id,
            6.650785,
            -74.056129,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO WILCHES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO WILCHES',
            dept_id,
            7.344057,
            -73.899909,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RIONEGRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIONEGRO',
            dept_id,
            7.265014,
            -73.150177,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABANA DE TORRES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABANA DE TORRES',
            dept_id,
            7.391919,
            -73.49906,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ANDR�S
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANDR�S',
            dept_id,
            6.811511,
            -72.848864,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN BENITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN BENITO',
            dept_id,
            6.126656,
            -73.50907,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN GIL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN GIL',
            dept_id,
            6.551952,
            -73.134776,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOAQUÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOAQUÍN',
            dept_id,
            6.427548,
            -72.867638,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS� DE MIRANDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DE MIRANDA',
            dept_id,
            6.658995,
            -72.733616,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MIGUEL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MIGUEL',
            dept_id,
            6.575315,
            -72.644123,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN VICENTE DE CHUCURÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN VICENTE DE CHUCURÍ',
            dept_id,
            6.880383,
            -73.411024,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA BÍRBARA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA BÍRBARA',
            dept_id,
            6.990996,
            -72.907445,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA HELENA DEL OPÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA HELENA DEL OPÍN',
            dept_id,
            6.339565,
            -73.616716,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SIMACOTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SIMACOTA',
            dept_id,
            6.443469,
            -73.337368,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOCORRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOCORRO',
            dept_id,
            6.46387,
            -73.261198,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUAITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUAITA',
            dept_id,
            6.101329,
            -73.44165,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUCRE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUCRE',
            dept_id,
            5.918743,
            -73.790975,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SURATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SURATÍ',
            dept_id,
            7.36658,
            -72.984232,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TONA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TONA',
            dept_id,
            7.201417,
            -72.967023,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VALLE DE SAN JOS�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALLE DE SAN JOS�',
            dept_id,
            6.448028,
            -73.143507,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- V�LEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'V�LEZ',
            dept_id,
            6.009275,
            -73.672447,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VETAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VETAS',
            dept_id,
            7.30981,
            -72.871041,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLANUEVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLANUEVA',
            dept_id,
            6.670078,
            -73.174307,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZAPATOCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZAPATOCA',
            dept_id,
            6.814387,
            -73.268034,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- SUCRE (70)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '70';
    
    IF dept_id IS NOT NULL THEN

        -- SINCELEJO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SINCELEJO',
            dept_id,
            9.302322,
            -75.395445,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUENAVISTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUENAVISTA',
            dept_id,
            9.319794,
            -74.972827,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAIMITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAIMITO',
            dept_id,
            8.789324,
            -75.117141,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COLOSÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COLOSÍ',
            dept_id,
            9.494192,
            -75.353256,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COROZAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COROZAL',
            dept_id,
            9.318749,
            -75.293048,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COVE�AS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COVE�AS',
            dept_id,
            9.402779,
            -75.680158,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHALÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHALÍN',
            dept_id,
            9.545352,
            -75.312697,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL ROBLE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL ROBLE',
            dept_id,
            9.100647,
            -75.198378,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GALERAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GALERAS',
            dept_id,
            9.160379,
            -75.04959,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUARANDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUARANDA',
            dept_id,
            8.468556,
            -74.537749,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA UNIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA UNIÍN',
            dept_id,
            8.853975,
            -75.276056,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LOS PALMITOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LOS PALMITOS',
            dept_id,
            9.380269,
            -75.268716,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MAJAGUAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MAJAGUAL',
            dept_id,
            8.541163,
            -74.628077,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MORROA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MORROA',
            dept_id,
            9.331395,
            -75.305949,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OVEJAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OVEJAS',
            dept_id,
            9.527176,
            -75.229037,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALMITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALMITO',
            dept_id,
            9.333157,
            -75.541264,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAMPU�S
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAMPU�S',
            dept_id,
            9.183193,
            -75.380222,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN BENITO ABAD
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN BENITO ABAD',
            dept_id,
            8.930108,
            -75.031089,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JUAN DE BETULIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JUAN DE BETULIA',
            dept_id,
            9.273066,
            -75.243565,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MARCOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MARCOS',
            dept_id,
            8.661774,
            -75.133831,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ONOFRE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ONOFRE',
            dept_id,
            9.736955,
            -75.522398,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PEDRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PEDRO',
            dept_id,
            9.39625,
            -75.063647,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN LUIS DE SINC�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN LUIS DE SINC�',
            dept_id,
            9.244308,
            -75.145999,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUCRE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUCRE',
            dept_id,
            8.811737,
            -74.723175,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTIAGO DE TOLÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTIAGO DE TOLÍ',
            dept_id,
            9.525387,
            -75.581112,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS� DE TOLUVIEJO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DE TOLUVIEJO',
            dept_id,
            9.451819,
            -75.44085,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- TOLIMA (73)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '73';
    
    IF dept_id IS NOT NULL THEN

        -- IBAGU�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'IBAGU�',
            dept_id,
            4.432248,
            -75.19425,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALPUJARRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALPUJARRA',
            dept_id,
            3.391548,
            -74.9329,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALVARADO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALVARADO',
            dept_id,
            4.567356,
            -74.953418,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AMBALEMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AMBALEMA',
            dept_id,
            4.782682,
            -74.764429,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANZOÍTEGUI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANZOÍTEGUI',
            dept_id,
            4.631756,
            -75.093772,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARMERO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARMERO',
            dept_id,
            5.030744,
            -74.884438,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ATACO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ATACO',
            dept_id,
            3.590591,
            -75.382545,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAJAMARCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAJAMARCA',
            dept_id,
            4.438812,
            -75.431971,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARMEN DE APICALÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARMEN DE APICALÍ',
            dept_id,
            4.152334,
            -74.717633,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CASABIANCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CASABIANCA',
            dept_id,
            5.078465,
            -75.120966,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHAPARRAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHAPARRAL',
            dept_id,
            3.722918,
            -75.480765,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COELLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COELLO',
            dept_id,
            4.287276,
            -74.898464,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COYAIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COYAIMA',
            dept_id,
            3.798036,
            -75.193862,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUNDAY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUNDAY',
            dept_id,
            4.059259,
            -74.692227,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DOLORES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DOLORES',
            dept_id,
            3.539072,
            -74.896761,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ESPINAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ESPINAL',
            dept_id,
            4.151314,
            -74.885446,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FALAN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FALAN',
            dept_id,
            5.123104,
            -74.953007,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FLANDES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FLANDES',
            dept_id,
            4.276373,
            -74.818763,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FRESNO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FRESNO',
            dept_id,
            5.153576,
            -75.035722,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUAMO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUAMO',
            dept_id,
            4.030992,
            -74.968135,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HERVEO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HERVEO',
            dept_id,
            5.080228,
            -75.177151,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HONDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HONDA',
            dept_id,
            5.211816,
            -74.75699,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ICONONZO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ICONONZO',
            dept_id,
            4.176487,
            -74.531969,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- L�RIDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'L�RIDA',
            dept_id,
            4.862046,
            -74.910716,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LÍBANO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LÍBANO',
            dept_id,
            4.92042,
            -75.061959,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN SEBASTIÍN DE MARIQUITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN SEBASTIÍN DE MARIQUITA',
            dept_id,
            5.199708,
            -74.889276,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MELGAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MELGAR',
            dept_id,
            4.203655,
            -74.641317,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MURILLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MURILLO',
            dept_id,
            4.874341,
            -75.171022,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NATAGAIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NATAGAIMA',
            dept_id,
            3.624324,
            -75.093182,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ORTEGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ORTEGA',
            dept_id,
            3.934916,
            -75.222601,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALOCABILDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALOCABILDO',
            dept_id,
            5.120918,
            -75.022167,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIEDRAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIEDRAS',
            dept_id,
            4.543951,
            -74.878106,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PLANADAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PLANADAS',
            dept_id,
            3.197911,
            -75.644163,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PRADO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PRADO',
            dept_id,
            3.750939,
            -74.927447,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PURIFICACIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PURIFICACIÍN',
            dept_id,
            3.857246,
            -74.935555,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RIOBLANCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIOBLANCO',
            dept_id,
            3.529932,
            -75.644069,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RONCESVALLES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RONCESVALLES',
            dept_id,
            4.011567,
            -75.605959,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ROVIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ROVIRA',
            dept_id,
            4.239019,
            -75.240648,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SALDA�A
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SALDA�A',
            dept_id,
            3.929815,
            -75.016852,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ANTONIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANTONIO',
            dept_id,
            3.914146,
            -75.480074,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN LUIS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN LUIS',
            dept_id,
            4.133721,
            -75.095804,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ISABEL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ISABEL',
            dept_id,
            4.713606,
            -75.097934,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUÍREZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUÍREZ',
            dept_id,
            4.048891,
            -74.831885,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VALLE DE SAN JUAN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALLE DE SAN JUAN',
            dept_id,
            4.197494,
            -75.115669,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VENADILLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VENADILLO',
            dept_id,
            4.717878,
            -74.929333,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLAHERMOSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLAHERMOSA',
            dept_id,
            5.030452,
            -75.117729,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLARRICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLARRICA',
            dept_id,
            3.936902,
            -74.600285,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- VALLE DEL CAUCA (76)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '76';
    
    IF dept_id IS NOT NULL THEN

        -- SANTIAGO DE CALI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTIAGO DE CALI',
            dept_id,
            3.413686,
            -76.52133,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALCALÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALCALÍ',
            dept_id,
            4.674994,
            -75.779792,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANDALUCÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANDALUCÍA',
            dept_id,
            4.171713,
            -76.167925,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANSERMANUEVO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANSERMANUEVO',
            dept_id,
            4.794984,
            -75.992003,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARGELIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARGELIA',
            dept_id,
            4.726945,
            -76.119905,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BOLÍVAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BOLÍVAR',
            dept_id,
            4.337846,
            -76.183583,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUENAVENTURA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUENAVENTURA',
            dept_id,
            3.875708,
            -77.01074,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUADALAJARA DE BUGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUADALAJARA DE BUGA',
            dept_id,
            3.900736,
            -76.298979,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BUGALAGRANDE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BUGALAGRANDE',
            dept_id,
            4.208358,
            -76.15682,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAICEDONIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAICEDONIA',
            dept_id,
            4.334808,
            -75.830594,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALIMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALIMA',
            dept_id,
            3.933664,
            -76.484132,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CANDELARIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CANDELARIA',
            dept_id,
            3.408354,
            -76.346519,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARTAGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARTAGO',
            dept_id,
            4.742192,
            -75.924374,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DAGUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DAGUA',
            dept_id,
            3.657318,
            -76.68886,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL ÍGUILA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL ÍGUILA',
            dept_id,
            4.906062,
            -76.042779,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CAIRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CAIRO',
            dept_id,
            4.760874,
            -76.221611,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CERRITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CERRITO',
            dept_id,
            3.684229,
            -76.311972,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL DOVIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL DOVIO',
            dept_id,
            4.510452,
            -76.237084,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FLORIDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FLORIDA',
            dept_id,
            3.324118,
            -76.234199,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GINEBRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GINEBRA',
            dept_id,
            3.724181,
            -76.268068,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUACARÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUACARÍ',
            dept_id,
            3.761815,
            -76.330911,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JAMUNDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JAMUNDÍ',
            dept_id,
            3.258751,
            -76.538472,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA CUMBRE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA CUMBRE',
            dept_id,
            3.649268,
            -76.56805,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA UNIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA UNIÍN',
            dept_id,
            4.533869,
            -76.099661,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA VICTORIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA VICTORIA',
            dept_id,
            4.523603,
            -76.036529,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OBANDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OBANDO',
            dept_id,
            4.575712,
            -75.974709,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALMIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALMIRA',
            dept_id,
            3.531544,
            -76.298846,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PRADERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PRADERA',
            dept_id,
            3.419793,
            -76.241799,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RESTREPO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RESTREPO',
            dept_id,
            3.821351,
            -76.523329,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RIOFRÍO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIOFRÍO',
            dept_id,
            4.156908,
            -76.288313,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ROLDANILLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ROLDANILLO',
            dept_id,
            4.413601,
            -76.152277,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PEDRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PEDRO',
            dept_id,
            3.995073,
            -76.228692,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SEVILLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SEVILLA',
            dept_id,
            4.270714,
            -75.931629,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TORO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TORO',
            dept_id,
            4.608085,
            -76.076859,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TRUJILLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TRUJILLO',
            dept_id,
            4.212037,
            -76.318818,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TULUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TULUÍ',
            dept_id,
            4.085399,
            -76.197731,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ULLOA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ULLOA',
            dept_id,
            4.703623,
            -75.737808,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VERSALLES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VERSALLES',
            dept_id,
            4.575019,
            -76.199203,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VIJES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VIJES',
            dept_id,
            3.698686,
            -76.441804,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YOTOCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YOTOCO',
            dept_id,
            3.861241,
            -76.382698,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YUMBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YUMBO',
            dept_id,
            3.540097,
            -76.499893,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZARZAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZARZAL',
            dept_id,
            4.392658,
            -76.070795,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- ARAUCA (81)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '81';
    
    IF dept_id IS NOT NULL THEN

        -- ARAUCA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARAUCA',
            dept_id,
            7.072726,
            -70.747408,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARAUQUITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARAUQUITA',
            dept_id,
            7.02702,
            -71.426733,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CRAVO NORTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CRAVO NORTE',
            dept_id,
            6.303913,
            -70.204286,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FORTUL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FORTUL',
            dept_id,
            6.796695,
            -71.76877,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO RONDÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO RONDÍN',
            dept_id,
            6.281461,
            -71.10339,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SARAVENA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SARAVENA',
            dept_id,
            6.953926,
            -71.872812,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TAME
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TAME',
            dept_id,
            6.453324,
            -71.754427,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- CASANARE (85)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '85';
    
    IF dept_id IS NOT NULL THEN

        -- YOPAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YOPAL',
            dept_id,
            5.327102,
            -72.396132,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AGUAZUL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AGUAZUL',
            dept_id,
            5.172641,
            -72.546838,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHÍMEZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHÍMEZA',
            dept_id,
            5.214527,
            -72.87016,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HATO COROZAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HATO COROZAL',
            dept_id,
            6.154099,
            -71.764213,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA SALINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA SALINA',
            dept_id,
            6.127762,
            -72.334978,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MANÍ',
            dept_id,
            4.81681,
            -72.281384,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONTERREY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONTERREY',
            dept_id,
            4.877017,
            -72.894065,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NUNCHÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NUNCHÍA',
            dept_id,
            5.636474,
            -72.195323,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OROCU�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OROCU�',
            dept_id,
            4.790258,
            -71.338533,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAZ DE ARIPORO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAZ DE ARIPORO',
            dept_id,
            5.879827,
            -71.890348,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PORE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PORE',
            dept_id,
            5.72773,
            -71.99286,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RECETOR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RECETOR',
            dept_id,
            5.229181,
            -72.760991,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABANALARGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABANALARGA',
            dept_id,
            4.854787,
            -73.038696,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SÍCAMA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SÍCAMA',
            dept_id,
            6.096738,
            -72.250157,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN LUIS DE PALENQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN LUIS DE PALENQUE',
            dept_id,
            5.422397,
            -71.732198,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TÍMARA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TÍMARA',
            dept_id,
            5.829543,
            -72.16165,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TAURAMENA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TAURAMENA',
            dept_id,
            5.018977,
            -72.74662,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TRINIDAD
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TRINIDAD',
            dept_id,
            5.412178,
            -71.662812,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLANUEVA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLANUEVA',
            dept_id,
            4.61035,
            -72.927797,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- PUTUMAYO (86)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '86';
    
    IF dept_id IS NOT NULL THEN

        -- MOCOA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MOCOA',
            dept_id,
            1.151172,
            -76.654238,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COLÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COLÍN',
            dept_id,
            1.190133,
            -76.972566,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ORITO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ORITO',
            dept_id,
            0.663593,
            -76.873276,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO ASÍS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO ASÍS',
            dept_id,
            0.505627,
            -76.496887,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO CAICEDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO CAICEDO',
            dept_id,
            0.687784,
            -76.606118,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO GUZMÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO GUZMÍN',
            dept_id,
            0.962854,
            -76.407663,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO LEGUÍZAMO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO LEGUÍZAMO',
            dept_id,
            -0.192318,
            -74.781842,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SIBUNDOY
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SIBUNDOY',
            dept_id,
            1.20026,
            -76.917814,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN FRANCISCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN FRANCISCO',
            dept_id,
            1.174194,
            -76.879283,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN MIGUEL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN MIGUEL',
            dept_id,
            0.34346,
            -76.91217,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTIAGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTIAGO',
            dept_id,
            1.147076,
            -77.002641,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VALLE DEL GUAMUEZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALLE DEL GUAMUEZ',
            dept_id,
            0.423506,
            -76.906751,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VILLAGARZÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VILLAGARZÍN',
            dept_id,
            1.028821,
            -76.61721,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- ARCHIPI�LAGO DE SAN ANDR�S, PROVIDENCIA Y SANTA CATALINA (88)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '88';
    
    IF dept_id IS NOT NULL THEN

        -- SAN ANDR�S
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANDR�S',
            dept_id,
            12.578108,
            -81.707181,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PROVIDENCIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PROVIDENCIA',
            dept_id,
            13.373185,
            -81.368386,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- AMAZONAS (91)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '91';
    
    IF dept_id IS NOT NULL THEN

        -- LETICIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LETICIA',
            dept_id,
            -4.19895,
            -69.941721,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL ENCANTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL ENCANTO',
            dept_id,
            -1.74806,
            -73.207114,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA CHORRERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA CHORRERA',
            dept_id,
            -1.442617,
            -72.791889,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PEDRERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PEDRERA',
            dept_id,
            -1.320301,
            -69.585499,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA VICTORIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA VICTORIA',
            dept_id,
            0.054936,
            -71.223208,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MIRITÍ - PARANÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MIRITÍ - PARANÍ',
            dept_id,
            -0.888833,
            -70.98893,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO ALEGRÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO ALEGRÍA',
            dept_id,
            -1.005674,
            -74.014461,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO ARICA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO ARICA',
            dept_id,
            -2.147039,
            -71.752186,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO NARI�O
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO NARI�O',
            dept_id,
            -3.779934,
            -70.364937,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO SANTANDER
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO SANTANDER',
            dept_id,
            -0.621184,
            -72.384213,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TARAPACÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TARAPACÍ',
            dept_id,
            -2.890126,
            -69.741745,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- GUAINÍA (94)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '94';
    
    IF dept_id IS NOT NULL THEN

        -- INÍRIDA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'INÍRIDA',
            dept_id,
            3.866764,
            -67.918613,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARRANCOMINAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARRANCOMINAS',
            dept_id,
            3.494178,
            -69.814066,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN FELIPE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN FELIPE',
            dept_id,
            1.912495,
            -67.067848,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO COLOMBIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO COLOMBIA',
            dept_id,
            2.726438,
            -67.566774,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA GUADALUPE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA GUADALUPE',
            dept_id,
            1.632464,
            -66.963692,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CACAHUAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CACAHUAL',
            dept_id,
            3.52617,
            -67.413312,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PANA PANA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PANA PANA',
            dept_id,
            1.865668,
            -69.0099,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MORICHAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MORICHAL',
            dept_id,
            2.265132,
            -69.919404,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- GUAVIARE (95)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '95';
    
    IF dept_id IS NOT NULL THEN

        -- SAN JOS� DEL GUAVIARE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DEL GUAVIARE',
            dept_id,
            2.565932,
            -72.639254,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALAMAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALAMAR',
            dept_id,
            1.960982,
            -72.655197,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL RETORNO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL RETORNO',
            dept_id,
            2.330164,
            -72.627304,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MIRAFLORES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MIRAFLORES',
            dept_id,
            1.337539,
            -71.950416,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- VAUP�S (97)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '97';
    
    IF dept_id IS NOT NULL THEN

        -- MITÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MITÍ',
            dept_id,
            1.253151,
            -70.232641,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARURÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARURÍ',
            dept_id,
            1.016116,
            -71.30221,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PACOA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PACOA',
            dept_id,
            0.020698,
            -71.004339,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TARAIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TARAIRA',
            dept_id,
            -0.564984,
            -69.635497,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PAPUNAHUA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PAPUNAHUA',
            dept_id,
            1.908124,
            -70.76091,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YAVARAT�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YAVARAT�',
            dept_id,
            0.609142,
            -69.203337,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- VICHADA (99)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '99';
    
    IF dept_id IS NOT NULL THEN

        -- PUERTO CARRE�O
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO CARRE�O',
            dept_id,
            6.186636,
            -67.487095,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PRIMAVERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PRIMAVERA',
            dept_id,
            5.486309,
            -70.410515,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ROSALÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ROSALÍA',
            dept_id,
            5.136393,
            -70.859499,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CUMARIBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CUMARIBO',
            dept_id,
            4.446352,
            -69.795533,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- ANTIOQUIA (05)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '05';
    
    IF dept_id IS NOT NULL THEN

        -- MEDELLÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MEDELLÍN',
            dept_id,
            6.246631,
            -75.581775,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ABEJORRAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ABEJORRAL',
            dept_id,
            5.789315,
            -75.428739,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ABRIAQUÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ABRIAQUÍ',
            dept_id,
            6.632282,
            -76.064304,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ALEJANDRÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ALEJANDRÍA',
            dept_id,
            6.376061,
            -75.141346,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AMAGÁ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AMAGÁ',
            dept_id,
            6.038708,
            -75.702188,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- AMALFI
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'AMALFI',
            dept_id,
            6.909655,
            -75.077501,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANDES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANDES',
            dept_id,
            5.657194,
            -75.878828,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANGELÓPOLIS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANGELÓPOLIS',
            dept_id,
            6.109719,
            -75.711389,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANGOSTURA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANGOSTURA',
            dept_id,
            6.885175,
            -75.335116,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANORÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANORÍ',
            dept_id,
            7.074703,
            -75.148355,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA F� DE ANTIOQUIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA F� DE ANTIOQUIA',
            dept_id,
            6.556484,
            -75.826648,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ANZÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ANZÍ',
            dept_id,
            6.302641,
            -75.854442,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- APARTADÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'APARTADÍ',
            dept_id,
            7.882968,
            -76.625279,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARBOLETES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARBOLETES',
            dept_id,
            8.849317,
            -76.426708,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARGELIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARGELIA',
            dept_id,
            5.731474,
            -75.14107,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ARMENIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ARMENIA',
            dept_id,
            6.155667,
            -75.786647,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARBOSA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARBOSA',
            dept_id,
            6.439195,
            -75.331627,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BELMIRA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BELMIRA',
            dept_id,
            6.606319,
            -75.667779,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BELLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BELLO',
            dept_id,
            6.333587,
            -75.555245,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BETANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BETANIA',
            dept_id,
            5.74615,
            -75.97679,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BETULIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BETULIA',
            dept_id,
            6.115208,
            -75.984452,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CIUDAD BOLÍVAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CIUDAD BOLÍVAR',
            dept_id,
            5.850273,
            -76.021509,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BRICE�O
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BRICE�O',
            dept_id,
            7.112803,
            -75.55036,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BURITICÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BURITICÍ',
            dept_id,
            6.720759,
            -75.907,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CÍCERES
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CÍCERES',
            dept_id,
            7.578366,
            -75.35205,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAICEDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAICEDO',
            dept_id,
            6.405607,
            -75.98293,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CALDAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CALDAS',
            dept_id,
            6.091077,
            -75.633673,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAMPAMENTO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAMPAMENTO',
            dept_id,
            6.979771,
            -75.298091,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CA�ASGORDAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CA�ASGORDAS',
            dept_id,
            6.753859,
            -76.028228,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARACOLÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARACOLÍ',
            dept_id,
            6.409829,
            -74.757421,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CARAMANTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CARAMANTA',
            dept_id,
            5.54853,
            -75.643868,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAREPA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAREPA',
            dept_id,
            7.755148,
            -76.652652,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL CARMEN DE VIBORAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL CARMEN DE VIBORAL',
            dept_id,
            6.082885,
            -75.333901,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAROLINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAROLINA',
            dept_id,
            6.725995,
            -75.283192,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAUCASIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAUCASIA',
            dept_id,
            7.977278,
            -75.197996,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CHIGORODÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CHIGORODÍ',
            dept_id,
            7.666147,
            -76.681531,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CISNEROS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CISNEROS',
            dept_id,
            6.537829,
            -75.087047,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COCORNÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COCORNÍ',
            dept_id,
            6.058295,
            -75.185483,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONCEPCIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONCEPCIÍN',
            dept_id,
            6.394348,
            -75.257587,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CONCORDIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CONCORDIA',
            dept_id,
            6.045738,
            -75.908448,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- COPACABANA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'COPACABANA',
            dept_id,
            6.348557,
            -75.509384,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DABEIBA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DABEIBA',
            dept_id,
            6.998112,
            -76.261614,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- DONMATÍAS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'DONMATÍAS',
            dept_id,
            6.485603,
            -75.39263,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EB�JICO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EB�JICO',
            dept_id,
            6.325615,
            -75.766413,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL BAGRE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL BAGRE',
            dept_id,
            7.5975,
            -74.799097,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ENTRERRÍOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ENTRERRÍOS',
            dept_id,
            6.566273,
            -75.517685,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ENVIGADO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ENVIGADO',
            dept_id,
            6.166695,
            -75.582192,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FREDONIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FREDONIA',
            dept_id,
            5.928039,
            -75.675072,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- FRONTINO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'FRONTINO',
            dept_id,
            6.776066,
            -76.130765,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GIRALDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GIRALDO',
            dept_id,
            6.680808,
            -75.952158,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GIRARDOTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GIRARDOTA',
            dept_id,
            6.379472,
            -75.444238,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GÍMEZ PLATA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GÍMEZ PLATA',
            dept_id,
            6.683269,
            -75.220018,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GRANADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GRANADA',
            dept_id,
            6.142892,
            -75.184446,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUADALUPE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUADALUPE',
            dept_id,
            6.815069,
            -75.239862,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUARNE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUARNE',
            dept_id,
            6.27787,
            -75.441612,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GUATAP�
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GUATAP�',
            dept_id,
            6.232461,
            -75.160041,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HELICONIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HELICONIA',
            dept_id,
            6.206757,
            -75.734322,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- HISPANIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'HISPANIA',
            dept_id,
            5.799461,
            -75.906587,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ITAG�Í
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ITAG�Í',
            dept_id,
            6.175079,
            -75.612056,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ITUANGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ITUANGO',
            dept_id,
            7.171629,
            -75.764673,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JARDÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JARDÍN',
            dept_id,
            5.597542,
            -75.818982,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JERICÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JERICÍ',
            dept_id,
            5.789748,
            -75.785499,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA CEJA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA CEJA',
            dept_id,
            6.028062,
            -75.429433,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA ESTRELLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA ESTRELLA',
            dept_id,
            6.145238,
            -75.637708,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA PINTADA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA PINTADA',
            dept_id,
            5.743808,
            -75.60781,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LA UNIÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LA UNIÍN',
            dept_id,
            5.973845,
            -75.360874,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LIBORINA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LIBORINA',
            dept_id,
            6.677316,
            -75.812838,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MACEO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MACEO',
            dept_id,
            6.552116,
            -74.78716,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MARINILLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MARINILLA',
            dept_id,
            6.173995,
            -75.339345,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MONTEBELLO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MONTEBELLO',
            dept_id,
            5.946313,
            -75.523455,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MURINDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MURINDÍ',
            dept_id,
            6.97771,
            -76.817485,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MUTATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MUTATÍ',
            dept_id,
            7.242875,
            -76.435875,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NARI�O
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NARI�O',
            dept_id,
            5.610777,
            -75.176262,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NECOCLÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NECOCLÍ',
            dept_id,
            8.434526,
            -76.787271,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- NECHÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'NECHÍ',
            dept_id,
            8.094129,
            -74.77647,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- OLAYA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'OLAYA',
            dept_id,
            6.626492,
            -75.811773,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PE�OL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PE�OL',
            dept_id,
            6.219349,
            -75.242693,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PEQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PEQUE',
            dept_id,
            7.021029,
            -75.910357,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUEBLORRICO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUEBLORRICO',
            dept_id,
            5.79158,
            -75.839903,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO BERRÍO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO BERRÍO',
            dept_id,
            6.487028,
            -74.410016,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO NARE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO NARE',
            dept_id,
            6.186025,
            -74.583012,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO TRIUNFO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO TRIUNFO',
            dept_id,
            5.871318,
            -74.64119,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- REMEDIOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'REMEDIOS',
            dept_id,
            7.029424,
            -74.698135,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RETIRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RETIRO',
            dept_id,
            6.062454,
            -75.501301,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- RIONEGRO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'RIONEGRO',
            dept_id,
            6.147148,
            -75.377316,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABANALARGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABANALARGA',
            dept_id,
            6.850028,
            -75.816645,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABANETA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABANETA',
            dept_id,
            6.149903,
            -75.615479,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SALGAR
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SALGAR',
            dept_id,
            5.964198,
            -75.976807,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ANDR�S DE CUERQUÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ANDR�S DE CUERQUÍA',
            dept_id,
            6.916676,
            -75.674564,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN CARLOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN CARLOS',
            dept_id,
            6.187746,
            -74.988097,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN FRANCISCO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN FRANCISCO',
            dept_id,
            5.963476,
            -75.101562,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JERÍNIMO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JERÍNIMO',
            dept_id,
            6.44809,
            -75.726975,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JOS� DE LA MONTA�A
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JOS� DE LA MONTA�A',
            dept_id,
            6.85009,
            -75.683352,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN JUAN DE URABÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN JUAN DE URABÍ',
            dept_id,
            8.758964,
            -76.52857,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN LUIS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN LUIS',
            dept_id,
            6.043017,
            -74.993619,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PEDRO DE LOS MILAGROS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PEDRO DE LOS MILAGROS',
            dept_id,
            6.46012,
            -75.556743,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN PEDRO DE URABÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN PEDRO DE URABÍ',
            dept_id,
            8.276884,
            -76.380567,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN RAFAEL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN RAFAEL',
            dept_id,
            6.293759,
            -75.02849,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN ROQUE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN ROQUE',
            dept_id,
            6.485939,
            -75.019109,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SAN VICENTE FERRER
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SAN VICENTE FERRER',
            dept_id,
            6.282164,
            -75.332616,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA BÍRBARA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA BÍRBARA',
            dept_id,
            5.875527,
            -75.567351,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA ROSA DE OSOS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA ROSA DE OSOS',
            dept_id,
            6.643366,
            -75.460723,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTO DOMINGO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTO DOMINGO',
            dept_id,
            6.473032,
            -75.164903,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- EL SANTUARIO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'EL SANTUARIO',
            dept_id,
            6.136871,
            -75.265465,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SEGOVIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SEGOVIA',
            dept_id,
            7.079648,
            -74.701596,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SONSÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SONSÍN',
            dept_id,
            5.714851,
            -75.309596,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOPETRÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOPETRÍN',
            dept_id,
            6.500745,
            -75.747378,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TÍMESIS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TÍMESIS',
            dept_id,
            5.664645,
            -75.714429,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TARAZÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TARAZÍ',
            dept_id,
            7.580127,
            -75.401407,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TARSO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TARSO',
            dept_id,
            5.864542,
            -75.822956,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TITIRIBÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TITIRIBÍ',
            dept_id,
            6.062391,
            -75.791887,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TOLEDO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TOLEDO',
            dept_id,
            7.010328,
            -75.692281,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TURBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TURBO',
            dept_id,
            8.089929,
            -76.728858,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- URAMITA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'URAMITA',
            dept_id,
            6.898393,
            -76.173284,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- URRAO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'URRAO',
            dept_id,
            6.317343,
            -76.133951,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VALDIVIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALDIVIA',
            dept_id,
            7.1652,
            -75.439274,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VALPARAÍSO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VALPARAÍSO',
            dept_id,
            5.614555,
            -75.624452,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VEGACHÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VEGACHÍ',
            dept_id,
            6.773525,
            -74.798714,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VENECIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VENECIA',
            dept_id,
            5.964693,
            -75.735544,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- VIGÍA DEL FUERTE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'VIGÍA DEL FUERTE',
            dept_id,
            6.588164,
            -76.896004,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YALÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YALÍ',
            dept_id,
            6.676554,
            -74.840059,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YARUMAL
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YARUMAL',
            dept_id,
            6.963832,
            -75.418828,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YOLOMBÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YOLOMBÍ',
            dept_id,
            6.594511,
            -75.013385,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- YONDÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'YONDÍ',
            dept_id,
            7.00396,
            -73.912445,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- ZARAGOZA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'ZARAGOZA',
            dept_id,
            7.488583,
            -74.867075,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- ATLÁNTICO (08)
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '08';
    
    IF dept_id IS NOT NULL THEN

        -- BARRANQUILLA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARRANQUILLA',
            dept_id,
            10.977961,
            -74.815546,
            true
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- BARANOA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'BARANOA',
            dept_id,
            10.79445,
            -74.916077,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CAMPO DE LA CRUZ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CAMPO DE LA CRUZ',
            dept_id,
            10.378291,
            -74.880847,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- CANDELARIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'CANDELARIA',
            dept_id,
            10.461903,
            -74.879717,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- GALAPA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'GALAPA',
            dept_id,
            10.919033,
            -74.870385,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- JUAN DE ACOSTA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'JUAN DE ACOSTA',
            dept_id,
            10.83254,
            -75.041032,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- LURUACO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'LURUACO',
            dept_id,
            10.610491,
            -75.14199,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MALAMBO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MALAMBO',
            dept_id,
            10.857086,
            -74.776923,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- MANATÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'MANATÍ',
            dept_id,
            10.449089,
            -74.956867,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PALMAR DE VARELA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PALMAR DE VARELA',
            dept_id,
            10.738591,
            -74.754765,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PIOJÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PIOJÍ',
            dept_id,
            10.749216,
            -75.107592,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- POLONUEVO
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'POLONUEVO',
            dept_id,
            10.777363,
            -74.852981,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PONEDERA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PONEDERA',
            dept_id,
            10.641779,
            -74.753885,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- PUERTO COLOMBIA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'PUERTO COLOMBIA',
            dept_id,
            11.015322,
            -74.888627,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- REPELÍN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'REPELÍN',
            dept_id,
            10.493357,
            -75.125534,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABANAGRANDE
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABANAGRANDE',
            dept_id,
            10.792453,
            -74.759496,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SABANALARGA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SABANALARGA',
            dept_id,
            10.632091,
            -74.921256,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTA LUCÍA
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTA LUCÍA',
            dept_id,
            10.324303,
            -74.959204,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SANTO TOMÍS
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SANTO TOMÍS',
            dept_id,
            10.758735,
            -74.757859,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SOLEDAD
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SOLEDAD',
            dept_id,
            10.909921,
            -74.786054,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- SUAN
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'SUAN',
            dept_id,
            10.335432,
            -74.881687,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- TUBARÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'TUBARÍ',
            dept_id,
            10.873586,
            -74.978704,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

        -- USIACURÍ
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            'USIACURÍ',
            dept_id,
            10.74298,
            -74.976985,
            false
        ) ON CONFLICT (name, department_id) DO NOTHING;

    END IF;
END $$;

-- Verificar inserción
SELECT 
    d.name as departamento,
    COUNT(c.id) as municipios
FROM departments d
LEFT JOIN cities c ON c.department_id = d.id
JOIN countries co ON d.country_id = co.id
WHERE co.code = 'CO'
GROUP BY d.id, d.name
ORDER BY d.name;

-- Total de municipios
SELECT COUNT(*) as total_municipios FROM cities c
JOIN departments d ON c.department_id = d.id
JOIN countries co ON d.country_id = co.id
WHERE co.code = 'CO';
