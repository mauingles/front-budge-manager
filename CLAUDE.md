# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with hot reload (frontend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Setup
- `npm install` - Install frontend dependencies

### Data Storage
- **Firebase/Firestore**: All data is stored in Firebase Firestore for all environments (localhost and production)
- **Real-time Sync**: Automatic real-time synchronization across all clients

## Architecture

This is a sophisticated Vue 3 budget management application with group collaboration features, dual authentication systems, and advanced UI/UX patterns.

### Technology Stack
- **Frontend**: Vue 3 (Composition API), Vite 6.2.4
- **Backend**: Firebase Firestore (real-time database)
- **Authentication**: Firebase (Google OAuth) + Local system
- **Styling**: Vanilla CSS with custom design system
- **State Management**: Centralized reactive state in App.vue with real-time Firestore listeners
- **UI System**: Custom modal system with Teleport, toast notifications, confirmation dialogs

### Key Architecture Patterns
- **Centralized State**: All global state managed in App.vue with reactive refs
- **Permission-Based Rendering**: Dynamic UI based on user roles and group membership
- **Dual Authentication**: Firebase for regular users, local auth for admins
- **Real-time Data**: All changes sync automatically via Firestore real-time listeners
- **Composable Pattern**: Reusable logic in `useAuth.js`, `useNotifications.js`, `useConfirm.js`
- **Teleport-based Modals**: All modals render directly to document.body for proper layering

### Data Models

#### Transaction Model
```js
{
  id: number,
  type: 'income' | 'expense',
  category: string, // for expenses: 'alquiler', 'electricidad', 'agua', 'gas', 'internet', 'telefono', 'compra', 'expensa', 'impuesto', 'seguro', 'otros' | for income: 'nomina', 'otros'
  description: string,
  amount: number,
  user: string,
  date: string, // format: 'YYYY-MM'
  createdAt: string, // format: 'DD/MM/YYYY, HH:MM'
  groupId: number | null, // Group association
  userId: number // IMPORTANT: User ownership tracking for permissions
}
```

#### User Model
```js
{
  id: number,
  username: string,
  email: string,
  password: string | null, // null for Google users
  role: 'user' | 'admin' | 'superadmin',
  isGoogleUser: boolean,
  uid?: string, // Firebase UID for Google users
  photoURL?: string // Google profile photo URL
}
```

#### Group Model
```js
{
  id: number,
  name: string,
  description: string,
  createdBy: number, // User ID of creator
  createdAt: string, // ISO date string
  inviteCode: string | null, // Single-use invite codes (invalidated after use)
  members: [
    {
      id: number, // User ID
      username: string,
      role: 'admin' | 'member'
    }
  ]
}
```

### Core Components

#### Main Application
- **App.vue**: Central state manager, authentication handler, UI coordinator, and modal management
- **AppLayout.vue**: Responsive layout wrapper with glass-morphism design and mobile optimizations

#### Authentication & User Management
- **LoginForm.vue**: Dual authentication (Firebase + local) with role selection and master password
- **UserModal.vue**: Compact user profile, password management, and comprehensive admin user controls

#### Transaction Management
- **TransactionForm.vue**: Compact smart form with group selection and category management
- **TransactionList.vue**: Permission-aware transaction display with group tags
- **TransactionItem.vue**: Individual transaction with conditional edit/delete controls
- **MonthlyBalance.vue**: Visual dashboard with progress bars and financial metrics

#### Group Collaboration System
- **GroupManagementModal.vue**: Complete group lifecycle management with tabbed interface
  - Create groups with automatic admin privileges
  - Generate and manage single-use invite codes
  - Member management with role-based permissions
  - Invitation message generation with copy-to-clipboard functionality
  - Real-time member list with remove capabilities

#### Advanced UI System
- **BaseModal.vue**: Teleport-based modal system with auto-centering, responsive design, and X button
- **NotificationContainer.vue**: Compact toast notification system with auto-dismiss and type-based styling
- **ConfirmDialog.vue**: Promise-based confirmation dialogs replacing browser alerts
- **Base Components**: BaseCard, BaseInput, BaseButton with consistent styling

### Group Functionality & Permissions

#### Advanced Access Control System
- **SuperAdmin/Admin**: Full access to all groups, transactions, and user management
- **Group Admin**: Can manage their group members, generate invite codes, and view group analytics
- **Group Member**: Can view and create transactions within their groups
- **Regular User**: Can only see own transactions unless in shared groups

#### Group Features
- **Single-use Invite System**: One-time use codes that automatically invalidate after use
- **Smart Permission Filtering**: Transactions filtered by complex user access rights logic
- **Group-Specific Views**: Independent balance calculations and transaction lists per group
- **Dynamic Member Management**: Add/remove members with appropriate permission checks
- **Invite Message Generation**: Pre-formatted invitation messages with copy functionality

### Authentication System

#### Dual Authentication Architecture
1. **Firebase Google OAuth**: Seamless Google authentication with automatic account creation
2. **Local Authentication**: Email/password system for admin and superadmin roles
3. **Master Password Protection**: Required for creating privileged accounts (security layer)
4. **Session Persistence**: Firebase handles session management with watchers

#### Role Hierarchy & Permissions
- **superadmin**: Full system access, user management, master password changes, all groups
- **admin**: User management, all groups access, system settings
- **user**: Own transactions and accessible groups only, Google OAuth registration

### State Management

#### Centralized State in App.vue
- **transactions**: Reactive array with complex filtering logic by month, group, and permissions
- **users**: Complete user database with role management
- **groups**: Group membership with dynamic permission calculations
- **currentUser**: Authentication state and user session management
- **UI State**: Modal visibility, loading states, selected filters, notifications

#### Advanced Computed Properties
- **filteredTransactions**: Multi-layered filtering by month, group access, and user permissions
- **userGroups**: Groups accessible by current user based on membership and role
- **totalIncome/totalExpenses**: Real-time financial calculations with group filtering
- **hasGroupAccess**: Dynamic permission checking function

### Data Persistence & Real-time Sync

#### Firebase Firestore Architecture
- **Cloud Database**: Scalable NoSQL document database
- **Real-time Listeners**: Automatic updates when data changes across all clients
- **Offline Support**: Built-in offline capabilities with automatic sync when back online
- **Security Rules**: Server-side security and validation

#### Real-time Operations
- **Automatic Sync**: All CRUD operations sync instantly across all connected clients
- **Optimistic Updates**: UI updates immediately with server confirmation
- **Conflict Resolution**: Firestore handles concurrent updates automatically
- **Connection Status**: Real-time monitoring of Firebase connection state

### UI/UX Patterns

#### Advanced Modal System
- **Teleport Architecture**: All modals render to document.body to avoid z-index issues
- **Auto-centering**: Perfect centering with responsive behavior on all screen sizes
- **Compact Design**: Minimalist, space-efficient modals with proper padding for X button
- **Responsive Sizing**: Dynamic sizing based on content with min/max constraints

#### Notification System
- **Toast Notifications**: Compact, auto-dismissing notifications in top-right corner
- **Type-based Styling**: Success (green), error (red), warning (orange), info (blue)
- **Duration Control**: Configurable auto-dismiss timing (default 5s, confirmations 2s)
- **Manual Dismissal**: X button for immediate closure

#### Responsive Design
- **Mobile-first Approach**: Breakpoints at 768px (tablet) and 480px (mobile)
- **Adaptive Layouts**: Grid system that gracefully stacks on smaller screens
- **Touch-friendly Interface**: Appropriate button sizes and spacing for mobile interaction
- **Glass-morphism Design**: Modern backdrop-filter effects with fallbacks

#### Transaction Container Intelligence
- **Adaptive Height**: Auto-adjusts up to 5 transactions, then shows scroll
- **Independent Layout**: Doesn't affect other dashboard elements
- **Smart Scrolling**: Scroll only appears when content exceeds container capacity
- **Responsive Limits**: Different max heights for mobile/tablet/desktop

### Development Patterns

#### Component Organization
- **Base Components**: Reusable UI elements with consistent styling (Base* prefix)
- **Feature Components**: Business logic components (Transaction*, Group*, User*)
- **Layout Components**: Structural elements (AppLayout, AppHeader)
- **Composables**: Reusable logic extraction (/composables directory)

#### Code Quality Patterns
- **Composition API**: Consistent use throughout application for better organization
- **TypeScript-like Props**: Detailed prop definitions with validation
- **Scoped Styling**: Component-level CSS with minimal global utilities
- **Permission-driven UI**: Conditional rendering based on user roles and access rights

#### Error Handling & UX
- **No More Browser Alerts**: All alerts replaced with custom notification system
- **Promise-based Confirmations**: Async/await confirmation dialogs
- **Real-time Feedback**: Immediate user feedback for all actions (create, edit, delete)
- **Loading States**: Spinner and connection status indicators
- **Offline Tolerance**: Firestore's built-in offline support with automatic sync

### Security Considerations
- **Client-side Validation**: Comprehensive form validation and permission checks
- **Role-based Access Control**: UI and data access dynamically based on user roles
- **Master Password Protection**: Admin account creation requires master password verification
- **Single-use Invite Codes**: Enhanced security with automatic code invalidation
- **Permission Verification**: Server-side permission checks (should be implemented)

### Configuration
- **Vite Config**: Path aliases (@/), SCSS preprocessing, Vue DevTools integration
- **Firebase Config**: Google OAuth setup with environment-based configuration
- **Responsive Breakpoints**: Standardized breakpoints for consistent responsive behavior
- **Z-index Management**: Proper layering for modals (9999), notifications (2000), and UI elements