# Greenspend

A modern personal finance management app built with React Native and Expo. Track your income, manage budgets, analyze spending patterns, and achieve your financial goals with an intuitive mobile-first interface.

##  Features

- **Transaction Management** - Record income and expenses with categories, notes, and dates
- **Budget Tracking** - Set monthly budget limits by category and monitor spending
- **Visual Analytics** - View spending patterns with interactive charts and statistics
- **Recurring Transactions** - Automatically track recurring income and expenses
- **Multi-Currency Support** - Configure your preferred currency for all transactions
- **Local Data Storage** - All data stored securely on your device
- **Cross-Platform** - Works seamlessly on iOS, Android, and Web
- **Responsive Design** - Optimized for all screen sizes and device orientations

##  Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Hooks
- **Charts**: Victory Native
- **Storage**: AsyncStorage
- **UI Components**: React Native with custom styling
- **Icons**: Expo Vector Icons

##  Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (
pm install -g expo-cli)
- For iOS development: macOS with Xcode
- For Android development: Android Studio

##  Getting Started

### Installation

1. **Clone the repository**
   `bash
   git clone https://github.com/yourusername/greenspend.git
   cd greenspend
   `

2. **Install dependencies**
   `bash
   npm install
   # or
   yarn install
   `

3. **Start the development server**
   `bash
   npx expo start
   `

4. **Run on your device or emulator**
   - Press 'i' for iOS simulator (macOS only)
   - Press 'a' for Android emulator
   - Press 'w' for web browser
   - Or scan the QR code with the Expo Go app on your device

##  Project Structure

\\\
greenspend/
 app/                          # Expo Router app directory
    _layout.tsx              # Root layout
    index.tsx                # Entry point (onboarding check)
    onboarding.tsx           # Onboarding screen
    add-transaction.tsx       # Add transaction form
    (tabs)/                  # Tab-based navigation
        _layout.tsx          # Tabs layout
        index.tsx            # Dashboard
        transactions.tsx      # Transactions list
        budgets.tsx          # Budget management
        analytics.tsx        # Analytics & charts
        profile.tsx          # Profile & settings
 assets/                       # Images, fonts, and icons
 components/                   # Reusable UI components
 constants/                    # App constants
 hooks/                        # Custom React hooks
 services/                     # Business logic & services
 types/                        # TypeScript type definitions
 app.json                      # Expo configuration
 package.json                  # Dependencies & scripts
\\\

##  Architecture

### Data Models

**Transaction**
- Unique transactions with amount, type (income/expense), category, and date
- Support for recurring transactions with frequency options
- Timestamps for creation and modification

**Budget**
- Monthly budget limits per category
- Tracks spending against limits
- Category-based organization

**AppSettings**
- User preferences (currency, onboarding status)
- Persisted across sessions

### Services

**Storage Service** (services/storage.ts)
- Manages all AsyncStorage operations
- Handles transactions and budgets
- Supports custom categories
- Provides analytics calculations

### Hooks

**useCurrency** (hooks/useCurrency.ts)
- Formats amounts with currency symbols
- Converts between currencies
- Globally consistent currency formatting

##  Key Screens

- **Onboarding**: First-time user experience
- **Dashboard**: Quick financial overview
- **Transactions**: Income/expense management
- **Budgets**: Set and track spending limits
- **Analytics**: Visual spending analysis
- **Profile**: Settings and preferences

##  Development

### Run Development Server
\\\ash
npx expo start
\\\

### Lint Code
\\\ash
npm run lint
\\\

### Build Commands

Development Build (Local):
\\\ash
eas build --platform ios --local
eas build --platform android --local
\\\

Production Build:
\\\ash
eas build --platform ios
eas build --platform android
\\\

##  Key Dependencies

- react & react-native - UI framework
- expo - Development platform
- expo-router - Navigation
- @react-native-async-storage/async-storage - LocalStorage
- victory-native - Charts and graphs
- @expo/vector-icons - Icon library
- react-native-gesture-handler - Gesture support
- react-native-reanimated - Animations

##  Deployment

### iOS
1. Ensure Xcode is installed
2. Configure signing in Apple Developer account
3. Run \eas build --platform ios\
4. Submit to App Store

### Android
1. Configure Google Play credentials
2. Run \eas build --platform android\
3. Upload to Google Play Console

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

##  License

MIT License

##  Bug Reports & Support

- Open an issue on the GitHub repository
- Include device, OS, and reproduction steps
- Join our Discord community for discussions

##  Acknowledgments

- Built with [Expo](https://expo.dev)
- Charts by [Victory](https://formidable.com/open-source/victory)
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)

---

**Happy budgeting! ** Track your spending and achieve your financial goals with Greenspend.
