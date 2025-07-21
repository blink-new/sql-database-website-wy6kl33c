import blink from '@/blink/client'

export interface LieuCSV {
  lieu: string
  region: string
  departement: string
  typeLieu: string
  tarif: string
  gps: string
  lienUtile: string
}

export const parseCSVLine = (line: string): LieuCSV | null => {
  // Split by semicolon and handle quoted fields
  const fields = line.split(';').map(field => field.trim().replace(/^"|"$/g, ''))
  
  if (fields.length < 7) return null
  
  return {
    lieu: fields[0],
    region: fields[1],
    departement: fields[2],
    typeLieu: fields[3],
    tarif: fields[4],
    gps: fields[5],
    lienUtile: fields[6]
  }
}

export const parseGPS = (gpsString: string): { latitude: number, longitude: number } | null => {
  try {
    // Format: "48.6361, -1.5115" ou "GPS (lat, long)"
    const cleanGps = gpsString.replace(/GPS \(lat, long\)/g, '').trim()
    if (!cleanGps) return null
    
    const coords = cleanGps.split(',').map(coord => parseFloat(coord.trim()))
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return {
        latitude: coords[0],
        longitude: coords[1]
      }
    }
    return null
  } catch {
    return null
  }
}

export const importCSVData = async (csvContent: string, userId: string) => {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const dataLines = lines.slice(1) // Skip header
  
  const importedLieux = []
  let successCount = 0
  let errorCount = 0
  
  for (const line of dataLines) {
    const lieu = parseCSVLine(line)
    if (!lieu) {
      errorCount++
      continue
    }
    
    // Parse GPS coordinates
    const gpsCoords = parseGPS(lieu.gps)
    
    try {
      const result = await blink.db.lieux.create({
        id: `lieu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nom: lieu.lieu,
        region: lieu.region,
        departement: lieu.departement,
        typeLieu: lieu.typeLieu,
        tarif: lieu.tarif,
        latitude: gpsCoords?.latitude || 0,
        longitude: gpsCoords?.longitude || 0,
        gps: lieu.gps,
        lienUtile: lieu.lienUtile,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      importedLieux.push(result)
      successCount++
    } catch (error) {
      console.error('Erreur lors de l\'import du lieu:', lieu.lieu, error)
      errorCount++
    }
  }
  
  return {
    imported: importedLieux,
    successCount,
    errorCount,
    total: dataLines.length
  }
}

export const loadCSVFromPublic = async (): Promise<string> => {
  try {
    const response = await fetch('/lieux_a_voir.csv')
    if (!response.ok) {
      throw new Error('Impossible de charger le fichier CSV')
    }
    return await response.text()
  } catch (error) {
    console.error('Erreur lors du chargement du CSV:', error)
    throw error
  }
}