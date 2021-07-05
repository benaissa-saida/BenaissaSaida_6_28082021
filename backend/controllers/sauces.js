const Sauce = require('../models/Sauces');
const fs = require('fs'); // donne accès aux différentes opérations lié au système de fichier 


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); // On obtient un objet utilisable grace à JSON.parse()
    delete sauceObject._id; //Avant de copier l'objet on retire l'id provenant du front-end
    const sauce = new Sauce({ //nouvelle instance de notre modéle "Sauce"
        /*opérateur spread "..." utilisé pour copier tous les éléments
        du body de notre requête */
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        /* On modifie l'url de l'image puisqu'il à été modifié avec multer. On récupére du coup les segment de l'image
         protocol(HTTP(S))://host(localhost)/images/nom_du_fichier*/
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) =>{
    const sauceObject = req.file ? // Si req.file existe alors
    { //On récupére les infos comme pour post 
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { // sinon on prend simplement le corps de la requête
        ...req.body};
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject,  _id: req.params.id })
    /* Cette methode permet de mettre à jour la Sauce de notre base de donnée le premier argument est
    l'objet de comparaison(id = id envoyé paramètre de la requête), et le second c'est le nouvel objet
    en utilisant le spread pour récup la sauce dans le corps de la requete avec le bon id
    qui est similaire à l'id de comparaison. */
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // on trouve le fichier avec son id
      .then(sauce => {  // récupération du nom du fichier précis
        const filename = sauce.imageUrl.split('/images/')[1]; // on split pour retrouver le bon nom
        fs.unlink(`images/${filename}`, () => { //fs.unlink nous permet de le supprimer
            Sauce.deleteOne({ _id: req.params.id })
            /* methode a qui on passe un objet (id) correspondant au fichier à supprimer de la base
            avant d'envoyer une réponse de réussite (200), ou échec (400) au front-end */
            .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find() 
    /*methode "find()" renvoie le tableau contenant toutes les sauces
    dans notre base de donnée. Avant de les afficher sur la page d'accueil */
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
};

exports.stateOfSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const like = sauce.usersLiked.findIndex(e => e == req.body.userId);
        const dislike = sauce.usersDisliked.findIndex(e => e == req.body.userId);
        const sauceObject = req.body.like;

        switch ( sauceObject ) {
            case 0: 
                if (like > -1) {
                    sauce.usersLiked.splice(like, 1);
                    sauce.likes -= 1;
                } 
                
                if (dislike > -1){
                    sauce.usersDisliked.splice(dislike, 1);
                    sauce.dislikes -= 1;
                }
            break;
            case 1: 
                if (like <= -1) {
                    sauce.usersLiked.push(req.body.userId);
                    sauce.likes += 1;
                } 
            break;
            case -1: 
                if (dislike <= -1){
                    sauce.usersDisliked.push(req.body.userId);
                    sauce.dislikes += 1;
                }
            break;
        }

        
        Sauce.updateOne({ _id: req.params.id },
          {
            likes: sauce.likes,
            dislikes: sauce.dislikes,
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
          }
        ).then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
};