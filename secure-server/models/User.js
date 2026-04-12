"use strict";

const mongoose = require('mongoose');

const encryptedFieldSchema = new mongoose.Schema(
    {
      encryptedData: { 
        type: String, 
        default: '' 
        },
      iv: { 
        type: String, 
        default: '' 
        }
    },
    { 
        _id: false 
    }
);

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    name: {
        type: String,
        default: '' 
    },
    emailEncrypted: {
        type: encryptedFieldSchema, 
        default: () => ({})
    },
    bioEncrypted: {
        type: encryptedFieldSchema,
        default: () => ({})
    }
});

module.exports = mongoose.model('User', UserSchema);