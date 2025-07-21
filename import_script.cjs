// Script d'import direct des lieux depuis le CSV
const fs = require('fs');
const path = require('path');

// Lire le fichier CSV
const csvPath = path.join(__dirname, 'public', 'lieux_a_voir.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parser le CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const dataLines = lines.slice(1); // Skip header

console.log(`📊 Fichier CSV chargé: ${dataLines.length} lieux à traiter`);

// Fonction pour parser une ligne CSV
function parseCSVLine(line) {
  const fields = line.split(';').map(field => field.trim().replace(/^"|"$/g, ''));
  
  if (fields.length < 7) return null;
  
  return {
    lieu: fields[0],
    region: fields[1],
    departement: fields[2],
    typeLieu: fields[3],
    tarif: fields[4],
    gps: fields[5],
    lienUtile: fields[6]
  };
}

// Fonction pour parser les coordonnées GPS
function parseGPS(gpsString) {
  try {
    const cleanGps = gpsString.replace(/GPS \(lat, long\)/g, '').trim();
    if (!cleanGps) return null;
    
    const coords = cleanGps.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return {
        latitude: coords[0],
        longitude: coords[1]
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Traiter les données
const processedLieux = [];
let errorCount = 0;

for (let i = 0; i < dataLines.length; i++) {
  const line = dataLines[i];
  const lieu = parseCSVLine(line);
  
  if (!lieu || !lieu.lieu.trim()) {
    errorCount++;
    continue;
  }
  
  const gpsCoords = parseGPS(lieu.gps);
  
  const processedLieu = {
    id: `lieu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nom: lieu.lieu.trim(),
    region: lieu.region.trim(),
    departement: lieu.departement.trim(),
    type_lieu: lieu.typeLieu.trim(),
    tarif: lieu.tarif.trim(),
    latitude: gpsCoords?.latitude || 0,
    longitude: gpsCoords?.longitude || 0,
    gps: lieu.gps.trim(),
    lien_utile: lieu.lienUtile.trim(),
    user_id: 'OU4g9e9XB0hNV1e9bJ7dUmbpJV73', // ID utilisateur du projet
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  processedLieux.push(processedLieu);
}

console.log(`✅ Traitement terminé: ${processedLieux.length} lieux traités, ${errorCount} erreurs`);

// Générer les requêtes SQL d'insertion
const sqlInserts = processedLieux.map(lieu => {
  const values = [
    `'${lieu.id}'`,
    `'${lieu.nom.replace(/'/g, "''")}'`,
    `'${lieu.region.replace(/'/g, "''")}'`,
    `'${lieu.departement.replace(/'/g, "''")}'`,
    `'${lieu.type_lieu.replace(/'/g, "''")}'`,
    `'${lieu.tarif.replace(/'/g, "''")}'`,
    lieu.latitude,
    lieu.longitude,
    `'${lieu.gps.replace(/'/g, "''")}'`,
    `'${lieu.lien_utile.replace(/'/g, "''")}'`,
    `'${lieu.user_id}'`,
    `'${lieu.created_at}'`,
    `'${lieu.updated_at}'`
  ];
  
  return `INSERT OR IGNORE INTO lieux (id, nom, region, departement, type_lieu, tarif, latitude, longitude, gps, lien_utile, user_id, created_at, updated_at) VALUES (${values.join(', ')});`;
});

// Écrire le fichier SQL
const sqlContent = sqlInserts.join('\n');
fs.writeFileSync('import_lieux.sql', sqlContent);

console.log(`📝 Fichier SQL généré: import_lieux.sql avec ${sqlInserts.length} requêtes d'insertion`);
console.log('🚀 Vous pouvez maintenant exécuter ce fichier SQL pour importer tous les lieux');