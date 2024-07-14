//importing requires
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const cron = require('node-cron');
const fs = require('fs');

//importing database
const sequelize = require('./util/database');
const User = require('./models/user');
const Group = require('./models/group');
const UserGroup = require('./models/userGroup');
const Message = require('./models/message');
const ArchivedChat = require('./models/archivedChat');


//routes for user
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const { CostExplorer } = require('aws-sdk');


const app = express();
const server = http.createServer(app);
const io = socket(server);
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//socket.io
io.on("connection", (socket) => {
    console.log('new User connected');

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        console.log(`user joined a group with group id: ${groupId}`);
    });

    socket.on('sendMessage', (data) => {
        const { groupId, message } = data;
        io.to(groupId).emit('receveMessage', message);
    })

    socket.on('disconnect', () => {
        console.log('user disconected');
    })
})

//connecting routes
app.use('/user', userRoutes);
app.use('/group', groupRoutes);


//using cron to to schedule a job to delete the old messages
async function archiveOldChats() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const oldChats = await Chat.findAll({
        where: {
            createdAt: {
                [Op.lt]: oneDayAgo,
            },
        },
    });

    await ArchivedChat.bulkCreate(oldChats.map(chat => chat.toJSON()));

    await Chat.destroy({
        where: {
            createdAt: {
                [Op.lt]: oneDayAgo,
            },
        },
    });

    console.log('Old chats archived and deleted successfully.');
}

cron.schedule('0 0 * * *', archiveOldChats);


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