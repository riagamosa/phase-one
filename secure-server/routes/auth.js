"use strict";

const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require("../middlewares/auth");
const { encrypt } = require('../utils/crypto');

const router = express.Router();

// register
router.post('/register', async (req,res) => {
   // console.log("BODY:", req.body);
   try {
    const {
      username,
      password,
      email,
      name = '',
      bio = '',
      role = 'user'
    } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        error: 'username, password, and email are required'
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await argon2.hash(password);

    const encryptedEmail = encrypt(email);
    const encryptedBio = encrypt(bio);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      name,
      emailEncrypted: encryptedEmail,
      bioEncrypted: encryptedBio
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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