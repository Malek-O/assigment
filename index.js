const cookieParser = require("cookie-parser");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors")

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser())


const ACCESS_TOKEN_SECRET = "ACCESS_SECRET_EXAMPLE";
const REFRESH_TOKEN_SECRET = "REFRESH_SECRET_EXAMPLE";

const accessTokenExpiry = "3m";
const refreshTokenExpiry = "7d";

let refreshTokens = [];

// Dummy users with extra data
let users = [
    {
        username: "admin1",
        password: "adminpass",
        role: "admin",
        permissions: ["read", "write", "delete"],
        name: "Admin One",
        email: "admin1@example.com",
        createdAt: "2024-01-01"
    },
    {
        username: "user1",
        password: "userpass",
        role: "user",
        permissions: ["read"],
        name: "User One",
        email: "user1@example.com",
        createdAt: "2024-02-01"
    },
    {
        username: "user2",
        password: "user123",
        role: "user",
        permissions: ["read", "write"],
        name: "User Two",
        email: "user2@example.com",
        createdAt: "2024-03-01"
    }
];

// Token generation
function generateTokens(user) {
    const payload = {
        username: user.username,
        role: user.role,
        permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: refreshTokenExpiry });

    refreshTokens.push(refreshToken);

    return { accessToken, refreshToken };
}

// Middleware to check access token and attach user
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Permission checker middleware
function authorize(permission) {
    return (req, res, next) => {
        if (req.user.permissions.includes(permission)) {
            return next();
        }
        return res.status(403).json({ message: "Forbidden: You lack the required permission." });
    };
}

// Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true, sameSite: "None" })

    // Simulate login response with role and permissions
    return res.json({
        message: "Login successful",
        user: {
            accessToken,
            username: user.username,
            role: user.role,
            permissions: user.permissions
        }
    });
});

// Refresh token
app.get("/refresh", (req, res) => {
    const { cookies } = req;
    console.log();

    if (!cookies?.jwt) return res.status(403).json({ message: "Invalid refresh token" });

    const refreshToken = cookies.jwt


    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token expired or invalid" });

        const newAccessToken = jwt.sign({
            username: user.username,
            role: user.role,
            permissions: user.permissions
        }, ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiry });

        res.json({ accessToken: newAccessToken });
    });
});

// Logout
app.post("/logout", (req, res) => {
    const { refreshToken } = req.body;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.json({ message: "Logged out" });
});

// GET all users (view permission)
app.get("/users", authenticateToken, authorize("read"), (req, res) => {
    const userSummaries = users.map(({ password, permissions, ...rest }) => rest);
    res.json(userSummaries);
});

// GET user details
app.get("/users/:username", authenticateToken, authorize("read"), (req, res) => {
    const user = users.find(u => u.username === req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, permissions, ...userData } = user;
    res.json(userData);
});

// PUT update user (write permission)
app.put("/users/:username", authenticateToken, authorize("write"), (req, res) => {
    const index = users.findIndex(u => u.username === req.params.username);
    if (index === -1) return res.status(404).json({ message: "User not found" });

    // Update user (except password and username)
    const updatedData = req.body;
    users[index] = {
        ...users[index],
        ...updatedData,
        username: users[index].username,
        password: users[index].password
    };

    const { password, ...userData } = users[index];
    res.json({ message: "User updated", user: userData });
});

// DELETE user (delete permission)
app.delete("/users/:username", authenticateToken, authorize("delete"), (req, res) => {
    const index = users.findIndex(u => u.username === req.params.username);
    if (index === -1) return res.status(404).json({ message: "User not found" });

    users.splice(index, 1);
    res.json({ message: "User deleted successfully" });
});

// Server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
