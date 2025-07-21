import blink from '@/blink/client'
import { parseCSVLine, parseGPS } from './csvImporter'

export const autoImportAllLieux = async () => {
  try {
    // Charger le fichier CSV depuis public
    const response = await fetch('/lieux_a_voir.csv')
    if (!response.ok) {
      throw new Error('Impossible de charger le fichier CSV')
    }
    
    const csvContent = await response.text()
    const lines = csvContent.split('\n').filter(line => line.trim())
    const dataLines = lines.slice(1) // Skip header
    
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    
    // Obtenir l'utilisateur actuel
    const user = await blink.auth.me()
    if (!user) {
      throw new Error('Utilisateur non connecté')
    }
    
    console.log(`🚀 Début de l'import automatique de ${dataLines.length} lieux...`)
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i]
      const lieu = parseCSVLine(line)
      
      if (!lieu || !lieu.lieu.trim()) {
        errorCount++
        continue
      }
      
      // Vérifier si le lieu existe déjà
      try {
        const existingLieux = await blink.db.lieux.list({
          where: { nom: lieu.lieu.trim() },
          limit: 1
        })
        
        if (existingLieux.length > 0) {
          skippedCount++
          continue
        }
      } catch (error) {
        console.warn('Erreur lors de la vérification:', error)
      }
      
      // Parse GPS coordinates
      const gpsCoords = parseGPS(lieu.gps)
      
      try {
        await blink.db.lieux.create({
          id: `lieu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nom: lieu.lieu.trim(),
          region: lieu.region.trim(),
          departement: lieu.departement.trim(),
          typeLieu: lieu.typeLieu.trim(),
          tarif: lieu.tarif.trim(),
          latitude: gpsCoords?.latitude || 0,
          longitude: gpsCoords?.longitude || 0,
          gps: lieu.gps.trim(),
          lienUtile: lieu.lienUtile.trim(),
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        successCount++
        
        // Log progress every 50 items
        if ((i + 1) % 50 === 0) {
          console.log(`📊 Progression: ${i + 1}/${dataLines.length} traités (${successCount} succès, ${errorCount} erreurs, ${skippedCount} ignorés)`)
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 10))
        
      } catch (error) {
        console.error(`❌ Erreur lors de l'import du lieu "${lieu.lieu}":`, error)
        errorCount++
      }
    }
    
    const result = {
      successCount,
      errorCount,
      skippedCount,
      total: dataLines.length
    }
    
    console.log(`✅ Import terminé!`, result)
    return result
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import automatique:', error)
    throw error
  }
}

export const clearAllLieux = async () => {
  try {
    const user = await blink.auth.me()
    if (!user) {
      throw new Error('Utilisateur non connecté')
    }
    
    // Supprimer tous les lieux de l'utilisateur
    const allLieux = await blink.db.lieux.list({
      where: { userId: user.id }
    })
    
    for (const lieu of allLieux) {
      await blink.db.lieux.delete(lieu.id)
    }
    
    return { deletedCount: allLieux.length }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    throw error
  }
}