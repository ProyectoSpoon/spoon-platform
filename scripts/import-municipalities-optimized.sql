-- ========================================
-- IMPORTACIÓN OPTIMIZADA DE MUNICIPIOS
-- Inserción por lotes para mayor eficiencia
-- ========================================

-- BOGOTÁ D.C. (11) - 1 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('BOGOTÁ D.C.', 4.649251, -74.106992, true)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '11'
ON CONFLICT (name, department_id) DO NOTHING;

-- BOLÍVAR (13) - 46 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('CARTAGENA DE INDIAS', 10.385126, -75.496269, true),
    ('ACHÍ', 8.570107, -74.557676, false),
    ('ALTOS DEL ROSARIO', 8.791865, -74.164905, false),
    ('ARENAL', 8.458865, -73.941099, false),
    ('ARJONA', 10.25666, -75.344332, false),
    ('ARROYOHONDO', 10.250075, -75.019215, false),
    ('BARRANCO DE LOBA', 8.947787, -74.104391, false),
    ('CALAMAR', 10.250431, -74.916144, false),
    ('CANTAGALLO', 7.378678, -73.914605, false),
    ('CICUCO', 9.274281, -74.645981, false),
    ('CÓRDOBA', 9.586942, -74.827399, false),
    ('CLEMENCIA', 10.567452, -75.328469, false),
    ('EL CARMEN DE BOLÍVAR', 9.718653, -75.121178, false),
    ('EL GUAMO', 10.030958, -74.976084, false),
    ('EL PE�ÍN', 8.988271, -73.949274, false),
    ('HATILLO DE LOBA', 8.956014, -74.077912, false),
    ('MAGANGU�', 9.263799, -74.766742, false),
    ('MAHATES', 10.233285, -75.191643, false),
    ('MARGARITA', 9.15784, -74.285137, false),
    ('MARÍA LA BAJA', 9.982402, -75.300516, false),
    ('MONTECRISTO', 8.297234, -74.471176, false),
    ('SANTA CRUZ DE MOMPOX', 9.244241, -74.42818, false),
    ('MORALES', 8.276558, -73.868172, false),
    ('NOROSÍ', 8.526259, -74.038003, false),
    ('PINILLOS', 8.914947, -74.462279, false),
    ('REGIDOR', 8.666258, -73.821638, false),
    ('RÍO VIEJO', 8.58795, -73.840466, false),
    ('SAN CRISTÍBAL', 10.392836, -75.065076, false),
    ('SAN ESTANISLAO', 10.398602, -75.153101, false),
    ('SAN FERNANDO', 9.214183, -74.323811, false),
    ('SAN JACINTO', 9.830275, -75.12105, false),
    ('SAN JACINTO DEL CAUCA', 8.25158, -74.721156, false),
    ('SAN JUAN NEPOMUCENO', 9.953751, -75.081761, false),
    ('SAN MARTÍN DE LOBA', 8.937485, -74.039134, false),
    ('SAN PABLO', 7.476747, -73.924602, false),
    ('SANTA CATALINA', 10.605294, -75.287855, false),
    ('SANTA ROSA', 10.444396, -75.369824, false),
    ('SANTA ROSA DEL SUR', 7.963938, -74.052243, false),
    ('SIMITÍ', 7.953916, -73.947264, false),
    ('SOPLAVIENTO', 10.38839, -75.136404, false),
    ('TALAIGUA NUEVO', 9.30403, -74.567479, false),
    ('TIQUISIO', 8.558666, -74.262922, false),
    ('TURBACO', 10.348316, -75.427249, false),
    ('TURBANÍ', 10.274585, -75.44265, false),
    ('VILLANUEVA', 10.444089, -75.275613, false),
    ('ZAMBRANO', 9.746306, -74.817879, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '13'
ON CONFLICT (name, department_id) DO NOTHING;

-- BOYACÁ (15) - 123 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('TUNJA', 5.53988, -73.355539, false),
    ('ALMEIDA', 4.970857, -73.378933, false),
    ('AQUITANIA', 5.518602, -72.88399, false),
    ('ARCABUCO', 5.755673, -73.437503, false),
    ('BEL�N', 5.98923, -72.911641, false),
    ('BERBEO', 5.227451, -73.12721, false),
    ('BET�ITIVA', 5.909978, -72.809014, false),
    ('BOAVITA', 6.330703, -72.584905, false),
    ('BOYACÁ', 5.454578, -73.361945, false),
    ('BRICE�O', 5.690879, -73.92326, false),
    ('BUENAVISTA', 5.512594, -73.94217, false),
    ('BUSBANZÍ', 5.831393, -72.884158, false),
    ('CALDAS', 5.55458, -73.865553, false),
    ('CAMPOHERMOSO', 5.031676, -73.104173, false),
    ('CERINZA', 5.955939, -72.947918, false),
    ('CHINAVITA', 5.167486, -73.368476, false),
    ('CHIQUINQUIRÍ', 5.61379, -73.818745, false),
    ('CHISCAS', 6.553136, -72.500957, false),
    ('CHITA', 6.187083, -72.471892, false),
    ('CHITARAQUE', 6.027425, -73.4471, false),
    ('CHIVATÍ', 5.558949, -73.282529, false),
    ('CI�NEGA', 5.408694, -73.296049, false),
    ('CÍMBITA', 5.634545, -73.323957, false),
    ('COPER', 5.475074, -74.045636, false),
    ('CORRALES', 5.828064, -72.844795, false),
    ('COVARACHÍA', 6.500177, -72.738978, false),
    ('CUBARÍ', 6.997275, -72.107939, false),
    ('CUCAITA', 5.544452, -73.454338, false),
    ('CUÍTIVA', 5.580367, -72.965923, false),
    ('CHÍQUIZA', 5.639834, -73.449463, false),
    ('CHIVOR', 4.888173, -73.368398, false),
    ('DUITAMA', 5.822964, -73.03063, false),
    ('EL COCUY', 6.407738, -72.444537, false),
    ('EL ESPINO', 6.483027, -72.497007, false),
    ('FIRAVITOBA', 5.668885, -72.993392, false),
    ('FLORESTA', 5.859519, -72.918111, false),
    ('GACHANTIVÍ', 5.751891, -73.549092, false),
    ('GÍMEZA', 5.802333, -72.80553, false),
    ('GARAGOA', 5.083234, -73.364413, false),
    ('GUACAMAYAS', 6.459667, -72.500812, false),
    ('GUATEQUE', 5.007321, -73.471207, false),
    ('GUAYATÍ', 4.967122, -73.489698, false),
    ('G�ICÍN DE LA SIERRA', 6.462864, -72.411763, false),
    ('IZA', 5.611577, -72.979559, false),
    ('JENESANO', 5.385813, -73.363738, false),
    ('JERICÍ', 6.145735, -72.571122, false),
    ('LABRANZAGRANDE', 5.562687, -72.57777, false),
    ('LA CAPILLA', 5.095687, -73.444347, false),
    ('LA VICTORIA', 5.523792, -74.234393, false),
    ('LA UVITA', 6.31616, -72.559982, false),
    ('VILLA DE LEYVA', 5.632455, -73.524948, false),
    ('MACANAL', 4.972464, -73.319593, false),
    ('MARIPÍ', 5.550091, -74.00405, false),
    ('MIRAFLORES', 5.196515, -73.14563, false),
    ('MONGUA', 5.754242, -72.79809, false),
    ('MONGUÍ', 5.723486, -72.849292, false),
    ('MONIQUIRÍ', 5.876331, -73.573374, false),
    ('MOTAVITA', 5.5777, -73.367841, false),
    ('MUZO', 5.532758, -74.10269, false),
    ('NOBSA', 5.768046, -72.937042, false),
    ('NUEVO COLÍN', 5.355317, -73.456759, false),
    ('OICATÍ', 5.595235, -73.308399, false),
    ('OTANCHE', 5.657536, -74.180965, false),
    ('PACHAVITA', 5.140065, -73.396953, false),
    ('PÍEZ', 5.097319, -73.052737, false),
    ('PAIPA', 5.779894, -73.11782, false),
    ('PAJARITO', 5.293783, -72.703231, false),
    ('PANQUEBA', 6.443416, -72.459424, false),
    ('PAUNA', 5.656323, -73.978449, false),
    ('PAYA', 5.625699, -72.423775, false),
    ('PAZ DE RÍO', 5.987645, -72.749137, false),
    ('PESCA', 5.558808, -73.050872, false),
    ('PISBA', 5.72141, -72.486023, false),
    ('PUERTO BOYACÁ', 5.976646, -74.587782, false),
    ('QUÍPAMA', 5.52055, -74.180033, false),
    ('RAMIRIQUÍ', 5.400303, -73.334839, false),
    ('RÍQUIRA', 5.539136, -73.632543, false),
    ('RONDÍN', 5.357378, -73.208474, false),
    ('SABOYÍ', 5.697756, -73.764456, false),
    ('SÍCHICA', 5.584305, -73.542539, false),
    ('SAMACÍ', 5.492161, -73.485589, false),
    ('SAN EDUARDO', 5.22401, -73.077747, false),
    ('SAN JOS� DE PARE', 6.018924, -73.545397, false),
    ('SAN LUIS DE GACENO', 4.81976, -73.168076, false),
    ('SAN MATEO', 6.401683, -72.555264, false),
    ('SAN MIGUEL DE SEMA', 5.518083, -73.722009, false),
    ('SAN PABLO DE BORBUR', 5.650743, -74.069963, false),
    ('SANTANA', 6.056866, -73.481639, false),
    ('SANTA MARÍA', 4.857193, -73.263518, false),
    ('SANTA ROSA DE VITERBO', 5.874547, -72.982461, false),
    ('SANTA SOFÍA', 5.713269, -73.602707, false),
    ('SATIVANORTE', 6.131132, -72.708458, false),
    ('SATIVASUR', 6.093183, -72.712435, false),
    ('SIACHOQUE', 5.511811, -73.24466, false),
    ('SOATÍ', 6.331945, -72.684051, false),
    ('SOCOTÍ', 6.041162, -72.636653, false),
    ('SOCHA', 5.996717, -72.691963, false),
    ('SOGAMOSO', 5.723976, -72.924355, false),
    ('SOMONDOCO', 4.985726, -73.433393, false),
    ('SORA', 5.56684, -73.450153, false),
    ('SOTAQUIRÍ', 5.764986, -73.246585, false),
    ('SORACÍ', 5.500898, -73.332804, false),
    ('SUSACÍN', 6.230332, -72.690289, false),
    ('SUTAMARCHÍN', 5.619781, -73.620536, false),
    ('SUTATENZA', 5.022989, -73.452317, false),
    ('TASCO', 5.909821, -72.781011, false),
    ('TENZA', 5.076781, -73.421176, false),
    ('TIBANÍ', 5.317251, -73.396457, false),
    ('TIBASOSA', 5.74723, -72.999449, false),
    ('TINJACÍ', 5.579713, -73.646847, false),
    ('TIPACOQUE', 6.419203, -72.691729, false),
    ('TOCA', 5.566464, -73.184794, false),
    ('TOG�Í', 5.937438, -73.513655, false),
    ('TÍPAGA', 5.768201, -72.832245, false),
    ('TOTA', 5.560497, -72.985898, false),
    ('TUNUNGUÍ', 5.730582, -73.933155, false),
    ('TURMEQU�', 5.323261, -73.491825, false),
    ('TUTA', 5.689082, -73.230285, false),
    ('TUTAZÍ', 6.032608, -72.856035, false),
    ('ÍMBITA', 5.221176, -73.456917, false),
    ('VENTAQUEMADA', 5.368739, -73.522368, false),
    ('VIRACACHÍ', 5.436833, -73.296894, false),
    ('ZETAQUIRA', 5.283443, -73.17098, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '15'
ON CONFLICT (name, department_id) DO NOTHING;

-- CALDAS (17) - 27 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('MANIZALES', 5.057657, -75.491025, true),
    ('AGUADAS', 5.610244, -75.45487, false),
    ('ANSERMA', 5.236471, -75.784343, false),
    ('ARANZAZU', 5.271195, -75.49129, false),
    ('BELALCÍZAR', 4.993785, -75.811918, false),
    ('CHINCHINÍ', 4.985227, -75.607529, false),
    ('FILADELFIA', 5.297091, -75.562474, false),
    ('LA DORADA', 5.460834, -74.668819, false),
    ('LA MERCED', 5.39647, -75.546486, false),
    ('MANZANARES', 5.255699, -75.152829, false),
    ('MARMATO', 5.47422, -75.600049, false),
    ('MARQUETALIA', 5.297525, -75.053097, false),
    ('MARULANDA', 5.284304, -75.259721, false),
    ('NEIRA', 5.166895, -75.520006, false),
    ('NORCASIA', 5.574796, -74.889543, false),
    ('PÍCORA', 5.527172, -75.459621, false),
    ('PALESTINA', 5.017879, -75.624577, false),
    ('PENSILVANIA', 5.383281, -75.160299, false),
    ('RIOSUCIO', 5.423673, -75.702104, false),
    ('RISARALDA', 5.164509, -75.76722, false),
    ('SALAMINA', 5.403025, -75.487223, false),
    ('SAMANÍ', 5.41308, -74.992263, false),
    ('SAN JOS�', 5.08231, -75.792063, false),
    ('SUPÍA', 5.446843, -75.64966, false),
    ('VICTORIA', 5.317437, -74.911239, false),
    ('VILLAMARÍA', 5.038925, -75.502487, false),
    ('VITERBO', 5.062664, -75.87061, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '17'
ON CONFLICT (name, department_id) DO NOTHING;

-- CAQUETÁ (18) - 16 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('FLORENCIA', 1.618196, -75.609831, false),
    ('ALBANIA', 1.328526, -75.878375, false),
    ('BEL�N DE LOS ANDAQUÍES', 1.415812, -75.872405, false),
    ('CARTAGENA DEL CHAIRÍ', 1.332371, -74.847867, false),
    ('CURILLO', 1.033473, -75.919205, false),
    ('EL DONCELLO', 1.679951, -75.283631, false),
    ('EL PAUJÍL', 1.570226, -75.326093, false),
    ('LA MONTA�ITA', 1.479173, -75.436408, false),
    ('MILÍN', 1.29021, -75.506926, false),
    ('MORELIA', 1.486611, -75.724146, false),
    ('PUERTO RICO', 1.909063, -75.157604, false),
    ('SAN JOS� DEL FRAGUA', 1.330266, -75.973796, false),
    ('SAN VICENTE DEL CAGUÍN', 2.119413, -74.767894, false),
    ('SOLANO', 0.699077, -75.253702, false),
    ('SOLITA', 0.87654, -75.619902, false),
    ('VALPARAÍSO', 1.194619, -75.70671, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '18'
ON CONFLICT (name, department_id) DO NOTHING;

-- CAUCA (19) - 42 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('POPAYÍN', 2.459641, -76.599377, false),
    ('ALMAGUER', 1.913429, -76.85607, false),
    ('ARGELIA', 2.257427, -77.24905, false),
    ('BALBOA', 2.040998, -77.215773, false),
    ('BOLÍVAR', 1.837538, -76.966215, false),
    ('BUENOS AIRES', 3.015382, -76.642238, false),
    ('CAJIBÍO', 2.623371, -76.570682, false),
    ('CALDONO', 2.798059, -76.484319, false),
    ('CALOTO', 3.034531, -76.408941, false),
    ('CORINTO', 3.173854, -76.261866, false),
    ('EL TAMBO', 2.451409, -76.810911, false),
    ('FLORENCIA', 1.682535, -77.072547, false),
    ('GUACHEN�', 3.134153, -76.392189, false),
    ('GUAPI', 2.571337, -77.88797, false),
    ('INZÍ', 2.549183, -76.063503, false),
    ('JAMBALÍ', 2.777834, -76.323877, false),
    ('LA SIERRA', 2.179383, -76.763278, false),
    ('LA VEGA', 2.001803, -76.778771, false),
    ('LÍPEZ DE MICAY', 2.846788, -77.247803, false),
    ('MERCADERES', 1.789193, -77.164319, false),
    ('MIRANDA', 3.254651, -76.228722, false),
    ('MORALES', 2.754684, -76.629106, false),
    ('PADILLA', 3.220984, -76.313265, false),
    ('PÍEZ', 2.645724, -75.970685, false),
    ('PATÍA', 2.115875, -76.981075, false),
    ('PIAMONTE', 1.11754, -76.327588, false),
    ('PIENDAMÍ - TUNÍA', 2.64228, -76.528615, false),
    ('PUERTO TEJADA', 3.233254, -76.417673, false),
    ('PURAC�', 2.341507, -76.496698, false),
    ('ROSAS', 2.260941, -76.740336, false),
    ('SAN SEBASTIÍN', 1.838451, -76.769467, false),
    ('SANTANDER DE QUILICHAO', 3.015008, -76.485141, false),
    ('SANTA ROSA', 1.700916, -76.573252, false),
    ('SILVIA', 2.611927, -76.379753, false),
    ('SOTARÍ - PAISPAMBA', 2.253156, -76.613365, false),
    ('SUÍREZ', 2.959785, -76.69357, false),
    ('SUCRE', 2.038237, -76.926279, false),
    ('TIMBÍO', 2.349686, -76.684476, false),
    ('TIMBIQUÍ', 2.777312, -77.667541, false),
    ('TORIBÍO', 2.953017, -76.270284, false),
    ('TOTORÍ', 2.510252, -76.403628, false),
    ('VILLA RICA', 3.17762, -76.458025, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '19'
ON CONFLICT (name, department_id) DO NOTHING;

-- CESAR (20) - 25 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('VALLEDUPAR', 10.460472, -73.259398, false),
    ('AGUACHICA', 8.306811, -73.614027, false),
    ('AGUSTÍN CODAZZI', 10.040454, -73.238389, false),
    ('ASTREA', 9.498062, -73.975842, false),
    ('BECERRIL', 9.704404, -73.278707, false),
    ('BOSCONIA', 9.975098, -73.888761, false),
    ('CHIMICHAGUA', 9.25875, -73.813278, false),
    ('CHIRIGUANÍ', 9.361058, -73.599913, false),
    ('CURUMANÍ', 9.201716, -73.540843, false),
    ('EL COPEY', 10.149883, -73.962703, false),
    ('EL PASO', 9.668461, -73.742012, false),
    ('GAMARRA', 8.324793, -73.737558, false),
    ('GONZÍLEZ', 8.389604, -73.38004, false),
    ('LA GLORIA', 8.619298, -73.80321, false),
    ('LA JAGUA DE IBIRICO', 9.563752, -73.334143, false),
    ('MANAURE BALCÍN DEL CESAR', 10.390776, -73.029472, false),
    ('PAILITAS', 8.959399, -73.625825, false),
    ('PELAYA', 8.689451, -73.666735, false),
    ('PUEBLO BELLO', 10.417321, -73.586211, false),
    ('RÍO DE ORO', 8.292292, -73.386393, false),
    ('LA PAZ', 10.387552, -73.171365, false),
    ('SAN ALBERTO', 7.76111, -73.393889, false),
    ('SAN DIEGO', 10.333039, -73.181208, false),
    ('SAN MARTÍN', 7.999855, -73.510914, false),
    ('TAMALAMEQUE', 8.861725, -73.812172, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '20'
ON CONFLICT (name, department_id) DO NOTHING;

-- CÓRDOBA (23) - 30 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('MONTERÍA', 8.759789, -75.873096, false),
    ('AYAPEL', 8.313838, -75.146048, false),
    ('BUENAVISTA', 8.221187, -75.480897, false),
    ('CANALETE', 8.786939, -76.241476, false),
    ('CERET�', 8.888532, -75.796093, false),
    ('CHIMÍ', 9.149698, -75.626886, false),
    ('CHINÍ', 9.105473, -75.399633, false),
    ('CI�NAGA DE ORO', 8.875794, -75.620807, false),
    ('COTORRA', 9.037163, -75.799216, false),
    ('LA APARTADA', 8.050125, -75.336031, false),
    ('LORICA', 9.240789, -75.816084, false),
    ('LOS CÓRDOBAS', 8.892098, -76.35518, false),
    ('MOMIL', 9.240707, -75.67796, false),
    ('MONTELÍBANO', 7.973777, -75.416818, false),
    ('MO�ITOS', 9.245223, -76.1291, false),
    ('PLANETA RICA', 8.4082, -75.583241, false),
    ('PUEBLO NUEVO', 8.504099, -75.508035, false),
    ('PUERTO ESCONDIDO', 9.005372, -76.260411, false),
    ('PUERTO LIBERTADOR', 7.888859, -75.671761, false),
    ('PURÍSIMA DE LA CONCEPCIÍN', 9.239295, -75.724987, false),
    ('SAHAGÍN', 8.943048, -75.445834, false),
    ('SAN ANDR�S DE SOTAVENTO', 9.145448, -75.50879, false),
    ('SAN ANTERO', 9.376434, -75.76112, false),
    ('SAN BERNARDO DEL VIENTO', 9.35247, -75.955107, false),
    ('SAN CARLOS', 8.799282, -75.698799, false),
    ('SAN JOS� DE UR�', 7.787303, -75.533476, false),
    ('SAN PELAYO', 8.958436, -75.835615, false),
    ('TIERRALTA', 8.170612, -76.059797, false),
    ('TUCHÍN', 9.186625, -75.553962, false),
    ('VALENCIA', 8.255016, -76.150756, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '23'
ON CONFLICT (name, department_id) DO NOTHING;

-- CUNDINAMARCA (25) - 116 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('AGUA DE DIOS', 4.375309, -74.669221, false),
    ('ALBÍN', 4.878022, -74.438261, false),
    ('ANAPOIMA', 4.562737, -74.528676, false),
    ('ANOLAIMA', 4.7617, -74.46384, false),
    ('ARBELÍEZ', 4.272534, -74.414901, false),
    ('BELTRÍN', 4.802832, -74.741666, false),
    ('BITUIMA', 4.872171, -74.539609, false),
    ('BOJACÍ', 4.737205, -74.344594, false),
    ('CABRERA', 3.985164, -74.484549, false),
    ('CACHIPAY', 4.730957, -74.435711, false),
    ('CAJICÍ', 4.920009, -74.02298, false),
    ('CAPARRAPÍ', 5.34758, -74.491045, false),
    ('CÍQUEZA', 4.404112, -73.946473, false),
    ('CARMEN DE CARUPA', 5.349119, -73.901357, false),
    ('CHAGUANÍ', 4.948916, -74.593455, false),
    ('CHÍA', 4.866508, -74.05, false),
    ('CHIPAQUE', 4.442671, -74.044876, false),
    ('CHOACHÍ', 4.527048, -73.922894, false),
    ('CHOCONTÍ', 5.145224, -73.683533, false),
    ('COGUA', 5.061842, -73.978497, false),
    ('COTA', 4.812564, -74.102569, false),
    ('CUCUNUBÍ', 5.249795, -73.766113, false),
    ('EL COLEGIO', 4.577951, -74.442261, false),
    ('EL PE�ÍN', 5.248747, -74.290207, false),
    ('EL ROSAL', 4.850589, -74.263103, false),
    ('FACATATIVÍ', 4.813353, -74.350085, false),
    ('FÍMEQUE', 4.485474, -73.892523, false),
    ('FOSCA', 4.339093, -73.93902, false),
    ('FUNZA', 4.710412, -74.201528, false),
    ('FÍQUENE', 5.403997, -73.795855, false),
    ('FUSAGASUGÍ', 4.336723, -74.37543, false),
    ('GACHALÍ', 4.693579, -73.520161, false),
    ('GACHANCIPÍ', 4.990947, -73.873464, false),
    ('GACHETÍ', 4.816411, -73.636377, false),
    ('GAMA', 4.763325, -73.611037, false),
    ('GIRARDOT', 4.313069, -74.798201, false),
    ('GRANADA', 4.519763, -74.350766, false),
    ('GUACHETÍ', 5.383378, -73.686972, false),
    ('GUADUAS', 5.072076, -74.603402, false),
    ('GUASCA', 4.866719, -73.877143, false),
    ('GUATAQUÍ', 4.517517, -74.790058, false),
    ('GUATAVITA', 4.935211, -73.83293, false),
    ('GUAYABAL DE SÍQUIMA', 4.877968, -74.467437, false),
    ('GUAYABETAL', 4.215306, -73.815107, false),
    ('GUTI�RREZ', 4.254679, -74.003042, false),
    ('JERUSAL�N', 4.562273, -74.695474, false),
    ('JUNÍN', 4.79057, -73.662961, false),
    ('LA CALERA', 4.721104, -73.968161, false),
    ('LA MESA', 4.631028, -74.461588, false),
    ('LA PALMA', 5.358816, -74.391022, false),
    ('LA PE�A', 5.198945, -74.394105, false),
    ('LA VEGA', 4.997768, -74.336885, false),
    ('LENGUAZAQUE', 5.306131, -73.711512, false),
    ('MACHETÍ', 5.08007, -73.608226, false),
    ('MADRID', 4.732791, -74.265854, false),
    ('MANTA', 5.009008, -73.540444, false),
    ('MEDINA', 4.506298, -73.348449, false),
    ('MOSQUERA', 4.70653, -74.221154, false),
    ('NARI�O', 4.399837, -74.824732, false),
    ('NEMOCÍN', 5.068705, -73.877888, false),
    ('NILO', 4.305838, -74.620009, false),
    ('NIMAIMA', 5.125992, -74.38604, false),
    ('NOCAIMA', 5.069466, -74.379093, false),
    ('VENECIA', 4.089056, -74.478301, false),
    ('PACHO', 5.136907, -74.156132, false),
    ('PAIME', 5.370487, -74.152213, false),
    ('PANDI', 4.190393, -74.486641, false),
    ('PARATEBUENO', 4.374832, -73.212825, false),
    ('PASCA', 4.308979, -74.302276, false),
    ('PUERTO SALGAR', 5.465413, -74.653695, false),
    ('PULÍ', 4.682022, -74.71438, false),
    ('QUEBRADANEGRA', 5.118076, -74.48014, false),
    ('QUETAME', 4.329884, -73.863214, false),
    ('QUIPILE', 4.74481, -74.533705, false),
    ('APULO', 4.520304, -74.593926, false),
    ('RICAURTE', 4.282113, -74.772861, false),
    ('SAN ANTONIO DEL TEQUENDAMA', 4.616138, -74.351443, false),
    ('SAN BERNARDO', 4.179433, -74.42296, false),
    ('SAN CAYETANO', 5.332938, -74.024754, false),
    ('SAN FRANCISCO', 4.972917, -74.289672, false),
    ('SAN JUAN DE RIOSECO', 4.847575, -74.621919, false),
    ('SASAIMA', 4.962167, -74.432628, false),
    ('SESQUIL�', 5.04476, -73.796099, false),
    ('SIBAT�', 4.492625, -74.257874, false),
    ('SILVANIA', 4.381981, -74.405534, false),
    ('SIMIJACA', 5.505231, -73.850703, false),
    ('SOACHA', 4.579268, -74.215463, false),
    ('SOPÍ', 4.915395, -73.943328, false),
    ('SUBACHOQUE', 4.929118, -74.172773, false),
    ('SUESCA', 5.103495, -73.798227, false),
    ('SUPATÍ', 5.06162, -74.235403, false),
    ('SUSA', 5.455291, -73.813938, false),
    ('SUTATAUSA', 5.247482, -73.853159, false),
    ('TABIO', 4.916832, -74.096461, false),
    ('TAUSA', 5.196333, -73.887813, false),
    ('TENA', 4.655286, -74.389193, false),
    ('TENJO', 4.872014, -74.143724, false),
    ('TIBACUY', 4.348605, -74.452662, false),
    ('TIBIRITA', 5.052278, -73.504514, false),
    ('TOCAIMA', 4.459279, -74.636296, false),
    ('TOCANCIPÍ', 4.964641, -73.91207, false),
    ('TOPAIPÍ', 5.336224, -74.300626, false),
    ('UBALÍ', 4.74762, -73.531489, false),
    ('UBAQUE', 4.483788, -73.933477, false),
    ('VILLA DE SAN DIEGO DE UBAT�', 5.307463, -73.814367, false),
    ('UNE', 4.40245, -74.025183, false),
    ('ÍTICA', 5.19055, -74.483154, false),
    ('VERGARA', 5.117258, -74.346163, false),
    ('VIANÍ', 4.875208, -74.56132, false),
    ('VILLAGÍMEZ', 5.273024, -74.195145, false),
    ('VILLAPINZÍN', 5.216393, -73.595704, false),
    ('VILLETA', 5.012754, -74.469686, false),
    ('VIOTÍ', 4.43935, -74.523131, false),
    ('YACOPÍ', 5.459272, -74.33806, false),
    ('ZIPACÍN', 4.759932, -74.379566, false),
    ('ZIPAQUIRÍ', 5.025477, -73.994444, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '25'
ON CONFLICT (name, department_id) DO NOTHING;

-- CHOCÓ (27) - 31 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('QUIBDÍ', 5.682166, -76.638144, false),
    ('ACANDÍ', 8.512178, -77.279951, false),
    ('ALTO BAUDÍ', 5.516221, -76.974373, false),
    ('ATRATO', 5.531419, -76.635674, false),
    ('BAGADÍ', 5.409681, -76.416063, false),
    ('BAHÍA SOLANO', 6.222807, -77.401359, false),
    ('BAJO BAUDÍ', 4.954576, -77.365717, false),
    ('BOJAYÍ', 6.559708, -76.886773, false),
    ('EL CANTÍN DEL SAN PABLO', 5.335321, -76.726844, false),
    ('CARMEN DEL DARI�N', 7.158294, -76.970798, false),
    ('C�RTEGUI', 5.371373, -76.607619, false),
    ('CONDOTO', 5.091003, -76.650683, false),
    ('EL CARMEN DE ATRATO', 5.899789, -76.142112, false),
    ('EL LITORAL DEL SAN JUAN', 4.259564, -77.363702, false),
    ('ISTMINA', 5.153946, -76.68518, false),
    ('JURADÍ', 7.103619, -77.762751, false),
    ('LLORÍ', 5.49789, -76.545147, false),
    ('MEDIO ATRATO', 5.994935, -76.783042, false),
    ('MEDIO BAUDÍ', 5.192471, -76.950891, false),
    ('MEDIO SAN JUAN', 5.098291, -76.694409, false),
    ('NÍVITA', 4.956063, -76.609467, false),
    ('NUEVO BEL�N DE BAJIRÍ', 7.3719, -76.71727, false),
    ('NUQUÍ', 5.709812, -77.265507, false),
    ('RÍO IRÍ', 5.1863, -76.472925, false),
    ('RÍO QUITO', 5.483667, -76.740684, false),
    ('RIOSUCIO', 7.436704, -77.113156, false),
    ('SAN JOS� DEL PALMAR', 4.896954, -76.234227, false),
    ('SIPÍ', 4.65262, -76.643453, false),
    ('TADÍ', 5.264873, -76.558571, false),
    ('UNGUÍA', 8.04406, -77.092538, false),
    ('UNIÍN PANAMERICANA', 5.281108, -76.630143, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '27'
ON CONFLICT (name, department_id) DO NOTHING;

-- HUILA (41) - 37 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('NEIVA', 2.935432, -75.277327, false),
    ('ACEVEDO', 1.805173, -75.888706, false),
    ('AGRADO', 2.25987, -75.772022, false),
    ('AIPE', 3.223996, -75.239017, false),
    ('ALGECIRAS', 2.521674, -75.315389, false),
    ('ALTAMIRA', 2.063841, -75.788471, false),
    ('BARAYA', 3.152204, -75.054843, false),
    ('CAMPOALEGRE', 2.686767, -75.325748, false),
    ('COLOMBIA', 3.376745, -74.802815, false),
    ('ELÍAS', 2.012854, -75.938301, false),
    ('GARZÍN', 2.196493, -75.627057, false),
    ('GIGANTE', 2.384031, -75.547681, false),
    ('GUADALUPE', 2.02426, -75.757185, false),
    ('HOBO', 2.580812, -75.447697, false),
    ('ÍQUIRA', 2.649359, -75.634497, false),
    ('ISNOS', 1.929467, -76.217637, false),
    ('LA ARGENTINA', 2.198496, -75.979763, false),
    ('LA PLATA', 2.389263, -75.891254, false),
    ('NÍTAGA', 2.5451, -75.808756, false),
    ('OPORAPA', 2.025088, -75.995165, false),
    ('PAICOL', 2.449651, -75.773158, false),
    ('PALERMO', 2.889649, -75.435296, false),
    ('PALESTINA', 1.723725, -76.133251, false),
    ('PITAL', 2.266618, -75.804544, false),
    ('PITALITO', 1.852631, -76.049441, false),
    ('RIVERA', 2.777586, -75.258753, false),
    ('SALADOBLANCO', 1.9934, -76.044747, false),
    ('SAN AGUSTÍN', 1.881081, -76.27036, false),
    ('SANTA MARÍA', 2.939603, -75.586223, false),
    ('SUAZA', 1.976051, -75.79525, false),
    ('TARQUI', 2.111325, -75.823976, false),
    ('TESALIA', 2.486364, -75.730271, false),
    ('TELLO', 3.067538, -75.138773, false),
    ('TERUEL', 2.740968, -75.567034, false),
    ('TIMANÍ', 1.974539, -75.932167, false),
    ('VILLAVIEJA', 3.218822, -75.217174, false),
    ('YAGUARÍ', 2.664694, -75.518023, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '41'
ON CONFLICT (name, department_id) DO NOTHING;

-- LA GUAJIRA (44) - 15 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('RIOHACHA', 11.528588, -72.911795, false),
    ('ALBANIA', 11.151628, -72.61232, false),
    ('BARRANCAS', 10.958669, -72.793639, false),
    ('DIBULLA', 11.27155, -73.307598, false),
    ('DISTRACCIÍN', 10.898414, -72.887405, false),
    ('EL MOLINO', 10.653505, -72.92673, false),
    ('FONSECA', 10.886734, -72.846319, false),
    ('HATONUEVO', 11.068864, -72.75904, false),
    ('LA JAGUA DEL PILAR', 10.511862, -73.072638, false),
    ('MAICAO', 11.378535, -72.242738, false),
    ('MANAURE', 11.773767, -72.438739, false),
    ('SAN JUAN DEL CESAR', 10.769546, -73.000629, false),
    ('URIBIA', 11.711904, -72.265906, false),
    ('URUMITA', 10.560169, -73.012507, false),
    ('VILLANUEVA', 10.608774, -72.977583, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '44'
ON CONFLICT (name, department_id) DO NOTHING;

-- MAGDALENA (47) - 30 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('SANTA MARTA', 11.204679, -74.199829, false),
    ('ALGARROBO', 10.188059, -74.061132, false),
    ('ARACATACA', 10.589791, -74.186702, false),
    ('ARIGUANÍ', 9.847047, -74.236515, false),
    ('CERRO DE SAN ANTONIO', 10.325531, -74.868474, false),
    ('CHIVOLO', 10.026631, -74.622242, false),
    ('CI�NAGA', 11.006654, -74.241286, false),
    ('CONCORDIA', 10.257314, -74.83303, false),
    ('EL BANCO', 9.008503, -73.97437, false),
    ('EL PI�ÍN', 10.402781, -74.823094, false),
    ('EL RET�N', 10.610488, -74.268444, false),
    ('FUNDACIÍN', 10.514146, -74.191453, false),
    ('GUAMAL', 9.144354, -74.223689, false),
    ('NUEVA GRANADA', 9.80186, -74.391841, false),
    ('PEDRAZA', 10.18825, -74.9154, false),
    ('PIJI�O DEL CARMEN', 9.331922, -74.459034, false),
    ('PIVIJAY', 10.460707, -74.613312, false),
    ('PLATO', 9.796713, -74.784549, false),
    ('PUEBLOVIEJO', 10.994766, -74.28253, false),
    ('REMOLINO', 10.701952, -74.716172, false),
    ('SABANAS DE SAN ÍNGEL', 10.032536, -74.213946, false),
    ('SALAMINA', 10.491229, -74.794189, false),
    ('SAN SEBASTIÍN DE BUENAVISTA', 9.241656, -74.351498, false),
    ('SAN ZENÍN', 9.245061, -74.498992, false),
    ('SANTA ANA', 9.324294, -74.566845, false),
    ('SANTA BÍRBARA DE PINTO', 9.432263, -74.704667, false),
    ('SITIONUEVO', 10.775285, -74.720021, false),
    ('TENERIFE', 9.898273, -74.859783, false),
    ('ZAPAYÍN', 10.168297, -74.716878, false),
    ('ZONA BANANERA', 10.763024, -74.140091, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '47'
ON CONFLICT (name, department_id) DO NOTHING;

-- META (50) - 29 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('VILLAVICENCIO', 4.126369, -73.622601, false),
    ('ACACÍAS', 3.990413, -73.766034, false),
    ('BARRANCA DE UPÍA', 4.566225, -72.961083, false),
    ('CABUYARO', 4.286705, -72.791768, false),
    ('CASTILLA LA NUEVA', 3.830005, -73.687302, false),
    ('CUBARRAL', 3.793653, -73.837999, false),
    ('CUMARAL', 4.270042, -73.487052, false),
    ('EL CALVARIO', 4.352665, -73.713325, false),
    ('EL CASTILLO', 3.563907, -73.794225, false),
    ('EL DORADO', 3.739984, -73.835264, false),
    ('FUENTE DE ORO', 3.462875, -73.618121, false),
    ('GRANADA', 3.547147, -73.705815, false),
    ('GUAMAL', 3.879657, -73.768815, false),
    ('MAPIRIPÍN', 2.896617, -72.135509, false),
    ('MESETAS', 3.382732, -74.044328, false),
    ('LA MACARENA', 2.177143, -73.78661, false),
    ('URIBE', 3.239634, -74.351508, false),
    ('LEJANÍAS', 3.525115, -74.023514, false),
    ('PUERTO CONCORDIA', 2.624006, -72.760209, false),
    ('PUERTO GAITÍN', 4.314905, -72.087649, false),
    ('PUERTO LÍPEZ', 4.09349, -72.957324, false),
    ('PUERTO LLERAS', 3.272117, -73.37385, false),
    ('PUERTO RICO', 2.939621, -73.206314, false),
    ('RESTREPO', 4.259556, -73.565408, false),
    ('SAN CARLOS DE GUAROA', 3.71065, -73.242253, false),
    ('SAN JUAN DE ARAMA', 3.373728, -73.875832, false),
    ('SAN JUANITO', 4.458181, -73.676699, false),
    ('SAN MARTÍN', 3.701899, -73.695812, false),
    ('VISTAHERMOSA', 3.125579, -73.750966, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '50'
ON CONFLICT (name, department_id) DO NOTHING;

-- NARI�O (52) - 64 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('PASTO', 1.212352, -77.278795, false),
    ('ALBÍN', 1.474978, -77.080712, false),
    ('ALDANA', 0.882381, -77.700564, false),
    ('ANCUYA', 1.263276, -77.514512, false),
    ('ARBOLEDA', 1.503418, -77.135467, false),
    ('BARBACOAS', 1.671733, -78.13765, false),
    ('BEL�N', 1.595681, -77.015619, false),
    ('BUESACO', 1.381453, -77.156463, false),
    ('COLÍN', 1.643878, -77.019777, false),
    ('CONSACÍ', 1.207854, -77.466136, false),
    ('CONTADERO', 0.910458, -77.549409, false),
    ('CÓRDOBA', 0.854564, -77.517897, false),
    ('CUASPUD CARLOSAMA', 0.862978, -77.728947, false),
    ('CUMBAL', 0.906367, -77.792505, false),
    ('CUMBITARA', 1.647163, -77.578616, false),
    ('CHACHAG�Í', 1.360545, -77.281869, false),
    ('EL CHARCO', 2.479688, -78.110217, false),
    ('EL PE�OL', 1.453567, -77.438522, false),
    ('EL ROSARIO', 1.745309, -77.33417, false),
    ('EL TABLÍN DE GÍMEZ', 1.427277, -77.097101, false),
    ('EL TAMBO', 1.407913, -77.390772, false),
    ('FUNES', 1.001159, -77.448913, false),
    ('GUACHUCAL', 0.959744, -77.731589, false),
    ('GUAITARILLA', 1.129574, -77.549824, false),
    ('GUALMATÍN', 0.919652, -77.568701, false),
    ('ILES', 0.96952, -77.521227, false),
    ('IMU�S', 1.05506, -77.496339, false),
    ('IPIALES', 0.827732, -77.646367, false),
    ('LA CRUZ', 1.601318, -76.970504, false),
    ('LA FLORIDA', 1.29753, -77.402882, false),
    ('LA LLANADA', 1.472892, -77.58091, false),
    ('LA TOLA', 2.398999, -78.189725, false),
    ('LA UNIÍN', 1.600219, -77.131316, false),
    ('LEIVA', 1.934453, -77.306135, false),
    ('LINARES', 1.350814, -77.523953, false),
    ('LOS ANDES', 1.494587, -77.521303, false),
    ('MAG�Í', 1.765633, -78.182924, false),
    ('MALLAMA', 1.141037, -77.864549, false),
    ('MOSQUERA', 2.507139, -78.452992, false),
    ('NARI�O', 1.288979, -77.357972, false),
    ('OLAYA HERRERA', 2.347457, -78.325814, false),
    ('OSPINA', 1.058433, -77.566082, false),
    ('FRANCISCO PIZARRO', 2.040629, -78.658361, false),
    ('POLICARPA', 1.627196, -77.458686, false),
    ('POTOSÍ', 0.806639, -77.573003, false),
    ('PROVIDENCIA', 1.237814, -77.596794, false),
    ('PUERRES', 0.885125, -77.504211, false),
    ('PUPIALES', 0.870442, -77.636042, false),
    ('RICAURTE', 1.212492, -77.995153, false),
    ('ROBERTO PAYÍN', 1.697492, -78.245716, false),
    ('SAMANIEGO', 1.335438, -77.594341, false),
    ('SANDONÍ', 1.283438, -77.47313, false),
    ('SAN BERNARDO', 1.513762, -77.0475, false),
    ('SAN LORENZO', 1.503362, -77.21542, false),
    ('SAN PABLO', 1.669429, -77.013984, false),
    ('SAN PEDRO DE CARTAGO', 1.551572, -77.11941, false),
    ('SANTA BÍRBARA', 2.449653, -77.979916, false),
    ('SANTACRUZ', 1.222589, -77.677035, false),
    ('SAPUYES', 1.037536, -77.62028, false),
    ('TAMINANGO', 1.570358, -77.2808, false),
    ('TANGUA', 1.09482, -77.393735, false),
    ('SAN ANDR�S DE TUMACO', 1.807399, -78.764073, false),
    ('TÍQUERRES', 1.085044, -77.61672, false),
    ('YACUANQUER', 1.115937, -77.400169, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '52'
ON CONFLICT (name, department_id) DO NOTHING;

-- NORTE DE SANTANDER (54) - 40 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('SAN JOS� DE CÍCUTA', 7.905725, -72.508178, false),
    ('ÍBREGO', 8.081616, -73.221722, false),
    ('ARBOLEDAS', 7.642985, -72.798952, false),
    ('BOCHALEMA', 7.612192, -72.64701, false),
    ('BUCARASICA', 8.041299, -72.868231, false),
    ('CÍCOTA', 7.268705, -72.642059, false),
    ('CÍCHIRA', 7.741248, -73.048983, false),
    ('CHINÍCOTA', 7.603112, -72.601162, false),
    ('CHITAGÍ', 7.138187, -72.665468, false),
    ('CONVENCIÍN', 8.470374, -73.3372, false),
    ('CUCUTILLA', 7.539633, -72.772816, false),
    ('DURANIA', 7.714804, -72.658491, false),
    ('EL CARMEN', 8.510579, -73.446687, false),
    ('EL TARRA', 8.574281, -73.09614, false),
    ('EL ZULIA', 7.938572, -72.604717, false),
    ('GRAMALOTE', 7.916946, -72.787233, false),
    ('HACARÍ', 8.321506, -73.145997, false),
    ('HERRÍN', 7.506541, -72.483519, false),
    ('LABATECA', 7.298414, -72.495983, false),
    ('LA ESPERANZA', 7.639839, -73.328126, false),
    ('LA PLAYA', 8.21124, -73.239986, false),
    ('LOS PATIOS', 7.833186, -72.505612, false),
    ('LOURDES', 7.945631, -72.832376, false),
    ('MUTISCUA', 7.300469, -72.747169, false),
    ('OCA�A', 8.248574, -73.35607, false),
    ('PAMPLONA', 7.372802, -72.647714, false),
    ('PAMPLONITA', 7.436745, -72.639111, false),
    ('PUERTO SANTANDER', 8.359993, -72.411363, false),
    ('RAGONVALIA', 7.577861, -72.476708, false),
    ('SALAZAR', 7.773683, -72.813064, false),
    ('SAN CALIXTO', 8.40214, -73.208622, true),
    ('SAN CAYETANO', 7.875695, -72.625459, false),
    ('SANTIAGO', 7.865856, -72.716203, false),
    ('SARDINATA', 8.082105, -72.800577, false),
    ('SILOS', 7.204736, -72.757128, false),
    ('TEORAMA', 8.438134, -73.28707, false),
    ('TIBÍ', 8.639891, -72.734496, false),
    ('TOLEDO', 7.307692, -72.481915, false),
    ('VILLA CARO', 7.914244, -72.973601, false),
    ('VILLA DEL ROSARIO', 7.847672, -72.469758, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '54'
ON CONFLICT (name, department_id) DO NOTHING;

-- QUINDÍO (63) - 12 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('ARMENIA', 4.53598, -75.680786, false),
    ('BUENAVISTA', 4.360029, -75.739572, false),
    ('CALARCÍ', 4.520982, -75.646085, false),
    ('CIRCASIA', 4.617759, -75.636533, false),
    ('CÓRDOBA', 4.392485, -75.687866, false),
    ('FILANDIA', 4.674338, -75.658387, false),
    ('G�NOVA', 4.206641, -75.790402, false),
    ('LA TEBAIDA', 4.453755, -75.786887, false),
    ('MONTENEGRO', 4.565057, -75.749827, false),
    ('PIJAO', 4.335036, -75.703329, false),
    ('QUIMBAYA', 4.624387, -75.765074, false),
    ('SALENTO', 4.637157, -75.570844, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '63'
ON CONFLICT (name, department_id) DO NOTHING;

-- RISARALDA (66) - 14 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('PEREIRA', 4.804985, -75.719711, true),
    ('APÍA', 5.106526, -75.942356, false),
    ('BALBOA', 4.949096, -75.958663, false),
    ('BEL�N DE UMBRÍA', 5.200793, -75.868334, false),
    ('DOSQUEBRADAS', 4.833131, -75.675371, false),
    ('GUÍTICA', 5.315367, -75.799005, false),
    ('LA CELIA', 5.002787, -76.0032, false),
    ('LA VIRGINIA', 4.896624, -75.880394, false),
    ('MARSELLA', 4.935771, -75.73879, false),
    ('MISTRATÍ', 5.297039, -75.882886, false),
    ('PUEBLO RICO', 5.222043, -76.030801, false),
    ('QUINCHÍA', 5.340456, -75.730431, false),
    ('SANTA ROSA DE CABAL', 4.876271, -75.623268, false),
    ('SANTUARIO', 5.074911, -75.964628, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '66'
ON CONFLICT (name, department_id) DO NOTHING;

-- SANTANDER (68) - 87 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('BUCARAMANGA', 7.11647, -73.132562, true),
    ('AGUADA', 6.162355, -73.523132, false),
    ('ALBANIA', 5.759166, -73.91336, false),
    ('ARATOCA', 6.694418, -73.01786, false),
    ('BARBOSA', 5.932531, -73.615965, false),
    ('BARICHARA', 6.634111, -73.223047, false),
    ('BARRANCABERMEJA', 7.064857, -73.849243, false),
    ('BETULIA', 6.899525, -73.283669, false),
    ('BOLÍVAR', 5.988953, -73.771346, false),
    ('CABRERA', 6.592118, -73.246475, false),
    ('CALIFORNIA', 7.347989, -72.946491, true),
    ('CAPITANEJO', 6.527394, -72.695427, false),
    ('CARCASÍ', 6.629016, -72.627099, false),
    ('CEPITÍ', 6.753518, -72.973536, false),
    ('CERRITO', 6.840405, -72.694851, false),
    ('CHARALÍ', 6.284339, -73.146873, false),
    ('CHARTA', 7.28082, -72.968798, false),
    ('CHIMA', 6.344348, -73.373656, false),
    ('CHIPATÍ', 6.062521, -73.637111, false),
    ('CIMITARRA', 6.320886, -73.953011, false),
    ('CONCEPCIÍN', 6.768908, -72.694567, false),
    ('CONFINES', 6.357327, -73.240554, false),
    ('CONTRATACIÍN', 6.290561, -73.474426, false),
    ('COROMORO', 6.294999, -73.040816, false),
    ('CURITÍ', 6.605099, -73.069383, false),
    ('EL CARMEN DE CHUCURÍ', 6.700038, -73.51066, false),
    ('EL GUACAMAYO', 6.245111, -73.496908, false),
    ('EL PE�ÍN', 6.05537, -73.815532, false),
    ('EL PLAYÍN', 7.470715, -73.20287, false),
    ('ENCINO', 6.137429, -73.098749, false),
    ('ENCISO', 6.668034, -72.699647, false),
    ('FLORIÍN', 5.804659, -73.97143, false),
    ('FLORIDABLANCA', 7.072329, -73.099104, false),
    ('GALÍN', 6.638423, -73.287769, false),
    ('GÍMBITA', 5.945998, -73.344185, false),
    ('GIRÍN', 7.070432, -73.166832, false),
    ('GUACA', 6.876563, -72.856322, false),
    ('GUADALUPE', 6.245847, -73.419292, false),
    ('GUAPOTÍ', 6.308635, -73.320732, false),
    ('GUAVATÍ', 5.954348, -73.700906, false),
    ('G�EPSA', 6.025013, -73.575146, false),
    ('HATO', 6.543957, -73.308399, false),
    ('JESÍS MARÍA', 5.876497, -73.783396, false),
    ('JORDÍN', 6.732727, -73.096053, false),
    ('LA BELLEZA', 5.85925, -73.965494, false),
    ('LANDÍZURI', 6.218812, -73.811359, false),
    ('LA PAZ', 6.178509, -73.58959, false),
    ('LEBRIJA', 7.113351, -73.219524, false),
    ('LOS SANTOS', 6.755203, -73.102739, false),
    ('MACARAVITA', 6.50658, -72.593105, false),
    ('MÍLAGA', 6.703081, -72.732089, false),
    ('MATANZA', 7.323175, -73.015566, false),
    ('MOGOTES', 6.475246, -72.969807, false),
    ('MOLAGAVITA', 6.67432, -72.809175, false),
    ('OCAMONTE', 6.339988, -73.122563, false),
    ('OIBA', 6.26521, -73.299791, false),
    ('ONZAGA', 6.344104, -72.816766, false),
    ('PALMAR', 6.537789, -73.29109, false),
    ('PALMAS DEL SOCORRO', 6.406139, -73.287764, false),
    ('PÍRAMO', 6.416811, -73.17022, false),
    ('PIEDECUESTA', 6.997245, -73.054795, false),
    ('PINCHOTE', 6.531552, -73.174209, false),
    ('PUENTE NACIONAL', 5.878381, -73.677567, false),
    ('PUERTO PARRA', 6.650785, -74.056129, false),
    ('PUERTO WILCHES', 7.344057, -73.899909, false),
    ('RIONEGRO', 7.265014, -73.150177, false),
    ('SABANA DE TORRES', 7.391919, -73.49906, false),
    ('SAN ANDR�S', 6.811511, -72.848864, false),
    ('SAN BENITO', 6.126656, -73.50907, false),
    ('SAN GIL', 6.551952, -73.134776, false),
    ('SAN JOAQUÍN', 6.427548, -72.867638, false),
    ('SAN JOS� DE MIRANDA', 6.658995, -72.733616, false),
    ('SAN MIGUEL', 6.575315, -72.644123, false),
    ('SAN VICENTE DE CHUCURÍ', 6.880383, -73.411024, false),
    ('SANTA BÍRBARA', 6.990996, -72.907445, false),
    ('SANTA HELENA DEL OPÍN', 6.339565, -73.616716, false),
    ('SIMACOTA', 6.443469, -73.337368, false),
    ('SOCORRO', 6.46387, -73.261198, false),
    ('SUAITA', 6.101329, -73.44165, false),
    ('SUCRE', 5.918743, -73.790975, false),
    ('SURATÍ', 7.36658, -72.984232, false),
    ('TONA', 7.201417, -72.967023, false),
    ('VALLE DE SAN JOS�', 6.448028, -73.143507, false),
    ('V�LEZ', 6.009275, -73.672447, false),
    ('VETAS', 7.30981, -72.871041, false),
    ('VILLANUEVA', 6.670078, -73.174307, false),
    ('ZAPATOCA', 6.814387, -73.268034, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '68'
ON CONFLICT (name, department_id) DO NOTHING;

-- SUCRE (70) - 26 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('SINCELEJO', 9.302322, -75.395445, false),
    ('BUENAVISTA', 9.319794, -74.972827, false),
    ('CAIMITO', 8.789324, -75.117141, false),
    ('COLOSÍ', 9.494192, -75.353256, false),
    ('COROZAL', 9.318749, -75.293048, false),
    ('COVE�AS', 9.402779, -75.680158, false),
    ('CHALÍN', 9.545352, -75.312697, false),
    ('EL ROBLE', 9.100647, -75.198378, false),
    ('GALERAS', 9.160379, -75.04959, false),
    ('GUARANDA', 8.468556, -74.537749, false),
    ('LA UNIÍN', 8.853975, -75.276056, false),
    ('LOS PALMITOS', 9.380269, -75.268716, false),
    ('MAJAGUAL', 8.541163, -74.628077, false),
    ('MORROA', 9.331395, -75.305949, false),
    ('OVEJAS', 9.527176, -75.229037, false),
    ('PALMITO', 9.333157, -75.541264, false),
    ('SAMPU�S', 9.183193, -75.380222, false),
    ('SAN BENITO ABAD', 8.930108, -75.031089, false),
    ('SAN JUAN DE BETULIA', 9.273066, -75.243565, false),
    ('SAN MARCOS', 8.661774, -75.133831, false),
    ('SAN ONOFRE', 9.736955, -75.522398, false),
    ('SAN PEDRO', 9.39625, -75.063647, false),
    ('SAN LUIS DE SINC�', 9.244308, -75.145999, false),
    ('SUCRE', 8.811737, -74.723175, false),
    ('SANTIAGO DE TOLÍ', 9.525387, -75.581112, false),
    ('SAN JOS� DE TOLUVIEJO', 9.451819, -75.44085, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '70'
ON CONFLICT (name, department_id) DO NOTHING;

-- TOLIMA (73) - 47 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('IBAGU�', 4.432248, -75.19425, false),
    ('ALPUJARRA', 3.391548, -74.9329, false),
    ('ALVARADO', 4.567356, -74.953418, false),
    ('AMBALEMA', 4.782682, -74.764429, false),
    ('ANZOÍTEGUI', 4.631756, -75.093772, false),
    ('ARMERO', 5.030744, -74.884438, false),
    ('ATACO', 3.590591, -75.382545, false),
    ('CAJAMARCA', 4.438812, -75.431971, false),
    ('CARMEN DE APICALÍ', 4.152334, -74.717633, false),
    ('CASABIANCA', 5.078465, -75.120966, false),
    ('CHAPARRAL', 3.722918, -75.480765, false),
    ('COELLO', 4.287276, -74.898464, false),
    ('COYAIMA', 3.798036, -75.193862, false),
    ('CUNDAY', 4.059259, -74.692227, false),
    ('DOLORES', 3.539072, -74.896761, false),
    ('ESPINAL', 4.151314, -74.885446, false),
    ('FALAN', 5.123104, -74.953007, false),
    ('FLANDES', 4.276373, -74.818763, false),
    ('FRESNO', 5.153576, -75.035722, false),
    ('GUAMO', 4.030992, -74.968135, false),
    ('HERVEO', 5.080228, -75.177151, false),
    ('HONDA', 5.211816, -74.75699, false),
    ('ICONONZO', 4.176487, -74.531969, false),
    ('L�RIDA', 4.862046, -74.910716, false),
    ('LÍBANO', 4.92042, -75.061959, false),
    ('SAN SEBASTIÍN DE MARIQUITA', 5.199708, -74.889276, false),
    ('MELGAR', 4.203655, -74.641317, false),
    ('MURILLO', 4.874341, -75.171022, false),
    ('NATAGAIMA', 3.624324, -75.093182, false),
    ('ORTEGA', 3.934916, -75.222601, false),
    ('PALOCABILDO', 5.120918, -75.022167, false),
    ('PIEDRAS', 4.543951, -74.878106, false),
    ('PLANADAS', 3.197911, -75.644163, false),
    ('PRADO', 3.750939, -74.927447, false),
    ('PURIFICACIÍN', 3.857246, -74.935555, false),
    ('RIOBLANCO', 3.529932, -75.644069, false),
    ('RONCESVALLES', 4.011567, -75.605959, false),
    ('ROVIRA', 4.239019, -75.240648, false),
    ('SALDA�A', 3.929815, -75.016852, false),
    ('SAN ANTONIO', 3.914146, -75.480074, false),
    ('SAN LUIS', 4.133721, -75.095804, false),
    ('SANTA ISABEL', 4.713606, -75.097934, false),
    ('SUÍREZ', 4.048891, -74.831885, false),
    ('VALLE DE SAN JUAN', 4.197494, -75.115669, false),
    ('VENADILLO', 4.717878, -74.929333, false),
    ('VILLAHERMOSA', 5.030452, -75.117729, false),
    ('VILLARRICA', 3.936902, -74.600285, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '73'
ON CONFLICT (name, department_id) DO NOTHING;

-- VALLE DEL CAUCA (76) - 42 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('SANTIAGO DE CALI', 3.413686, -76.52133, true),
    ('ALCALÍ', 4.674994, -75.779792, false),
    ('ANDALUCÍA', 4.171713, -76.167925, false),
    ('ANSERMANUEVO', 4.794984, -75.992003, false),
    ('ARGELIA', 4.726945, -76.119905, false),
    ('BOLÍVAR', 4.337846, -76.183583, false),
    ('BUENAVENTURA', 3.875708, -77.01074, false),
    ('GUADALAJARA DE BUGA', 3.900736, -76.298979, false),
    ('BUGALAGRANDE', 4.208358, -76.15682, false),
    ('CAICEDONIA', 4.334808, -75.830594, false),
    ('CALIMA', 3.933664, -76.484132, true),
    ('CANDELARIA', 3.408354, -76.346519, false),
    ('CARTAGO', 4.742192, -75.924374, false),
    ('DAGUA', 3.657318, -76.68886, false),
    ('EL ÍGUILA', 4.906062, -76.042779, false),
    ('EL CAIRO', 4.760874, -76.221611, false),
    ('EL CERRITO', 3.684229, -76.311972, false),
    ('EL DOVIO', 4.510452, -76.237084, false),
    ('FLORIDA', 3.324118, -76.234199, false),
    ('GINEBRA', 3.724181, -76.268068, false),
    ('GUACARÍ', 3.761815, -76.330911, false),
    ('JAMUNDÍ', 3.258751, -76.538472, false),
    ('LA CUMBRE', 3.649268, -76.56805, false),
    ('LA UNIÍN', 4.533869, -76.099661, false),
    ('LA VICTORIA', 4.523603, -76.036529, false),
    ('OBANDO', 4.575712, -75.974709, false),
    ('PALMIRA', 3.531544, -76.298846, false),
    ('PRADERA', 3.419793, -76.241799, false),
    ('RESTREPO', 3.821351, -76.523329, false),
    ('RIOFRÍO', 4.156908, -76.288313, false),
    ('ROLDANILLO', 4.413601, -76.152277, false),
    ('SAN PEDRO', 3.995073, -76.228692, false),
    ('SEVILLA', 4.270714, -75.931629, false),
    ('TORO', 4.608085, -76.076859, false),
    ('TRUJILLO', 4.212037, -76.318818, false),
    ('TULUÍ', 4.085399, -76.197731, false),
    ('ULLOA', 4.703623, -75.737808, false),
    ('VERSALLES', 4.575019, -76.199203, false),
    ('VIJES', 3.698686, -76.441804, false),
    ('YOTOCO', 3.861241, -76.382698, false),
    ('YUMBO', 3.540097, -76.499893, false),
    ('ZARZAL', 4.392658, -76.070795, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '76'
ON CONFLICT (name, department_id) DO NOTHING;

-- ARAUCA (81) - 7 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('ARAUCA', 7.072726, -70.747408, false),
    ('ARAUQUITA', 7.02702, -71.426733, false),
    ('CRAVO NORTE', 6.303913, -70.204286, false),
    ('FORTUL', 6.796695, -71.76877, false),
    ('PUERTO RONDÍN', 6.281461, -71.10339, false),
    ('SARAVENA', 6.953926, -71.872812, false),
    ('TAME', 6.453324, -71.754427, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '81'
ON CONFLICT (name, department_id) DO NOTHING;

-- CASANARE (85) - 19 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('YOPAL', 5.327102, -72.396132, false),
    ('AGUAZUL', 5.172641, -72.546838, false),
    ('CHÍMEZA', 5.214527, -72.87016, false),
    ('HATO COROZAL', 6.154099, -71.764213, false),
    ('LA SALINA', 6.127762, -72.334978, false),
    ('MANÍ', 4.81681, -72.281384, false),
    ('MONTERREY', 4.877017, -72.894065, false),
    ('NUNCHÍA', 5.636474, -72.195323, false),
    ('OROCU�', 4.790258, -71.338533, false),
    ('PAZ DE ARIPORO', 5.879827, -71.890348, false),
    ('PORE', 5.72773, -71.99286, false),
    ('RECETOR', 5.229181, -72.760991, false),
    ('SABANALARGA', 4.854787, -73.038696, false),
    ('SÍCAMA', 6.096738, -72.250157, false),
    ('SAN LUIS DE PALENQUE', 5.422397, -71.732198, false),
    ('TÍMARA', 5.829543, -72.16165, false),
    ('TAURAMENA', 5.018977, -72.74662, false),
    ('TRINIDAD', 5.412178, -71.662812, false),
    ('VILLANUEVA', 4.61035, -72.927797, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '85'
ON CONFLICT (name, department_id) DO NOTHING;

-- PUTUMAYO (86) - 13 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('MOCOA', 1.151172, -76.654238, false),
    ('COLÍN', 1.190133, -76.972566, false),
    ('ORITO', 0.663593, -76.873276, false),
    ('PUERTO ASÍS', 0.505627, -76.496887, false),
    ('PUERTO CAICEDO', 0.687784, -76.606118, false),
    ('PUERTO GUZMÍN', 0.962854, -76.407663, false),
    ('PUERTO LEGUÍZAMO', -0.192318, -74.781842, false),
    ('SIBUNDOY', 1.20026, -76.917814, false),
    ('SAN FRANCISCO', 1.174194, -76.879283, false),
    ('SAN MIGUEL', 0.34346, -76.91217, false),
    ('SANTIAGO', 1.147076, -77.002641, false),
    ('VALLE DEL GUAMUEZ', 0.423506, -76.906751, false),
    ('VILLAGARZÍN', 1.028821, -76.61721, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '86'
ON CONFLICT (name, department_id) DO NOTHING;

-- ARCHIPI�LAGO DE SAN ANDR�S, PROVIDENCIA Y SANTA CATALINA (88) - 2 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('SAN ANDR�S', 12.578108, -81.707181, false),
    ('PROVIDENCIA', 13.373185, -81.368386, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '88'
ON CONFLICT (name, department_id) DO NOTHING;

-- AMAZONAS (91) - 11 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('LETICIA', -4.19895, -69.941721, false),
    ('EL ENCANTO', -1.74806, -73.207114, false),
    ('LA CHORRERA', -1.442617, -72.791889, false),
    ('LA PEDRERA', -1.320301, -69.585499, false),
    ('LA VICTORIA', 0.054936, -71.223208, false),
    ('MIRITÍ - PARANÍ', -0.888833, -70.98893, false),
    ('PUERTO ALEGRÍA', -1.005674, -74.014461, false),
    ('PUERTO ARICA', -2.147039, -71.752186, false),
    ('PUERTO NARI�O', -3.779934, -70.364937, false),
    ('PUERTO SANTANDER', -0.621184, -72.384213, false),
    ('TARAPACÍ', -2.890126, -69.741745, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '91'
ON CONFLICT (name, department_id) DO NOTHING;

-- GUAINÍA (94) - 8 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('INÍRIDA', 3.866764, -67.918613, false),
    ('BARRANCOMINAS', 3.494178, -69.814066, false),
    ('SAN FELIPE', 1.912495, -67.067848, false),
    ('PUERTO COLOMBIA', 2.726438, -67.566774, false),
    ('LA GUADALUPE', 1.632464, -66.963692, false),
    ('CACAHUAL', 3.52617, -67.413312, false),
    ('PANA PANA', 1.865668, -69.0099, false),
    ('MORICHAL', 2.265132, -69.919404, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '94'
ON CONFLICT (name, department_id) DO NOTHING;

-- GUAVIARE (95) - 4 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('SAN JOS� DEL GUAVIARE', 2.565932, -72.639254, false),
    ('CALAMAR', 1.960982, -72.655197, false),
    ('EL RETORNO', 2.330164, -72.627304, false),
    ('MIRAFLORES', 1.337539, -71.950416, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '95'
ON CONFLICT (name, department_id) DO NOTHING;

-- VAUP�S (97) - 6 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('MITÍ', 1.253151, -70.232641, false),
    ('CARURÍ', 1.016116, -71.30221, false),
    ('PACOA', 0.020698, -71.004339, false),
    ('TARAIRA', -0.564984, -69.635497, false),
    ('PAPUNAHUA', 1.908124, -70.76091, false),
    ('YAVARAT�', 0.609142, -69.203337, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '97'
ON CONFLICT (name, department_id) DO NOTHING;

-- VICHADA (99) - 4 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('PUERTO CARRE�O', 6.186636, -67.487095, false),
    ('LA PRIMAVERA', 5.486309, -70.410515, false),
    ('SANTA ROSALÍA', 5.136393, -70.859499, false),
    ('CUMARIBO', 4.446352, -69.795533, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '99'
ON CONFLICT (name, department_id) DO NOTHING;

-- ANTIOQUIA (05) - 125 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('MEDELLÍN', 6.246631, -75.581775, true),
    ('ABEJORRAL', 5.789315, -75.428739, false),
    ('ABRIAQUÍ', 6.632282, -76.064304, false),
    ('ALEJANDRÍA', 6.376061, -75.141346, false),
    ('AMAGÁ', 6.038708, -75.702188, false),
    ('AMALFI', 6.909655, -75.077501, false),
    ('ANDES', 5.657194, -75.878828, false),
    ('ANGELÓPOLIS', 6.109719, -75.711389, false),
    ('ANGOSTURA', 6.885175, -75.335116, false),
    ('ANORÍ', 7.074703, -75.148355, false),
    ('SANTA F� DE ANTIOQUIA', 6.556484, -75.826648, false),
    ('ANZÍ', 6.302641, -75.854442, false),
    ('APARTADÍ', 7.882968, -76.625279, false),
    ('ARBOLETES', 8.849317, -76.426708, false),
    ('ARGELIA', 5.731474, -75.14107, false),
    ('ARMENIA', 6.155667, -75.786647, false),
    ('BARBOSA', 6.439195, -75.331627, false),
    ('BELMIRA', 6.606319, -75.667779, false),
    ('BELLO', 6.333587, -75.555245, false),
    ('BETANIA', 5.74615, -75.97679, false),
    ('BETULIA', 6.115208, -75.984452, false),
    ('CIUDAD BOLÍVAR', 5.850273, -76.021509, false),
    ('BRICE�O', 7.112803, -75.55036, false),
    ('BURITICÍ', 6.720759, -75.907, false),
    ('CÍCERES', 7.578366, -75.35205, false),
    ('CAICEDO', 6.405607, -75.98293, false),
    ('CALDAS', 6.091077, -75.633673, false),
    ('CAMPAMENTO', 6.979771, -75.298091, false),
    ('CA�ASGORDAS', 6.753859, -76.028228, false),
    ('CARACOLÍ', 6.409829, -74.757421, false),
    ('CARAMANTA', 5.54853, -75.643868, false),
    ('CAREPA', 7.755148, -76.652652, false),
    ('EL CARMEN DE VIBORAL', 6.082885, -75.333901, false),
    ('CAROLINA', 6.725995, -75.283192, false),
    ('CAUCASIA', 7.977278, -75.197996, false),
    ('CHIGORODÍ', 7.666147, -76.681531, false),
    ('CISNEROS', 6.537829, -75.087047, false),
    ('COCORNÍ', 6.058295, -75.185483, false),
    ('CONCEPCIÍN', 6.394348, -75.257587, false),
    ('CONCORDIA', 6.045738, -75.908448, false),
    ('COPACABANA', 6.348557, -75.509384, false),
    ('DABEIBA', 6.998112, -76.261614, false),
    ('DONMATÍAS', 6.485603, -75.39263, false),
    ('EB�JICO', 6.325615, -75.766413, false),
    ('EL BAGRE', 7.5975, -74.799097, false),
    ('ENTRERRÍOS', 6.566273, -75.517685, false),
    ('ENVIGADO', 6.166695, -75.582192, false),
    ('FREDONIA', 5.928039, -75.675072, false),
    ('FRONTINO', 6.776066, -76.130765, false),
    ('GIRALDO', 6.680808, -75.952158, false),
    ('GIRARDOTA', 6.379472, -75.444238, false),
    ('GÍMEZ PLATA', 6.683269, -75.220018, false),
    ('GRANADA', 6.142892, -75.184446, false),
    ('GUADALUPE', 6.815069, -75.239862, false),
    ('GUARNE', 6.27787, -75.441612, false),
    ('GUATAP�', 6.232461, -75.160041, false),
    ('HELICONIA', 6.206757, -75.734322, false),
    ('HISPANIA', 5.799461, -75.906587, false),
    ('ITAG�Í', 6.175079, -75.612056, false),
    ('ITUANGO', 7.171629, -75.764673, false),
    ('JARDÍN', 5.597542, -75.818982, false),
    ('JERICÍ', 5.789748, -75.785499, false),
    ('LA CEJA', 6.028062, -75.429433, false),
    ('LA ESTRELLA', 6.145238, -75.637708, false),
    ('LA PINTADA', 5.743808, -75.60781, false),
    ('LA UNIÍN', 5.973845, -75.360874, false),
    ('LIBORINA', 6.677316, -75.812838, false),
    ('MACEO', 6.552116, -74.78716, false),
    ('MARINILLA', 6.173995, -75.339345, false),
    ('MONTEBELLO', 5.946313, -75.523455, false),
    ('MURINDÍ', 6.97771, -76.817485, false),
    ('MUTATÍ', 7.242875, -76.435875, false),
    ('NARI�O', 5.610777, -75.176262, false),
    ('NECOCLÍ', 8.434526, -76.787271, false),
    ('NECHÍ', 8.094129, -74.77647, false),
    ('OLAYA', 6.626492, -75.811773, false),
    ('PE�OL', 6.219349, -75.242693, false),
    ('PEQUE', 7.021029, -75.910357, false),
    ('PUEBLORRICO', 5.79158, -75.839903, false),
    ('PUERTO BERRÍO', 6.487028, -74.410016, false),
    ('PUERTO NARE', 6.186025, -74.583012, false),
    ('PUERTO TRIUNFO', 5.871318, -74.64119, false),
    ('REMEDIOS', 7.029424, -74.698135, false),
    ('RETIRO', 6.062454, -75.501301, false),
    ('RIONEGRO', 6.147148, -75.377316, false),
    ('SABANALARGA', 6.850028, -75.816645, false),
    ('SABANETA', 6.149903, -75.615479, false),
    ('SALGAR', 5.964198, -75.976807, false),
    ('SAN ANDR�S DE CUERQUÍA', 6.916676, -75.674564, false),
    ('SAN CARLOS', 6.187746, -74.988097, false),
    ('SAN FRANCISCO', 5.963476, -75.101562, false),
    ('SAN JERÍNIMO', 6.44809, -75.726975, false),
    ('SAN JOS� DE LA MONTA�A', 6.85009, -75.683352, false),
    ('SAN JUAN DE URABÍ', 8.758964, -76.52857, false),
    ('SAN LUIS', 6.043017, -74.993619, false),
    ('SAN PEDRO DE LOS MILAGROS', 6.46012, -75.556743, false),
    ('SAN PEDRO DE URABÍ', 8.276884, -76.380567, false),
    ('SAN RAFAEL', 6.293759, -75.02849, false),
    ('SAN ROQUE', 6.485939, -75.019109, false),
    ('SAN VICENTE FERRER', 6.282164, -75.332616, false),
    ('SANTA BÍRBARA', 5.875527, -75.567351, false),
    ('SANTA ROSA DE OSOS', 6.643366, -75.460723, false),
    ('SANTO DOMINGO', 6.473032, -75.164903, false),
    ('EL SANTUARIO', 6.136871, -75.265465, false),
    ('SEGOVIA', 7.079648, -74.701596, false),
    ('SONSÍN', 5.714851, -75.309596, false),
    ('SOPETRÍN', 6.500745, -75.747378, false),
    ('TÍMESIS', 5.664645, -75.714429, false),
    ('TARAZÍ', 7.580127, -75.401407, false),
    ('TARSO', 5.864542, -75.822956, false),
    ('TITIRIBÍ', 6.062391, -75.791887, false),
    ('TOLEDO', 7.010328, -75.692281, false),
    ('TURBO', 8.089929, -76.728858, false),
    ('URAMITA', 6.898393, -76.173284, false),
    ('URRAO', 6.317343, -76.133951, false),
    ('VALDIVIA', 7.1652, -75.439274, false),
    ('VALPARAÍSO', 5.614555, -75.624452, false),
    ('VEGACHÍ', 6.773525, -74.798714, false),
    ('VENECIA', 5.964693, -75.735544, false),
    ('VIGÍA DEL FUERTE', 6.588164, -76.896004, false),
    ('YALÍ', 6.676554, -74.840059, false),
    ('YARUMAL', 6.963832, -75.418828, false),
    ('YOLOMBÍ', 6.594511, -75.013385, false),
    ('YONDÍ', 7.00396, -73.912445, false),
    ('ZARAGOZA', 7.488583, -74.867075, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '05'
ON CONFLICT (name, department_id) DO NOTHING;

-- ATLÁNTICO (08) - 23 municipios
INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital
FROM (
  VALUES
    ('BARRANQUILLA', 10.977961, -74.815546, true),
    ('BARANOA', 10.79445, -74.916077, false),
    ('CAMPO DE LA CRUZ', 10.378291, -74.880847, false),
    ('CANDELARIA', 10.461903, -74.879717, false),
    ('GALAPA', 10.919033, -74.870385, false),
    ('JUAN DE ACOSTA', 10.83254, -75.041032, false),
    ('LURUACO', 10.610491, -75.14199, false),
    ('MALAMBO', 10.857086, -74.776923, false),
    ('MANATÍ', 10.449089, -74.956867, false),
    ('PALMAR DE VARELA', 10.738591, -74.754765, false),
    ('PIOJÍ', 10.749216, -75.107592, false),
    ('POLONUEVO', 10.777363, -74.852981, false),
    ('PONEDERA', 10.641779, -74.753885, false),
    ('PUERTO COLOMBIA', 11.015322, -74.888627, false),
    ('REPELÍN', 10.493357, -75.125534, false),
    ('SABANAGRANDE', 10.792453, -74.759496, false),
    ('SABANALARGA', 10.632091, -74.921256, false),
    ('SANTA LUCÍA', 10.324303, -74.959204, false),
    ('SANTO TOMÍS', 10.758735, -74.757859, false),
    ('SOLEDAD', 10.909921, -74.786054, false),
    ('SUAN', 10.335432, -74.881687, false),
    ('TUBARÍ', 10.873586, -74.978704, false),
    ('USIACURÍ', 10.74298, -74.976985, false)
) AS data(name, latitude, longitude, is_capital)
CROSS JOIN departments d WHERE d.code = '08'
ON CONFLICT (name, department_id) DO NOTHING;

-- Verificar inserción final
SELECT 
    d.name as departamento,
    COUNT(c.id) as municipios_insertados
FROM departments d
LEFT JOIN cities c ON c.department_id = d.id
GROUP BY d.name, d.code
ORDER BY d.code;
