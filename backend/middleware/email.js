const emailValidator = require('validator'); //module de validation des email, il nettoie et désinfecte les chaînes

module.exports = (req, res, next) =>{
    if (!emailValidator.isEmail(req.body.email)){ // si la chaine entrée n'est pas un email valide
        return res.status(400).json({error: "email pas valide: exemple@domaine.fr"}) //alors envoyer une erreur
    } else{ // sinon passer à la prochaine fonction
        next();
    }
};