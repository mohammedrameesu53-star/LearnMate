# LearnMate Backend API Documentation

This document describes the current Django REST Framework backend API implemented in `Backend/core`.

Base URL:

```text
http://localhost:8000/api/accounts/
```

All request and response bodies are JSON unless noted otherwise.

## Authentication

The backend uses JWT authentication from `djangorestframework-simplejwt`.

Protected endpoints require this header:

```http
Authorization: Bearer <access_token>
```

JWT tokens can be obtained in two ways:

- MFA flow: `POST /api/accounts/login-otp/` then `POST /api/accounts/verify-login-otp/`
- Direct Simple JWT flow: `POST /api/accounts/token/`

The MFA flow is the custom project flow. The direct Simple JWT endpoint is still routed and available.

## User Model

Registered users have these API-facing fields:

| Field | Type | Notes |
| --- | --- | --- |
| `username` | string | Required during registration |
| `email` | string | Required, unique, used as login identifier |
| `password` | string | Required during registration, write-only, minimum 8 characters |
| `role` | string | One of `admin`, `mentor`, `student`; defaults to `student` |
| `is_verified` | boolean | Set to `true` after email OTP verification |
| `mfa_enabled` | boolean | Exists on model, but current login flow always sends login OTP |

Valid roles:

```json
["admin", "mentor", "student"]
```

## Endpoint Summary

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/accounts/register/` | Register a new user | No |
| POST | `/api/accounts/send-otp/` | Send email verification OTP | No |
| POST | `/api/accounts/verify-otp/` | Verify email with OTP | No |
| POST | `/api/accounts/login-otp/` | Validate credentials and send login OTP | No |
| POST | `/api/accounts/verify-login-otp/` | Verify login OTP and return JWT tokens | No |
| POST | `/api/accounts/forgot-password/` | Send password reset OTP | No |
| POST | `/api/accounts/reset-password/` | Reset password using OTP | No |
| GET | `/api/accounts/admin/` | Admin-only dashboard test endpoint | Yes, role `admin` |
| GET | `/api/accounts/mentor/` | Mentor-only dashboard test endpoint | Yes, role `mentor` |
| GET | `/api/accounts/student/` | Student-only dashboard test endpoint | Yes, role `student` |
| POST | `/api/accounts/token/` | Obtain JWT access and refresh tokens | No |
| POST | `/api/accounts/token/refresh/` | Refresh JWT access token | No |

## Standard Error Shapes

Serializer validation errors usually return field names with an array of messages:

```json
{
  "email": [
    "Enter a valid email address."
  ]
}
```

Authentication failures from protected APIs commonly return:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

Permission failures for the role dashboard APIs commonly return:

```json
{
  "detail": "You do not have permission to perform this action."
}
```

## 1. Register User

Creates a new user account.

```http
POST /api/accounts/register/
Content-Type: application/json
```

### Request

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "StrongPass123",
  "role": "student"
}
```

### Success Response

Status: `201 Created`

```json
{
  "massage": "User Registered Successfully",
  "data": {
    "username": "john",
    "email": "john@example.com",
    "role": "student"
  }
}
```

Note: The response key is currently spelled `massage` in `RegisterView`.

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john\",\"email\":\"john@example.com\",\"password\":\"StrongPass123\",\"role\":\"student\"}"
```

### Error Examples

Status: `400 Bad Request`

```json
{
  "email": [
    "user with this email already exists."
  ]
}
```

Status: `400 Bad Request`

```json
{
  "password": [
    "Ensure this field has at least 8 characters."
  ]
}
```

Status: `400 Bad Request`

```json
{
  "role": [
    "\"teacher\" is not a valid choice."
  ]
}
```

## 2. Send Email Verification OTP

Sends a 6-digit email verification OTP to a registered user.

```http
POST /api/accounts/send-otp/
Content-Type: application/json
```

### Request

```json
{
  "email": "john@example.com"
}
```

### Success Response

Status: `200 OK`

```json
{
  "message": "OTP sent successfully"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/send-otp/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\"}"
```

### Error Examples

Status: `404 Not Found`

```json
{
  "message": "User not found"
}
```

Status: `400 Bad Request`

```json
{
  "email": [
    "Enter a valid email address."
  ]
}
```

## 3. Verify Email OTP

Verifies the user email address using an unused OTP.

```http
POST /api/accounts/verify-otp/
Content-Type: application/json
```

### Request

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Success Response

Status: `200 OK`

```json
{
  "message": "Email verified successfully"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/verify-otp/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"otp\":\"123456\"}"
```

### Error Examples

Status: `404 Not Found`

```json
{
  "message": "User not found"
}
```

Status: `400 Bad Request`

```json
{
  "message": "Invalid OTP"
}
```

## 4. Login OTP

Checks the user's email and password. If credentials are valid and the email is verified, sends a login OTP.

```http
POST /api/accounts/login-otp/
Content-Type: application/json
```

### Request


```json
{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

### Success Response

Status: `200 OK`

```json
{
  "message": "Login OTP sent successfully"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/login-otp/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"StrongPass123\"}"
```

### Error Examples

Status: `401 Unauthorized`

```json
{
  "message": "Invalid credentials"
}
```

Status: `400 Bad Request`

```json
{
  "message": "Please verify your email first"
}
```

## 5. Verify Login OTP

Verifies a login OTP and returns JWT tokens.

```http
POST /api/accounts/verify-login-otp/
Content-Type: application/json
```

### Request

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Success Response

Status: `200 OK`

```json
{
  "message": "Login successful",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-access-token",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/verify-login-otp/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"otp\":\"123456\"}"
```

### Error Examples

Status: `404 Not Found`

```json
{
  "message": "User not found"
}
```

Status: `400 Bad Request`

```json
{
  "message": "Invalid OTP"
}
```

## 6. Forgot Password

Sends a password reset OTP to a registered user's email address.

```http
POST /api/accounts/forgot-password/
Content-Type: application/json
```

### Request

```json
{
  "email": "john@example.com"
}
```

### Success Response

Status: `200 OK`

```json
{
  "message": "Reset OTP sent successfully"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/forgot-password/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\"}"
```

### Error Examples

Status: `404 Not Found`

```json
{
  "message": "User not found"
}
```

Status: `400 Bad Request`

```json
{
  "email": [
    "Enter a valid email address."
  ]
}
```

## 7. Reset Password

Resets the user password with an unused OTP.

```http
POST /api/accounts/reset-password/
Content-Type: application/json
```

### Request

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "new_password": "NewStrongPass123"
}
```

### Success Response

Status: `200 OK`

```json
{
  "message": "Password reset successful"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/reset-password/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"otp\":\"123456\",\"new_password\":\"NewStrongPass123\"}"
```

### Error Examples

Status: `404 Not Found`

```json
{
  "message": "User not found"
}
```

Status: `400 Bad Request`

```json
{
  "message": "Invalid OTP"
}
```

Status: `400 Bad Request`

```json
{
  "new_password": [
    "Ensure this field has at least 8 characters."
  ]
}
```

## 8. Admin Dashboard

Returns a simple admin-only response.

```http
GET /api/accounts/admin/
Authorization: Bearer <admin_access_token>
```

### Request

No body required.

### Success Response

Status: `200 OK`

```json
{
  "message": "Welcome Admin"
}
```

### Example cURL

```bash
curl http://localhost:8000/api/accounts/admin/ \
  -H "Authorization: Bearer <admin_access_token>"
```

### Error Examples

Status: `401 Unauthorized`

```json
{
  "detail": "Authentication credentials were not provided."
}
```

Status: `403 Forbidden`

```json
{
  "detail": "You do not have permission to perform this action."
}
```

## 9. Mentor Dashboard

Returns a simple mentor-only response.

```http
GET /api/accounts/mentor/
Authorization: Bearer <mentor_access_token>
```

### Request

No body required.

### Success Response

Status: `200 OK`

```json
{
  "message": "Welcome Mentor"
}
```

### Example cURL

```bash
curl http://localhost:8000/api/accounts/mentor/ \
  -H "Authorization: Bearer <mentor_access_token>"
```

### Error Examples

Status: `401 Unauthorized`

```json
{
  "detail": "Authentication credentials were not provided."
}
```

Status: `403 Forbidden`

```json
{
  "detail": "You do not have permission to perform this action."
}
```

## 10. Student Dashboard

Returns a simple student-only response.

```http
GET /api/accounts/student/
Authorization: Bearer <student_access_token>
```

### Request

No body required.

### Success Response

Status: `200 OK`

```json
{
  "message": "Welcome Student"
}
```

### Example cURL

```bash
curl http://localhost:8000/api/accounts/student/ \
  -H "Authorization: Bearer <student_access_token>"
```

### Error Examples

Status: `401 Unauthorized`

```json
{
  "detail": "Authentication credentials were not provided."
}
```

Status: `403 Forbidden`

```json
{
  "detail": "You do not have permission to perform this action."
}
```

## 11. Obtain JWT Token

Returns JWT access and refresh tokens using email and password.

Because the custom user model sets `email` as `USERNAME_FIELD`, use `email` with this Simple JWT endpoint.

```http
POST /api/accounts/token/
Content-Type: application/json
```

### Request

```json
{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

### Success Response

Status: `200 OK`

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-access-token"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"StrongPass123\"}"
```

### Error Example

Status: `401 Unauthorized`

```json
{
  "detail": "No active account found with the given credentials"
}
```

## 12. Refresh JWT Token

Uses a refresh token to create a new access token.

```http
POST /api/accounts/token/refresh/
Content-Type: application/json
```

### Request

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token"
}
```

### Success Response

Status: `200 OK`

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-access-token"
}
```

### Example cURL

```bash
curl -X POST http://localhost:8000/api/accounts/token/refresh/ \
  -H "Content-Type: application/json" \
  -d "{\"refresh\":\"<refresh_token>\"}"
```

### Error Example

Status: `401 Unauthorized`

```json
{
  "detail": "Token is invalid",
  "code": "token_not_valid"
}
```

## Recommended Client Flows

### Registration and Email Verification

1. `POST /api/accounts/register/`
2. `POST /api/accounts/send-otp/`
3. User receives OTP by email.
4. `POST /api/accounts/verify-otp/`

### MFA Login

1. `POST /api/accounts/login-otp/`
2. User receives OTP by email.
3. `POST /api/accounts/verify-login-otp/`
4. Store `access` and `refresh` tokens on the client.
5. Send `Authorization: Bearer <access_token>` for protected APIs.

### Password Reset

1. `POST /api/accounts/forgot-password/`
2. User receives OTP by email.
3. `POST /api/accounts/reset-password/`

### Role-Based Access

1. Register a user with the required `role`.
2. Verify the user's email.
3. Log in and get an access token.
4. Call the matching dashboard endpoint:
   - Admin users: `GET /api/accounts/admin/`
   - Mentor users: `GET /api/accounts/mentor/`
   - Student users: `GET /api/accounts/student/`

## Backend Maintenance Notes

- OTP codes are 6-digit numeric strings generated by `generate_otp()`.
- OTP records are marked as used after successful verification.
- There is currently no OTP expiry validation.
- `VerifyOTPView` does not explicitly filter by `otp_type = "email_verification"`.
- `ResetPasswordView` checks unused OTPs but does not filter by `otp_type = "password_reset"`.
- `mfa_enabled` exists on the user model, but the login flow currently always sends a login OTP.
- `corsheaders` is installed, but `CorsMiddleware` and CORS settings are not configured in `settings.py`.
- The registration response currently uses the key `massage`; changing it to `message` would be a breaking API response change for clients relying on the current spelling.
