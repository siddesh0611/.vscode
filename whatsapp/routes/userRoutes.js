const express = require('express');

// importing controllers
const userControler = require('../controller/userController');

const router = express.Router();

//routes
router.post('/signup', userControler.signup);
router.post('/login', userControler.login);
router.get('/users', userControler.getAllUsers);

module.exports = router;