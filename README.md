# 💚 Greenspend

<div align="center">

### 🌱 Take Control of Your Finances

A modern, intuitive personal finance management app built with **React Native** and **Expo**. 
Track your income, manage budgets, analyze spending patterns, and achieve your financial goals with style.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-54.0.21-000020?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org)

</div>

---

## ⭐ Features

<table>
<tr>
<td>

💳 **Transaction Management**
- Record income & expenses with categories, notes, and dates
- Organize transactions by custom categories
- Full transaction history with timestamps

</td>
<td>

📊 **Budget Tracking**
- Set monthly spending limits by category
- Real-time budget monitoring
- Visual spending alerts when approaching limits

</td>
</tr>
<tr>
<td>

📈 **Visual Analytics**
- Interactive charts and graphs
- Category breakdown visualizations
- Monthly spending trends
- Income vs expense analysis

</td>
<td>

🔄 **Recurring Transactions**
- Automate income tracking (salary, passive income)
- Set recurring expenses (bills, subscriptions)
- Flexible frequency options (weekly, monthly, yearly)

</td>
</tr>
<tr>
<td>

💱 **Multi-Currency Support**
- Configure your preferred currency
- Automatic currency formatting
- Global exchange rate support

</td>
<td>

🔒 **Local Data Storage**
- All data stored securely on your device
- No cloud dependency - complete privacy
- AsyncStorage persistence
- Full offline functionality

</td>
</tr>
<tr>
<td>

📱 **Cross-Platform**
- iOS native experience
- Android native experience
- Web browser support
- Seamless sync across devices

</td>
<td>

 🎨 **Beautiful UI/UX**
- Responsive design for all screen sizes
- Smooth animations and transitions
- Dark & light mode support
- Intuitive navigation

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<th>Category</th>
<th>Technology</th>
<th>Purpose</th>
</tr>
<tr>
<td>⚡ Core</td>
<td><strong>React 19</strong> + <strong>React Native 0.81</strong></td>
<td>UI framework & mobile development</td>
</tr>
<tr>
<td>🧭 Framework</td>
<td><strong>Expo 54</strong></td>
<td>Development platform & rapid deployment</td>
</tr>
<tr>
<td>🗂️ Routing</td>
<td><strong>Expo Router 6</strong></td>
<td>File-based navigation system</td>
</tr>
<tr>
<td>💾 Storage</td>
<td><strong>AsyncStorage</strong></td>
<td>Persistent local data management</td>
</tr>
<tr>
<td>📊 Charts</td>
<td><strong>Victory Native</strong></td>
<td>Beautiful data visualization</td>
</tr>
<tr>
<td>✍️ Language</td>
<td><strong>TypeScript</strong></td>
<td>Type-safe development</td>
</tr>
<tr>
<td>🎨 Icons</td>
<td><strong>Expo Vector Icons</strong></td>
<td>1000+ customizable icons</td>
</tr>
<tr>
<td>📦 Navigation</td>
<td><strong>React Navigation 7</strong></td>
<td>Bottom tab navigation system</td>
</tr>
</table>

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
