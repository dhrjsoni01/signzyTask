const express = require('express');
const router = express.Router();
const auth = require('basic-auth');

const util = require('../function/util')
const userFucntion = require('../function/user')
const jwt = require('jsonwebtoken')
//model
const user = require('../model/userSchema')
const config = require('../config.json')


router.get('/test', (req, res) => {
    res.send('working');
});

router.post('/signup', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const mobile = req.body.mobile;
    const gender = req.body.gender;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    if (!username || !email || !password || !mobile || !gender || !firstName||!lastName) {
        console.log("invalid request due to insufficiant data in request");
        res.status(400).json({ code: 400, message: 'Invalid Request insufficiant data!' });
    }else if (!util.verifyEmail(email)) {
        res.status(400).json({ code: 400, message: 'invalid email' });
        
    }else if (!util.verifyPass(password)) {
        res.status(400).json({ code: 400, message: 'invalid password' });

    }else{

        userFucntion.registerUser(firstName,lastName,username,email,mobile,password,gender)
        .then((result) =>{
            res.status(result.status).json({ code: result.status, message: result.message })
        })
        .catch((err) => res.status(err.status).json({ code: err.status, message: err.message }));
    }
});
router.post('/login', (req, res) => {
    const credentials = auth(req);
    console.log(credentials);
    if (!credentials) {
        res.status(400).json({ code: 400, message: 'Invalid Request !' });
    } else {
        userFucntion.loginUser(credentials.name, credentials.pass)
            .then((result) => {
                console.log(result);
                
                const token = jwt.sign(result, config.secret, { expiresIn: '10d'});
                console.log(token);
                res.setHeader('x-acess-token', token);
                res.status(200).json({ message:"login sucesss" });
            })
            
            .catch(err => res.status(err.status).json({ code: err.status, message: err.message, token: "invalid" }));
    }
});
router.get('/details', (req, res) => {
    const check = util.checkToken(req);
    console.log("checking");
    console.log(check);
    
    if (check==true) {
        console.log("next");
        const data = jwt.decode(req.headers['x-access-token'],config.secret)
        userFucntion.getProfile(data._id)
            .then(result => res.json(result))
            .catch(err => res.status(err.status).json({ message: err.message }));

    } else {
        res.status(401).json({ message: 'Invalid Token !' });
    }
});

router.post('/forgetPassword', (req, res) => {
    console.log(req.body.email);
    util.sendOtp(req.body.email)
        .then(result => { res.status(result.status).json({ message: result.message }) })
        .catch(err => { res.status(err.status).json({ message: err.message }) })
});
router.post('/verifyCode', (req, res) => {

    util.verify(req.body.email, req.body.otp)
        .then(result => { 
            const token = jwt.sign({ _id: result.id }, config.secret, { expiresIn: '10d' });
            console.log(token);
            res.setHeader('x-acess-token', token);
            res.status(result.status).json({ message: result.message }) })
        .catch(err => { res.status(err.status).json({ message: err.message }) })
});
router.post('/changePassword', (req, res) => {
    const check = util.checkToken(req);
    console.log("checking");
    console.log(check);
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    
    if (check == true && newPassword && password) {
        console.log("next");
        const data = jwt.decode(req.headers['x-access-token'], config.secret)
        userFucntion.changePass(data._id,password,newPassword)
            .then(result => res.json(result))
            .catch(err => res.status(err.status).json({ message: err.message }));

    } else {
        res.status(401).json({ message: 'Invalid Token !' });
    }
});


router.get('/signout', (req, res) => {

});
module.exports = router;