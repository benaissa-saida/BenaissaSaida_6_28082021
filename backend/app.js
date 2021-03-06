const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//varibales sécurité 
const helmet = require('helmet'); // sécurise les informations présentes dans le Header
const xssClean = require('xss-clean');
const cookieSession = require('cookie-session');

//Désactive la mise en cache coté client
const noCache = require('nocache');


//Module npm charge les variables d'environnement
const db = require('./config');


//Variable de stockage de routes
const sauceRoutes = require('./routes/sauces')
const userRoutes = require('./routes/user');

//Connexion MONGOOSE
const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@openclasseroomsp6.y3irm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


//Appel d'express dans l'application
const app = express();

//methode de sécurité helmet
app.use(helmet());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//Cookie-session
const expiryDate = new Date( Date.now() + 60 * 60 * 1000); //1h

app.use(
  cookieSession({
    name : 'session',
    keys : ['key1', 'key2'],
    cookie: {
      secure: true, 
      //garantie que le navigateur envoie le cookie sur HTTPS
      httpOnly: true, 
      /* Garantit que le cookie n’est envoyé que sur HTTP(S), pas au JavaScript du client, 
      ce qui renforce la protection contre les attaques de type cross-site scripting. */
      domain: 'http://localhost:3000/',
      expires: expiryDate 
      //utilise une date d'expitation pour les cookies persistants
    }
  })
);

// Désactive les caches
app.use(noCache());

//Methode qui neutralise l'en-tête et empêcher les attaques ciblés 
app.disable('x-powered-by');

//Traite les requêtes post en objet json
app.use(bodyParser.json());

//Methode qui nettoie les entrées utili du corps POST, requêtes GET et des paramètres URL
app.use(xssClean());

/*Gére les images dans le fichier image statique pour nous le servir avec express.static 
et le path nous permettra de trouver le fichier dans notre dossier images */
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes); //importe notre logique de route pour les sauces
app.use('/api/auth', userRoutes);// importe notre logique de route pour les utilisateurs

module.exports = app;