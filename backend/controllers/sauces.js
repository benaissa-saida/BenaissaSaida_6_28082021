const Sauce = require('../models/Sauces');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) =>{
    const sauceObject = req.file ? 
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject,  id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
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
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
};

exports.stateOfSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const like = sauce.usersLiked.includes(req.body.userId);
        const dislike = sauce.usersDisliked.includes(req.body.userId);
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
                
                if (dislike > -1){
                    sauce.usersDisliked.splice(dislike, 1);
                    sauce.dislikes -= 1;
                }
            break;
            case -1: 
                if (like > -1) {
                    sauce.usersLiked.splice(like, 1);
                    sauce.likes -= 1;
                } 
                
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