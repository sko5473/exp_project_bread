var User = require('../models/usermodel');

let auth = (req, res, next) => {
  let token = req.cookies.token;

  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, error: true });
      req.token = token;
      req.user = user;
      next();
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = { auth };