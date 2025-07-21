export interface Lieu {
  id: string
  nom: string
  region: string
  departement: string
  typeLieu: string
  tarif: string
  latitude: number
  longitude: number
  gps: string
  lienUtile: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface LieuFormData {
  nom: string
  region: string
  departement: string
  typeLieu: string
  tarif: string
  latitude: number
  longitude: number
  gps: string
  lienUtile: string
}