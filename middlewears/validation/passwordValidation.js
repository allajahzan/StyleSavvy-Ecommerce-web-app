const User = require('../../model/user/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const validateUser = async (req, res, next) => {

    const passEmptyPattern = /^\S+$/;
    const passwordPattern = /^(?!.*\s).{8,16}$/;

    const { oldPassword, newPassword, cPassword } = req.body


    const token = req.session.user
    const isTokenValid = jwt.verify(token, process.env.userSecretCode)
    id = isTokenValid.id

    const user = await User.findById(id)

    const isPasswordCorrect = await bcrypt.compare(oldPassword,user.password)
    if(!isPasswordCorrect){
        return res.status(401).json({msg:'Incorrect password', type:'oldP'})
    }

    // password empty check pattern----------------

    const isPasswordValid = await bcrypt.compare(newPassword,user.password)
    if(isPasswordValid){
        return res.status(401).json({ msg: 'Enter New Password', type: 'newP' });
    }

    // Password Validation old password
    if (!passEmptyPattern.test(oldPassword.trim())) {
        return res.status(401).json({ msg: 'Invalid Password', type: 'oldP' });
    }

    // Password Validation new password
    if (!passEmptyPattern.test(newPassword.trim())) {
        return res.status(401).json({ msg: 'Invalid Password', type: 'newP' });
    }

    // password valid check pattern------------------------------


    // Password Validation confirm password
    if (!passwordPattern.test(oldPassword.trim())) {
        return res.status(401).json({ msg: 'Password length must be 8-16', type: 'oldP' });
    }

    // Password Validation new password
    if (!passwordPattern.test(newPassword.trim())) {
        return res.status(401).json({ msg: 'Password length must be 8-16', type: 'newP' });
    }


    if (user.email === newPassword) {
        return res.status(401).json({ msg: 'Password shouldn\'t be same as email ', type: 'newP' });
    }

    if (cPassword !== newPassword) {
        return res.status(401).json({ msg: 'Password doesn\'t match', type: 'cP' });
    }

    next()
}

module.exports = validateUser;
