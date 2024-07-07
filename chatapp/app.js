//importing requires
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
// const helmet = require('helmet');
// const morgan = require('morgan');
const fs = require('fs');


//importing database
const sequelize = require('./util/database');
const User = require('./models/user');

//routes for user
const userRoutes = require('./routes/signup');



// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(helmet());
// app.use(morgan('combined', { stream: accessLogStream }));

//connecting routes
app.use('/user', userRoutes);


//for frontned deplayment
// app.use((req, res) => {
//     console.log('url', req.url);
//     res.sendFile(path.join(__dirname, `public/${req.url}`))
// })

//database relations


sequelize.sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
