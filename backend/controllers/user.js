const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js');
require('dotenv').config();

exports.signup = (req, res, next) => {
    const emailCrypt = cryptojs.SHA256(req.body.email, process.env.SECRET_TOKEN).toString();
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email : emailCrypt,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
            .catch((error) => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    const emailCrypt = cryptojs.SHA256(req.body.email, process.env.CRYPTOJS_SECRET_TOKEN).toString();
    User.findOne({ email : emailCrypt })
        .then((user) => {
            if(!user) {
                return res.status(401).json({message : "Utilisateur non trouvé!"});
            } 
            else {
                bcrypt.compare(req.body.password, user.password)
                .then((valid) => {
                    if(!valid) {
                        return res.status(401).json({message : "Mot de passe incorrect !"});
                    }
                    else {
                    res.status(200).json({
                        userId : user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.CRYPTOJS_SECRET_TOKEN,
                            { expiresIn: '24h' }
                            )
                    });
                    }
                })
                .catch(error => res.status(501).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};