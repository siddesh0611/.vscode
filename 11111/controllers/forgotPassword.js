const User = require('../models/user');
const ForgotPassword = require('../models/forgotPassword');
const bcrypt = require('bcrypt');
const sequelize = require('../util/database');
const Sbi = require('sib-api-v3-sdk');
const uuid = require('uuid');
const { where } = require('sequelize');

require('dotenv').config()

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { emailId: email } });

        if (user) {
            const id = uuid.v4();
            await user.createForgotPassword({ id, isActive: true });

            const client = Sbi.ApiClient.instance;
            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.API_KEY;

            const tranEmailApi = new Sbi.TransactionalEmailsApi();

            const sender = {
                email: 'animemhub0611@gmail.com',
            };

            const receiver = [{
                email: email,
            }];

            await tranEmailApi.sendTransacEmail({
                sender,
                to: receiver,
                subject: 'Forgot Password',
                textContent: `You have requested a password reset.
                http://13.60.36.173:3000/password/resetpassword/${id}`,
                // html: `<h1>Click <a href="http://13.60.36.173:3000/password/resetpassword/${id}">here</a> to reset your password</h1>`
            });

            return res.status(202).json({ message: 'Password reset email sent' });
        }

        return res.status(404).json({ message: 'User not found' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error in forgotPassword', error: err.message });
    }
};

exports.getPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotPasswordRequest = await ForgotPassword.findOne({ where: { id } });

        if (!forgotPasswordRequest || !forgotPasswordRequest.isActive) {
            return res.status(400).json({ message: 'Invalid or expired password reset request' });
        }

        // Render the HTML form for password reset
        res.redirect(`http://13.60.36.173:3000/password/resetpassword.html?id=${id}`);

    } catch (err) {
        console.error('Error in getPassword:', err);
        res.status(500).json({ error: err.message });
    }
};

// forgotPassword.js

exports.updatePassword = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const newPassword = req.body.newpassword; // Getting the new password from the request body
        const resetPasswordId = req.params.id; // Getting the reset password ID from the request parameters

        const forgotPasswordRecord = await ForgotPassword.findOne({ where: { id: resetPasswordId }, transaction: t });

        if (!forgotPasswordRecord) {
            return res.status(400).json({ message: 'Invalid or expired password reset request' });
        }

        const saltRounds = 10; // Typically, 10 is used for salt rounds
        const hash = await bcrypt.hash(newPassword, saltRounds); // Hashing the new password

        await User.update({ password: hash }, { where: { id: forgotPasswordRecord.userId }, transaction: t }); // Updating the user's password

        await forgotPasswordRecord.update({ isActive: false }, { transaction: t }); // Deactivating the reset password request

        await t.commit();
        res.status(200).json({ message: 'Password updated successfully' });

    } catch (err) {
        await t.rollback();
        console.error('Error in updatePassword:', err);
        res.status(500).json({ error: err.message });
    }
};
