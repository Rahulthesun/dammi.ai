# Dammi.ai 🤖

**Your Business Context-Aware AI Assistant**

Dammi.ai is a powerful B2B AI platform that leverages business context data to provide intelligent, contextual responses across your entire business ecosystem. Whether through embedded widgets, direct API integration, or WhatsApp integration, Dammi.ai ensures your AI interactions are always informed by your specific business knowledge and documentation.

## 🚀 Features

### Core Capabilities
- **Business Context Integration**: Upload and process business documents (PDF, DOCX, TXT) to create a knowledge base
- **Intelligent Query Processing**: AI-powered responses based on your business-specific data
- **Multi-Platform Deployment**: Embeddable widget, API endpoints, and WhatsApp integration
- **Vector Search**: Advanced semantic search using Pinecone vector database
- **Secure Token-Based Authentication**: Domain-restricted access with JWT tokens

### Platform Integrations
- **Embeddable Widget**: Easy-to-integrate chat widget for websites
- **RESTful API**: Full API access for custom integrations
- **WhatsApp Integration**: Direct messaging through WhatsApp Business API
- **Questionnaire System**: Interactive data collection and processing

## 🏗️ Architecture

```
Dammi.ai/
├── Frontend (Next.js)
│   ├── React 19.1.0
│   ├── Tailwind CSS 4
│   └── Modern UI Components
├── Backend API
│   ├── Express.js Routes
│   ├── AI Services (LLM Integration)
│   ├── Vector Database (Pinecone)
│   └── File Processing (PDF, DOCX, TXT)
└── Integrations
    ├── Widget System
    ├── WhatsApp API
    └── Token Authentication
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.0** - React framework with SSR/SSG
- **React 19.1.0** - Latest React with concurrent features
- **Tailwind CSS 4** - Utility-first CSS framework
- **Geist Font** - Modern typography

### Backend
- **Express.js** - Node.js web framework
- **Pinecone** - Vector database for semantic search
- **OpenAI/LLM APIs** - AI model integration
- **Multer** - File upload handling
- **PDF-Parse & Mammoth** - Document text extraction

### AI & ML
- **Vector Embeddings** - Semantic text representation
- **Context-Aware Responses** - Business-specific AI answers
- **Semantic Search** - Intelligent document retrieval

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Pinecone account and API key
- OpenAI API key (or compatible LLM provider)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dammi-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd src/pages/api/backend
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` in the root directory:
   ```env
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_index_name
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 API Endpoints

### Core Endpoints

#### `POST /api/backend/query`
Process AI queries with business context
```json
{
  "question": "What are our company policies?",
  "businessId": "your-business-id",
  "topK": 3
}
```

#### `POST /api/backend/upload`
Upload and process business documents
```json
{
  "file": "document.pdf",
  "businessId": "your-business-id"
}
```

#### `GET /api/backend/widget.js?token=<token>`
Generate embeddable widget JavaScript

### Integration Endpoints

#### `POST /api/backend/whatsapp`
WhatsApp Business API integration

#### `POST /api/backend/submitQuestionnaire`
Process questionnaire responses

## 🎯 Widget Integration

### Quick Integration
Add this script to your website:
```html
<script src="https://your-domain.com/api/backend/widget.js?token=YOUR_WIDGET_TOKEN"></script>
```

### Widget Features
- **Floating Chat Bubble** - Always accessible customer support
- **Business Context Aware** - Responses based on your uploaded documents
- **Responsive Design** - Works on desktop and mobile
- **Customizable Styling** - Match your brand colors and design

## 📚 Document Processing

### Supported Formats
- **PDF** - Full text extraction with structure preservation
- **DOCX** - Microsoft Word documents
- **TXT** - Plain text files

### Processing Pipeline
1. **Upload** → File validation and storage
2. **Extract** → Text extraction from documents
3. **Chunk** → Intelligent text segmentation
4. **Embed** → Vector embedding generation
5. **Store** → Pinecone vector database storage
6. **Index** → Semantic search indexing

## 🔐 Security & Authentication

### Token-Based Access
- **JWT Tokens** - Secure widget authentication
- **Domain Restrictions** - Whitelist allowed domains
- **Business Isolation** - Data separation by business ID

### Security Features
- **CORS Protection** - Cross-origin request handling
- **Input Validation** - Sanitized user inputs
- **Rate Limiting** - API usage protection
- **Error Handling** - Secure error responses

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
PINECONE_API_KEY=your_production_key
PINECONE_INDEX_NAME=your_production_index
OPENAI_API_KEY=your_production_key
JWT_SECRET=your_secure_secret
```

### Recommended Hosting
- **Vercel** - Optimized for Next.js
- **AWS** - Scalable cloud infrastructure
- **Google Cloud** - Enterprise-grade hosting

## 📊 Business Use Cases

### Customer Support
- **24/7 AI Support** - Instant responses to customer queries
- **Knowledge Base Integration** - Access to company policies and procedures
- **Multi-Channel Support** - Website, WhatsApp, and API access

### Sales & Marketing
- **Product Information** - Detailed product knowledge and specifications
- **Lead Qualification** - Intelligent questionnaire processing
- **Customer Onboarding** - Automated guidance and support

### Internal Operations
- **Employee Training** - Access to company documentation and procedures
- **Process Automation** - Streamlined workflows and approvals
- **Knowledge Management** - Centralized business intelligence

## 🔄 Development Workflow

### Adding New Features
1. **Backend Services** - Add new AI services in `/services/`
2. **API Routes** - Create new endpoints in `/routes/`
3. **Frontend Components** - Build UI components in `/src/`
4. **Testing** - Add tests in `/test/` directory

### Code Structure
```
src/pages/api/backend/
├── routes/          # API endpoints
├── services/        # Business logic
├── utils/          # Helper functions
├── scripts/        # Utility scripts
└── test/           # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.dammi.ai](https://docs.dammi.ai)
- **Email**: support@dammi.ai
- **Discord**: [Join our community](https://discord.gg/dammi-ai)

## 🗺️ Roadmap

- [ ] **Multi-language Support** - International business context
- [ ] **Advanced Analytics** - Usage insights and performance metrics
- [ ] **Custom AI Models** - Business-specific model training
- [ ] **Mobile App** - Native iOS and Android applications
- [ ] **Enterprise Features** - SSO, advanced security, compliance

---

**Built with ❤️ by the Dammi.ai team**

*Empowering businesses with intelligent, context-aware AI solutions.*
