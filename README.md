# easy-dev-be

Backend for Easy Dev application built with Node.js, Express, and MongoDB.

## Features

- User authentication (Sign up and Sign in)
- JWT-based authorization
- Password hashing with bcrypt

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Copy `.env` file and update the values as needed.

3. Start MongoDB (if running locally).

4. Run the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Sign in an existing user

### Request Body for Signup/Signin

```json
{
  "username": "example",
  "email": "user@example.com",
  "password": "password123"
}
```

For signin, only email and password are required.