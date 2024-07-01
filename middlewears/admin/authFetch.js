const jwt = require('jsonwebtoken');
const Admin = require('../../model/admin/admin');
const isAuth = async (req, res, next) => {
  if (!req.session.admin) {
    return res.status(401).json({ type: 'redirect' })
  }

  const token = req.session.admin;
  const isTokenValid = jwt.verify(token, process.env.adminSecretCode)
  if (!isTokenValid) {
    return res.status(401).json({ type: 'redirect' })
  }
  const admin = await Admin.findById(isTokenValid.id)
  if (!admin) {
    return res.status(401).json({ type: 'redirect' })
  }
  next()
}

module.exports = isAuth