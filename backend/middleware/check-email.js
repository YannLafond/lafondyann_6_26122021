const checkEmail = require('email-validator');

module.exports = (req, res, next) => {
    if (!checkEmail.validate(req.body.email)) {
        return res.status(400).json({ message: "Veuillez saisir un email valide."});
    } else {
        next();
    }
};