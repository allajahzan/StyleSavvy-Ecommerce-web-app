const User = require('../../model/user/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const validatePassword = async (req, res, next) => {

    const passEmptyPattern = /^\S+$/;
    const passwordPattern = /^(?!.*\s).{8,16}$/;

    const {newPassword, cPassword } = req.body

    if(!req.session.resetPasswordEmail){
        return res.status(200).json({type:'redirect'})
    }

    const user = await User.findOne({email:req.session.resetPasswordEmail})

    // password empty check pattern----------------

   const isPasswordValid = await bcrypt.compare(newPassword, user.password)
    if(isPasswordValid){
        return res.status(401).json({ msg: 'Enter new password', type: 'newP' });
    }

    // Password Validation new password
    if (!passEmptyPattern.test(newPassword.trim())) {
        return res.status(401).json({ msg: 'Invalid password', type: 'newP' });
    }

    // password valid check pattern-----------------------------

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

module.exports = validatePassword;
