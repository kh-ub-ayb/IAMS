# Running IAMS Locally

This guide will walk you through the steps to successfully clone, setup, and run the Intelligent Academic Management System (IAMS) on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js**: v18.x or higher (Download from [nodejs.org](https://nodejs.org/))
- **MongoDB**: You need either a local instance of MongoDB running or a MongoDB Atlas URI (Cloud). (Download from [mongodb.com](https://www.mongodb.com/try/download/community))
- **Git**: To clone the repository.

---

## Step 1: Clone the Repository

Open your terminal or command prompt and clone the project:

```bash
git clone <your-github-repo-url>
cd IAMS
```

The project is structured into two main directories: `backend` and `frontend`.

---

## Step 2: Setup the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   - Create a file named `.env` in the `backend` directory.
   - You can copy the contents of `.env.example` if it exists, or create it with the following required variables:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   # Using local MongoDB (make sure it is running)
   MONGO_URI=mongodb://127.0.0.1:27017/iams_db

   # JWT Secrets (Use any long, random strings for local development)
   JWT_SECRET=your_super_secret_access_key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. Start the Backend Server:
   ```bash
   npm run dev
   ```
   *You should see a message saying the server is running on port 5000 and the database is connected.*

---

## Step 3: Setup the Frontend

1. Open a **new terminal window/tab** (keep the backend running) and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   - Create a file named `.env` in the `frontend` directory.
   - Add the following line to point the frontend to your local backend server:

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```

5. Access the application:
   - Open your browser and navigate to `http://localhost:3000` (or whichever port Vite provides in the terminal, usually 5173 or 3000).

---

## Step 4: Initial Seeding (Optional but Recommended)

If this is a fresh database, you need a SuperAdmin account to create an institution and begin the setup process.

1. Ensure your backend server is running.
2. In the `backend` directory, there is usually a seeder script (like `seed.js`). If one is provided, you can run it:
   ```bash
   node script/seed.js  # Replace with actual script name if different
   ```
3. If no seeder script exists, you will need to manually insert the initial SuperAdmin user and roles into your MongoDB database using a tool like MongoDB Compass.

---

## Troubleshooting

- **MongoDB Connection Error (`MongoParseError` or `MongoServerSelectionError`)**: Ensure your local MongoDB Windows/Mac service is actually running, or double-check your `MONGO_URI` if using MongoDB Atlas.
- **CORS Errors in Browser**: Ensure your backend `cors` configuration in `server.js` or `app.js` is set to accept requests from `http://localhost:3000` (or your Vite port).
- **"Invalid Credentials" on Login**: Ensure your database has the roles collection populated. The backend relies on specific role names (`SuperAdmin`, `Manager`, `ClassTeacher`, `Teacher`, `Student`).

### Copyright
- © 2026 Syed Khubayb Ur Rahman.
- GitHub: https://github.com/kh-ub-ayb
