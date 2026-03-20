"use strict";

const express = require('express');
const argon2 = require('argon2');
const User = require('../models/User');
const authenticate = require("../middlewares/auth");

const router = express.Router();

// register
router.post('/register', async (req,res) => {
   // console.log("BODY:", req.body);
    try {
        const { username, password, role = 'user' } = req.body;

        // hash pass with argon2
        const hashedPassword = await argon2.hash(password);

        // save user with hashed pass
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const jwt = require('jsonwebtoken');

// login
router.post('/login', async (req,res) => {
    try {
        const { username, password } = req.body;

        // find user by username
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        // verify pass with argon2
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,  // Store the secret in the .env file
            { expiresIn: '24h' },
        );

        res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/profile', authenticate, (req,res) => {
    res.json({
        message: "This is protected data",
        user: req.user
    });
});

module.exports = router;