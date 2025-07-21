import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Map, MapPin, Navigation, Layers, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import blink from '@/blink/client'
import { Lieu } from '@/types/lieu'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Composant pour ajuster la vue de la carte
function MapBounds({ lieux }: { lieux: Lieu[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (lieux.length > 0) {
      const bounds = L.latLngBounds(
        lieux.map(lieu => [lieu.latitude, lieu.longitude])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [lieux, map])
  
  return null
}

export default function CartePage() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const loadLieux = async () => {
    try {
      // Charger tous les lieux (système + utilisateur)
      const data = await blink.db.lieux.list({
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

  const filteredLieux = lieux.filter(lieu => {
    const regionMatch = selectedRegion === 'all' || lieu.region === selectedRegion
    const typeMatch = selectedType === 'all' || lieu.typeLieu === selectedType
    return regionMatch && typeMatch
  })

  const getUniqueRegions = () => {
    return [...new Set(lieux.map(lieu => lieu.region))].sort()
  }

  const getUniqueTypes = () => {
    return [...new Set(lieux.map(lieu => lieu.typeLieu))].sort()
  }

  const generateGoogleMapsUrl = (lieu: Lieu) => {
    return `https://www.google.com/maps/search/?api=1&query=${lieu.latitude},${lieu.longitude}`
  }

  const generateGoogleMapsAllUrl = () => {
    if (filteredLieux.length === 0) return '#'
    
    const waypoints = filteredLieux
      .slice(1, 10) // Limite à 9 waypoints (limite Google Maps)
      .map(lieu => `${lieu.latitude},${lieu.longitude}`)
      .join('|')
    
    const destination = `${filteredLieux[0].latitude},${filteredLieux[0].longitude}`
    
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&waypoints=${waypoints}&travelmode=driving`
  }

  // Créer des icônes colorées selon le type
  const getMarkerIcon = (typeLieu: string) => {
    const colors: { [key: string]: string } = {
      'Château': '#8B5CF6',
      'Monument historique': '#EF4444',
      'Musée': '#3B82F6',
      'Parc naturel': '#10B981',
      'Plage': '#06B6D4',
      'Site naturel': '#84CC16',
      'Village': '#F59E0B',
      'Montagne': '#6B7280'
    }
    
    const color = colors[typeLieu] || '#6366F1'
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
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
          Explorez {lieux.length} lieux touristiques français sur une carte interactive
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
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
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {getUniqueTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                Itinéraire Google Maps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carte interactive */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Zone carte */}
        <div className="lg:col-span-3">
          <Card className="h-96 lg:h-[600px]">
            <CardContent className="p-0 h-full">
              {filteredLieux.length > 0 ? (
                <MapContainer
                  center={[46.603354, 1.888334]} // Centre de la France
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapBounds lieux={filteredLieux} />
                  
                  {filteredLieux.map((lieu) => (
                    <Marker
                      key={lieu.id}
                      position={[lieu.latitude, lieu.longitude]}
                      icon={getMarkerIcon(lieu.typeLieu)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[250px]">
                          <h3 className="font-semibold text-gray-900 mb-2">{lieu.nom}</h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Région:</span> {lieu.region}</p>
                            <p><span className="font-medium">Département:</span> {lieu.departement}</p>
                            <p><span className="font-medium">Type:</span> {lieu.typeLieu}</p>
                            <p><span className="font-medium">Tarif:</span> 
                              <span className={`ml-1 ${
                                lieu.tarif.toLowerCase().includes('gratuit') 
                                  ? 'text-green-600 font-medium' 
                                  : 'text-orange-600 font-medium'
                              }`}>
                                {lieu.tarif}
                              </span>
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => window.open(generateGoogleMapsUrl(lieu), '_blank')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Directions
                            </Button>
                            {lieu.lienUtile && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(lieu.lienUtile, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Site web
                              </Button>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun lieu à afficher</h3>
                    <p className="text-gray-600">
                      Modifiez vos filtres pour voir des lieux sur la carte
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panneau latéral avec légende et statistiques */}
        <div className="space-y-6">
          {/* Légende des couleurs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Légende</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getUniqueTypes().slice(0, 8).map((type) => {
                  const colors: { [key: string]: string } = {
                    'Château': '#8B5CF6',
                    'Monument historique': '#EF4444',
                    'Musée': '#3B82F6',
                    'Parc naturel': '#10B981',
                    'Plage': '#06B6D4',
                    'Site naturel': '#84CC16',
                    'Village': '#F59E0B',
                    'Montagne': '#6B7280'
                  }
                  const color = colors[type] || '#6366F1'
                  
                  return (
                    <div key={type} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-sm text-gray-700">{type}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{filteredLieux.length}</div>
                  <div className="text-sm text-gray-600">Lieux affichés</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {filteredLieux.filter(l => l.tarif.toLowerCase().includes('gratuit')).length}
                    </div>
                    <div className="text-xs text-gray-600">Gratuits</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-600">
                      {filteredLieux.filter(l => !l.tarif.toLowerCase().includes('gratuit')).length}
                    </div>
                    <div className="text-xs text-gray-600">Payants</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {new Set(filteredLieux.map(l => l.region)).size}
                  </div>
                  <div className="text-xs text-gray-600">Régions représentées</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setSelectedRegion('all')
                  setSelectedType('all')
                }}
              >
                <Map className="h-4 w-4 mr-2" />
                Réinitialiser les filtres
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setSelectedType('Château')}
              >
                <span className="w-4 h-4 mr-2 rounded-full bg-purple-500"></span>
                Voir tous les châteaux
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setSelectedType('Parc naturel')}
              >
                <span className="w-4 h-4 mr-2 rounded-full bg-green-500"></span>
                Voir les parcs naturels
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}