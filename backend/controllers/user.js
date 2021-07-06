const bcrypt = require('bcrypt'); // Nous aide à hacher le mdp en une valeur unique, pas de retour en arrière
const jwt = require('jsonwebtoken'); // Nous permet d'avoir un Token


// Variable qui masque l'email
const maskData = require('maskdata');

const emailMaskOpt = {
  maskWith: '*',
  unmaskedStartCharactersBeforeAt: 2, //laisse seulement 2 caractères non cachés avant l'@
  unmaskedEndCharactersAfterAt: 3, //laisse seulement 3 caractères non cachés après l'@
  maskAtTheRate: false,
};

const User = require('../models/User');


exports.signup = (req, res, next) => {
  /* regex accepte : chiffre de[0-9], minuscule de [a-z],majuscule de [A-Z], prend des maj et min 
  doit être de 8 caractère min 100 max et prend tous les caratères spéciaux sauf espace et saut de ligne */
  const regex = /^(?!.*[\s])(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,100}$/;

  if (regex.test(req.body.password)){
    bcrypt.hash(req.body.password, 10) 
    /*Notre fonction va "saler" le mdp 10 fois ce qui permet de renforcer la sécurité du mdp, elle y ajoute une 
    donnée sup pour empêcher deux infos identiques de conduire à la même empreinte */
    .then(hash => { 
        const user = new User({ // création utilisateur avant de l'enregistrer dans base de donnée
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
        if (!user) {// si l'email est inexistant 
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password) 
        //sinon on compare le mot de passe entré et le hash enregistré dans la base de donnée
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({ //La réponse est valide elle renvoie l'id avec le token
              userId: user._id,
              token: jwt.sign( /*permet d'encoder notre token, il contien l'id de notre user
              une chaine secrète, avec une durée de validité de 24h*/
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