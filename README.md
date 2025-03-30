# STCK Project

## Overview
STCK is a full-stack application designed for inventory management, user roles, license activation, and more. It includes a backend built with Node.js and Express, and a frontend built with React and Material-UI.

---

## Features
- Inventory management with search, filters, and bulk upload.
- User roles and permissions management.
- Permanent license activation and renewal.
- Audit logs and user activity tracking.
- Multi-language support (English, Arabic, French).

---

## Prerequisites
Before setting up the project, ensure the following are installed on your system:

1. **Node.js** (v16 or later):
   - Download and install from [Node.js official website](https://nodejs.org/).
   - Verify installation:
     ```bash
     node -v
     npm -v
     ```

2. **npm**:
   - npm comes bundled with Node.js. If you prefer yarn, install it globally:


3. **MongoDB**:
   - Download and install MongoDB from [MongoDB official website](https://www.mongodb.com/try/download/community).
   - Start the MongoDB service:
     ```bash
     mongod
     ```
   - Verify MongoDB is running:
     ```bash
     mongo
     ```

4. **MongoDB Shell (Mongosh)**:
   - Download and install Mongosh from [Mongosh Official Website](https://www.mongodb.com/try/download/shell).
   - Verify installation:
     ```bash
     where mongosh
     ```


5. **Git**:
   - Download and install Git from [Git official website](https://git-scm.com/).
   - Verify installation:
     ```bash
     git --version
     ```

---

## Installation Guide

### 1. Clone the Repository
1. Open a terminal and navigate to the directory where you want to clone the project.
2. Run the following command:
   ```bash
   git clone <repository-url>
   cd stck
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install express-session express-rate-limit helmet express-mongo-sanitize xss-clean express-validator mongo-sanitize nodemailer systeminformation
   ```

2. Create a `.env` file in the `backend` directory:
   ```plaintext
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/stck
   JWT_SECRET=your_jwt_secret
   LICENSE_ENCRYPTION_KEY=your_32_byte_hex_key
   LICENSE_ENCRYPTION_IV=your_16_byte_hex_iv
   ```
   - Replace `your_jwt_secret` with a secure secret key for JWT.
   - Replace `your_32_byte_hex_key` and `your_16_byte_hex_iv` with valid encryption keys.
3. Install backend dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   - The backend server will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Create a `.env` file in the `frontend` directory:
   ```plaintext
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   - Ensure the API URL matches the backend server's address.
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```
   - The frontend server will run on `http://localhost:3000`.

---

## Usage
1. Open your browser and navigate to `http://localhost:3000`.
2. Use the application to manage inventory, users, licenses, and more.

---

## Build for Production
To create a production build of the frontend:
```bash
npm run build
```
The build files will be located in the `frontend/build` directory.

---

## API Documentation
The backend exposes a RESTful API. Below are some key endpoints:

### Authentication
- **POST** `/api/auth/login`: Log in a user.
- **POST** `/api/auth/register`: Register a new user.
- **GET** `/api/auth/profile`: Fetch the current user's profile.

### Inventory
- **GET** `/api/inventory`: Fetch all products with pagination.
- **POST** `/api/inventory`: Add a new product.
- **PUT** `/api/inventory/:id`: Update an existing product.
- **DELETE** `/api/inventory/:id`: Delete a product.

### Roles and Permissions
- **GET** `/api/roles`: Fetch all roles.
- **POST** `/api/roles`: Create a new role.
- **PUT** `/api/roles/:id`: Update a role.
- **DELETE** `/api/roles/:id`: Delete a role.

### License
- **POST** `/api/license/activate`: Activate a license.
- **POST** `/api/license/deactivate`: Deactivate a license.
- **POST** `/api/license/renew`: Renew a license.
- **GET** `/api/license/validate`: Validate a license.
- **GET** `/api/license/analytics`: Get license usage analytics.

### User Activity Logs
- **GET** `/api/user-activity-logs`: Fetch all user activity logs (admin only).
- **GET** `/api/user-activity-logs/by-user/:userId`: Fetch activity logs for a specific user (admin only).

### Roles
- **POST** `/api/roles/initialize`: Initialize predefined roles (admin only).
- **PUT** `/api/roles/delegate-admin`: Temporarily delegate admin role to a manager (superadmin only).

### Inventory
- **GET** `/api/inventory/stats`: Fetch inventory statistics, including total products and stock value.
- **GET** `/api/inventory/category-stats`: Fetch product counts grouped by category.
- **POST** `/api/inventory/bulk-upload`: Bulk upload products via a CSV file.
- **GET** `/api/inventory/export`: Export inventory data as a CSV file.
- **GET** `/api/inventory/trends`: Fetch inventory trends over time.

### License
- **GET** `/api/license/usage-analytics`: Fetch detailed license usage analytics.
- **GET** `/api/license/admin/dashboard`: Fetch detailed license data for the admin dashboard.
- **GET** `/api/license/admin/usage-history/:id`: Fetch the usage history of a specific license.

For a full list of endpoints, refer to the `routes` directory in the backend.

---

## Middleware

### Audit Logger
The `auditLogger` middleware logs user actions to the database for auditing purposes. It is used in routes like inventory and transactions.

### License Validator
The `licenseValidator` middleware validates license keys and enforces usage limits. It also tracks failed attempts and blocks IPs temporarily after repeated invalid attempts.

### Permission Checker
The `checkPermission` middleware ensures that users have the required permissions to access specific routes. It checks the user's role and associated permissions.

---

## Predefined Roles
The application includes predefined roles with specific permissions:

1. **Superadmin**: Full access to all features and settings.
2. **Admin**: Manage users, view reports, and oversee operations.
3. **Manager**: Manage inventory and oversee sellers and inventory clerks.
4. **Seller**: Sell products and view sales reports.
5. **Inventory Clerk**: Add and update product information in the inventory.

---

## Real-Time Features
The application uses **Socket.IO** for real-time updates:
- **Inventory Updates**: Clients are notified when inventory changes occur.
- **Audit Log Updates**: Clients are notified when new audit logs are added.

---

## Testing
To run tests for the backend:
```bash
npm test
```

To run tests for the frontend:
```bash
cd frontend
npm test
```

---

## Troubleshooting
- **MongoDB not running**: Ensure MongoDB is installed and running.
- **Missing dependencies**: Run `npm install` in both backend and frontend directories.
- **Environment variables**: Verify `.env` files for typos or missing values.
- **Port conflicts**: Ensure no other services are running on ports `5000` or `3000`.

---

## Project Structure
The project is organized as follows:
```
stck/
├── backend/                # Backend code
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/               # Frontend code
│   ├── src/                # React source files
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── i18n/           # Localization files
│   │   └── App.js          # Main React app file
│   └── public/             # Static assets
└── README.md               # Project documentation
```

---

## Technologies Used
### Backend
- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM for MongoDB.

### Frontend
- **React**: JavaScript library for building user interfaces.
- **Material-UI**: Component library for styling.
- **Chart.js**: For data visualization.

### Other Tools
- **Socket.IO**: Real-time communication.
- **Axios**: HTTP client for API requests.
- **dotenv**: Environment variable management.

---

## Deployment
### Backend Deployment
1. Ensure MongoDB is accessible from the deployment environment.
2. Set up environment variables on the server.
3. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```

### Frontend Deployment
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the `frontend/build` directory using a static file server or integrate it with the backend.

---

## Acknowledgments
- **Node.js** and **React** communities for their extensive documentation and support.
- **Material-UI** for providing a robust component library.
- **MongoDB** for its scalable database solution.

---

## License
This project is licensed under the MIT License.
