const Sauces = require('../models/sauces');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauces.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id })
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const saucesObject = JSON.parse(req.body.sauce)
    delete saucesObject._id;
    const sauce = new Sauces({
        ...saucesObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [' '],
        usersdisLiked: [' '],
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const saucesObject = req.file ? {
        ...JSON.parse(req.body.sauces),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauces.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce =  (req, res, next) => {
    Sauces.findOne({ _id: req.params.id  })
        .then(sauces => {
            const filename = sauces.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauces.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(400).json({ error }));
    
};



exports.likeSauce = (req, res, next) => {
    if (req.body.like === 1) {  
        Sauces.updateOne( {_id:req.params.id}, { $push: { usersLiked: req.body.userId }, $inc: { likes: +1 } })
            .then(() => res.status(200).json({ message: 'Vous aimez cette sauce !'}))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like === -1) {  
        Sauces.updateOne( {_id:req.params.id}, { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } })
            .then(() => res.status(200).json({ message: "Vous n'aimez pas cette sauce!"}))
            .catch(error => res.status(400).json({ error }));
    } else {  
        Sauces.findOne({ _id: req.params.id })
            .then(sauce => {
            if (sauce.usersLiked.includes(req.body.userId)) {
                Sauces.updateOne( {_id:req.params.id}, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                .then(() => res.status(200).json({ message: 'Like supprimé !'}))
                .catch(error => res.status(400).json({ error }))
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
                Sauces.updateOne( {_id:req.params.id}, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                .then(() => res.status(200).json({ message: 'Dislike supprimé !'}))
                .catch(error => res.status(400).json({ error }))
            }
            })
            .catch(error => res.status(400).json({ error }));
        }
    };