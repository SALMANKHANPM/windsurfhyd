# LearnSurf - Telugu Language Learning Platform 🌊

A modern, AI-powered multimodal conversational platform for learning Telugu and English. Built with Next.js 15, React 19, and powered by advanced AI technologies.

## ✨ Features

### 🤖 AI-Powered Chat Assistant
- Natural conversations in both Telugu and English
- Real-time translations and contextual help
- Markdown support for rich text formatting
- Image upload for context-aware conversations
- Audio message support

### 🎤 Speech Recognition & Transcription
- Real-time audio transcription powered by Whisper AI
- Bilingual transcription (Telugu ↔ English)
- Pronunciation feedback
- Interactive waveform visualization

### 📚 Interactive Learning Modules
- **Speaking Practice**: Improve pronunciation with real-time feedback
- **Writing Practice**: Master Telugu script through interactive exercises
- **Quizzes**: Test your knowledge with engaging quizzes
- **Text Matching**: Practice vocabulary and sentence structure

### 📊 Progress Tracking
- User profile with learning statistics
- Level progression system
- Daily streak tracking
- Lesson completion metrics

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.2.4](https://nextjs.org) with Turbopack
- **UI Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with Typography plugin
- **UI Components**: 
  - [Radix UI](https://www.radix-ui.com) - Accessible component primitives
  - [shadcn/ui](https://ui.shadcn.com) - Re-usable components
  - [Lucide React](https://lucide.dev) - Beautiful icons
- **Animations**: [Framer Motion](https://www.framer.com/motion)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) with GitHub Flavored Markdown
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com) - Image text recognition
- **Charts**: [Recharts](https://recharts.org)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode support
- **TypeScript**: Type-safe development

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ or Bun
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
# or
bun run build
bun start
```

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── dashboard/           # Main dashboard and features
│   │   ├── chat/           # AI chat interface
│   │   ├── learn/          # Learning modules (speak, write)
│   │   ├── practice/       # Practice exercises (quiz, speaking, text matching)
│   │   └── profile/        # User profile
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── sidebar/            # Sidebar navigation
│   ├── kokonutui/          # Custom UI components
│   └── ...                 # Feature components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and API
│   ├── api.ts              # API client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
└── public/                  # Static assets

```

## 🎨 Key Features Implementation

### Markdown Support
All chat messages support rich Markdown formatting including:
- **Bold** and *italic* text
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Links and images
- Tables (via GFM)

### Speech Recognition
Utilizes the Web Speech API with custom TypeScript definitions for:
- Real-time speech-to-text conversion
- Language detection
- Confidence scoring
- Error handling

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Optimized for tablets and desktops

### Dark Mode
Full dark mode support with automatic theme detection and manual toggle.

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Integration

The frontend connects to a Python backend API for:
- AI chat completions
- Audio transcription (Whisper)
- Language translation
- User authentication
- Progress tracking

API endpoints are configured in `lib/api.ts`.

## 🎯 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 👥 Team - VibeCoder

- **Salman** - Developer
- **Srihari** - Developer
- **Atul** - Developer
- **Asmitha** - Developer
- **Somanshu Dev** - Developer

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a team project. For contributions, please follow the established code style and submit pull requests for review.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

---

Built with ❤️ by Team VibeCoder
