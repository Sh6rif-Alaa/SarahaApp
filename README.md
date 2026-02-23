# Saraha App 💬

A Node.js backend application inspired by Saraha - an anonymous messaging platform where users can receive anonymous messages, manage their profiles, and build a follower network.

## 📋 Features

- **User Authentication** - Secure signup and signin with JWT tokens and Gmail authentication
- **User Profiles** - Create and manage user profiles with detailed information
- **Follow System** - Follow and unfollow other users
- **Secure Password Storage** - Bcrypt encryption for password security
- **Data Encryption** - Additional security layer for sensitive data
- **Anonymous Messaging** - *(Coming Soon)* Send and receive anonymous messages

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express.js v5.2.1** - Web framework with enhanced error handling and native error middleware support
- **MongoDB** - NoSQL database
- **Mongoose v9.1.6** - MongoDB object modeling and schema validation
- **JWT (jsonwebtoken v9.0.3)** - JSON Web Tokens for authentication
- **Bcrypt v6.0.0** - Secure password hashing and verification
- **Google Auth Library v10.5.0** - OAuth 2.0 authentication with Gmail
- **UUID v13.0.0** - Unique identifier generation
- **CORS v2.8.6** - Cross-Origin Resource Sharing middleware
- **dotenv v17.3.1** - Environment variable management
- **cross-env v10.1.0** - Cross-platform environment variable setting
- **Node.js Crypto** - Built-in encryption for sensitive data

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
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
PORT=your_port
DATABASE_URL=your_mongodb
TOKEN_KEY=your_jwt_key
ENCRYPT_KEY==your_encrypt_key
ENCRYPT_ALGORITHM=your_algorithm like (aes-256-cbc)
PREFIX=your_prefix
SALT_ROUNDS=your_salt
CLIENT_ID=your_client_id
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
| POST | `/users/signup/gmail` | Register new user with Gmail | No |
| POST | `/users/signin` | Login user | No |
| GET | `/users/profile` | Get user profile | Yes |

### Followers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/followers` | Follow a user | Yes |
| DELETE | `/followers` | Unfollow a user | Yes |

### Messages *(Coming Soon)*

The messages module is under development. Endpoints for sending and receiving anonymous messages will be available soon.

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, you'll receive a token that should be included in the Authorization header:

```
Authorization: your_prefix <your_token_here>
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

[@Sh6rif-Alaa](https://github.com/Sh6rif-Alaa)

## 🙏 Acknowledgments

- Inspired by the original Saraha application
- Built with modern Node.js and Express best practices

---

⭐ Star this repository if you find it helpful!
