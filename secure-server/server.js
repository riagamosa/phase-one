const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const path = require('path');

const app = express();

const PORT = 3000;
const pages = path.join(__dirname, "pages");

// helmet for security headers
app.use(helmet());

app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.set('Cache-Control', 'max-age=86400'); // Cache for 24 hours
        }
        if (path.endsWith('.jpg')) {
            res.set('Cache-Control', 'max-age=2592000'); // Cache images for 30 days
        }
    }
}));

// homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(pages, "index.html"));
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

// core routes //

// get all posts
app.get('/posts', (req,res) => {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.json([{ id: 1, title: "Project 1" }]);
});

// get specific post
app.get('/posts/:id', (req,res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json([{ id: 1, title: "Project 1" }]);
});

// create new post
app.post('/posts', (req,res) => {
    res.set('Cache-Control', 'no-store');
});

// likes or unlikes a post 
app.post('/posts/:id/like', (req,res) => {
    res.set('Cache-Control', 'no-store');
});

// show public profile and posts 
app.get('/posts/user/:id', (req,res) => { 
    res.set('Cache-Control', 'public, max-age=300');
    res.json([{ id: 1, title: "Project 1" }]);
});
