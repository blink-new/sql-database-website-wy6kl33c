import blink from '@/blink/client'

export interface LieuCSV {
  lieu: string
  region: string
  departement: string
  typeLieu: string
  tarif: string
  latitude: number
  longitude: number
  gps: string
  lienUtile: string
}

export const parseCSVLine = (line: string): LieuCSV | null => {
  // Split by semicolon and handle quoted fields
  const fields = line.split(';').map(field => field.trim().replace(/^"|"$/g, ''))
  
  if (fields.length < 9) return null
  
  const latitude = parseFloat(fields[5])
  const longitude = parseFloat(fields[6])
  
  if (isNaN(latitude) || isNaN(longitude)) return null
  
  return {
    lieu: fields[0],
    region: fields[1],
    departement: fields[2],
    typeLieu: fields[3],
    tarif: fields[4],
    latitude,
    longitude,
    gps: fields[7],
    lienUtile: fields[8]
  }
}

export const importCSVData = async (csvContent: string, userId: string) => {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const header = lines[0] // Skip header
  const dataLines = lines.slice(1)
  
  const importedLieux = []
  
  for (const line of dataLines) {
    const lieu = parseCSVLine(line)
    if (!lieu) continue
    
    try {
      const result = await blink.db.lieux.create({
        id: `lieu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nom: lieu.lieu,
        region: lieu.region,
        departement: lieu.departement,
        typeLieu: lieu.typeLieu,
        tarif: lieu.tarif,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
        gps: lieu.gps,
        lienUtile: lieu.lienUtile,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      importedLieux.push(result)
    } catch (error) {
      console.error('Erreur lors de l\'import du lieu:', lieu.lieu, error)
    }
  }
  
  return importedLieux
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