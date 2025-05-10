# Component Documentation

## Core Components

### Navigation (`Navigation.tsx`)
- **Purpose**: Main navigation bar component
- **Props**: None
- **Features**:
  - Responsive design with mobile menu
  - User authentication status handling
  - Dynamic route highlighting
  - Glassmorphism effect on scroll

### LoadingScreen (`LoadingScreen.tsx`)
- **Purpose**: Loading state component
- **Props**: None
- **Features**:
  - Animated loading indicator
  - Branded loading message
  - Full-screen overlay

### ProtectedRoute (`ProtectedRoute.tsx`)
- **Purpose**: Authentication wrapper component
- **Props**: 
  - `children`: ReactNode
- **Features**:
  - Route protection based on auth status
  - Automatic redirect to login
  - Loading state handling

## Quiz Components

### QuizQuestion (`QuizQuestion.tsx`)
- **Purpose**: Individual question display
- **Props**:
  ```typescript
  {
    question: Question;
    selectedAnswer: number | string;
    onAnswer: (answer: number | string, timeSpent: number) => void;
    showExplanation: boolean;
    onShowExplanation: () => void;
  }
  ```
- **Features**:
  - Multiple question types support
  - Real-time answer validation
  - AI-powered explanations
  - Time tracking

### CategoryCard (`CategoryCard.tsx`)
- **Purpose**: Quiz category display card
- **Props**:
  ```typescript
  {
    category: Category;
    index: number;
  }
  ```
- **Features**:
  - Animated hover effects
  - Question count badge
  - Category icon display
  - Link to category quiz

## User Progress Components

### UserXPProgress (`UserXPProgress.tsx`)
- **Purpose**: XP and level progress display
- **Props**:
  ```typescript
  {
    user: User;
  }
  ```
- **Features**:
  - Animated progress bar
  - Level progression display
  - XP calculation

### TimeAnalytics (`TimeAnalytics.tsx`)
- **Purpose**: User performance analytics
- **Props**:
  ```typescript
  {
    userId: string;
  }
  ```
- **Features**:
  - Response time tracking
  - Performance charts
  - Category-wise analysis

### AchievementCard (`AchievementCard.tsx`)
- **Purpose**: Achievement display
- **Props**:
  ```typescript
  {
    name: string;
    description: string;
    icon: string;
    achieved: boolean;
    achievedAt?: string;
  }
  ```
- **Features**:
  - Achievement status indication
  - Unlock date display
  - Visual feedback

### LeaderboardItem (`LeaderboardItem.tsx`)
- **Purpose**: Leaderboard entry display
- **Props**:
  ```typescript
  {
    entry: LeaderboardEntry;
    currentUserId: string;
    index: number;
  }
  ```
- **Features**:
  - Rank display
  - User highlighting
  - Score presentation

## Dashboard Components

### DashboardStats (`DashboardStats.tsx`)
- **Purpose**: User statistics overview
- **Props**: None
- **Features**:
  - Key metrics display
  - Real-time updates
  - Visual data presentation

## Style Guidelines

### Component Structure
- Use functional components with TypeScript
- Implement proper prop typing
- Include error boundaries where appropriate
- Handle loading and error states

### Animation Guidelines
- Use Framer Motion for animations
- Keep animations subtle and purposeful
- Ensure smooth transitions
- Consider reduced motion preferences

### Styling Conventions
- Use Tailwind CSS classes
- Follow the design system color scheme
- Maintain dark mode support
- Use consistent spacing and typography

### Best Practices
- Implement proper error handling
- Use proper TypeScript types
- Follow React hooks best practices
- Maintain component reusability
- Ensure accessibility compliance

## State Management

### Authentication Store (`useAuthStore`)
- User authentication state
- Login/logout functionality
- User profile management

### Quiz Store (`useQuizStore`)
- Quiz state management
- Question progression
- Answer tracking
- Score calculation

## Database Integration

### Supabase Tables
- users
- questions
- user_answers
- achievements
- categories
- quiz_results

### Edge Functions
- evaluate-essay
- evaluate-fill-in-blank
- generate-explanation 

## Icons and Assets
- Use Lucide React icons
- Follow icon naming conventions
- Maintain consistent icon sizes