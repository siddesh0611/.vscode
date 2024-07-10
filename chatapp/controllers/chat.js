const { where, DatabaseError, DATE, Sequelize } = require('sequelize');
const UserChat = require('../models/userChat');
const User = require('../models/user');
const sequelize = require('../util/database');

exports.postChat = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { chat } = req.body;
        const userId = req.user.id;
        // console.log(chat);
        // console.log(Object.getOwnPropertyNames(req.user.__proto__));
        // console.log(userId);

        const newChat = await req.user.createUserchat({ chatLogs: chat }, { transaction: t })
        await t.commit();

        res.status(201).json({ newChat });
    } catch (err) {
        console.log(err);
        await t.rollback();
        res.status(500).json({ err, message: 'error in postChat' });
    }
}

exports.getChats = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const totalchats = await UserChat.count();
        let allChats;
        if (totalchats > 20) {
            allChats = await UserChat.findAll({
                limit: 20
            });

        } else {
            allChats = await UserChat.findAll();
        }
        // console.log(allChats);

        await t.commit();

        res.status(201).json({ allChats });

    } catch (err) {
        console.log(err);
        await t.rollback();
        res.status(500).json({ err, message: 'error in getChats' });
    }
}

exports.getNewChats = async (req, res) => {
    try {
        const noOfChats = 20;
        const lastChatId = req.query.lastChatId;
        // console.log(lastChatId)
        const totalChats = await UserChat.count();


        newChats = await UserChat.findAll({
            where: {
                id: {
                    [Sequelize.Op.gt]: lastChatId
                }
            }, limit: noOfChats,
            offset: totalChats > noOfChats ? totalChats - noOfChats : 0


        })

        // console.log(newChats);
        res.status(201).json({ newChats })
        // console.log(newChats);

    } catch (err) {
        console.log(err);
        res.status(500).json({ err, message: 'error in getNewChats' })
    }
}

exports.createGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name } = req.body;
        const userId = req.user.id;

        const newGroup = await Group.create({ name, createdBy: userId }, { transaction: t });

        await UserGroup.create({ userId, groupId: newGroup.id }, { transaction: t });

        await t.commit();
        res.status(201).json({ newGroup });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ err, message: 'Error in creating group' });
    }
};
exports.inviteUserToGroup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { groupId, userId } = req.body;

        const userGroup = await UserGroup.create({ userId, groupId }, { transaction: t });

        await t.commit();
        res.status(201).json({ userGroup });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ err, message: 'Error in inviting user to group' });
    }
};
exports.postGroupChat = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { groupId, message } = req.body;
        const userId = req.user.id;

        const newChat = await GroupChat.create({ groupId, userId, message }, { transaction: t });

        await t.commit();
        res.status(201).json({ newChat });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ err, message: 'Error in posting group chat' });
    }
};
exports.getGroupChats = async (req, res) => {
    try {
        const { groupId, lastChatId } = req.query;

        const groupChats = await GroupChat.findAll({
            where: {
                groupId,
                id: {
                    [Sequelize.Op.gt]: lastChatId || 0
                }
            },
            order: [['createdAt', 'ASC']],
            limit: 20
        });

        res.status(200).json({ groupChats });
    } catch (err) {
        res.status(500).json({ err, message: 'Error in getting group chats' });
    }
};

// exports.getNewChats = async (req, res) => {
//     try {
//         const lastChatId = req.query.lastChatId;
//         const noOfChats = 20;
//         const totalChats = await UserChat.count();

//         const newChats = await UserChat.findAll({
//             where: {
//                 id: {
//                     [Sequelize.Op.gt]: lastChatId
//                 }
//             },
//             order: [['id', 'DESC']],
//             limit: noOfChats,
//             offset: totalChats > noOfChats ? totalChats - noOfChats : 0
//         });

//         res.status(201).json({ newChats });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ err, message: 'error in getNewChats' });
//     }
// };