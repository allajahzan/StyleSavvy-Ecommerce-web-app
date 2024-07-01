const Address = require('../../model/user/address')
const jwt = require('jsonwebtoken')

const validateAddress = async (req, res, next) => {
    const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;
    const phoneNoPattern = /^[1-9][0-9]{9}$/;
    // const addressPattern = /^[a-zA-Z0-9\s,().*+\-]+$/;

    const { name, city, district, phone, index } = req.body

    if (index === undefined) {

        // Name Validation
        if (!namePattern.test(name.trim())) {
            return res.status(401).json({ msg: 'Invalid name', type: 'name' });
        }

        // Password Validation if password is not undefined
        if (!namePattern.test(city.trim())) {
            return res.status(401).json({ msg: 'Invalid town/city name', type: 'city' });
        }

        // Password Validation if password is not undefined
        if (!namePattern.test(district.trim())) {
            return res.status(401).json({ msg: 'Invalid district/state name', type: 'district' });
        }

        // PhoneNo validation
        if (!phoneNoPattern.test(phone.trim())) {
            return res.status(401).json({ msg: 'Invalid phone number', type: 'phone' });
        }

    } else {

        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const customerId = isTokenValid.id;

        const address = await Address.findOne({ customerId });

        const oldName = address.addresses[index].name
        const oldCity = address.addresses[index].city
        const oldDistrict = address.addresses[index].district
        const oldPhone = address.addresses[index].phoneNo

        // Name Validation
        if (!namePattern.test(name.trim())) {
            return res.status(401).json({ msg: 'Invalid name', type: 'name' ,name:oldName});
        }

        // Password Validation if password is not undefined
        if (!namePattern.test(city.trim())) {
            return res.status(401).json({ msg: 'Invalid city/town name', type: 'city',city:oldCity});
        }

        // Password Validation if password is not undefined
        if (!namePattern.test(district.trim())) {
            return res.status(401).json({ msg: 'Invalid district/state name', type: 'district' ,district:oldDistrict});
        }

        // PhoneNo validation
        if (!phoneNoPattern.test(phone.trim())) {
            return res.status(401).json({ msg: 'Invalid phone number', type: 'phone' ,phone:oldPhone});
        }

    }


    next()
}

module.exports = validateAddress;
