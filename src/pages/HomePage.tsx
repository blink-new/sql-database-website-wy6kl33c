import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Building, Mountain, TreePine, Star } from 'lucide-react'
import blink from '@/blink/client'
import { Lieu } from '@/types/lieu'
import { setupScrollAnimations, animateStats } from '@/utils/animations'

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 0,
    monuments: 0,
    nature: 0,
    chateaux: 0,
    regions: 0
  })
  const [recentLieux, setRecentLieux] = useState<Lieu[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      
      // Charger tous les lieux pour les statistiques
      const allLieux = await blink.db.lieux.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })

      // Calculer les statistiques
      const uniqueRegions = new Set(allLieux.map(lieu => lieu.region)).size
      const monuments = allLieux.filter(lieu => 
        lieu.typeLieu.toLowerCase().includes('monument') || 
        lieu.typeLieu.toLowerCase().includes('historique')
      ).length
      const nature = allLieux.filter(lieu => 
        lieu.typeLieu.toLowerCase().includes('nature') || 
        lieu.typeLieu.toLowerCase().includes('parc') ||
        lieu.typeLieu.toLowerCase().includes('montagne')
      ).length
      const chateaux = allLieux.filter(lieu => 
        lieu.typeLieu.toLowerCase().includes('château')
      ).length

      setStats({
        total: allLieux.length,
        monuments,
        nature,
        chateaux,
        regions: uniqueRegions
      })

      // Prendre les 6 lieux les plus récents
      setRecentLieux(allLieux.slice(0, 6))
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  const importCSVData = async () => {
    setImporting(true)
    setImportMessage('Chargement du fichier CSV...')
    
    try {
      const user = await blink.auth.me()
      
      // Importer depuis le fichier CSV
      const { loadCSVFromPublic, importCSVData: processCSV } = await import('@/utils/csvImporter')
      
      setImportMessage('Lecture des données...')
      const csvContent = await loadCSVFromPublic()
      
      setImportMessage('Import des lieux en cours...')
      const result = await processCSV(csvContent, user.id)
      
      setImportMessage(`✅ Import terminé ! ${result.successCount} lieux importés avec succès${result.errorCount > 0 ? `, ${result.errorCount} erreurs` : ''}.`)
      
      // Recharger les données
      setTimeout(() => {
        loadData()
        setImportMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      setImportMessage('❌ Erreur lors de l\'import du fichier CSV')
      setTimeout(() => setImportMessage(''), 5000)
    } finally {
      setImporting(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // Initialiser les animations après le chargement
    const cleanup = setupScrollAnimations()
    
    return cleanup
  }, [])

  useEffect(() => {
    // Animer les statistiques quand elles changent
    if (stats.total > 0) {
      animateStats(stats)
    }
  }, [stats])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section amélioré */}
      <div className="hero-header">
        <div className="hero-content container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 animate-on-scroll">
            🗺️ Les Trésors de France
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto animate-on-scroll">
            Découvrez les plus beaux lieux à visiter dans chaque région
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll">
            <button className="btn-enhanced text-white px-8 py-3 text-lg">
              <MapPin className="inline-block w-5 h-5 mr-2" />
              Explorer par région
            </button>
            <button className="bg-white bg-opacity-20 text-white font-medium px-8 py-3 rounded-full hover:bg-opacity-30 transition-all duration-300">
              <Star className="inline-block w-5 h-5 mr-2" />
              Lieux gratuits
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistiques améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="location-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total des lieux</CardTitle>
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900" data-stat="total">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="location-card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Monuments</CardTitle>
              <Building className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900" data-stat="monuments">{stats.monuments}</div>
            </CardContent>
          </Card>

          <Card className="location-card bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Sites naturels</CardTitle>
              <TreePine className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900" data-stat="nature">{stats.nature}</div>
            </CardContent>
          </Card>

          <Card className="location-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Régions</CardTitle>
              <Mountain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900" data-stat="regions">{stats.regions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lieux récents avec design amélioré */}
        <div className="mb-12">
          <h2 className="section-title text-3xl font-bold text-gray-900">
            ⭐ Lieux récemment ajoutés
          </h2>
          {recentLieux.length === 0 ? (
            <Card className="text-center py-12 location-card">
              <CardContent>
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lieu ajouté</h3>
                <p className="text-gray-600">Commencez par ajouter vos premiers lieux touristiques !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentLieux.map((lieu) => (
                <Card key={lieu.id} className="location-card hover-effect">
                  <div className="relative">
                    <div className="card-img-top bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                      🏛️
                    </div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="badge-enhanced badge-region">{lieu.region}</span>
                      <span className="badge-enhanced badge-type">{lieu.typeLieu}</span>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between">
                      <span className="truncate">{lieu.nom}</span>
                      <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Département:</span> {lieu.departement}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tarif:</span> {lieu.tarif}
                      </p>
                      {lieu.lienUtile && (
                        <a
                          href={lieu.lienUtile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Voir plus d'infos
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Call to action amélioré */}
        <div className="text-center rounded-xl p-8 text-white relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))'
        }}>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">🚀 Prêt à explorer ?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Découvrez tous vos lieux ou ajoutez-en de nouveaux à votre collection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 font-medium px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                🗺️ Explorer les lieux
              </button>
              <button className="bg-blue-700 text-white font-medium px-8 py-4 rounded-full hover:bg-blue-800 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                ➕ Ajouter un lieu
              </button>
              {stats.total === 0 && (
                <button 
                  onClick={importCSVData}
                  disabled={importing}
                  className="bg-orange-600 text-white font-medium px-8 py-4 rounded-full hover:bg-orange-700 transition-all duration-300 hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? '⏳ Import en cours...' : '📥 Importer les lieux CSV'}
                </button>
              )}
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        </div>

        {/* Message d'import */}
        {importMessage && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-blue-800 font-medium">{importMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}