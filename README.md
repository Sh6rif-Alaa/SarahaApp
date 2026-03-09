# Saraha App 💬

A Node.js backend application inspired by Saraha - an anonymous messaging platform where users can receive anonymous messages, manage their profiles, and build a follower network.

## 📋 Features

- **User Authentication** - Secure signup and signin with JWT tokens and Gmail authentication
- **User Profiles** - Create and manage user profiles with detailed information, profile pictures, and view tracking
- **Follow System** - Follow and unfollow other users with follower/following counts
- **Token Management** - JWT access and refresh tokens with logout functionality (single device or all devices)
- **Token Revocation** - Secure logout with automatic token revocation and TTL cleanup
- **Secure Password Storage** - Bcrypt encryption for password security
- **Data Encryption** - Additional security layer for sensitive data like phone numbers
- **Input Validation** - Comprehensive Joi-based validation for all API requests
- **File Upload** - Image upload support with Cloudinary integration
- **Profile Sharing** - Public profile sharing with view count tracking
- **Anonymous Messaging** - *(Coming Soon)* Send and receive anonymous messages

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express.js v5.2.1** - Web framework with enhanced error handling and native error middleware support
- **MongoDB** - NoSQL database
- **Mongoose v9.1.6** - MongoDB object modeling and schema validation
- **JWT (jsonwebtoken v9.0.3)** - JSON Web Tokens for authentication
- **Bcrypt v6.0.0** - Secure password hashing and verification
- **Google Auth Library v10.5.0** - OAuth 2.0 authentication with Gmail
- **Cloudinary v2.9.0** - Cloud-based image management and storage
- **UUID v13.0.0** - Unique identifier generation
- **CORS v2.8.6** - Cross-Origin Resource Sharing middleware
- **dotenv v17.3.1** - Environment variable management
- **cross-env v10.1.0** - Cross-platform environment variable setting
- **Multer v2.0.2** - Middleware for handling file uploads (images, documents, etc.)
- **Joi v18.0.2** - Data validation and schema description language
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
cp .env.example .env.development
```

Edit `.env.development` with your configuration (see Environment example Variables section below for all required variables).

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
| POST | `/users/signup` | Register new user with image upload | No |
| POST | `/users/signup/gmail` | Register new user with Gmail OAuth | No |
| POST | `/users/signin` | Login user | No |
| POST | `/users/refreshToken` | Refresh access token | Yes |
| POST | `/users/logout` | Logout user (revoke token or all tokens) | Yes |
| GET | `/users/profile` | Get authenticated user profile with follower counts | Yes |
| GET | `/users/shareProfile/:id` | Get public user profile (increments view count) | No |
| PATCH | `/users/updateProfile` | Update user profile information | Yes |
| PATCH | `/users/updatePassword` | Update user password | Yes |

### Followers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/followers` | Follow a user | Yes |
| DELETE | `/followers` | Unfollow a user | Yes |

### Messages *(Coming Soon)*

The messages module is under development. Endpoints for sending and receiving anonymous messages will be available soon.

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication with both access and refresh tokens. After successful login, you'll receive both tokens that should be included in the Authorization header:

```
Authorization: your_prefix <your_token_here>
```

### Token Management

- **Access Token**: Short-lived (5 minutes) for API access
- **Refresh Token**: Long-lived (1 year) for obtaining new access tokens
- Use `/users/refreshToken` endpoint to get new access tokens when they expire
- **Token Revocation**: Supports individual token logout or logout from all devices
  - Single logout: `POST /users/logout` (revokes current token only)
  - Logout all devices: `POST /users/logout?flag=all` (invalidates all tokens by updating `changeCredential` timestamp)
  - Revoked tokens are tracked in the database with automatic TTL cleanup

### Logout Usage

The logout endpoint provides two different logout strategies:

**1. Single Device Logout** (default)
```bash
POST /users/logout
Authorization: your_prefix <your_access_token>
```
- Revokes only the current token
- User can still access with other tokens from different devices
- Revoked token ID is stored in RevokeToken model with expiration time
- Tokens are auto-deleted after expiration via MongoDB TTL index

**2. Logout from All Devices**
```bash
POST /users/logout?flag=all
Authorization: your_prefix <your_access_token>
```
- Updates user's `changeCredential` timestamp
- Invalidates ALL tokens issued before this timestamp
- Removes all revoked token records for the user
- All previous devices will be logged out

## 📊 Data Models

### User Model
```javascript
{
  firstName: String (3-16 chars),
  lastName: String (3-16 chars),
  password: String (hashed, min 6 chars) [optional for Google users],
  email: String (unique, required),
  phone: String (encrypted, Egyptian format) [optional for Google users],
  age: Number (16-80) [optional for Google users],
  gender: Enum (male/female),
  provider: Enum (system/google),
  role: Enum (user),
  profilePicture: {
    secure_url: String (required),
    public_id: String (optional for Google users)
  },
  profileViews: Number (default: 0),
  changeCredential: Date (used to invalidate all tokens when logout from all devices),
  confirmed: Boolean,
  createdAt: Date,
  updatedAt: Date,
  userName: String (virtual: firstName + ' ' + lastName)
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

### RevokeToken Model
```javascript
{
  tokenId: String (unique identifier for revoked token),
  userId: ObjectId (ref: User),
  expiredAt: Date (token expiration time, auto-deleted via TTL index),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Development

### Scripts

- `npm start` - Start the production server (`NODE_ENV=production`)
- `npm run dev` - Start the development server with nodemon (`NODE_ENV=development`)

### Error Handling

The application uses Express v5's native error handling capabilities. All errors are caught and returned in a consistent format:

```json
{
  "message": "Error message",
  "stack": "Error stack trace (in development)"
}
```

## ✅ Validation

The API uses **Joi** for comprehensive input validation on all endpoints. Validation schemas are defined per module:

### User Validation Schemas

- **signUpSchema** - Validates user registration with:
  - `userName`: 5-40 characters (required)
  - `email`: Valid email format (required)
  - `password`: 6-30 characters with alphanumeric and special characters (required)
  - `cPassword`: Must match password (required)
  - `phone`: Egyptian phone format (required)
  - `gender`: male/female enum (default: male)
  - `age`: 16-60 years old (required)
  - `image`: Profile picture file (required)

- **signUpGmailSchema** - Validates Gmail OAuth signup:
  - `idToken`: Google ID token (required)

- **signInSchema** - Validates user login:
  - `email`: Valid email format (required)
  - `password`: Valid password format (required)

- **updateProfileSchema** - Validates profile updates:
  - `firstName`: 3-16 characters (optional)
  - `lastName`: 3-16 characters (optional)
  - `phone`: Egyptian phone format (optional)
  - `gender`: male/female enum (optional)
  - `age`: 16-60 years old (optional)

- **updatePasswordSchema** - Validates password updates:
  - `oldPassword`: Current password (required)
  - `newPassword`: New password (required)
  - `cPassword`: Must match newPassword (required)

- **shareProfileSchema** - Validates profile sharing:
  - `id`: Valid user ID (required)

### Follower Validation Schemas

- **followSchema** - Validates follow/unfollow action:
  - `following_id`: User ID to follow (required)

### Custom Validation Response

When validation fails, the API returns a 400 status with detailed error information:

```json
{
  "message": "validation error",
  "error": [
    {
      "key": "body",
      "message": "email must be a valid email",
      "path": "email",
      "type": "string.email"
    }
  ]
}
```

## 📁 File Upload (Multer & Cloudinary)

The API supports file uploads with **Multer v2.0.2** and **Cloudinary v2.9.0**. File upload functionality is configured with:

- **Storage**: Cloud-based storage with Cloudinary
- **Naming**: UUID-based public IDs for uniqueness
- **File Type Filtering**: MIME type validation (images: `image/png`, `image/jpeg`)
- **Upload Paths**: Files are organized in Cloudinary under `sarahaApp/users/` folder

### Upload Configuration

```javascript
multer_host({ 
  custom_type: ['image/png', 'image/jpeg']  // Allowed MIME types
})
```

### Supported File Types

- **Images**: `image/png`, `image/jpeg`

### Cloudinary Integration

- Automatic image optimization and transformation
- Secure URL generation for profile pictures
- Public ID tracking for image management

## 🌍 Environment Variables

The application supports multiple environments:

### Development Environment
```bash
npm run dev
# NODE_ENV=development
# Auto-reload with nodemon
```

### Production Environment
```bash
npm start
# NODE_ENV=production
# Optimized for production deployment
```

### Environment Files
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables

All environment files are listed in `.gitignore` for security.

### Required Environment Variables

```env
PORT=your_port
DATABASE_URL=your_mongodb_connection_string
TOKEN_KEY=your_jwt_access_token_secret
REFRESH_TOKEN_KEY=your_jwt_refresh_token_secret
ENCRYPT_KEY=your_encryption_key
ENCRYPT_ALGORITHM=aes-256-cbc
PREFIX=your_prefix
SALT_ROUNDS=your_bcrypt_salt_rounds
CLIENT_ID=your_google_oauth_client_id
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

## 👥 Profile Sharing

The application includes a profile sharing feature that allows users to share their profiles publicly:

- **Public Profiles**: Access user profiles without authentication via `/users/shareProfile/:id`
- **View Tracking**: Each profile view increments a counter for analytics
- **Follower Counts**: Public profiles display follower and following statistics
- **Secure Data**: Sensitive information like passwords remain protected

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
