# Zelo Application Documentation

This document provides a comprehensive overview of the Zelo application, detailing its features, user roles, pages, and core components.

## 🚀 Core Features

- **Role-Based Authentication**: Secure sign-up and login for Clients, Artisans, and Admins using Email/Password or Google Sign-In.
- **Tailored Onboarding**: Unique onboarding flows for Clients and Artisans to set up their profiles and preferences.
- **Comprehensive Profiles**: Detailed public profiles for Artisans to showcase their skills, experience, and portfolio. Clients also have profiles to manage their requests.
- **Service Request Management**: Clients can post detailed service requests, which are then browseable by Artisans.
- **Proposal System**: Artisans can submit detailed proposals (bids) for open service requests.
- **Secure Payments**: Integration with Paystack for secure, escrow-based payments in Nigerian Naira (NGN).
- **Real-time Messaging**: A complete in-app chat interface for direct communication between Clients and Artisans.
- **Admin Dashboard**: A powerful backend interface for platform management, including user, job, and transaction oversight.
- **File & Image Uploads**: Secure handling of profile photos and portfolio images via Firebase Storage.

---

## 👤 User Roles & Pages

### Public / Unauthenticated User

- **Home Page (`/`)**: Landing page with feature overview and calls to action.
- **Browse Services (`/browse-services`)**: A public view of open job requests and featured artisans.
- **Authentication Pages (`/login`, `/register`)**: Forms for user sign-in and sign-up.
- **Legal Pages (`/terms`, `/privacy`)**: Terms of Service and Privacy Policy.

### Client

- **Dashboard (`/dashboard`)**: Overview of active requests, hired artisans, and quick actions.
- **Post a New Request (`/dashboard/services/request/new`)**: Form to create a new job posting.
- **My Service Requests (`/dashboard/services/my-requests`)**: A view of all requests posted by the client.
- **Service Request Details (`/dashboard/services/requests/[id]`)**: Detailed view of a single request, where clients can review proposals and manage the job (e.g., accept proposals, fund escrow).
- **Browse Artisans (`/dashboard/services/browse`)**: Filterable gallery of available artisans.
- **Messages (`/dashboard/messages`)**: Communication center.
- **Payments (`/dashboard/payments/**`)**: Overview of spending and transaction history.
- **Profile Management (`/dashboard/profile/client/edit`)**: Page to edit personal and profile information.

### Artisan

- **Dashboard (`/dashboard`)**: Overview of bids, active jobs, and earnings.
- **Find Jobs (`/dashboard/jobs`)**: Main page to browse and filter all open service requests from clients.
- **My Jobs & Proposals (`/dashboard/services/my-offers`)**: Tabbed view to track submitted proposals, active jobs, and completed work.
- **Service Request Details (`/dashboard/services/requests/[id]`)**: Detailed view of a job, where an artisan can submit a proposal.
- **Messages (`/dashboard/messages`)**: Communication center.
- **Payments (`/dashboard/payments/**`)**: Overview of earnings, withdrawal settings, and transaction history.
- **Profile Management (`/dashboard/profile/artisan/edit`)**: Page to edit all artisan-specific details, including bio, services, experience, and portfolio.
- **Withdrawal Settings (`/dashboard/profile/withdrawal-settings`)**: Page to manage bank account details for payouts.

### Admin

- **Admin Dashboard (`/dashboard/admin`)**: A central hub with platform statistics and quick actions.
- **User Management (`/dashboard/admin/users`)**: View, filter, and manage all users on the platform.
- **Job Management (`/dashboard/admin/jobs`)**: Oversee all service requests on the platform.
- **Transaction Log (`/dashboard/admin/transactions`)**: View a complete history of all financial transactions.
- **Dispute Center (`/dashboard/admin/disputes`)**: Interface to manage and resolve disputes.
- **Platform Settings (`/dashboard/admin/settings`)**: Configure global settings for the application.

---

## 🧩 Key Components

- **Authentication (`/components/auth`)**: Contains layouts and forms for login, registration, and role selection.
- **Onboarding (`/components/onboarding`)**: Components used in the multi-step user onboarding process, like `ServiceSelectionChips` and progress indicators.
- **Profiles (`/components/profile`)**: Forms for editing Client and Artisan profiles.
- **Service Requests (`/components/service-requests`)**: Reusable `ServiceRequestCard` and forms for creating/editing requests and submitting proposals.
- **Messaging (`/components/messaging`)**: The `ChatInterface` component that powers the real-time messaging page.
- **Payments (`/components/payments`)**: Components like `EscrowInfo` for displaying transaction details.
- **Shared UI (`/components/shared`)**: Core, reusable elements like the `DashboardHeader` and `Logo`.
- **UI Primitives (`/components/ui`)**: Base UI components from `shadcn/ui` (Button, Card, Input, etc.) that form the design system.

---

## 🛠 Technology Stack

- **Framework**: Next.js 15 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with `shadcn/ui` components
- **Backend-as-a-Service (BaaS)**:
  - **Database**: Firestore
  - **Authentication**: Firebase Authentication
  - **File Storage**: Firebase Storage
- **Payments**: Paystack (for Nigerian Naira)

---

## 📦 Pushing to GitHub

To get your project code into a GitHub repository, follow these steps in your local terminal:

1. **Initialize Git (if you haven't already):**
   ```bash
   git init
   ```

2. **Add all files to staging:**
   ```bash
   git add .
   ```

3. **Create your first commit:**
   ```bash
   git commit -m "Initial commit of Zelo application"
   ```

4. **Link to your GitHub repository:**
   (Replace `<your-github-repo-url>` with the URL from your GitHub project)
   ```bash
   git remote add origin <your-github-repo-url>
   ```

5. **Push your code to the `main` branch:**
   ```bash
   git push -u origin main
   ```

Now your code is safely stored on GitHub!
