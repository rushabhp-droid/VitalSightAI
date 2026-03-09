# VitalSightAI Frontend

Next.js frontend for the VitalSightAI health analysis platform.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build for Production
```bash
npm run build
npm start
```

## Features

- **Blood Report Analysis**: Upload blood test reports and get detailed health insights
- **Prescription Analysis**: Analyze prescriptions for medicine details, pros/cons, interactions
- **Medicine Lookup**: Search any medicine for comprehensive information

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- React Dropzone
- Axios