//importing requires
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const io = require('socket.io')(4000);

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


io.on('connection', socket => {
    console.log('New client connected');


    socket.on('joinGroup', groupId => {
        socket.join(groupId);
        console.log(`Socket ${socket.id} joined group ${groupId}`);
    });


    socket.on('message', message => {
        io.to(message.groupId).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

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