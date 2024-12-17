const User = require('../models/user');
const bcrypt = require('bcrypt');
const sequelize = require('../util/database');
// const FileLink = require('../models/fileLink');
const jwt = require('jsonwebtoken');
// const AWS = require('aws-sdk');

exports.signup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { userName, emailId, phoneNo, password } = req.body;
        console.log(userName, emailId, phoneNo, password);

        if (!userName || !emailId || !phoneNo || !password) {
            return res.status(400).json({ message: 'emailId, phoneNo and password must not be empty' });
        }
        // console.log(userDetails);
        const oldUsser = await User.findOne({ where: { emailId: emailId } });
        if (oldUsser) {
            return res.status(400).send({ message: 'user already exists' });
        }

        const saltRouts = 10;
        bcrypt.hash(password, saltRouts, async (err, hash) => {
            // console.log(err);
            if (err) {
                thrownew.error('error in dcrypt');
            }
            await User.create({ userName, emailId, phoneNo, password: hash }, { transaction: t });
            await t.commit();
            res.status(200).json({ message: 'User signed up successfully' });

        });
    } catch (err) {
        await t.rollback();
        res.status(500).send(err);
        console.log(err);
    }
};


function generateToken(id) {
    return jwt.sign({ userId: id }, 'secretKey');
}

exports.login = async (req, res, next) => {
    try {
        console.log('i am here');
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({ message: 'Email ID and password must not be empty' });
        }

        const userLogin = await User.findOne({ where: { emailId: emailId } });
        if (!userLogin) {
            return res.status(404).json({ message: 'User not found' });
        }

        bcrypt.compare(password, userLogin.password, (err, isMatch) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Server Error' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Email ID and password do not match' });
            }

            const token = generateToken(userLogin.id);
            return res.status(200).json({ message: 'Login successful', token });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
