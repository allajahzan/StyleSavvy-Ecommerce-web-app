const jwt = require('jsonwebtoken');
const User = require('../../model/user/user');
const isAuth = async (req, res, next) => {
  if (!req.session.user) {
    delete req.session.userName
    delete req.session.user
    return res.redirect('/home')
  }

  const token = req.session.user;
  const isTokenValid = jwt.verify(token, process.env.userSecretCode)
  if (!isTokenValid) {
    delete req.session.userName
    delete req.session.user
    return res.redirect('/home')
  }
  const user = await User.findById(isTokenValid.id)
  if (!user) {
    delete req.session.userName
    delete req.session.user
    return res.redirect('/home')
  }

  if(user.isBlocked){
    delete req.session.userName
    delete req.session.user
    return res.redirect('/home')
  }
  next()
}

module.exports = isAuth