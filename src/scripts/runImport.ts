// Script pour exécuter l'import automatique
import { autoImportAllLieux } from '../utils/autoImport'

// Fonction pour exécuter l'import
export const executeImport = async () => {
  try {
    console.log('🚀 Démarrage de l\'import automatique...')
    const result = await autoImportAllLieux()
    console.log('✅ Import terminé!', result)
    return result
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error)
    throw error
  }
}

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).executeImport = executeImport
}