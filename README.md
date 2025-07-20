# Agente de IA para Composição de Looks

Um assistente pessoal de moda inteligente que analisa suas roupas, descobre estilos e oferece sugestões personalizadas para qualquer ocasião.

## 🎯 Funcionalidades

### 📸 Cadastro Inteligente de Peças
- Upload de fotos das suas roupas e calçados
- Análise automática por IA para identificar:
  - Tipo da peça (camisa, calça, vestido, etc.)
  - Cores predominantes
  - Estilos de moda (Streetwear, Casual, Clássico, etc.)
  - Estações apropriadas
  - Ocasiões de uso
- Classificação manual opcional para correções

### 🤖 Sugestões Personalizadas de Looks
- Geração de looks completos baseados no seu guarda-roupa
- Consideração de contexto:
  - Ocasião (trabalho, festa, casual, etc.)
  - Estação do ano
  - Condições climáticas
  - Preferências pessoais de estilo
- Explicações detalhadas sobre as escolhas
- Dicas de styling personalizadas

### 📊 Sistema de Feedback e Aprendizado
- Avaliação das sugestões (aprovar/rejeitar)
- Comentários detalhados para melhoria
- Estatísticas de aprovação
- Aprendizado contínuo baseado nas suas preferências

### 🎨 Estilos Suportados
- **Streetwear**: Urbano e descontraído
- **Casual**: Confortável e versátil
- **Clássico**: Elegante e atemporal
- **Chic/Elegante**: Sofisticado e refinado
- **Boho-Chic**: Livre e artístico
- **Vintage**: Retrô e nostálgico
- **Esportivo**: Ativo e funcional
- **Minimalista**: Limpo e essencial

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **IA**: OpenRouter API (GPT-4o multimodal)
- **Armazenamento**: Sistema mock em memória (desenvolvimento)
- **Análise de Imagens**: IA multimodal para classificação automática

## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Chave de API do OpenRouter

## ⚙️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd fashion-ai-stylist
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Edite o arquivo .env.local e adicione sua chave da API
AI_API_KEY=sua_chave_do_openrouter_aqui
```

### 4. Obtenha uma chave de API do OpenRouter
1. Acesse [OpenRouter](https://openrouter.ai/)
2. Crie uma conta
3. Gere uma chave de API
4. Adicione a chave no arquivo `.env.local`

### 5. Execute o projeto
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:8000](http://localhost:8000) no seu navegador.

## 📱 Como Usar

### 1. Cadastrar Peças
1. Acesse a página "Cadastro"
2. Faça upload de fotos das suas roupas
3. A IA analisará automaticamente cada peça
4. Confirme ou ajuste a classificação se necessário

### 2. Gerar Sugestões de Looks
1. Acesse a página "Sugestões"
2. Selecione a ocasião e estação
3. Opcionalmente, informe clima e preferências de estilo
4. Clique em "Gerar Sugestão de Look"
5. Visualize a sugestão com explicações detalhadas

### 3. Avaliar e Melhorar
1. Avalie cada sugestão (👍 ou 👎)
2. Deixe comentários específicos
3. O sistema aprenderá com suas preferências
4. Receba sugestões cada vez mais personalizadas

## 🏗️ Arquitetura do Sistema

### Estrutura de Pastas
```
src/
├── app/                    # Páginas Next.js (App Router)
│   ├── api/               # Endpoints da API
│   │   ├── clothing-classify/  # Classificação de roupas
│   │   ├── generate-look/      # Geração de looks
│   │   └── feedback/           # Sistema de feedback
│   ├── cadastro/          # Página de cadastro
│   ├── sugestoes/         # Página de sugestões
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── FashionUploader.tsx    # Upload de roupas
│   ├── FashionGallery.tsx     # Galeria de peças
│   ├── LookSuggestions.tsx    # Sugestões de looks
│   └── FeedbackForm.tsx       # Formulário de feedback
└── lib/                   # Utilitários e clientes
    ├── aiFashionClient.ts     # Cliente da API de IA
    ├── mockDatabase.ts        # Banco de dados mock
    └── utils.ts              # Utilitários gerais
```

### Fluxo de Dados
1. **Upload de Imagem** → API de Classificação → IA Analysis → Armazenamento
2. **Solicitação de Look** → API de Geração → IA Composition → Resposta
3. **Feedback** → API de Feedback → Armazenamento → Aprendizado

## 🔧 APIs Disponíveis

### POST `/api/clothing-classify`
Classifica uma peça de roupa a partir de uma imagem.

**Parâmetros:**
- `image`: Arquivo de imagem (FormData)
- `type`: Tipo manual (opcional)
- `styles`: Estilos manuais (opcional)

### POST `/api/generate-look`
Gera uma sugestão de look baseada no contexto.

**Body:**
```json
{
  "occasion": "Trabalho",
  "season": "Inverno",
  "weather": "Frio",
  "preferredStyles": "Clássico,Minimalista"
}
```

### POST `/api/feedback`
Registra feedback sobre uma sugestão de look.

**Body:**
```json
{
  "lookId": "look_123",
  "rating": "approve",
  "comments": "Adorei a combinação!"
}
```

## 🎨 Personalização

### Adicionando Novos Estilos
Edite os arrays de estilos em:
- `src/components/FashionUploader.tsx`
- `src/components/LookSuggestions.tsx`
- `src/lib/aiFashionClient.ts`

### Modificando Prompts da IA
Os prompts estão em `src/lib/aiFashionClient.ts`:
- `analyzeClothingImage()`: Para classificação de peças
- `generateLookSuggestion()`: Para geração de looks

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure a variável de ambiente `AI_API_KEY`
3. Deploy automático

### Outras Plataformas
1. Build do projeto: `npm run build`
2. Configure as variáveis de ambiente
3. Execute: `npm start`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique se a chave da API está configurada corretamente
2. Confirme que as imagens estão em formato válido (PNG, JPG, JPEG)
3. Verifique os logs do console para erros específicos
4. Abra uma issue no repositório

## 🔮 Próximas Funcionalidades

- [ ] Integração com banco de dados real
- [ ] Sistema de usuários e autenticação
- [ ] Compartilhamento de looks
- [ ] Integração com redes sociais
- [ ] Recomendações de compras
- [ ] Análise de tendências de moda
- [ ] App mobile
