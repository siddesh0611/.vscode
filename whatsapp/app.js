//importing requires
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

//importing database
const sequelize = require('./util/database');
const User = require('./models/user');
const Group = require('./models/group');
const UserGroup = require('./models/userGroup');
const Message = require('./models/message');


//routes for user
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');


const app = express();
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


//connecting routes
app.use('/user', userRoutes);
app.use('/group', groupRoutes);


//database relations
Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup });
Group.hasMany(Message);
Message.belongsTo(Group);
Message.belongsTo(User);

sequelize.sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });