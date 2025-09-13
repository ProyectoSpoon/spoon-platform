// Script optimizado para generar SQL de municipios
const fs = require('fs');
const path = require('path');

// Función para corregir encoding
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
        .replace(/\?/g, 'Í')
        .replace(/\?/g, 'Á') 
        .replace(/\?/g, 'É')
        .replace(/\?/g, 'Ó')
        .replace(/\?/g, 'Ú')
        .replace(/\?/g, 'Ñ');
}

// Leer CSV
const csvPath = path.join(__dirname, '../documentacion modulos/Departamentos_Municipios.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');
const municipalities = [];

// Procesar CSV
for (let i = 7; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(';');
    if (parts.length >= 7) {
        const deptCode = parts[0];
        const deptName = fixEncoding(parts[1]);
        const municCode = parts[2];
        const municName = fixEncoding(parts[3]);
        const longitude = parseFloat(parts[5].replace(',', '.'));
        const latitude = parseFloat(parts[6].replace(',', '.'));
        
        if (deptCode && municName && !isNaN(longitude) && !isNaN(latitude)) {
            municipalities.push({
                deptCode, deptName, municCode, municName, longitude, latitude
            });
        }
    }
}

console.log(`🏘️ Municipios procesados: ${municipalities.length}`);

// Generar SQL simple y eficiente
let sqlContent = `-- ========================================
-- IMPORTACIÓN OPTIMIZADA DE MUNICIPIOS
-- Inserción por lotes para mayor eficiencia
-- ========================================

`;

// Agrupar por departamento
const municipalitiesByDept = {};
municipalities.forEach(muni => {
    if (!municipalitiesByDept[muni.deptCode]) {
        municipalitiesByDept[muni.deptCode] = [];
    }
    municipalitiesByDept[muni.deptCode].push(muni);
});

// Generar INSERT por departamento
for (const deptCode in municipalitiesByDept) {
    const deptMunicipalities = municipalitiesByDept[deptCode];
    const deptName = deptMunicipalities[0].deptName;
    
    sqlContent += `-- ${deptName} (${deptCode}) - ${deptMunicipalities.length} municipios\n`;
    sqlContent += `INSERT INTO cities (id, name, department_id, latitude, longitude, is_capital)\n`;
    sqlContent += `SELECT gen_random_uuid(), data.name, d.id, data.latitude, data.longitude, data.is_capital\n`;
    sqlContent += `FROM (\n  VALUES\n`;
    
    deptMunicipalities.forEach((muni, index) => {
        const cleanName = muni.municName.replace(/'/g, "''");
        const isCapital = cleanName.includes('MEDELLÍN') || 
                         cleanName.includes('BOGOTÁ D.C.') || 
                         cleanName.includes('CALI') || 
                         cleanName.includes('BARRANQUILLA') ||
                         cleanName.includes('CARTAGENA DE INDIAS') ||
                         cleanName.includes('BUCARAMANGA') ||
                         cleanName.includes('PEREIRA') ||
                         cleanName.includes('MANIZALES');
        
        sqlContent += `    ('${cleanName}', ${muni.latitude}, ${muni.longitude}, ${isCapital})`;
        sqlContent += index < deptMunicipalities.length - 1 ? ',\n' : '\n';
    });
    
    sqlContent += `) AS data(name, latitude, longitude, is_capital)\n`;
    sqlContent += `CROSS JOIN departments d WHERE d.code = '${deptCode}'\n`;
    sqlContent += `ON CONFLICT (name, department_id) DO NOTHING;\n\n`;
}

sqlContent += `-- Verificar inserción final
SELECT 
    d.name as departamento,
    COUNT(c.id) as municipios_insertados
FROM departments d
LEFT JOIN cities c ON c.department_id = d.id
GROUP BY d.name, d.code
ORDER BY d.code;
`;

// Guardar archivo
const outputPath = path.join(__dirname, 'import-municipalities-optimized.sql');
fs.writeFileSync(outputPath, sqlContent);

console.log('✅ Archivo SQL optimizado generado');
console.log('📁 Archivo:', outputPath);
console.log('📊 Departamentos:', Object.keys(municipalitiesByDept).length);
