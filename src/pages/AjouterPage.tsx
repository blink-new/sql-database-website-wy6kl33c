import { useState } from 'react'
import { Plus, MapPin, Save, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import blink from '@/blink/client'
import { LieuFormData } from '@/types/lieu'

export default function AjouterPage() {
  const [formData, setFormData] = useState<LieuFormData>({
    nom: '',
    region: '',
    departement: '',
    typeLieu: '',
    tarif: '',
    latitude: 0,
    longitude: 0,
    lienUtile: ''
  })
  const [loading, setLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const { toast } = useToast()

  const regions = [
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    'Île-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    'Provence-Alpes-Côte d\'Azur'
  ]

  const typesLieux = [
    'Monument historique',
    'Château',
    'Musée',
    'Site naturel',
    'Parc naturel',
    'Montagne',
    'Ville fortifiée',
    'Cathédrale',
    'Nature / Canyon',
    'Autre'
  ]

  const handleInputChange = (field: keyof LieuFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nom || !formData.region || !formData.typeLieu) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const user = await blink.auth.me()
      
      await blink.db.lieux.create({
        id: `lieu_${Date.now()}`,
        nom: formData.nom,
        region: formData.region,
        departement: formData.departement,
        typeLieu: formData.typeLieu,
        tarif: formData.tarif || 'Non spécifié',
        latitude: formData.latitude,
        longitude: formData.longitude,
        lienUtile: formData.lienUtile,
        userId: user.id
      })

      toast({
        title: 'Succès',
        description: 'Le lieu a été ajouté avec succès !',
      })

      // Reset form
      setFormData({
        nom: '',
        region: '',
        departement: '',
        typeLieu: '',
        tarif: '',
        latitude: 0,
        longitude: 0,
        lienUtile: ''
      })
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout du lieu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const importFromCSV = async () => {
    setImportLoading(true)
    try {
      const user = await blink.auth.me()
      
      // Lire le fichier CSV
      const response = await fetch('/lieux_a_voir.csv')
      const csvText = await response.text()
      
      // Parser le CSV (simple parsing)
      const lines = csvText.split('\n').slice(1) // Skip header
      let imported = 0
      
      for (const line of lines) {
        if (!line.trim()) continue
        
        const parts = line.split(';')
        if (parts.length < 7) continue
        
        const [nom, region, departement, typeLieu, tarif, gps, lienUtile] = parts
        
        // Parser GPS coordinates
        const gpsMatch = gps.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
        const latitude = gpsMatch ? parseFloat(gpsMatch[1]) : 0
        const longitude = gpsMatch ? parseFloat(gpsMatch[2]) : 0
        
        try {
          await blink.db.lieux.create({
            id: `lieu_${Date.now()}_${imported}`,
            nom: nom.trim(),
            region: region.trim(),
            departement: departement.trim(),
            typeLieu: typeLieu.trim(),
            tarif: tarif.trim(),
            latitude,
            longitude,
            lienUtile: lienUtile.trim(),
            userId: user.id
          })
          imported++
        } catch (error) {
          console.error('Erreur lors de l\'import d\'un lieu:', error)
        }
      }
      
      toast({
        title: 'Import terminé',
        description: `${imported} lieux ont été importés avec succès !`,
      })
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      toast({
        title: 'Erreur d\'import',
        description: 'Une erreur est survenue lors de l\'import du fichier CSV',
        variant: 'destructive'
      })
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajouter un lieu</h1>
        <p className="text-gray-600">
          Enrichissez votre collection avec de nouveaux lieux touristiques
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Nouveau lieu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom du lieu */}
                <div>
                  <Label htmlFor="nom">Nom du lieu *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Ex: Mont Saint-Michel"
                    required
                  />
                </div>

                {/* Région et Département */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Région *</Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une région" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="departement">Département</Label>
                    <Input
                      id="departement"
                      value={formData.departement}
                      onChange={(e) => handleInputChange('departement', e.target.value)}
                      placeholder="Ex: Manche (50)"
                    />
                  </div>
                </div>

                {/* Type et Tarif */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="typeLieu">Type de lieu *</Label>
                    <Select value={formData.typeLieu} onValueChange={(value) => handleInputChange('typeLieu', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typesLieux.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tarif">Tarif</Label>
                    <Input
                      id="tarif"
                      value={formData.tarif}
                      onChange={(e) => handleInputChange('tarif', e.target.value)}
                      placeholder="Ex: Gratuit, 15 €"
                    />
                  </div>
                </div>

                {/* Coordonnées GPS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 48.6361"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                      placeholder="Ex: -1.5115"
                    />
                  </div>
                </div>

                {/* Lien utile */}
                <div>
                  <Label htmlFor="lienUtile">Lien utile</Label>
                  <Input
                    id="lienUtile"
                    type="url"
                    value={formData.lienUtile}
                    onChange={(e) => handleInputChange('lienUtile', e.target.value)}
                    placeholder="https://www.site-officiel.com"
                  />
                </div>

                {/* Bouton de soumission */}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Ajouter le lieu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Import CSV */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Import rapide</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Importez tous les lieux depuis le fichier CSV fourni
              </p>
              <Button 
                onClick={importFromCSV} 
                disabled={importLoading}
                variant="outline" 
                className="w-full"
              >
                {importLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer le CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Aide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Conseils</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Coordonnées GPS :</strong> Utilisez Google Maps pour obtenir les coordonnées précises
                </p>
                <p>
                  <strong>Tarif :</strong> Indiquez "Gratuit" ou le prix d'entrée
                </p>
                <p>
                  <strong>Lien utile :</strong> Site officiel ou page d'information
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}