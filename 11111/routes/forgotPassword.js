const express = require('express');
const forgotPasswordController = require('../controllers/forgotPassword');

const router = express.Router();

router.post('/forgotpassword', forgotPasswordController.forgotPassword);
router.get('/resetpassword/:id', forgotPasswordController.getPassword);
router.post('/updatepassword/:id', forgotPasswordController.updatePassword);


module.exports = router;