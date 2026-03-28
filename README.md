# 📝 Production-Ready Task Management Application

A full-stack, production-grade Task Management Application built with **React 19 + Vite** on the frontend and **Express 5 + Node.js** on the backend, backed by **MongoDB**. Features JWT authentication, bcrypt password hashing, protected routes, input validation, and multiple security layers.

🌐 **Live Demo:** [production-ready-task-management-ap.vercel.app](https://production-ready-task-management-ap.vercel.app)

> ## ⚠️ Important — Backend Cold Start (Render Free Tier)
>
> The backend API is hosted on **Render's free tier**, which **automatically spins down after 15 minutes of inactivity**.
>
> **What this means for you:**
> - 🐢 The **first request** after idle may take **30–60 seconds** to respond — this is normal
> - ✅ Once the server is awake, all subsequent requests will be **fast and responsive**
> - 🔄 If the live demo appears to hang or not load on first visit, **please wait a moment and refresh**
>
> This is a known limitation of Render's free hosting plan and does **not** reflect the actual performance of the application.

---

## 🚀 Features

- 🔐 **JWT Authentication** — HttpOnly cookie + Bearer token dual delivery
- 🔒 **Password Hashing** — bcryptjs with 10 salt rounds
- 🛡️ **Protected Routes** — frontend `ProtectedRoute` component + backend `protect` middleware
- ✅ **Input Validation** — express-validator on all auth and task endpoints
- 🧹 **NoSQL Injection Prevention** — express-mongo-sanitize on all requests
- 🪖 **Security Headers** — Helmet.js sets production-safe HTTP headers
- 📋 **Full Task CRUD** — create, read, update, and delete tasks per user
- 🔍 **Search & Filter** — full-text search + status filter with pagination (10/page)
- 👤 **User Ownership** — every task is tied to a user; access is strictly enforced
- 🍞 **Toast Notifications** — react-hot-toast for success/error feedback
- 🌍 **Deployed** — frontend on Vercel, CORS configured for cross-origin support

---

## 🛠️ Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| express | ^5.2.1 | REST API framework |
| mongoose | ^9.3.0 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT signing & verification |
| express-validator | ^7.3.1 | Request input validation |
| helmet | ^8.1.0 | Secure HTTP headers |
| express-mongo-sanitize | ^2.2.0 | NoSQL injection prevention |
| cookie-parser | ^1.4.7 | HttpOnly cookie support |
| cors | ^2.8.6 | Cross-origin resource sharing |
| morgan | ^1.10.1 | HTTP request logging (dev) |
| express-async-handler | ^1.2.0 | Async error forwarding |
| dotenv | ^17.3.1 | Environment variable loading |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| react | ^19.1.1 | UI library |
| vite | ^7.1.7 | Build tool & dev server |
| tailwindcss | ^4.2.1 | Utility-first CSS |
| react-router-dom | ^7.13.1 | Client-side routing & protected routes |
| axios | ^1.13.6 | HTTP client with request interceptors |
| react-hot-toast | ^2.6.0 | Toast notifications |
| lucide-react | ^0.577.0 | Icon library |

---

## 📁 Project Structure

```
production-ready-Task-Management-Application/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js      # Register, login, logout, profile
│   │   └── taskController.js      # CRUD + search + pagination
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect middleware
│   │   ├── errorMiddleware.js     # Global error & 404 handler
│   │   └── validator.js           # express-validator rules
│   ├── models/
│   │   ├── User.js                # User schema + bcrypt hooks
│   │   └── Task.js                # Task schema + text index
│   ├── routes/
│   │   ├── userRoutes.js          # /api/users
│   │   └── taskRoutes.js          # /api/tasks
│   ├── utils/
│   │   └── generateToken.js       # JWT sign + HttpOnly cookie setter
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── server.js                  # App entry — middleware chain + routes
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── ProtectedRoute.jsx # Auth guard (redirects to /login)
│   │   │   └── TaskModal.jsx      # Create/edit task modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state + login/logout/register
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Main task management page
│   │   │   ├── Login.jsx          # Login form
│   │   │   └── Register.jsx       # Registration form
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance + Bearer token interceptor
│   │   ├── App.jsx                # Routes + AuthProvider wrapper
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── vercel.json                # Vercel SPA routing config
│   ├── vite.config.js
│   └── package.json
│
└── .gitignore
```

---

## 🔐 Core Security — How It Works

### 1. Password Hashing (bcryptjs)

Passwords are **never stored in plain text**. The `User` model uses a Mongoose `pre('save')` hook to automatically hash passwords before they hit the database.

```js
// backend/models/User.js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next(); // skip if password unchanged
  const salt = await bcrypt.genSalt(10);    // 1024 iterations
  this.password = await bcrypt.hash(this.password, salt);
});

// Constant-time comparison — prevents timing attacks
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

The `password` field has `select: false` — it is **never returned** from any query unless explicitly opted in with `.select('+password')` during login.

---

### 2. JWT Authentication

Tokens are signed with `JWT_SECRET` and expire in **30 days**. They are delivered two ways to handle cross-origin cookie restrictions:

```js
// backend/utils/generateToken.js
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

res.cookie('jwt', token, {
  httpOnly: true,   // inaccessible to JavaScript — blocks XSS theft
  secure: true,     // HTTPS only
  sameSite: 'none', // allows cross-site (Vercel frontend ↔ backend)
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

return token; // also returned in response body as fallback
```

**Logout** clears the cookie by overwriting it with an empty, immediately-expired value:

```js
res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
```

---

### 3. Backend Protected Routes (`protect` middleware)

Every private route passes through the `protect` middleware, which:
1. Checks for a JWT in the HttpOnly cookie **or** the `Authorization: Bearer` header
2. Verifies the token with `jwt.verify()`
3. Fetches the user from MongoDB (without password) and attaches to `req.user`

```js
// backend/middleware/authMiddleware.js
const protect = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
```

---

### 4. Frontend Protected Routes (`ProtectedRoute` component)

The React router wraps private pages in `ProtectedRoute`, which reads auth state from `AuthContext`. If the user is not authenticated, they are redirected to `/login`:

```jsx
// frontend/src/components/ProtectedRoute.jsx
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
```

Routing setup in `App.jsx`:

```jsx
<Routes>
  <Route path="/login"    element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Dashboard />} />  {/* 🔒 protected */}
  </Route>
</Routes>
```

---

### 5. Axios Interceptor — Auto Bearer Token

The Axios instance automatically attaches the stored JWT to every outgoing API request:

```js
// frontend/src/utils/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

### 6. Input Validation (express-validator)

All user-facing endpoints validate input **before** it reaches any controller logic:

```js
// backend/middleware/validator.js
const validateRegister = [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Minimum 6 characters').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
```

---

### 7. Security Middleware Stack (`server.js`)

```js
app.use(helmet());                  // Sets X-Frame-Options, HSTS, CSP, etc.
app.use(mongoSanitize());           // Strips $ and . from req.body / req.query
app.use(cors({ credentials: true })); // Allows cookies cross-origin
```

---

## 📡 API Reference

### User Routes — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/users` | Public | Register new user |
| POST | `/api/users/login` | Public | Login, receive JWT |
| POST | `/api/users/logout` | Public | Clear JWT cookie |
| GET | `/api/users/profile` | 🔒 Private | Get logged-in user profile |

### Task Routes — `/api/tasks`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | 🔒 Private | Get all tasks (paginated, searchable) |
| POST | `/api/tasks` | 🔒 Private | Create a new task |
| GET | `/api/tasks/:id` | 🔒 Private | Get single task by ID |
| PUT | `/api/tasks/:id` | 🔒 Private | Update a task |
| DELETE | `/api/tasks/:id` | 🔒 Private | Delete a task |

#### Query Parameters for `GET /api/tasks`

| Param | Type | Description |
|---|---|---|
| `keyword` | string | Search in title & description (case-insensitive) |
| `status` | string | Filter: `pending`, `in-progress`, or `completed` |
| `pageNumber` | number | Page number — 10 results per page |

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/Akhandsingh119/production-ready-Task-Management-Application.git
cd production-ready-Task-Management-Application
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the server:

```bash
npm run dev    # development with nodemon (auto-restart)
npm start      # production
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## 🌐 Deployment

### Frontend — Vercel

1. Import the repo into [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend-url/api`
4. The included `vercel.json` handles SPA client-side routing automatically

### Backend — Render

The backend is deployed on [Render](https://render.com) (free tier).

1. Point **Root Directory** to `backend`
2. Set start command to `node server.js`
3. Add environment variables: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`

> ⚠️ **Cold Start Notice:** Render's free tier spins down the server after periods of inactivity. The **first request after idle may take 30–60 seconds** to respond while the server wakes up. Subsequent requests will be fast. If the live demo appears unresponsive on first load, please wait a moment and try again.

---

## 🗄️ Data Models

### User

| Field | Type | Notes |
|---|---|---|
| username | String | Required, trimmed |
| email | String | Required, unique, regex validated |
| password | String | Required, min 6 chars, `select: false` — never returned by default |
| createdAt / updatedAt | Date | Auto-generated (Mongoose timestamps) |

### Task

| Field | Type | Notes |
|---|---|---|
| title | String | Required, max 100 characters |
| description | String | Required, max 500 characters |
| status | String | Enum: `pending` / `in-progress` / `completed` (default: `pending`) |
| user | ObjectId | Ref → User. Ownership enforced on every operation |
| createdAt / updatedAt | Date | Auto-generated (Mongoose timestamps) |

> A compound **text index** on `title` + `description` powers the keyword search feature.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Akhand Singh**
- GitHub: [@Akhandsingh119](https://github.com/Akhandsingh119)
- Live: [production-ready-task-management-ap.vercel.app](https://production-ready-task-management-ap.vercel.app)
