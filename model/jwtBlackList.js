'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jwtSchema = mongoose.Schema({
name: {type:String},
list : [
    {
        token: String ,
        date :{type:Date , default: Date.now()}
    }
]
});

module.exports = mongoose.model('jwt', jwtSchema); 