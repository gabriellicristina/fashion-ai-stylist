import { ClothingItem, LookSuggestion } from './aiFashionClient'

// Simple in-memory storage for development
class MockDatabase {
  private clothingItems: ClothingItem[] = []
  private lookSuggestions: LookSuggestion[] = []
  private feedbacks: Array<{
    id: string
    lookId: string
    rating: 'approve' | 'reject'
    comments: string
    timestamp: Date
  }> = []

  // Clothing Items Methods
  addClothingItem(item: Omit<ClothingItem, 'id' | 'createdAt'>): ClothingItem {
    const newItem: ClothingItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }
    this.clothingItems.push(newItem)
    return newItem
  }

  getAllClothingItems(): ClothingItem[] {
    return [...this.clothingItems]
  }

  getClothingItemById(id: string): ClothingItem | undefined {
    return this.clothingItems.find(item => item.id === id)
  }

  updateClothingItem(id: string, updates: Partial<ClothingItem>): ClothingItem | null {
    const index = this.clothingItems.findIndex(item => item.id === id)
    if (index === -1) return null
    
    this.clothingItems[index] = { ...this.clothingItems[index], ...updates }
    return this.clothingItems[index]
  }

  deleteClothingItem(id: string): boolean {
    const index = this.clothingItems.findIndex(item => item.id === id)
    if (index === -1) return false
    
    this.clothingItems.splice(index, 1)
    return true
  }

  // Look Suggestions Methods
  addLookSuggestion(suggestion: LookSuggestion): LookSuggestion {
    this.lookSuggestions.push(suggestion)
    return suggestion
  }

  getAllLookSuggestions(): LookSuggestion[] {
    return [...this.lookSuggestions]
  }

  getLookSuggestionById(id: string): LookSuggestion | undefined {
    return this.lookSuggestions.find(suggestion => suggestion.id === id)
  }

  // Feedback Methods
  addFeedback(lookId: string, rating: 'approve' | 'reject', comments: string = '') {
    const feedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lookId,
      rating,
      comments,
      timestamp: new Date()
    }
    this.feedbacks.push(feedback)
    return feedback
  }

  getFeedbacksForLook(lookId: string) {
    return this.feedbacks.filter(feedback => feedback.lookId === lookId)
  }

  getAllFeedbacks() {
    return [...this.feedbacks]
  }

  // Filter Methods
  filterClothingItems(filters: {
    type?: string
    styles?: string[]
    colors?: string[]
    season?: string[]
    occasion?: string[]
  }): ClothingItem[] {
    return this.clothingItems.filter(item => {
      if (filters.type && item.type.toLowerCase() !== filters.type.toLowerCase()) {
        return false
      }
      
      if (filters.styles && filters.styles.length > 0) {
        const hasMatchingStyle = filters.styles.some(style => 
          item.styles.some(itemStyle => 
            itemStyle.toLowerCase().includes(style.toLowerCase())
          )
        )
        if (!hasMatchingStyle) return false
      }
      
      if (filters.colors && filters.colors.length > 0) {
        const hasMatchingColor = filters.colors.some(color => 
          item.colors.some(itemColor => 
            itemColor.toLowerCase().includes(color.toLowerCase())
          )
        )
        if (!hasMatchingColor) return false
      }
      
      if (filters.season && filters.season.length > 0) {
        const hasMatchingSeason = filters.season.some(season => 
          item.season.some(itemSeason => 
            itemSeason.toLowerCase().includes(season.toLowerCase())
          )
        )
        if (!hasMatchingSeason) return false
      }
      
      if (filters.occasion && filters.occasion.length > 0) {
        const hasMatchingOccasion = filters.occasion.some(occasion => 
          item.occasion.some(itemOccasion => 
            itemOccasion.toLowerCase().includes(occasion.toLowerCase())
          )
        )
        if (!hasMatchingOccasion) return false
      }
      
      return true
    })
  }

  // Statistics Methods
  getStats() {
    const totalItems = this.clothingItems.length
    const totalSuggestions = this.lookSuggestions.length
    const totalFeedbacks = this.feedbacks.length
    const approvedSuggestions = this.feedbacks.filter(f => f.rating === 'approve').length
    const rejectedSuggestions = this.feedbacks.filter(f => f.rating === 'reject').length
    
    const styleDistribution = this.clothingItems.reduce((acc, item) => {
      item.styles.forEach(style => {
        acc[style] = (acc[style] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)
    
    const typeDistribution = this.clothingItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalItems,
      totalSuggestions,
      totalFeedbacks,
      approvedSuggestions,
      rejectedSuggestions,
      approvalRate: totalFeedbacks > 0 ? (approvedSuggestions / totalFeedbacks) * 100 : 0,
      styleDistribution,
      typeDistribution
    }
  }

  // Clear all data (for testing)
  clearAll() {
    this.clothingItems = []
    this.lookSuggestions = []
    this.feedbacks = []
  }

  // Seed with sample data
  seedSampleData() {
    const sampleItems: Omit<ClothingItem, 'id' | 'createdAt'>[] = [
      {
        imageUrl: '/api/placeholder/300/400',
        type: 'Camisa',
        colors: ['Branco', 'Azul'],
        styles: ['Casual', 'Clássico'],
        season: ['Primavera', 'Verão'],
        occasion: ['Trabalho', 'Casual'],
        description: 'Camisa social branca com detalhes azuis'
      },
      {
        imageUrl: '/api/placeholder/300/400',
        type: 'Calça',
        colors: ['Preto'],
        styles: ['Clássico', 'Minimalista'],
        season: ['Outono', 'Inverno'],
        occasion: ['Trabalho', 'Formal'],
        description: 'Calça social preta slim fit'
      },
      {
        imageUrl: '/api/placeholder/300/400',
        type: 'Tênis',
        colors: ['Branco', 'Preto'],
        styles: ['Streetwear', 'Casual'],
        season: ['Primavera', 'Verão', 'Outono'],
        occasion: ['Casual', 'Esportivo'],
        description: 'Tênis branco com detalhes pretos'
      }
    ]

    sampleItems.forEach(item => this.addClothingItem(item))
  }
}

// Export singleton instance
export const mockDatabase = new MockDatabase()

// Initialize with sample data in development
if (process.env.NODE_ENV === 'development') {
  mockDatabase.seedSampleData()
}
