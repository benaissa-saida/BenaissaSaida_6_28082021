const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Variable qui masque l'email
const maskData = require('maskdata');

const emailMaskOpt = {
  maskWith: '*',
  unmaskedStartCharactersBeforeAt: 2,
  unmaskedEndCharactersAfterAt: 3,
  maskAtTheRate: false,
};

const User = require('../models/User');


exports.signup = (req, res, next) => {
  /*regex accepte : chiffre de[0-9], minuscule de [a-z],majuscule de [A-Z], prend des maj et min 
  /*doit être de 8 caractère min 100 max et prend tous les caratères spéciaux sauf l'espace*/
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,100}$/;

  if (regex.test(req.body.password)){
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
          email: maskData.maskEmail2(req.body.email, emailMaskOpt),
          password: hash
        });
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  } else {
    res.status(403).json({error: 'Le mot de passe est insuffisant! Il faut au moins 8 caractères dont : une majuscule, une minuscule, un chiffre' })
  }
    
};

exports.login = (req, res, next) => {
    User.findOne({ email: maskData.maskEmail2(req.body.email, emailMaskOpt) })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};