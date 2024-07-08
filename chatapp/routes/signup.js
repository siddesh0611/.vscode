const express = require('express');

const userControler = require('../controllers/user');
// const authenticate = require('../autentication/userAutentication');

const router = express.Router();

router.post('/signup', userControler.signup);
router.get('/login', userControler.login);

module.exports = router;