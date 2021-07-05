const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const limitUser = require('../tools/limiter')
const verifEmail = require('../middleware/email');


router.post('/signup',verifEmail, userCtrl.signup); // vérifie l'email donnée avant de permettre l'inscription
router.post('/login',limitUser.limiter, userCtrl.login); // limite à 3 chances l'authentification des utilisateurs

module.exports = router;