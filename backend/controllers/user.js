/* algorithme unidirectionnel(en une seule fois) pour chiffrer et créer
un hash des mdp user dans la base de donnée pour chaque user.
À la connexion, on utilise bcrypt pour créer un new hash avant de 
le comparer avec celui de la base de donnée. Il nous permettra ainsi
de savoir si les deux hash ont été générés d'un même mdp */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Variable qui masque l'email
const maskData = require('maskdata');

const emailMaskOpt = {
  maskWith: '*',
  unmaskedStartCharactersBeforeAt: 2, //laisse seulement 2 caractères non cachés avant l'@
  unmaskedEndCharactersAfterAt: 3, //laisse seulement 2 caractères non cachés après l'@
  maskAtTheRate: false,
};

const User = require('../models/User');


exports.signup = (req, res, next) => {
  /* regex accepte : chiffre de[0-9], minuscule de [a-z],majuscule de [A-Z], prend des maj et min 
  doit être de 8 caractère min 100 max et prend tous les caratères spéciaux sauf l'espace */
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,100}$/;

  if (regex.test(req.body.password)){
    bcrypt.hash(req.body.password, 10) /*nous demandons à notre fonction(asynchrone) de hachage de "saler" 
    le mdp 10 fois ce qui permet de renforcer la sécurité du mdp, elle y ajoute une donnée sup
    pour empêcher deux infos identiques de conduire à la même empreinte */
    .then(hash => { // création utilisateur avant de l'enregistrer dans base de donnée
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
      .then(user => { // si l'email est existant 
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password) //compare le mot de passe entré et le hash enregistré dans la base de donnée
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({ //La réponse est valide elle renvoie l'id avec le token
              userId: user._id,
              token: jwt.sign( /*permet d'encoder notre token, il contien l'id de notre user
              en tant que payload(données encodées dans le token), une chaine secrète, avec une durée de validité de 24h*/
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