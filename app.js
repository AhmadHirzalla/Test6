const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const profileRouter = require('./routes/profile');

const app = express();

// Use helmet for security
app.use(helmet());

// Set up session management
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set 'secure' to true if using HTTPS
}));

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login');
}

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the root URL
app.get('/', (req, res) => {
    res.redirect('/login'); // Redirect to login page
});

// Profile route (protected)
app.use('/profile', isAuthenticated, profileRouter);

// Login route (dummy route for demonstration)
app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <input type="text" name="name" placeholder="Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <button type="submit">Login</button>
        </form>
    `);
});

// Handle login POST request
app.post('/login', express.urlencoded({ extended: true }), (req, res) => {
    req.session.isAuthenticated = true;
    req.session.user = {
        name: req.body.name,
        email: req.body.email,
        address: "123 Main St",
        pincode: "123456"
    };
    res.redirect('/profile');
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/profile');
        }
        res.redirect('/login');
    });
});

// Start the server
const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
