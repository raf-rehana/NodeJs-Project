# StartupSAAS SaaS Platform

🌐 **Live Demo (Vercel):** [https://startupsaas.vercel.app](https://startupsaas.vercel.app)

StartupSAAS is a comprehensive, premium SaaS platform designed to automate financial workflows and service management for startups and small businesses. It provides an end-to-end journey from service discovery to automated billing and task fulfillment.

## Key Features

- **Service Catalogue**: A diverse range of startup services (Trade License, Company Incorporation, VAT, etc.) with automated document checklists.
- **Role-Based Access Control (RBAC)**: Distinct portals for Super Admin, Admin, Employee, and Client.
- **Automated Billing**: Real-time invoice generation (including 50% advance billing) and payment tracking.
- **Payment Integration**: Support for SSLCommerz (Sandbox/Live), Mobile Wallets (bKash, Nagad), and Manual Payments.
- **Task Management**: Seamless workflow from client request to employee assignment and fulfillment.
- **Audit Logs**: Comprehensive system-wide tracking of administrative and financial actions.
- **Live Chat**: Real-time support widget integrated with a Node.js/Socket.io backend.
- **Responsive Design**: Modern, glass-morphism UI built with Angular and Vanilla CSS.

## 🛠️ Technology Stack

- **Frontend**: Angular (Standalone Components), RxJS, Bootstrap 5.
- **Backend (API)**: Node.js (Express), Socket.io.
- **Database**: JSON Server (Mock database for rapid development).
- **Styling**: Vanilla CSS with custom design tokens.

## 🏁 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.dev/tools/cli)

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
npm install
```

### 3. Running the Project
The project requires a PostgreSQL database and two services to run concurrently:

```bash
npm run backend

# Terminal 2: Run the Angular Frontend
npm start
```

## 🔐 Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@startupsaas.com` | `demo123` |
| Admin | `admin@startupsaas.com` | `demo123` |
| Employee | `employee@startupsaas.com` | `demo123` |
| Client | `client@startupsaas.com` | `demo123` |

## 📁 Project Structure

- `src/app/core`: Singleton services, guards, and models.
- `src/app/shared`: Reusable components (Navbar, Sidebar, Modals, Chat).
- `src/app/admin`: Administrative dashboard and management modules.
- `src/app/client`: Client portal for service requests and billing.
- `src/app/employee`: Task fulfillment and status tracking.
- `server.js`: Node.js/Express backend for payments and sockets.
- `db.json`: JSON database schema.

---

Built with ❤️ by Rafiaah.
