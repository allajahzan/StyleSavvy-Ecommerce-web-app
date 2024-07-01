const User = require('../../model/user/user')
const jwt = require('jsonwebtoken')

const validateUser = async (req, res, next) => {

    const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;
    const phoneNoPattern = /^[1-9][0-9]{9}$/;

    const { name, phoneNo } = req.body;

    const token = req.session.user;
    const isTokenValid = jwt.verify(token, process.env.userSecretCode);
    const id = isTokenValid.id;
    
    const user = await User.findById(id)

    // Name Validation
    if (!namePattern.test(name.trim())) {
        return res.status(401).json({ msg: 'Invalid name', type: 'name' ,name:user.name});
    }

    // PhoneNo validation
    if (!phoneNoPattern.test(phoneNo.trim())) {
        return res.status(401).json({ msg: 'Invalid phone number', type: 'phone' ,phone:user.phoneNo});
    }

    next()
}

module.exports = validateUser;
