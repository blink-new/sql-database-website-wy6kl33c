import { useState, useEffect } from 'react'
import { Map, MapPin, Navigation, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import blink from '@/blink/client'
import { Lieu } from '@/types/lieu'

export default function CartePage() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const loadLieux = async () => {
    try {
      const user = await blink.auth.me()
      const data = await blink.db.lieux.list({
        where: { userId: user.id },
        orderBy: { nom: 'asc' }
      })
      setLieux(data)
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLieux()
  }, [])

  const filteredLieux = selectedRegion === 'all' 
    ? lieux 
    : lieux.filter(lieu => lieu.region === selectedRegion)

  const getUniqueRegions = () => {
    return [...new Set(lieux.map(lieu => lieu.region))].sort()
  }

  const generateGoogleMapsUrl = (lieu: Lieu) => {
    return `https://www.google.com/maps/search/?api=1&query=${lieu.latitude},${lieu.longitude}`
  }

  const generateGoogleMapsAllUrl = () => {
    if (filteredLieux.length === 0) return '#'
    
    const waypoints = filteredLieux
      .slice(1) // Skip first point (it will be the destination)
      .map(lieu => `${lieu.latitude},${lieu.longitude}`)
      .join('|')
    
    const destination = `${filteredLieux[0].latitude},${filteredLieux[0].longitude}`
    
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&waypoints=${waypoints}&travelmode=driving`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carte interactive</h1>
        <p className="text-gray-600">
          Visualisez vos {lieux.length} lieux touristiques sur la carte
        </p>
      </div>

      {/* Filtres et actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5" />
            <span>Filtres et navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filtrer par région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {getUniqueRegions().map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">
                {filteredLieux.length} lieu(x) affiché(s)
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => window.open(generateGoogleMapsAllUrl(), '_blank')}
                disabled={filteredLieux.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Itinéraire complet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carte simulée et liste des lieux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Zone carte (simulée) */}
        <div className="lg:col-span-2">
          <Card className="h-96 lg:h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulation d'une carte */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-20 right-20 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-20 left-20 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-10 right-10 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="text-center z-10">
                  <Map className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Carte interactive</h3>
                  <p className="text-gray-600 mb-4">
                    {filteredLieux.length} marqueurs affichés
                  </p>
                  <p className="text-sm text-gray-500">
                    Cliquez sur un lieu dans la liste pour le voir sur Google Maps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des lieux */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Lieux sur la carte</h3>
          
          {filteredLieux.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Aucun lieu à afficher</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredLieux.map((lieu, index) => (
                <Card key={lieu.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1 truncate">
                          {lieu.nom}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {lieu.region}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{lieu.latitude.toFixed(4)}, {lieu.longitude.toFixed(4)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(generateGoogleMapsUrl(lieu), '_blank')}
                        >
                          <Navigation className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{lieu.typeLieu}</span>
                        <span className={`font-medium ${
                          lieu.tarif.toLowerCase().includes('gratuit') 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {lieu.tarif}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistiques de la carte */}
      {filteredLieux.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Statistiques de la région</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{filteredLieux.length}</div>
                <div className="text-sm text-gray-600">Lieux total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredLieux.filter(l => l.tarif.toLowerCase().includes('gratuit')).length}
                </div>
                <div className="text-sm text-gray-600">Gratuits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredLieux.filter(l => !l.tarif.toLowerCase().includes('gratuit')).length}
                </div>
                <div className="text-sm text-gray-600">Payants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(filteredLieux.map(l => l.typeLieu)).size}
                </div>
                <div className="text-sm text-gray-600">Types différents</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}