'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({

    name: {
        firstName:{
             type: String
         },
        lastName:{
            type: String
        }
    },
    username : {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    mobile: {
        type: String

    },
    password: {
        type: String,
        require: true
    },
    gender: {
        type: String
    },
    active: {
        type: Boolean
    },
    otp : {
        type: String
    }
});

module.exports = mongoose.model('user', userSchema); 