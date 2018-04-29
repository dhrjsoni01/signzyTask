const config = require('../config.json');
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const jwtBlackListSchema = require('../model/jwtBlackList')

//models
const user = require('../model/userSchema')

exports.checkToken = (req) => {
    const token = req.headers['x-access-token'];
    console.log(token);
    console.log(config.secret);
    let blacklisted =false;
    jwtBlackListSchema.findOne({'list.token':token},(err,jwtbt)=>{
        if (jwtbt === undefined) {
        }else{
            console.log("black listed");
            
            blacklisted = true;
        }
    })
    if (token && !blacklisted) {
        console.log("checking token");
        try {
            jwt.verify(token, config.secret);
        } catch (err) {
            console.log(err.message);
            return false;
        }
        return true;
    } else {
        return false;
    }
}

exports.verifyEmail = (email)=>{
   return emailValidator.validate(email);
}

exports.verifyPass = (pass)=>{
    // Create a schema
    var schema = new passwordValidator();

    // Add properties to it
    schema
        .is().min(6)                                    
        .is().max(20)                                                              
        .has().not().spaces()                
    return schema.validate(pass);
}

exports.sendOtp = (email) => {
    return new Promise((resolve, reject) => {
        const otp = randomstring.generate({
            length: 6,
            charset: "alphabetic"
        });
        console.log(otp);
        user.find({ email: email })
            .then(users => {
                if (users.length == 0) {
                    reject({ status: 404, message: 'User Not Found !' });
                } else {
                    return users[0];
                }
            })
            .then(user => {
                user.otp = otp;
                return user.save();
            })
            .catch((err) => {
                reject({ status: 401, message: 'user not found' })
            })
            .then(user => {
                var transpoter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: config.email,
                        pass: config.pass
                    }
                });
                const mailOptions = {
                    from: config.email,
                    to: email,
                    subject: 'otp for forget password',
                    html: `<p> Hey ${user.name.firstName}, </br> Your otp for forgetpasword <b>${otp}</b></p>`
                };
                return transpoter.sendMail(mailOptions)
            })
            .then(info => {
                console.log(info);
                resolve({ status: 200, message: 'Check mail for instructions' })
            })
            .catch(err => {

                console.log(err);
                reject({ status: 500, message: 'Internal Server Error !' });

            });
    });
}

exports.verify = (email, otp) => {
    return new Promise((resolve, reject) => {
        user.find({ email: email })
            .then(users => {
                if (users.length == 0) {
                    reject({ status: 404, message: 'User Not Found !' });
                } else {
                    return users[0];
                }
            })
            .then(user => {
                if (otp == user.otp) {
                    user.otp = "";
                    user.verify.email = true;
                    return user.save();
                } else {
                    reject({ status: 401, message: 'Invalid otp' });
                }
            }).then(user => {
                resolve({ status: 200, message: 'currect otp' ,id : user._id })
            })
            .catch(err => {
                console.log(err);
                reject({ status: 500, message: 'Internal Server Error !' });
            });
    });
}


exports.jwtBLPush = (token)=>{
    return new Promise((resolve, reject) => {
        jwtBlackListSchema.findOne({name : 'black list'})
        .catch((err)=>{
            console.log(err.message);
            
        })
        .then((jwtBlackList)=>{
            console.log(jwtBlackList);
            
            if (jwtBlackList == undefined) {
                const jwtbl = new jwtBlackListSchema({
                    name: "black list"
                });

                jwtbl.list.push({ token: token})
                return jwtbl.save();
            }else{
                jwtBlackList.list.push({ token: token })
                return jwtBlackList.save()
            }
        })
    .then((blacklist)=>{
        resolve({message : 'success'})
    }).catch((err)=>{
        console.log(err.code + err.message);
        reject({message : err.message})
    })
    });
}