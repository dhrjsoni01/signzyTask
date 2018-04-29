'use strict';
const user = require('../model/userSchema');
const bcrypt = require('bcryptjs');

exports.registerUser = (firstName,lastName, username, email, mobile, password, gender) => {

    return new Promise((resolve, reject) => {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newUser = new user({
            name: {
                firstName: firstName,
                lastName: lastName
            },
            username: username,
            email: email,
            mobile: mobile,
            password: hash,
            gender: gender
        });
        return newUser.save()
            .then((user) => resolve({ status: 201, message: 'User Registered Sucessfully !' }))
            .catch((err) => {
                if (err.code == 11000) {
                    reject({ status: 409, message: 'Email or Username Already Registered !' });
                } else {
                    reject({ status: 500, message: 'Internal Server Error !' + err });
                }
            });
    });
}



exports.loginUser = (email, password) => {
    return new Promise((resolve, reject) => {
        user.findOne({ email: email })
            .catch((err)=>{
                console.log(err.message);
                reject({ status: 500, message: "user not found" })
            })
            .then(user => {
                console.log(user);

                const hashed_password = user.password;
                console.log(hashed_password);

                if (bcrypt.compareSync(password, hashed_password)) {
                    console.log("ready to go");
                    console.log(user._id);
                    
                    resolve({ _id : user._id });
                } else {
                    reject({ status: 401, message: 'Invalid Credentials !' });
                }
            })
            .catch(err => {
                console.log(err);
                reject({ status: 500, message: 'Internal Server Error !' })
            });
    });
}

exports.changePass = (id,password,newPass)=>{
    return new Promise((resolve, reject) => {
        user.findOne({ _id: id })
            .catch((err) => {
                console.log(err.message);
                reject({ status: 500, message: "user not found" })
            })
            .then(user => {
                console.log(user);

                const hashed_password = user.password;
                console.log(hashed_password);

                if (bcrypt.compareSync(password, hashed_password)) {
                    console.log("ready to go");
                    console.log(user._id);

                    return user;
                } else {
                    reject({ status: 401, message: 'Invalid Credentials !' });
                }
            })
            .then((user)=>{
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(newPass, salt);
                user.password = hash
                return user.save()
            })
            .then((user) => resolve({ status: 201, message: 'password changed Sucessfully !' }))
            .catch(err => {
                console.log(err);
                reject({ status: 500, message: 'Internal Server Error !' })
            });
    });
}

exports.getProfile = id =>
    new Promise((resolve, reject) => {

        user.findOne({ _id: id }, { password: 0, _id: 0, active: 0 })
            .then(user => resolve(user))
            .catch(err => reject({ status: 500, message: 'Internal Server Error !' }))

    });