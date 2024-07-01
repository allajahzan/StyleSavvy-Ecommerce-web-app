const jwt = require('jsonwebtoken');
const User = require('../../model/user/user');
const isAuth = async (req, res, next) => {
    const token = req.session.user
    if (!token) {
        delete req.session.userName
        delete req.session.user
        return res.status(401).json({ type: 'redirect' })
    }
    const isTokenValid = jwt.verify(token, process.env.userSecretCode)
    if (!isTokenValid) {
        delete req.session.userName
        delete req.session.user
        return res.status(401).json({ type: 'redirect' })
    }
    id = isTokenValid.id
    const user = await User.findById(id)
    if (!user) {
        delete req.session.userName
        delete req.session.user
        return res.status(401).json({ type: 'redirect' })
    }

    if(user.isBlocked){
        delete req.session.userName
        delete req.session.user
        return res.status(401).json({ type: 'redirect' })
    }
    next()
}

module.exports = isAuth