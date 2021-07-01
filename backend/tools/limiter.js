//Limite les requêtes en boucles
const rateLimit = require('express-rate-limit');

const userLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // Voici l’équivalent de 3 minutes
  max: 3, // Le client pourra donc faire 3 requêtes toutes les 3 minutes
  message: 'Trop de requêtes, veuillez attendre 3 minutes'
});

module.exports = {
  limiter: userLimiter
};