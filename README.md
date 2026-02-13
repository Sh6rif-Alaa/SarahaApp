# Saraha App 💬

A Node.js backend application inspired by Saraha - an anonymous messaging platform where users can receive anonymous messages, manage their profiles, and build a follower network.

## 📋 Features

- **User Authentication** - Secure signup and signin with JWT tokens
- **User Profiles** - Create and manage user profiles with detailed information
- **Anonymous Messaging** - Send and receive anonymous messages
- **Follow System** - Follow and unfollow other users
- **Secure Password Storage** - Bcrypt encryption for password security
- **Data Encryption** - Additional security layer for sensitive data

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express.js v5** - Web framework with enhanced error handling
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **UUID** - Unique identifier generation
- **dotenv** - Environment variable management

## 📁 Project Structure

```
saraha-app/
├── src/
│   ├── DB/
│   │   ├── connection.js          # Database connection setup
│   │   ├── db.service.js          # Database services
│   │   └── models/                # Mongoose models
│   │       ├── user.model.js      # User schema
│   │       ├── message.model.js   # Message schema
│   │       └── follower.model.js  # Follower relationship schema
│   ├── common/
│   │   ├── enum/                  # Enums for type safety
|   |   |   └── user.enum.js
│   │   ├── middleware/
│   │   │   └── auth.js            # Authentication middleware
│   │   └── utils/
│   │       ├── response.success.js # Success response handler
│   │       └── security/          # Security utilities
│   │           ├── encrypt.security.js
│   │           └── hash.security.js
│   ├── modules/
│   │   ├── users/                 # User module
│   │   │   ├── user.controller.js
│   │   │   └── user.service.js
│   │   ├── messages/              # Message module
│   │   │   ├── message.controller.js
│   │   │   └── message.service.js
│   │   └── followers/             # Follower module
│   │       ├── follower.controller.js
│   │       └── follower.service.js
│   ├── app.controller.js          # Main application controller
│   └── index.js                   # Application entry point
├── .env.example                   # Environment variables template
├── .gitignore
├── postman_collection.json #import it on postman for apis
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/saraha-app.git
cd saraha-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=your_port
DATABASE_URL=your_database_url
TOKEN_KEY=your_jwt_secret_key
ENCRYPT_KEY=your_encryption_key
ENCRYPT_ALGORITHM=aes-256-cbc
```

4. **Run the application**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or your specified PORT)

## 📡 API Endpoints

### Authentication & Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/signup` | Register new user | No |
| POST | `/users/signin` | Login user | No |
| GET | `/users/profile` | Get user profile | Yes |

### Followers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/followers` | Follow a user | Yes |
| DELETE | `/followers` | Unfollow a user | Yes |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| Coming soon | `/messages` | Message endpoints | Yes |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, you'll receive a token that should be included in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## 📊 Data Models

### User Model
```javascript
{
  firstName: String (3-16 chars),
  lastName: String (3-16 chars),
  email: String (unique),
  password: String (hashed, min 6 chars),
  phone: String (encrypt),
  age: Number (16-80),
  gender: Enum (male/female),
  provider: Enum (system/google),
  profilePicture: String,
  confirmed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  content: String (1-999 chars),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Follower Model
```javascript
{
  follower_id: ObjectId (ref: User),
  following_id: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Development

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

### Error Handling

The application uses Express v5's native error handling capabilities. All errors are caught and returned in a consistent format:

```json
{
  "message": "Error message",
  "stack": "Error stack trace (in development)"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Your Name - [@Sh6rif-Alaa](https://github.com/Sh6rif-Alaa)

## 🙏 Acknowledgments

- Inspired by the original Saraha application
- Built with modern Node.js and Express best practices

---

⭐ Star this repository if you find it helpful!
