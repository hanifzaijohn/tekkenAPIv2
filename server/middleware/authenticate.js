var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  /* find user by token given */
  User.findByToken(token).then((user)=> {
    if(!user){
      /* to run error case */
      return Promise.reject();
    }
    /* find user info which matches the token given */
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
