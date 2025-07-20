'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LookSuggestion, ClothingItem } from '@/lib/aiFashionClient'

interface LookSuggestionsProps {
  refreshTrigger?: number
}

export default function LookSuggestions({ refreshTrigger }: LookSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<(LookSuggestion & { itemDetails?: ClothingItem[] })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  
  // Form state for generating new suggestions
  const [occasion, setOccasion] = useState<string>('')
  const [season, setSeason] = useState<string>('')
  const [weather, setWeather] = useState<string>('')
  const [preferredStyles, setPreferredStyles] = useState<string>('')

  const OCCASIONS = [
    'Trabalho', 'Casual', 'Formal', 'Festa', 'Esportivo', 'Viagem', 
    'Encontro', 'Reunião', 'Evento Social', 'Casa'
  ]

  const SEASONS = ['Primavera', 'Verão', 'Outono', 'Inverno']
  
  const WEATHER_CONDITIONS = [
    'Ensolarado', 'Nublado', 'Chuvoso', 'Frio', 'Quente', 'Ameno', 'Ventoso'
  ]

  const FASHION_STYLES = [
    'Streetwear', 'Casual', 'Clássico', 'Chic/Elegante', 'Boho-Chic', 
    'Vintage', 'Esportivo', 'Minimalista'
  ]

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/generate-look')
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.suggestions)
      } else {
        setError('Erro ao carregar sugestões')
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const generateNewLook = async () => {
    if (!occasion || !season) {
      setError('Ocasião e estação são obrigatórios')
      return
    }

    try {
      setGenerating(true)
      setError('')
      
      const requestBody = {
        occasion,
        season,
        weather: weather || undefined,
        preferredStyles: preferredStyles || undefined
      }

      const response = await fetch('/api/generate-look', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro na geração do look')
      }

      // Add new suggestion to the list
      const newSuggestion = {
        ...data.suggestion,
        itemDetails: data.items
      }
      
      setSuggestions(prev => [newSuggestion, ...prev])
      
      // Reset form
      setOccasion('')
      setSeason('')
      setWeather('')
      setPreferredStyles('')

    } catch (err) {
      console.error('Error generating look:', err)
      setError(err instanceof Error ? err.message : 'Erro na geração do look')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [refreshTrigger])

  return (
    <div className="space-y-6">
      {/* Look Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Nova Sugestão de Look</CardTitle>
          <CardDescription>
            Informe o contexto para receber uma sugestão personalizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="occasion">Ocasião *</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ocasião" />
                </SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map(occ => (
                    <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Estação *</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a estação" />
                </SelectTrigger>
                <SelectContent>
                  {SEASONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weather">Clima (Opcional)</Label>
              <Select value={weather} onValueChange={setWeather}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o clima" />
                </SelectTrigger>
                <SelectContent>
                  {WEATHER_CONDITIONS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="styles">Estilos Preferidos (Opcional)</Label>
              <Select value={preferredStyles} onValueChange={setPreferredStyles}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione estilos" />
                </SelectTrigger>
                <SelectContent>
                  {FASHION_STYLES.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            onClick={generateNewLook}
            disabled={generating || !occasion || !season}
            className="w-full"
            size="lg"
          >
            {generating ? 'Gerando Look...' : 'Gerar Sugestão de Look'}
          </Button>
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <CardTitle>Sugestões de Looks</CardTitle>
          <CardDescription>
            Suas sugestões de looks geradas pela IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando sugestões...</p>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Nenhuma sugestão de look ainda
              </p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                Gere sua primeira sugestão usando o formulário acima
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                        <CardDescription className="mt-2">
                          Confiança: {Math.round(suggestion.confidence * 100)}%
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {suggestion.items.length} peças
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-2">Descrição do Look</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {suggestion.description}
                      </p>
                    </div>

                    {/* Items */}
                    {suggestion.itemDetails && suggestion.itemDetails.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Peças Sugeridas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {suggestion.itemDetails.map((item) => (
                            <Card key={item.id} className="border">
                              <CardContent className="p-4">
                                <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.type}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <h5 className="font-medium">{item.type}</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {item.colors.slice(0, 2).map((color, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {color}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {item.styles.slice(0, 2).map((style, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {style}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reasoning */}
                    <div>
                      <h4 className="font-semibold mb-2">Por que esta combinação?</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {suggestion.reasoning}
                      </p>
                    </div>

                    {/* Tips */}
                    {suggestion.tips && suggestion.tips.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Dicas de Styling</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                          {suggestion.tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Feedback Section */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Avalie esta sugestão</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => {
                            // This will be handled by the FeedbackForm component
                            const event = new CustomEvent('feedback', {
                              detail: { lookId: suggestion.id, rating: 'approve' }
                            })
                            window.dispatchEvent(event)
                          }}
                        >
                          👍 Gostei
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            const event = new CustomEvent('feedback', {
                              detail: { lookId: suggestion.id, rating: 'reject' }
                            })
                            window.dispatchEvent(event)
                          }}
                        >
                          👎 Não gostei
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
