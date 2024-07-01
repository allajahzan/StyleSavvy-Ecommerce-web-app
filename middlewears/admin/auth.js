const jwt = require('jsonwebtoken');
const Admin = require('../../model/admin/admin');
const isAuth = async (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/admin/signIn')
  }

  const token = req.session.admin;
  const isTokenValid = jwt.verify(token, process.env.adminSecretCode)
  if (!isTokenValid) {
    return res.redirect('/admin/signIn')
  }
  const admin = await Admin.findById(isTokenValid.id)
  if (!admin) {
    return res.redirect('/admin/signIn')
  }
  next()
}

module.exports = isAuth