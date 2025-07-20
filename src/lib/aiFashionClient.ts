// Types for the AI Fashion Client
export interface ClothingItem {
  id: string
  imageUrl: string
  type: string
  colors: string[]
  styles: string[]
  season: string[]
  occasion: string[]
  description?: string
  createdAt: Date
}

export interface ClassificationResult {
  type: string
  colors: string[]
  styles: string[]
  season: string[]
  occasion: string[]
  confidence: number
  description: string
}

export interface LookContext {
  occasion: string
  season: string
  weather?: string
  preferredStyles?: string[]
  excludeItems?: string[]
}

export interface LookSuggestion {
  id: string
  title: string
  description: string
  items: string[]
  reasoning: string
  tips: string[]
  confidence: number
}

// AI Fashion Client Class
class AIFashionClient {
  private apiKey: string
  private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions'
  private model: string = 'openai/gpt-4o'

  constructor() {
    this.apiKey = process.env.AI_API_KEY || ''
    if (!this.apiKey) {
      console.warn('AI_API_KEY not found in environment variables')
    }
  }

  private async makeRequest(messages: any[]): Promise<any> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured')
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:8000',
          'X-Title': 'Fashion AI Stylist'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content
    } catch (error) {
      console.error('AI API request failed:', error)
      throw error
    }
  }

  async analyzeClothingImage(imageData: string): Promise<ClassificationResult> {
    const systemPrompt = `Você é um especialista em moda e estilo. Analise a imagem de roupa fornecida e classifique-a detalhadamente.

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "type": "tipo da peça (ex: camisa, calça, vestido, sapato, etc.)",
  "colors": ["cor1", "cor2", "cor3"],
  "styles": ["estilo1", "estilo2"],
  "season": ["primavera", "verão", "outono", "inverno"],
  "occasion": ["casual", "formal", "esportivo", "festa", "trabalho"],
  "confidence": 0.95,
  "description": "descrição detalhada da peça"
}

Estilos disponíveis: Streetwear, Casual, Clássico, Chic/Elegante, Boho-Chic, Vintage, Esportivo, Minimalista

Seja preciso e considere:
- Tipo exato da peça
- Cores predominantes
- Estilos que a peça representa
- Estações apropriadas
- Ocasiões de uso
- Confiança na análise (0-1)`

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analise esta peça de roupa e classifique-a conforme as instruções.' },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      }
    ]

    try {
      const response = await this.makeRequest(messages)
      const result = JSON.parse(response)
      
      return {
        type: result.type || 'Não identificado',
        colors: result.colors || [],
        styles: result.styles || [],
        season: result.season || [],
        occasion: result.occasion || [],
        confidence: result.confidence || 0.5,
        description: result.description || 'Análise não disponível'
      }
    } catch (error) {
      console.error('Error analyzing clothing image:', error)
      throw new Error('Falha na análise da imagem. Tente novamente.')
    }
  }

  async generateLookSuggestion(context: LookContext, availableItems: ClothingItem[]): Promise<LookSuggestion> {
    const systemPrompt = `Você é um consultor de moda especializado em criar looks harmoniosos. 

Baseado no contexto fornecido e nas peças disponíveis no guarda-roupa do usuário, crie uma sugestão de look completo.

Considere:
- Harmonia de cores
- Adequação à ocasião
- Estação/clima
- Proporções e texturas
- Estilo pessoal

Retorne APENAS um JSON válido:
{
  "id": "look_unique_id",
  "title": "Nome do Look",
  "description": "Descrição completa do look sugerido",
  "items": ["id1", "id2", "id3"],
  "reasoning": "Explicação da escolha das peças",
  "tips": ["dica1", "dica2", "dica3"],
  "confidence": 0.9
}`

    const itemsDescription = availableItems.map(item => 
      `ID: ${item.id}, Tipo: ${item.type}, Cores: ${item.colors.join(', ')}, Estilos: ${item.styles.join(', ')}, Descrição: ${item.description || 'N/A'}`
    ).join('\n')

    const contextDescription = `
Ocasião: ${context.occasion}
Estação: ${context.season}
Clima: ${context.weather || 'N/A'}
Estilos preferidos: ${context.preferredStyles?.join(', ') || 'Qualquer'}
Itens a evitar: ${context.excludeItems?.join(', ') || 'Nenhum'}
`

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Crie um look para o seguinte contexto:
${contextDescription}

Peças disponíveis:
${itemsDescription}

Crie uma combinação harmoniosa e adequada.`
      }
    ]

    try {
      const response = await this.makeRequest(messages)
      const result = JSON.parse(response)
      
      return {
        id: result.id || `look_${Date.now()}`,
        title: result.title || 'Look Sugerido',
        description: result.description || 'Look criado especialmente para você',
        items: result.items || [],
        reasoning: result.reasoning || 'Combinação baseada em harmonia de cores e estilo',
        tips: result.tips || [],
        confidence: result.confidence || 0.7
      }
    } catch (error) {
      console.error('Error generating look suggestion:', error)
      throw new Error('Falha na geração de sugestão. Tente novamente.')
    }
  }
}

// Export singleton instance
export const aiFashionClient = new AIFashionClient()
