'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClothingItem } from '@/lib/aiFashionClient'

interface FashionGalleryProps {
  refreshTrigger?: number
}

export default function FashionGallery({ refreshTrigger }: FashionGalleryProps) {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const [stats, setStats] = useState<any>(null)
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [styleFilter, setStyleFilter] = useState<string>('all')
  const [seasonFilter, setSeasonFilter] = useState<string>('all')

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clothing-classify')
      const data = await response.json()
      
      if (data.success) {
        setItems(data.items)
        setFilteredItems(data.items)
        setStats(data.stats)
      } else {
        setError('Erro ao carregar itens')
      }
    } catch (err) {
      console.error('Error fetching items:', err)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [refreshTrigger])

  useEffect(() => {
    // Apply filters
    let filtered = items

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.type.toLowerCase().includes(typeFilter.toLowerCase())
      )
    }

    if (styleFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.styles.some(style => 
          style.toLowerCase().includes(styleFilter.toLowerCase())
        )
      )
    }

    if (seasonFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.season.some(season => 
          season.toLowerCase().includes(seasonFilter.toLowerCase())
        )
      )
    }

    setFilteredItems(filtered)
  }, [items, typeFilter, styleFilter, seasonFilter])

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/clothing-classify?id=${itemId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setItems(prev => prev.filter(item => item.id !== itemId))
        setSelectedItem(null)
      } else {
        setError('Erro ao remover item')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      setError('Erro ao remover item')
    }
  }

  const getUniqueValues = (key: keyof ClothingItem) => {
    const values = new Set<string>()
    items.forEach(item => {
      if (Array.isArray(item[key])) {
        (item[key] as string[]).forEach(value => values.add(value))
      } else if (typeof item[key] === 'string') {
        values.add(item[key] as string)
      }
    })
    return Array.from(values).sort()
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando peças...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalItems}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total de Peças
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.keys(stats.typeDistribution).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tipos Diferentes
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(stats.styleDistribution).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Estilos Únicos
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.totalSuggestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Looks Criados
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {getUniqueValues('type').map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Estilo</label>
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estilos</SelectItem>
                  {getUniqueValues('styles').map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Estação</label>
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as estações</SelectItem>
                  {getUniqueValues('season').map(season => (
                    <SelectItem key={season} value={season}>{season}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Peças ({filteredItems.length})</CardTitle>
          <CardDescription>
            Clique em uma peça para ver mais detalhes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {items.length === 0 
                  ? 'Nenhuma peça cadastrada ainda'
                  : 'Nenhuma peça encontrada com os filtros aplicados'
                }
              </p>
              {items.length === 0 && (
                <p className="text-gray-500 dark:text-gray-500 mt-2">
                  Cadastre sua primeira peça usando o formulário acima
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          <img
                            src={item.imageUrl}
                            alt={item.type}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{item.type}</h3>
                          
                          <div className="flex flex-wrap gap-1">
                            {item.colors.slice(0, 3).map((color, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                            {item.colors.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.colors.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {item.styles.slice(0, 2).map((style, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {style}
                              </Badge>
                            ))}
                            {item.styles.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.styles.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{item.type}</DialogTitle>
                      <DialogDescription>
                        Cadastrado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <img
                          src={item.imageUrl}
                          alt={item.type}
                          className="w-full rounded-lg shadow-md"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Cores</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.colors.map((color, index) => (
                              <Badge key={index} variant="secondary">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Estilos</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.styles.map((style, index) => (
                              <Badge key={index} variant="outline">
                                {style}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Estações</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.season.map((season, index) => (
                              <Badge key={index} variant="secondary">
                                {season}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Ocasiões</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.occasion.map((occasion, index) => (
                              <Badge key={index} variant="outline">
                                {occasion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {item.description && (
                          <div>
                            <h4 className="font-semibold mb-2">Descrição</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        )}
                        
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteItem(item.id)}
                          className="w-full"
                        >
                          Remover Peça
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
