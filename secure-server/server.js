const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const path = require('path');

const app = express();

const PORT = 3000;
const pages = path.join(__dirname, "pages");

// parse json request bodies
app.use(express.json());

// helmet for security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", 'https://fonts.googleapis.com'],
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

// homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(pages, "index.html"));
});

// core routes //

// get all posts
app.get('/posts', (req,res) => {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.status(200).json([
        { id: 1, title: "Project 1" },
        { id: 2, title: "Project 2" },
    ]);
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

// load ssl certificate
const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem'),
};

// create HTTPS server
https.createServer(options,app).listen(PORT, () => {
    console.log(`Secure Project App running at https://localhost:${PORT}`);
});
