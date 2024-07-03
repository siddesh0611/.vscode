const User = require('../models/user');
const bcrypt = require('bcrypt');
const sequelize = require('../util/database');
const FileLink = require('../models/fileLink');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

exports.signup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { userName, emailId, password } = req.body;

        if (!userName || !emailId || !password) {
            return res.status(400).json({ message: 'emailId and password must not be empty' });
        }
        // console.log(userDetails);
        const oldUsser = await User.findOne({ where: { emailId: emailId } });
        if (oldUsser) {
            return res.status(400).send({ message: 'user already exists' });
        }

        const saltRouts = 10;
        bcrypt.hash(password, saltRouts, async (err, hash) => {
            // console.log(err);
            await User.create({ userName, emailId, password: hash }, { transaction: t });
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
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Email ID and password do not match' });
            }

            const token = generateToken(userLogin.id);
            return res.status(200).json({ message: 'Login successful', token });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.checkPremiumStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log(userId);
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ isPremium: user.ispremiumuser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();


exports.downloadExpense = async (req, res) => {
    if (!req.user.ispremiumuser) {
        return res.status(400).json({ message: 'Only for premium users' });
    }
    try {
        const userId = req.user.id;
        const user = await req.user.reload();
        const expenses = await user.getExpenses();
        console.log(expenses);
        const stringifiedExpense = JSON.stringify(expenses);

        const filename = `Expense${userId}/${new Date().toISOString()}.txt`;
        const fileURL = await uploadTOS3(stringifiedExpense, filename);

        // console.log(fileURL);
        // console.log(Object.keys(req.user.__proto__));

        if (typeof req.user.createFilelink !== 'function') {
            throw new Error('createFilelink method is not available on req.user');
        }

        const uploadFileUrl = await req.user.createFilelink({ fileURL: fileURL });
        const pastDownloads = await req.user.getFilelinks();
        res.status(200).json({ fileURL, pastDownloads, success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ fileURL: '', success: false });
    }
};


async function uploadTOS3(data, filename) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    const REGION = process.env.REGION;

    const s3Client = new S3Client({
        region: REGION,
        credentials: {
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
        },
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    };

    try {
        const command = new PutObjectCommand(params);
        const response = await s3Client.send(command);
        console.log(response);
        const fileURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;
        return fileURL;
    } catch (err) {
        console.error('Error uploading to S3:', err);
        throw err;
    }
}

exports.updateTotalExpense = async (req, res) => {
    const userId = req.user.id;
    const expenseAmount = parseFloat(req.body.expenseAmount);


    if (isNaN(expenseAmount)) {
        return res.status(400).json({ error: 'Invalid expense amount' });
    }

    try {

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newTotalExpense = Number(req.user.totaleExpense) + Number(expenseAmount);

        await User.update(
            { totaleExpense: newTotalExpense },
            { where: { id: userId } }
        );

        res.status(200).json({ message: 'Total expense updated successfully' });
    } catch (error) {
        console.error('Error updating total expense:', error);
        res.status(500).json({ error: 'An error occurred while updating the total expense' });
    }
};