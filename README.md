#  Greenspend

<div align="center">

###  Take Control of Your Finances

A modern, intuitive personal finance management app built with **React Native** and **Expo**. 
Track your income, manage budgets, analyze spending patterns, and achieve your financial goals with style.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-54.0.21-000020?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org)

</div>

---

##  Features at a Glance

| Feature | Description | Icon |
|---------|-------------|------|
|  **Transactions** | Record income & expenses with categories & notes |  |
|  **Budget Tracking** | Set monthly limits & monitor spending |  |
|  **Analytics** | Beautiful charts & spending insight |  |
|  **Recurring** | Automate income & expense tracking |  |
|  **Multi-Currency** | Support for global currencies |  |
|  **Privacy** | All data stored locally on device |  |
|  **Cross-Platform** | iOS, Android & Web support |  |
|  **Beautiful UI** | Smooth animations & responsive design |  |

---

##  Tech Stack

<table>
<tr>
<th> Category</th>
<th> Technology</th>
<th> Purpose</th>
</tr>
<tr>
<td> Core</td>
<td><strong>React 19</strong> + <strong>React Native 0.81</strong></td>
<td>UI framework & mobile development</td>
</tr>
<tr>
<td> Framework</td>
<td><strong>Expo 54</strong></td>
<td>Development platform & rapid deployment</td>
</tr>
<tr>
<td> Routing</td>
<td><strong>Expo Router 6</strong></td>
<td>File-based navigation system</td>
</tr>
<tr>
<td> Storage</td>
<td><strong>AsyncStorage</strong></td>
<td>Persistent local data management</td>
</tr>
<tr>
<td> Charts</td>
<td><strong>Victory Native</strong></td>
<td>Beautiful data visualization</td>
</tr>
<tr>
<td> Language</td>
<td><strong>TypeScript</strong></td>
<td>Type-safe development</td>
</tr>
<tr>
<td> Icons</td>
<td><strong>Expo Vector Icons</strong></td>
<td>1000+ customizable icons</td>
</tr>
<tr>
<td> Navigation</td>
<td><strong>React Navigation 7</strong></td>
<td>Bottom tab navigation system</td>
</tr>
</table>

---

##  Prerequisites

Before you begin, ensure you have the following installed:

|  Requirement |  Version |  Purpose |
|------------|---------|---------|
|  Node.js | v18+ | JavaScript runtime |
|  npm or yarn | Latest | Package manager |
|  Expo CLI | Latest | Development platform |
|  Xcode | Latest | iOS development (macOS only) |
|  Android Studio | Latest | Android development |

> ** Tip:** Install Expo CLI globally:
> ```bash
> npm install -g expo-cli
> ```

---

##  Quick Start (5 Minutes)

### Step 1: Clone Repository 

```bash
git clone https://github.com/yourusername/greenspend.git
cd greenspend
```

### Step 2: Install Dependencies 

```bash
npm install
# or if you prefer yarn
yarn install
```

### Step 3: Start Development Server 

```bash
npx expo start
```

### Step 4: Run on Device 

| Platform | Command | Info |
|----------|---------|------|
| ** iOS Simulator** | Press `i` | macOS only |
| ** Android Emulator** | Press `a` | Any OS |
| ** Web Browser** | Press `w` | Desktop |
| ** Physical Device** | Scan QR code | Use Expo Go app |

---

##  Project Structure

```
greenspend/ 

  app/                           # Expo Router (file-based routing)
    _layout.tsx                  # Root layout & navigation
    index.tsx                    # Entry point
    onboarding.tsx               #  Onboarding screens  
    add-transaction.tsx          #  Add transaction
    (tabs)/                      # Tab navigation
        _layout.tsx              # Tab layout
        index.tsx                #  Dashboard
        transactions.tsx         #  Transactions
        budgets.tsx              #  Budgets
        analytics.tsx            #  Analytics
        profile.tsx              #  Profile

  assets/                       # Images, fonts, icons

  components/                   # Reusable components
    BarChart.tsx                #  Bar charts
    BudgetGauge.tsx             #  Budget gauges
    Button.tsx                  # Buttons
    Card.tsx                    # Cards
    EmptyState.tsx              # Empty states
    PieChart.tsx                #  Pie charts
    TransactionItem.tsx         # Transaction items

  constants/
    theme.ts                    #  Colors & typography

  hooks/
    useCurrency.ts              # Currency formatting

  services/
    storage.ts                  # Storage operations

  types/
    index.ts                    # TypeScript interfaces

  Configuration Files
     app.json                    # Expo config
     package.json                # Dependencies
     tsconfig.json               # TypeScript
     babel.config.js             # Babel
     metro.config.js             # Metro

```

---

##  Architecture Overview

###  Data Models

|  Model |  Purpose |  Key Fields |
|-------|---------|-----------|
| **Transaction** | Income/expense | `id`, `amount`, `type`, `category`, `date` |
| **Budget** | Spending limits | `id`, `category`, `limit`, `month` |
| **Settings** | Preferences | `currency`, `onboarding` |

###  Core Services

####  Storage Service (`services/storage.ts`)
```
 CRUD operations for transactions
 Budget management per category
 Custom category storage
 Analytics calculations
 Settings persistence
```

####  Currency Hook (`hooks/useCurrency.ts`)
```
 Currency symbol formatting
 Multi-currency support
 Locale-aware formatting
 Consistent app-wide usage
```

###  Data Flow Architecture

```

  User Input 

       

  React Component

       

  Custom Hooks    (useCurrency, etc)

       

 Storage Service 

       

   AsyncStorage       
  (Local Persistence) 

```

---

##  App Screens

|  Screen | Emoji |  Description |
|--------|-------|-------------|
| **Onboarding** |  | Welcome intro & setup wizard |
| **Dashboard** |  | Financial overview & quick stats |
| **Transactions** |  | Manage all transactions |
| **Budgets** |  | Set & track spending |
| **Analytics** |  | Charts & trends |
| **Profile** |  | Settings & preferences |

###  Screen Highlights

** Dashboard**
- Recent transactions list
- Monthly income vs expenses
- Budget status overview
- Quick action buttons

** Transactions**
- Full transaction history
- Filter by date & category
- Quick add button
- Transaction details modal

** Analytics**
- Monthly trend charts
- Category breakdown
- Spending patterns
- Import/export data

** Budgets**
- Category limits
- Visual progress gauge
- Spending alerts
- Budget recommendations

---

##  Development Guide

###  Start Server
```bash
npx expo start
```

###  Lint Code
```bash
npm run lint
```

**Auto-fix issues:**
```bash
npm run lint -- --fix
```

###  Build Commands

|  Purpose |  Command |  Output |
|---------|---------|--------|
| **iOS (Local)** | `eas build --platform ios --local` | .ipa |
| **Android (Local)** | `eas build --platform android --local` | .apk |
| **iOS (Release)** | `eas build --platform ios` | App Store ready |
| **Android (Release)** | `eas build --platform android` | Play Store ready |

###  Development Tips

 Hot reload enabled for instant testing
 React Native Debugger for deep debugging
 Test on physical devices with Expo Go
 Use TypeScript for type safety
 Test on various screen sizes

###  Debugging

```bash
# Verbose logging
DEBUG=expo:* npx expo start

# React DevTools  
npm install -g react-devtools
react-devtools
```

---

##  Key Dependencies

###  Core Packages

```json
{
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo": "54.0.21",
  "expo-router": "6.0.14",
  "typescript": "latest"
}
```

###  UI & Visualization

- `victory-native` - Charts & graphs
- `@expo/vector-icons` - Icon library
- `react-native-svg` - SVG support
- `expo-linear-gradient` - Gradients
- `expo-blur` - Blur effects

###  Navigation & Interaction

- `@react-navigation/native` - Navigation
- `@react-navigation/bottom-tabs` - Tab nav
- `react-native-gesture-handler` - Gestures
- `react-native-reanimated` - Animations
- `expo-haptics` - Haptic feedback

###  Storage & Data

- `@react-native-async-storage/async-storage` - LocalStorage
- `uuid` - ID generation
- `@react-native-community/datetimepicker` - Date picker

---

##  Deployment Guide

###  iOS Deployment

1.  Install & configure Xcode
2.  Set up Apple Developer account
3.  Create provisioning profiles
4.  Build: `eas build --platform ios`
5.  Submit to App Store

###  Android Deployment

1.  Configure Google Play credentials
2.  Generate signing key
3.  Build: `eas build --platform android`
4.  Upload to Google Play Console

###  Web Deployment

```bash
npx expo export --platform web

# Deploy to Vercel, Netlify, etc.
vercel .expo/dist/web
```

---

##  Customization

###  Theme Customization

Edit `constants/theme.ts`:

```typescript
export const Colors = {
  emeraldGreen: '#10b981',
  lightGray: '#f3f4f6',
  darkBg: '#1f2937',
  // Add your colors
};
```

###  Add Custom Categories

Edit `constants/theme.ts` and add to `DefaultCategories`:

```typescript
export const DefaultCategories = [
  'Salary', 'Freelance', 'Groceries', 'Transport',
  'Entertainment', 'Healthcare', 'Your Custom Category'
];
```

---

##  Contributing

We love contributions! Here''s how to help:

1.  Fork the repository
2.  Create feature branch: `git checkout -b feature/YourFeature`
3.  Commit changes: `git commit -m ''Add YourFeature''`
4.  Push branch: `git push origin feature/YourFeature`
5.  Open Pull Request

###  Contribution Ideas

-  Bug fixes
-  New features
-  Documentation
-  Tests
-  Translations

---

##  License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

---

##  Bug Reports & Feature Requests

Found a  bug or have a  feature idea?

1. Check [existing issues](https://github.com/yourusername/greenspend/issues)
2. [Create new issue](https://github.com/yourusername/greenspend/issues/new) with:
   -  Clear description
   -  Device & OS info
   -  Screenshots if applicable
   -  Steps to reproduce (bugs)

---

##  Support & Community

-  **GitHub Issues** - Bug reports & features
-  **Discussions** - Q&A & ideas
-  **Wiki** - Detailed guides
-  **Discord** - Community chat

---

##  Acknowledgments & Credits

|  Credit |  Link |
|--------|------|
| **Expo** | [expo.dev](https://expo.dev) - Amazing platform |
| **React Native** | Community & maintainers |
| **Victory** | [Victory Charts](https://formidable.com/open-source/victory) |
| **Icons** | [Expo Vector Icons](https://icons.expo.fyi/) |
| **Community** | All contributors & supporters |

---

##  Project Stats

-  Components: 7
-  Custom Hooks: 1
-  Services: 1
-  App Screens: 6
-  TypeScript: 100%
-  Lines of Code: 2000+

---

<div align="center">

###  **Happy Budgeting!**

#### Track your spending, manage your budget, and achieve your financial goals with **Greenspend** 

 If you find this project useful, please star it! 

[GitHub](https://github.com/yourusername/greenspend)  [Issues](https://github.com/yourusername/greenspend/issues)  [Discussions](https://github.com/yourusername/greenspend/discussions)

</div>

---

**Made with  by developers, for developers**

Last Updated: February 2026  v1.0.0
