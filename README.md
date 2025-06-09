# Zelo App - Complete Backend Setup

A comprehensive web application for connecting artisans and clients in Nigeria, built with Next.js, Firebase, and Paystack.

## 🚀 Features

### Core Functionality
- **User Authentication**: Email/password authentication with role-based access (Client, Artisan, Admin)
- **Profile Management**: Comprehensive profiles for artisans and clients
- **Service Requests**: Clients can post service requests, artisans can submit proposals
- **Real-time Messaging**: In-app chat with Google Meet integration
- **Secure Payments**: Escrow system using Paystack for Nigerian payments
- **File Storage**: Profile photos, portfolio images, and document attachments
- **Admin Dashboard**: Complete admin panel for platform management

### Technical Features
- **Real-time Updates**: Live notifications and messaging using Firestore
- **Security**: Comprehensive Firestore security rules
- **Scalable Architecture**: Modular backend services
- **Payment Integration**: Full Paystack integration with webhooks
- **File Management**: Firebase Storage for all file uploads
- **Database Optimization**: Proper indexing for performance

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **Payments**: Paystack (Nigerian payment gateway)
- **Real-time**: Firestore real-time listeners
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form with Zod validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zelo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

4. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Firebase and Paystack credentials.

5. **Initialize Firebase**
   ```bash
   firebase login
   firebase init
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Start Firebase emulators** (in a separate terminal)
   ```bash
   npm run firebase:emulators
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Enable Storage
5. Copy your config to `.env.local`

### Paystack Setup

1. Create a Paystack account at [Paystack](https://paystack.com)
2. Get your API keys from the dashboard
3. Add them to `.env.local`
4. Set up webhooks pointing to your app's `/api/webhooks/paystack` endpoint

### Database Schema

The app uses the following main collections:

- `users` - User authentication data and roles
- `artisanProfiles` - Artisan-specific profile data
- `clientProfiles` - Client-specific profile data
- `serviceRequests` - Job postings from clients
- `proposals` - Artisan proposals for service requests
- `chats` - Chat metadata
- `chats/{chatId}/messages` - Chat messages
- `escrowTransactions` - Payment and escrow data
- `notifications` - User notifications
- `withdrawalAccounts` - Artisan bank account details

## 🔐 Security

### Firestore Security Rules

The app implements comprehensive security rules:

- **Role-based access**: Users can only access data appropriate to their role
- **Owner-based permissions**: Users can only modify their own data
- **Admin privileges**: Admins have elevated access for platform management
- **Chat security**: Users can only access chats they participate in
- **Transaction security**: Financial data is strictly controlled

### Authentication Flow

1. User registers with email/password and selects role
2. Profile document is created based on role
3. Role-based dashboard access is enforced
4. All API calls are authenticated and authorized

## 💳 Payment Flow

1. **Service Agreement**: Client accepts artisan's proposal
2. **Payment Initialization**: Client pays via Paystack
3. **Escrow Funding**: Payment is held in escrow (minus 10% platform fee)
4. **Service Delivery**: Artisan completes the work
5. **Payment Release**: Client confirms completion, payment is released to artisan

## 📱 Real-time Features

- **Live Messaging**: Real-time chat updates
- **Notifications**: Instant notifications for important events
- **Service Request Updates**: Live updates on proposal status
- **Payment Status**: Real-time payment and escrow updates

## 🚀 Deployment

### Frontend Deployment

```bash
npm run build
firebase deploy --only hosting
```

### Backend Deployment

```bash
firebase deploy --only firestore,storage,functions
```

### Environment Variables for Production

Make sure to set production environment variables:

- Firebase production config
- Paystack live API keys
- Production app URL for webhooks

## 📊 Admin Features

- **User Management**: View, suspend, and manage all users
- **Service Oversight**: Monitor all service requests and proposals
- **Dispute Resolution**: Handle disputes between clients and artisans
- **Transaction Monitoring**: View all payments and escrow transactions
- **Platform Settings**: Configure platform-wide settings

## 🔄 API Endpoints

### Payment APIs
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify payment status
- `POST /api/webhooks/paystack` - Handle Paystack webhooks

### File Upload
- Handled through Firebase Storage with proper security rules

## 🧪 Testing

### Local Development
- Use Firebase emulators for local testing
- Test payments with Paystack test keys
- Use test bank accounts for withdrawal testing

### Production Testing
- Test with small amounts first
- Verify webhook endpoints are accessible
- Test all user flows end-to-end

## 📈 Monitoring

- **Firebase Analytics**: Track user engagement
- **Firestore Monitoring**: Monitor database performance
- **Payment Tracking**: Monitor transaction success rates
- **Error Logging**: Comprehensive error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Note**: This is a production-ready backend setup. Make sure to review all security rules, test payment flows thoroughly, and configure proper monitoring before going live.