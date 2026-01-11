# LogBook Codebase Analysis

## Project Overview
**LogBook** is a personal diary/log application built with modern web technologies. It's a Japanese diary app (日記ログアプリ) that allows users to record daily entries, view past logs, and retrieve historical data.

**Language**: Japanese (日本語)
**Type**: Full-stack web application (SPA)
**Deployment**: Vercel

---

## Technology Stack

### Core Framework
- **Next.js 16.1.1** (App Router, not Pages Router)
- **React 19** with TypeScript
- **TypeScript 5**

### Styling & UI
- **Tailwind CSS 3.4.1** (Utility-first CSS framework)
- **Custom CSS**: Global styles in `app/globals.css`
- **Design System**: Color tokens (primary, secondary, accent) with light/dark modes
- **UI Library**: Heroicons (Hero Icons 2.2.0) for SVG icons
- **Headless UI**: @headlessui/react 2.2.0 (accessible components)

### State Management
- **Zustand 5.0.3** (Lightweight state management)
- **React Context API** (used for theme management)
- **Custom Hooks**: useAuth, useTheme

### Backend & Database
- **Firebase** (v11.1.0)
  - Authentication: Google Sign-in & Anonymous auth
  - Firestore: Real-time document database
  - Storage: Firebase Cloud Storage
- **Firebase Admin SDK** (v13.0.2)

### Date & Time
- **date-fns 4.1.0** (Date manipulation library)
- Locale support: Japanese (ja)

### Development Tools
- ESLint 9 with Next.js config
- PostCSS with Autoprefixer
- TypeScript strict mode

---

## Project Structure

```
LogBook/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page (login)
│   ├── globals.css                # Global styles + 24節気 seasonal backgrounds
│   ├── (protected)/               # Protected routes (auth required)
│   │   ├── layout.tsx             # Protected layout wrapper
│   │   ├── dashboard/             # Main dashboard
│   │   │   └── page.tsx           # Dashboard page
│   │   ├── future-letter/         # Future letters feature
│   │   │   └── page.tsx           # Future letters page
│   │   └── timeline/              # Timeline view
│   │       └── page.tsx           # Timeline page
│   └── apple-icon.tsx, icon.tsx   # PWA icons
│
├── components/                     # Reusable React components
│   ├── EntryForm.tsx              # Entry creation/edit form
│   ├── UnifiedList.tsx            # Combined entries & memos list
│   ├── Calendar.tsx               # Month calendar with entry indicators
│   ├── InsightsPanel.tsx          # Daily/weekly/monthly stats
│   ├── MoodTrendChart.tsx         # Mood trend visualization
│   ├── FutureLetterForm.tsx       # Future letter creation form
│   ├── FutureLetterList.tsx       # List of future letters
│   ├── QuickMemo.tsx              # Quick memo floating widget
│   ├── TimelineView.tsx           # Year/month timeline view
│   ├── ExportModal.tsx            # CSV export modal
│   ├── SekkiBackground.tsx        # Seasonal background component
│   ├── SekkiHeader.tsx            # Header with 24節気 info
│   ├── SeasonalAnimation.tsx      # Seasonal animations
│   ├── ThemeToggle.tsx            # Dark/light mode toggle
│   ├── EntryList.tsx              # Entries list (older, may be unused)
│   └── Toast.tsx                  # Notification toasts
│
├── lib/                            # Core utilities & services
│   ├── types.ts                   # TypeScript interfaces & types
│   ├── ThemeContext.tsx           # Theme provider (light/dark)
│   ├── sekki.ts                   # 24節気 (seasonal term) utilities
│   ├── constants/
│   │   └── entry.ts               # Entry constants (mood scale)
│   ├── firebase/
│   │   └── config.ts              # Firebase initialization
│   ├── hooks/
│   │   └── useAuth.ts             # Authentication hook
│   ├── services/
│   │   ├── entries.ts             # Entry CRUD operations
│   │   ├── futureLetters.ts       # Future letter operations
│   │   ├── memos.ts               # Memo operations
│   │   └── storage.ts             # Firebase Storage operations
│   └── utils/
│       └── export.ts              # CSV export utilities
│
├── public/                         # Static assets
│   ├── icon.svg                   # App icon
│   └── manifest.json              # PWA manifest
│
├── docs/                           # Documentation
│   ├── FIREBASE_SETUP.md
│   ├── VERCEL_DEPLOY.md
│   ├── STEP_BY_STEP.md
│   └── QUICK_START.md
│
├── Configuration Files
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js         # Tailwind theme extension
│   ├── next.config.ts
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── firebase.json              # Firebase CLI config
│   ├── firestore.rules            # Firestore security rules
│   ├── firestore.indexes.json     # Firestore indexes
│   ├── storage.rules              # Storage security rules
│   └── .firebaserc                # Firebase project config
```

---

## Core Data Models (lib/types.ts)

### Entry (日記投稿)
```typescript
interface Entry {
  id: string;
  userId: string;
  title?: string;           // Optional
  content: string;          // Required
  tags?: string[];          // Optional
  weather?: string;         // Optional (天気)
  mood?: number | null;     // 1-5 scale
  imageUrl?: string;        // Optional image
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Memo (メモ/断片)
```typescript
interface Memo {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Timestamp;
}
```

### FutureLetter (未来への手紙)
```typescript
interface FutureLetter {
  id: string;
  userId: string;
  title: string;
  content: string;
  period: LetterPeriod;      // 'short' | 'medium' | 'long' | 'custom'
  deliveryDate: Timestamp;
  isOpened: boolean;
  openedAt?: Timestamp;
  createdAt: Timestamp;
}
```

---

## Key Features

### 1. Entry Management (ダッシュボード)
- Create entries with title, content, weather, mood, image
- Edit/delete entries
- View entries in unified list (chronological)
- Search entries by keywords
- Filter by date range
- Copy entries to clipboard
- Export to CSV

### 2. Calendar View
- Monthly calendar display
- Highlight dates with entries
- Click to filter entries by date

### 3. Insights & Analytics
- Daily/Weekly/Monthly summaries
- Top tags and weather stats
- Average mood calculation
- Mood trend chart (7-day or 30-day)

### 4. Quick Memo Feature
- Floating memo widget
- Create quick text/image memos
- Integrated into unified list

### 5. Future Letters (未来への手紙)
- Write letters to self
- Schedule delivery: short/medium/long/custom periods
- Random delivery date within period
- Mark as opened when delivered
- Unread count indicator

### 6. Timeline View
- Year/month/week navigation
- Visual timeline representation

### 7. Theme & Design
- Dark/Light mode toggle
- **24節気 (Traditional Japanese Seasonal Terms)** theme
- Seasonal background animations
- Responsive design (mobile-first)

### 8. Authentication
- Google Sign-in
- Anonymous/Guest login
- Protected routes

---

## Firestore Collections

### Collection: `entries`
- Document IDs: Auto-generated
- Indexed by: `userId`, `createdAt`

### Collection: `futureLetters`
- Document IDs: Auto-generated
- Indexed by: `userId`, `deliveryDate`

### Collection: `memos`
- Document IDs: Auto-generated
- Indexed by: `userId`, `createdAt`

---

## Authentication Flow

1. **Landing Page** (app/page.tsx)
   - Google Sign-in button
   - Anonymous/Guest login option
   - Feature showcase

2. **Protected Layout** (app/(protected)/layout.tsx)
   - Checks auth state
   - Redirects to login if not authenticated
   - Shows loading during auth check

3. **useAuth Hook** (lib/hooks/useAuth.ts)
   - Monitors Firebase auth state
   - Provides signInWithGoogle, signInAnonymous, signOut
   - Manages loading state

---

## UI Design System

### Colors (Tailwind Extended)
- **Primary**: Teal family (0d9488, 0f766e, etc.)
- **Secondary**: Green family (059669, 047857, etc.)
- **Accent**: Lime family (16a34a, 15803d, etc.)
- Full light/dark mode support with css vars

### Typography
- **Sans**: Inter
- **Display**: Lexend (brand/headers)

### Components
- Card: 24px border radius
- Button: 12px border radius
- Shadow system: soft, soft-lg, card
- Animations: fade-in, slide-up, scale-in

### 24節気 Theme
- 24 unique seasonal backgrounds in `app/globals.css`
- Each season (春/夏/秋/冬) has 6 节气
- Gradients with radial + linear combinations
- Dark mode variants included

---

## State Management Pattern

### Context API (Theme)
```
ThemeProvider → useTheme() → {theme, toggleTheme}
```

### Zustand (if used)
- Installed but minimal explicit use (may be used indirectly)

### Local Component State
- React hooks (useState, useEffect, useMemo)
- Filter state management in dashboard
- Editing state for entries

---

## Firebase Service Patterns

### lib/services/entries.ts
- `createEntry(userId, data)`
- `updateEntry(entryId, data)`
- `deleteEntry(entryId)`
- `getEntry(entryId)`
- `getEntriesByUser(userId)`
- `getEntriesByDateRange(userId, startDate, endDate)`
- `entryMatchesSearchTerm(entry, term)` - Client-side search
- `searchEntries(userId, term)`

### lib/services/futureLetters.ts
- `createFutureLetter(userId, data)`
- `openFutureLetter(letterId)`
- `deleteFutureLetter(letterId)`
- `getFutureLettersByUser(userId)`
- `getDeliveredLetters(userId)` - Delivery date <= now
- `getPendingLetters(userId)` - Delivery date > now
- `getUnreadLettersCount(userId)`

### lib/services/memos.ts
- Likely has CRUD operations similar to entries

### lib/services/storage.ts
- `uploadImage(userId, file)` - Firebase Storage

---

## Export & Data Utilities (lib/utils/export.ts)

- `entriesToText(entries)` - Format entries as text
- `unifiedToCSV(entries, memos)` - Generate CSV from entries & memos
- `downloadCSV(csv, filename)` - Trigger browser download
- `copyToClipboard(text)` - Copy to clipboard

---

## Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deployment
- **Platform**: Vercel
- **Type**: Next.js automatic deployment
- **Environment variables**: Firebase config in `.env.local`

---

## Security (Firestore & Storage Rules)

### Files
- `firestore.rules` - Firestore security rules
- `storage.rules` - Cloud Storage security rules

### Pattern
- Likely enforced by `userId` field
- Anonymous auth may have restricted permissions
- Custom rules prevent unauthorized access

---

## Notable Implementation Details

1. **Dynamic Rendering**: Multiple pages use `export const dynamic = 'force-dynamic'` to prevent caching auth state
2. **Mood Scale**: 5-point scale with emojis (😞→😄)
3. **Search**: Client-side search in `entryMatchesSearchTerm()`
4. **CSV Export**: Combined export of entries and memos
5. **Hydration Safety**: ThemeProvider checks `mounted` state
6. **Image Handling**: File upload preview before submission
7. **Timestamp Format**: Using Firebase Timestamp for consistency

---

## Next.js Router Type
✅ **App Router** (not Pages Router)
- Uses file-based routing in `app/` directory
- Supports layouts, error boundaries, loading states
- Route groups with `(protected)` pattern

---

## Missing or Potential Areas
- Utility files in lib/utils/ (only export.ts exists)
- Storage service implementation details
- Memos service full implementation
- Error boundary implementation
- Loading state components
- Advanced analytics/charts beyond mood trend

