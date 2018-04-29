const express = require('express');
const mongoose = require('mongoose');
const config = require('./config.json')
const app = express();
const bodyParser = require('body-parser');
const logger = require('morgan');
const port = process.env.PORT || 3000;

//database
console.log("db connecting...");
mongoose.connect(config.db, function (err, done) {
    if (err) {
        console.log("connection error" + err);

    } else {
        console.log("db connected");
    }
});

app.use('/image', express.static('uploads'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.get("/", function (req, res) {
    res.send("Welcome to our new app ")
})


//route moount
const userRoute = require('./route/userRoute')
app.use('/user',userRoute);

app.listen(port, function () {
    console.log(`server is runnning on http://localhost:${port}`);
})
