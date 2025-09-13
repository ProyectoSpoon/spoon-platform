const fs = require('fs');
const path = require('path');

// Función para corregir caracteres mal codificados
function fixEncoding(text) {
    return text
        .replace(/MEDELL\?N/g, 'MEDELLÍN')
        .replace(/BOGOT\?, D\.C\./g, 'BOGOTÁ D.C.')
        .replace(/BOGOT\?/g, 'BOGOTÁ')
        .replace(/ABRIAQU\?/g, 'ABRIAQUÍ') 
        .replace(/ALEJANDR\?A/g, 'ALEJANDRÍA')
        .replace(/AMAG\?/g, 'AMAGÁ')
        .replace(/ANGEL\?POLIS/g, 'ANGELÓPOLIS')
        .replace(/ANOR\?/g, 'ANORÍ')
        .replace(/BOL\?VAR/g, 'BOLÍVAR')
        .replace(/BOYAC\?/g, 'BOYACÁ')
        .replace(/CAQUET\?/g, 'CAQUETÁ')
        .replace(/C\?RDOBA/g, 'CÓRDOBA')
        .replace(/NARI\?O/g, 'NARIÑO')
        .replace(/QUIND\?O/g, 'QUINDÍO')
        .replace(/ATL\?NTICO/g, 'ATLÁNTICO')
        .replace(/CHOC\?/g, 'CHOCÓ')
        .replace(/GUAIN\?A/g, 'GUAINÍA')
        .replace(/VAUP\?S/g, 'VAUPÉS')
        // Reemplazos generales para caracteres especiales
        .replace(/\?/g, 'Í')
        .replace(/\?/g, 'Á') 
        .replace(/\?/g, 'É')
        .replace(/\?/g, 'Ó')
        .replace(/\?/g, 'Ú')
        .replace(/\?/g, 'Ñ');
}

// Leer el archivo CSV
const csvPath = path.join(__dirname, '../documentacion modulos/Departamentos_Municipios.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Procesar las líneas
const lines = csvContent.split('\n');
const municipalities = [];
const departments = new Set();

// Empezar desde la línea 7 (después de los headers)
for (let i = 7; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(';');
    if (parts.length >= 7) {
        const deptCode = parts[0];
        const deptName = fixEncoding(parts[1]);
        const municCode = parts[2];
        const municName = fixEncoding(parts[3]);
        const type = parts[4];
        const longitude = parts[5].replace(',', '.');
        const latitude = parts[6].replace(',', '.');
        
        if (deptCode && deptName && municCode && municName && longitude && latitude) {
            departments.add(`${deptCode};${deptName}`);
            municipalities.push({
                deptCode,
                deptName,
                municCode,
                municName,
                type,
                longitude: parseFloat(longitude),
                latitude: parseFloat(latitude)
            });
        }
    }
}

console.log(`🏛️ Departamentos encontrados: ${departments.size}`);
console.log(`🏘️ Municipios encontrados: ${municipalities.length}`);

// Generar SQL para municipios
let sqlContent = `-- ========================================
-- IMPORTACIÓN DE MUNICIPIOS DE COLOMBIA
-- Generado automáticamente desde CSV
-- ========================================

`;

// Agrupar por departamento para facilitar la inserción
const municipalitiesByDept = {};
municipalities.forEach(muni => {
    if (!municipalitiesByDept[muni.deptCode]) {
        municipalitiesByDept[muni.deptCode] = [];
    }
    municipalitiesByDept[muni.deptCode].push(muni);
});

// Generar SQL
for (const deptCode in municipalitiesByDept) {
    const deptMunicipalities = municipalitiesByDept[deptCode];
    const deptName = deptMunicipalities[0].deptName;
    
    sqlContent += `
-- ${deptName} (${deptCode})
DO $$
DECLARE
    dept_id UUID;
BEGIN
    -- Obtener ID del departamento
    SELECT id INTO dept_id FROM departments WHERE code = '${deptCode}';
    
    IF dept_id IS NOT NULL THEN
`;

    deptMunicipalities.forEach(muni => {
        const cleanName = muni.municName.replace(/'/g, "''"); // Escapar comillas
        
        // Determinar si es capital (principales ciudades)
        const isCapital = cleanName.includes('MEDELLÍN') || 
                         cleanName.includes('BOGOTÁ D.C.') || 
                         cleanName.includes('CALI') || 
                         cleanName.includes('BARRANQUILLA') ||
                         cleanName.includes('CARTAGENA DE INDIAS') ||
                         cleanName.includes('BUCARAMANGA') ||
                         cleanName.includes('PEREIRA') ||
                         cleanName.includes('MANIZALES') ||
                         cleanName.includes('IBAGUÉ') ||
                         cleanName.includes('VILLAVICENCIO') ||
                         cleanName.includes('NEIVA') ||
                         cleanName.includes('ARMENIA') ||
                         cleanName.includes('MONTERÍA') ||
                         cleanName.includes('SINCELEJO') ||
                         cleanName.includes('VALLEDUPAR') ||
                         cleanName.includes('SANTA MARTA') ||
                         cleanName.includes('RIOHACHA') ||
                         cleanName.includes('TUNJA') ||
                         cleanName.includes('FLORENCIA') ||
                         cleanName.includes('POPAYÁN') ||
                         cleanName.includes('QUIBDÓ') ||
                         cleanName.includes('CUCUTA') ||
                         cleanName.includes('ARAUCA') ||
                         cleanName.includes('YOPAL') ||
                         cleanName.includes('MOCOA') ||
                         cleanName.includes('LETICIA') ||
                         cleanName.includes('INÍRIDA') ||
                         cleanName.includes('SAN JOSÉ DEL GUAVIARE') ||
                         cleanName.includes('MITÚ') ||
                         cleanName.includes('PUERTO CARREÑO') ||
                         cleanName.includes('SAN ANDRÉS');
        
        sqlContent += `
        -- ${cleanName}
        INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)
        VALUES (
            gen_random_uuid(),
            '${cleanName}',
            dept_id,
            ${muni.latitude},
            ${muni.longitude},
            ${isCapital}
        ) ON CONFLICT (name, department_id) DO NOTHING;
`;
    });

    sqlContent += `
    END IF;
END $$;
`;
}

sqlContent += `
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
`;

// Escribir archivo SQL
const outputPath = path.join(__dirname, '../scripts/import-colombia-municipalities.sql');
fs.writeFileSync(outputPath, sqlContent);

console.log(`✅ Archivo SQL generado: ${outputPath}`);
console.log(`📊 Resumen:`);
console.log(`   - Departamentos: ${departments.size}`);
console.log(`   - Municipios: ${municipalities.length}`);

// Mostrar algunos ejemplos
console.log(`\n🏘️ Primeros 10 municipios:`);
municipalities.slice(0, 10).forEach(muni => {
    console.log(`   ${muni.deptName} > ${muni.municName} (${muni.latitude}, ${muni.longitude})`);
});
