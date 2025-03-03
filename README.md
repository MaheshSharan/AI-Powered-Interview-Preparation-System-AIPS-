# AI-Powered Interview Preparation System (AIPS)

AIPS is a comprehensive platform designed to help job seekers prepare for interviews through AI-powered tools for resume analysis, technical assessments, and virtual interview practice.

## Project Overview

The AI-Powered Interview Preparation System (AIPS) guides users through a structured preparation process:

1. **Resume Analysis** - Upload and analyze your resume for strengths and weaknesses
2. **Target Job Selection** - Match your skills with potential job opportunities
3. **Technical Assessment** - Practice coding challenges tailored to your target roles
4. **Virtual Interview** - Participate in AI-driven mock interviews with feedback
5. **Analytics** - Track your progress and receive personalized improvement suggestions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd aips

# Install dependencies
npm install

# Start development server
npm run dev
```

## Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Zustand for state management
- Monaco Editor for code editing
- D3.js and Recharts for data visualization

### Backend
- Express.js with TypeScript
- SQLite database with Prisma ORM
- JWT for authentication
- Docker for isolated code execution

## Project Structure

```
aips/
├── client/              # Frontend React application
│   ├── public/          # Static assets
│   └── src/             # React source code
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       ├── hooks/       # Custom React hooks
│       ├── store/       # Zustand state management
│       ├── utils/       # Utility functions
│       └── App.jsx      # Main application component
├── server/              # Backend Express application
│   ├── src/             # TypeScript source code
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utility functions
│   └── prisma/          # Prisma ORM configuration
└── docker/              # Docker configuration for code execution
```

## Development Roadmap

See the [AIPS_Todo_List.md](./AIPS_Todo_List.md) for a detailed breakdown of project phases and tasks.

## License

This project is licensed under the MIT License - see the LICENSE file for details.