// const { Router } = require('express');
const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, sauceCtrl.createSauce); 
//réimplémente notre logique, l'authentification par email et mdp, et permet à multer de gérer les fichiers entrants

router.post('/:id/like', auth, sauceCtrl.stateOfSauce);

router.put('/:id', auth, multer, sauceCtrl.modifySauce);

router.delete('/:id', auth, sauceCtrl.deleteSauce)

router.get('/:id', auth, sauceCtrl.getOneSauce);

router.get('/', auth, sauceCtrl.getAllSauce);

module.exports = router;