
  

# 🛡️ User Management API Documentation

## Sketch
https://excalidraw.com/#json=keaNNvfOfWkFsfEdMJHdh,9eO7jl_WrcQXk2nl4GLFhg
  

## 🧠 Overview

  

This API allows user authentication, token handling (access/refresh), and management of users with role-based permissions.

  

---

  

## 📦 Authentication

  

### 🔐 `POST /login`

  

Authenticate a user and return an access and refresh token.

  

#### Request

```json

POST /login

Content-Type: application/json

  

{

"username": "admin1",

"password": "adminpass"

}

```

  

#### Response

```json

{

"message": "Login successful",

"accessToken": "jwt_access_token",


}

```

  

---

  

### 🔁 `GET /refresh`

  

Obtain a new access token using a valid refresh token. it will obtain the JWT from cookie

  

#### Request

```json

GET /refresh

Content-Type: application/json



```

  

#### Response

```json

{

"accessToken": "new_access_token"

}

```

  

---

  

### 🚪 `POST /logout`

  

Invalidate a refresh token (logout).

  

#### Request

```json

POST /logout

Content-Type: application/json

  

{

"refreshToken": "your_refresh_token"

}

```

  

#### Response

```json

{

"message": "Logged out"

}

```

  

---

  

## 👥 User Management

  

> ⚠️ All routes below require an **access token** in the header:

  

```

Authorization: Bearer <access_token>

```

  

---

  

### 📃 `GET /users`

  

List all users (requires `"read"` permission).

  

#### Response

```json

[

{

"username": "admin1",

"role": "admin",

"permissions": ["read", "write", "delete"],

"name": "Admin One",

"email": "admin1@example.com",

"createdAt": "2024-01-01"

}

]

```

  

---

  

### 🔍 `GET /users/:username`

  

Get details of a single user (requires `"read"` permission).

  

#### Example

```

GET /users/user1

```

  

#### Response

```json

{

"username": "user1",

"role": "user",

"permissions": ["read"],

"name": "User One",

"email": "user1@example.com",

"createdAt": "2024-02-01"

}

```

  

---

  

### ✏️ `PUT /users/:username`

  

Update a user's info (requires `"write"` permission).

  

#### Request

```json

PUT /users/user2

Content-Type: application/json

  

{

"name": "New Name",

"email": "newemail@example.com"

}

```

  

#### Response

```json

{

"message": "User updated",

"user": {

"username": "user2",

"role": "user",

"permissions": ["read", "write"],

"name": "New Name",

"email": "newemail@example.com",

"createdAt": "2024-03-01"

}

}

```

  

---

  

### 🗑️ `DELETE /users/:username`

  

Delete a user (requires `"delete"` permission).

  

#### Example

```

DELETE /users/user1

```

  

#### Response

```json

{

"message": "User deleted successfully"

}

```

  

---

  

## 🧪 Permissions Guide

  

| Action | Permission Required |

|---------------|---------------------|

| View users | `"read"` |

| Edit users | `"write"` |

| Delete users | `"delete"` |

  

---

  

## 🔐 Access Token Format

  

JWT access tokens include:

```json

{

"username": "admin1",

"role": "admin",

"permissions": ["read", "write", "delete"],

"iat": 1710000000,

"exp": 1710000900

}

```
## 👤 Dummy Users

### 👇 Sample Data for Testing

```json

[
  {
    "username": "admin1",
    "password": "adminpass",
    "role": "admin",
    "permissions": ["read", "write", "delete"],
    "name": "Admin One",
    "email": "admin1@example.com",
    "createdAt": "2024-01-01"
  },
  {
    "username": "user1",
    "password": "userpass",
    "role": "user",
    "permissions": ["read"],
    "name": "User One",
    "email": "user1@example.com",
    "createdAt": "2024-02-01"
  },
  {
    "username": "user2",
    "password": "user123",
    "role": "user",
    "permissions": ["read", "write"],
    "name": "User Two",
    "email": "user2@example.com",
    "createdAt": "2024-03-01"
  }
]
```
