import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import blink from '@/blink/client'
import Header from '@/components/layout/Header'
import HomePage from '@/pages/HomePage'
import ExplorerPage from '@/pages/ExplorerPage'
import AjouterPage from '@/pages/AjouterPage'
import CartePage from '@/pages/CartePage'

type Page = 'accueil' | 'explorer' | 'ajouter' | 'carte'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('accueil')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🗺️ Lieux à Voir</h1>
          <p className="text-gray-600 mb-8">Découvrez et gérez votre collection de lieux touristiques français</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'accueil':
        return <HomePage />
      case 'explorer':
        return <ExplorerPage />
      case 'ajouter':
        return <AjouterPage />
      case 'carte':
        return <CartePage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} user={user} />
      <main className="pt-16">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  )
}

export default App