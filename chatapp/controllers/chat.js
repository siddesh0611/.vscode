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

        const allChats = await UserChat.findAll();
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
        const lastChatId = new Date(req.query.lastChatId);
        const newChats = await UserChat.findAll({
            where: {
                createdAt: {
                    [Sequelize.Op.gt]: lastChatId
                }
            }
        })
        // console.log(newChats);
        res.status(201).json({ newChats })
    } catch (err) {
        console.log(err);
        res.status(500).json({ err, message: 'error in getNewChats' })
    }
}