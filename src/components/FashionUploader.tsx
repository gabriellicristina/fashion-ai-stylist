'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface FashionUploaderProps {
  onUploadSuccess?: () => void
}

const CLOTHING_TYPES = [
  'Camisa', 'Camiseta', 'Blusa', 'Vestido', 'Saia', 'Calça', 'Shorts', 'Jaqueta', 
  'Casaco', 'Suéter', 'Tênis', 'Sapato', 'Sandália', 'Bota', 'Acessório'
]

const FASHION_STYLES = [
  'Streetwear', 'Casual', 'Clássico', 'Chic/Elegante', 'Boho-Chic', 
  'Vintage', 'Esportivo', 'Minimalista'
]

export default function FashionUploader({ onUploadSuccess }: FashionUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [manualType, setManualType] = useState<string>('')
  const [manualStyles, setManualStyles] = useState<string[]>([])
  const [description, setDescription] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 10MB')
      return
    }

    setSelectedFile(file)
    setError('')
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleStyleToggle = (style: string) => {
    setManualStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    )
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione uma imagem')
      return
    }

    setIsUploading(true)
    setError('')
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      
      if (manualType) {
        formData.append('type', manualType)
      }
      
      if (manualStyles.length > 0) {
        formData.append('styles', manualStyles.join(','))
      }

      const response = await fetch('/api/clothing-classify', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro na classificação')
      }

      setUploadResult(result)
      
      // Reset form
      setSelectedFile(null)
      setPreviewUrl('')
      setManualType('')
      setManualStyles([])
      setDescription('')
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      if (onUploadSuccess) {
        onUploadSuccess()
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setManualType('')
    setManualStyles([])
    setDescription('')
    setError('')
    setUploadResult(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Cadastrar Nova Peça
        </CardTitle>
        <CardDescription className="text-center">
          Faça upload de uma foto da sua roupa para análise automática
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <Label htmlFor="image-upload" className="text-lg font-medium">
            Foto da Peça
          </Label>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
                <Button variant="outline" onClick={handleReset}>
                  Trocar Imagem
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-lg">Clique para selecionar uma imagem</p>
                  <p className="text-sm">PNG, JPG, JPEG até 10MB</p>
                </div>
                <Input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Manual Classification */}
        {selectedFile && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Classificação Manual (Opcional)</h3>
            
            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type-select">Tipo da Peça</Label>
              <Select value={manualType} onValueChange={setManualType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {CLOTHING_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <Label>Estilos</Label>
              <div className="flex flex-wrap gap-2">
                {FASHION_STYLES.map(style => (
                  <Badge
                    key={style}
                    variant={manualStyles.includes(style) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleStyleToggle(style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
              {manualStyles.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selecionados: {manualStyles.join(', ')}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva a peça..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {uploadResult && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
            <p className="text-green-700 dark:text-green-400 font-medium">
              ✓ {uploadResult.message}
            </p>
            
            <div className="text-sm space-y-2">
              <p><strong>Tipo:</strong> {uploadResult.classification.type}</p>
              <p><strong>Cores:</strong> {uploadResult.classification.colors.join(', ')}</p>
              <p><strong>Estilos:</strong> {uploadResult.classification.styles.join(', ')}</p>
              <p><strong>Confiança:</strong> {Math.round(uploadResult.classification.confidence * 100)}%</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? 'Analisando...' : 'Analisar e Cadastrar'}
        </Button>
      </CardContent>
    </Card>
  )
}
