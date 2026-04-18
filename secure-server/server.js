"use strict";
require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const { body, validationResult, matchedData } = require('express-validator');

const { encrypt,decrypt } = require('./utils/crypto');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const authenticateToken = require('./middlewares/auth');
const authorizeRoles = require('./middlewares/authorize');

const crypto = require('crypto');


const app = express();
const PORT = process.env.PORT || 3000;
const pages = path.join(__dirname, "pages");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// parse json request bodies
// app.use(bodyParser.json());

// helmet for security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                scriptSrcElem: ["'self'"],
                styleSrc: ["'self'", 'https://fonts.googleapis.com'],
                styleSrcElem: ["'self'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'blob:'],
                connectSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
            },
        },
        referrerPolicy: { policy: 'no-referrer' },
        frameguard: { action: 'deny' },
        noSniff: true,
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.set('Cache-Control', 'max-age=86400'); // Cache for 24 hours
        }
        if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {
            res.set('Cache-Control', 'max-age=2592000'); // Cache images for 30 days
        }
    }
}));

// session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: { 
        secure: true,
        httpOnly: true,
        sameSite:'lax'
     }
}));

// initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 attempts per window
    message: 'Too many failed login attempts. Try again in 15 minutes.'
});

const users = {};

// passport configuration for Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        username: profile.displayName,
        role: 'user' // Default role
    };
    users[profile.id] = user; // Store user in memory
    return done(null, user);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, users[id]));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/login');
}

const localUser = {
    id: 1,
    username: 'regularuser',
    password: 'password123',
    role: 'user',
    name: 'Regular User',
    emailEncrypted: '',
    bioEncrypted: ''
};

// homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(pages, "index.html"));
    // res.send('<h1>Welcome to the Secure App!</h1><a href="/auth/google">Login with Google</a>');
    // res.send('<h1>Welcome to Secure Session Management App</h1><a href="/login">Login</a>');
});

// login
app.get('/login', (req, res) => {
    res.send(`
            <h1>Login</h1>
            <form method="POST" action="/login">            
                <div>
                    <label>Username:</label>
                    <input type="text" name="username" autocomplete="off" />
                </div>

                <div>
                    <label>Password:</label>
                    <input type="password" name="password" autocomplete="off" />
                </div>

                <button type="submit">Login</button>
            </form>
    `);
});

app.post('/login', loginLimiter, (req, res, next) => {
    const { username, password } = req.body;

    // prevent account enumeration
    if (username !== localUser.username || password !== localUser.password) {
        return res.status(401).send('Invalid username or password');
    }

    // regenerate session after successful login
    req.session.regenerate((err) => {
        if (err) {
            return next(err);
        }

        req.session.user = {
            id: localUser.id,
            username: localUser.username,
            role: localUser.role,
            name: localUser.name,
            email: localUser.emailEncrypted?.encryptedData
            ? decrypt(localUser.emailEncrypted.encryptedData, localUser.emailEncrypted.iv)
            : '',
          bio: localUser.bioEncrypted?.encryptedData
            ? decrypt(localUser.bioEncrypted.encryptedData, localUser.bioEncrypted.iv)
            : ''        };

        res.send('You are logged in. <a href="/dashboard">Go to Dashboard</a>');
    });
});

app.get('/api/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    res.json(req.session.user);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    });

// protected routes

// admin only
app.get('/admin', authenticateToken, authorizeRoles('admin'), (req,res) => {
    res.status(200).json({
        message: `Welcome to the admin panel, ${req.user.username}`,
        features: [
            'manage users',
            'delete any posts',
        ]
    });
})

// users only
app.get('/profile', ensureAuthenticated, (req,res) => {
    res.status(200).json({
        message: `Welcome!`,
        user: req.session.user
    });
});

// dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    const user = req.session.user;

    res.render('dashboard', {
        user,
        errors: [],
        success: null
    });
});

const profileValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 50})
        .withMessage('Name must be between 3 to 50 characters')
        .matches(/^[A-Za-z\s]+$/)
        .withMessage('Name must contain letters and spaces only')
        .escape(),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    
    body('bio')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be 500 characters or less')
        .matches(/^[A-Za-z0-9\s]+$/)
        .withMessage('Bio must not contain HTML tags and special characters')
        .escape()
];

app.post('/profile/update', ensureAuthenticated, profileValidation, (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('dashboard', {
            user: {
                ...req.session.user,
                name: req.body.name || '',
                email: req.body.email || '',
                bio: req.body.bio || ''
            },
            errors: errors.array(),
            success: null
        });
    }

    try {
        const safeData = matchedData(req, { locations: ['body'] });

        localUser.name = safeData.name;
        localUser.emailEncrypted = encrypt(safeData.email);
        localUser.bioEncrypted = encrypt(safeData.bio || '');
        
        req.session.user = {
            ...req.session.user,
            name: localUser.name,
            email: decrypt(
                localUser.emailEncrypted.encryptedData,
                localUser.emailEncrypted.iv 
            ),
            bio: decrypt(
                localUser.bioEncrypted.encryptedData,
                localUser.bioEncrypted.iv 
            )
        };
    
        return res.render('dashboard', {
            user: req.session.user,
            errors: [],
            success: 'Profile updated successfully!'
        });
    } catch (error) {
        return res.status(500).send('Error updating profile');
    }
});

// core routes //

// get all posts
app.get('/posts', (req,res) => {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.status(200).json([
        { id: 1, title: "Project 1" },
        { id: 2, title: "Project 2" },
    ]);
    if (req.isAuthenticated()) {
        res.send(`Welcome ${req.user.username}! <a href="/logout">Logout</a>`);
    } else {
        res.redirect('/');
    }
});

// get specific post
app.get('/posts/:id', (req,res) => {
    const postId = req.params.id;

    res.set('Cache-Control', 'public, max-age=600');
    res.status(200).json({
        id: postId,
        title: `Project ${postId}`,
    });
});

// create new post
app.post('/posts', (req,res) => {
    res.set('Cache-Control', 'no-store');
    res.status(201).json({
        message: 'Post created successfully',
    });
});

// likes or unlikes a post 
app.post('/posts/:id/like', (req,res) => {
    const postId = req.params.id;

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
        message: `Like status updated for post ${postId}`,
    });
});

// show public profile and posts 
app.get('/posts/user/:id', (req,res) => { 
    const userId = req.params.id;

    res.set('Cache-Control', 'public, max-age=3600');
    res.status(200).json({
        userId,
        username: 'designIsLyf',
        posts: [
            { id: 1, title: "Portfolio Project 1" },
            { id: 2, title: "Portfolio Project 2"},
        ],
    });
});

// logout
app.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) { 
            return next(err); 
        }
        
        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                return next(sessionErr);
            }

            res.clearCookie('connect.sid');
            return res.redirect('/login');
        });
    });
});

// load ssl certificate
const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem'),
};

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MONGO CONNECTION ERROR: ", error);
        process.exit(1);
    }
};

// create HTTPS server
https.createServer(options,app).listen(PORT, () => {
    connectDB();
    console.log(`Secure Project App running at https://localhost:${PORT}`);
});
