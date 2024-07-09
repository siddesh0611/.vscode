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
const UserChat = require('./models/userChat');

//routes for user
const userRoutes = require('./routes/signup');
const chatRoutes = require('./routes/chat');



// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

const app = express();
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(helmet());
// app.use(morgan('combined', { stream: accessLogStream }));

//connecting routes
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);


//for frontned deplayment
// app.use((req, res) => {
//     console.log('url', req.url);
//     res.sendFile(path.join(__dirname, `public/${req.url}`))
// })

//database relations
// User.hasMany(UserChat, { as: 'userchats' });
User.hasMany(UserChat, { as: 'userchats' });
UserChat.belongsTo(User);


sequelize.sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
