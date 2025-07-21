import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, MapPin, ExternalLink, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import blink from '@/blink/client'
import { Lieu } from '@/types/lieu'

export default function ExplorerPage() {
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [filteredLieux, setFilteredLieux] = useState<Lieu[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedTarif, setSelectedTarif] = useState<string>('all')

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

  const filterLieux = useCallback(() => {
    let filtered = [...lieux]

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(lieu =>
        lieu.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.departement.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par région
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(lieu => lieu.region === selectedRegion)
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(lieu => lieu.typeLieu === selectedType)
    }

    // Filtre par tarif
    if (selectedTarif !== 'all') {
      if (selectedTarif === 'gratuit') {
        filtered = filtered.filter(lieu => 
          lieu.tarif.toLowerCase().includes('gratuit')
        )
      } else if (selectedTarif === 'payant') {
        filtered = filtered.filter(lieu => 
          !lieu.tarif.toLowerCase().includes('gratuit')
        )
      }
    }

    setFilteredLieux(filtered)
  }, [lieux, searchTerm, selectedRegion, selectedType, selectedTarif])

  useEffect(() => {
    loadLieux()
  }, [])

  useEffect(() => {
    filterLieux()
  }, [filterLieux])

  const getUniqueValues = (field: keyof Lieu) => {
    return [...new Set(lieux.map(lieu => lieu[field]))].sort()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedRegion('all')
    setSelectedType('all')
    setSelectedTarif('all')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explorer les lieux</h1>
        <p className="text-gray-600">
          Découvrez votre collection de {lieux.length} lieux touristiques français
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres de recherche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un lieu, région..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Région */}
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {getUniqueValues('region').map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {getUniqueValues('typeLieu').map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tarif */}
            <Select value={selectedTarif} onValueChange={setSelectedTarif}>
              <SelectTrigger>
                <SelectValue placeholder="Tarif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tarifs</SelectItem>
                <SelectItem value="gratuit">Gratuit</SelectItem>
                <SelectItem value="payant">Payant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {filteredLieux.length} lieu(x) trouvé(s)
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {filteredLieux.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lieu trouvé</h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche ou d'ajouter de nouveaux lieux
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLieux.map((lieu) => (
            <Card key={lieu.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <CardTitle className="text-lg flex items-start justify-between">
                  <span className="truncate group-hover:text-blue-600 transition-colors">
                    {lieu.nom}
                  </span>
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{lieu.region} - {lieu.departement}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Type:</span>{' '}
                      <span className="text-gray-600">{lieu.typeLieu}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Tarif:</span>{' '}
                      <span className={`font-medium ${
                        lieu.tarif.toLowerCase().includes('gratuit') 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        {lieu.tarif}
                      </span>
                    </p>
                  </div>

                  {lieu.lienUtile && (
                    <a
                      href={lieu.lienUtile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Site officiel</span>
                    </a>
                  )}

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      GPS: {lieu.latitude.toFixed(4)}, {lieu.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}