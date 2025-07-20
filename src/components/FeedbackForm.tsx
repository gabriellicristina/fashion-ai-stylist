'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'

interface FeedbackFormProps {
  lookId?: string
  onFeedbackSubmitted?: () => void
}

interface FeedbackStats {
  totalFeedbacks: number
  approvedSuggestions: number
  rejectedSuggestions: number
  approvalRate: number
}

export default function FeedbackForm({ lookId, onFeedbackSubmitted }: FeedbackFormProps) {
  const [rating, setRating] = useState<'approve' | 'reject' | ''>('')
  const [comments, setComments] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>('')
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/feedback')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setRecentFeedbacks(data.feedbacks.slice(0, 5)) // Last 5 feedbacks
      }
    } catch (err) {
      console.error('Error fetching feedback stats:', err)
    }
  }

  useEffect(() => {
    fetchStats()

    // Listen for feedback events from LookSuggestions component
    const handleFeedbackEvent = (event: CustomEvent) => {
      const { lookId: eventLookId, rating: eventRating } = event.detail
      setRating(eventRating)
      if (eventLookId && !lookId) {
        // If no specific lookId is set, use the one from the event
        handleSubmitFeedback(eventLookId, eventRating, '')
      }
    }

    window.addEventListener('feedback', handleFeedbackEvent as EventListener)
    
    return () => {
      window.removeEventListener('feedback', handleFeedbackEvent as EventListener)
    }
  }, [lookId])

  const handleSubmitFeedback = async (targetLookId?: string, targetRating?: string, targetComments?: string) => {
    const finalLookId = targetLookId || lookId
    const finalRating = targetRating || rating
    const finalComments = targetComments !== undefined ? targetComments : comments

    if (!finalLookId || !finalRating) {
      setError('Look ID e avaliação são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess(false)

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lookId: finalLookId,
          rating: finalRating,
          comments: finalComments
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar feedback')
      }

      setSuccess(true)
      setRating('')
      setComments('')
      
      // Refresh stats
      await fetchStats()

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted()
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError(err instanceof Error ? err.message : 'Erro ao enviar feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = () => {
    handleSubmitFeedback()
  }

  return (
    <div className="space-y-6">
      {/* Feedback Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Feedback</CardTitle>
            <CardDescription>
              Como você tem avaliado as sugestões de looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalFeedbacks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total de Avaliações
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.approvedSuggestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Aprovadas
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejectedSuggestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Rejeitadas
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(stats.approvalRate)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Taxa de Aprovação
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form */}
      {lookId && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliar Look</CardTitle>
            <CardDescription>
              Sua avaliação nos ajuda a melhorar as sugestões futuras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Como você avalia esta sugestão?</Label>
              <RadioGroup value={rating} onValueChange={(value) => setRating(value as 'approve' | 'reject')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approve" id="approve" />
                  <Label htmlFor="approve" className="cursor-pointer">
                    👍 Gostei - Vou usar esta combinação
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label htmlFor="reject" className="cursor-pointer">
                    👎 Não gostei - Não combina comigo
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comentários (Opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Conte-nos o que achou da sugestão, o que poderia melhorar, etc..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-700 dark:text-green-400">
                  ✓ Feedback enviado com sucesso! Obrigado pela sua avaliação.
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!rating || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Enviando...' : 'Enviar Feedback'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedbacks */}
      {recentFeedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Recentes</CardTitle>
            <CardDescription>
              Suas últimas avaliações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={feedback.rating === 'approve' ? 'default' : 'destructive'}
                      >
                        {feedback.rating === 'approve' ? '👍 Aprovado' : '👎 Rejeitado'}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(feedback.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {feedback.comments && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        "{feedback.comments}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Better Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas para Feedback Efetivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Seja específico sobre o que gostou ou não gostou</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Mencione se as cores combinam bem</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Comente sobre a adequação à ocasião</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Sugira melhorias ou alternativas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
