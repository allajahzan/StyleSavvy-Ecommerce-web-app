const User = require('../../model/user/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require('../../mail/nodeMailer')
const Address = require('../../model/user/address')
const Order = require('../../model/user/order')
const Wishlist = require('../../model/user/wishlist')
const Cart = require('../../model/user/cart')
const Wallet = require('../../model/user/wallet')

// get the profile page

exports.getProfile = async (req, res) => {
    try {

        // delete cart session
        delete req.session.cart

        const token = req.session.user
        if (!token) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn')
        }
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)
        if (!isTokenValid) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn')
        }
        const id = isTokenValid.id
        const userPromise = User.findById(id)
        const addressPromise = Address.findOne({ customerId: id })
        const orderPromise = Order.find({ customerId: id })
        const wishlistPromise = Wishlist.findOne({ customerId: id })
        const walletPromise = Wallet.findOne({ customerId: id })
        const cartPromise = Cart.findOne({customerId:isTokenValid.id})

        const [user, address, order, wishlist, wallet, cart] = await Promise.all([userPromise, addressPromise, orderPromise, wishlistPromise, walletPromise, cartPromise]);

        // const orders = getOrderedItemsByCustomerId(order, user._id)


        if (!user) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn')
        }

        if (user.isBlocked) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn')
        }

        if (address && order) {

            if (address.addresses.length > 0) {
                const adresses = address.addresses
                const orders = order
                return res.render('profile', { user, adresses, orders, wishlist, wallet ,cart})
            }

        }

        if (address) {
            if (address.addresses.length > 0) {
                const adresses = address.addresses
                return res.render('profile', { user, adresses, wishlist, wallet ,cart})
            }
        }

        if (order) {
            const orders = order
            return res.render('profile', { user, orders, wishlist, wallet ,cart})
        }


        res.render('profile', { user ,cart, wishlist})

    } catch (err) {
        console.log(err);
        res.render('500')
    }
}

// function to get  ordredItems

function getOrderedItemsByCustomerId(orders, customerId) {
    const orderedItems = [];

    orders.forEach(order => {
        if (order.customerId.toString() === customerId.toString()) {
            // Iterate through the ordered items of the current order
            order.orderedItems.forEach((item, index) => {
                // Push an object containing the orderId and the current ordered item to the result array
                orderedItems.push({
                    order_id: order._id,
                    index: index,
                    item: item
                });
            });
        }
    });
    return orderedItems;
}

// update profile

exports.updateProfile = async (req, res) => {
    try {

        const { name, password, phoneNo } = req.body

        const token = req.session.user
        const isValidToken = jwt.verify(token, process.env.userSecretCode)

        const user = await User.findById(isValidToken.id)

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ msg: 'Incorrect Password', type: 'password' })
        }

        user.name = name
        user.phoneNo = phoneNo
        await user.save()
        const updateData = await User.findById(isValidToken.id)

        res.status(200).json({ msg: 'Profile updated successfully', type: 'success', user: updateData })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// update profile of google authenticated user

exports.updateProfileGoogle = async (req, res) => {
    try {

        const { name, phoneNo } = req.body

        const token = req.session.user
        const isValidToken = jwt.verify(token, process.env.userSecretCode)

        const user = await User.findById(isValidToken.id)

        user.name = name
        user.phoneNo = phoneNo
        await user.save()

        const updateData = await User.findById(isValidToken.id)

        res.status(200).json({ msg: 'Profile updated successfully', type: 'success', user: updateData })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// delete otp

exports.deleteOTP = async (req, res) => {
    try {

        delete req.session.newOTP
        res.status(204).end()

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

//  verify email

exports.verifyEmail = async (req, res) => {
    try {

        const email = req.body.email

        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const id = isTokenValid.id;

        const user = await User.findById(id)

        const emailPattern = /^[A-Za-z0-9._%+-]+@gmail\.com$/;
        // Email validation
        if (!emailPattern.test(email.toLocaleLowerCase().trim())) {
            return res.status(401).json({ msg: 'Invalid Email Format', type: 'email', email: user.email });
        }

        const users = await User.find({ $and: [{ _id: { $ne: id } }, { email: email }] });

        if (users.length > 0) {
            return res.status(401).json({ msg: 'Email Already Exists', type: 'email', email: user.email });
        }


        const otp = nodemailer.generateOTP()

        req.session.newOTP = otp
        req.session.userEmail = email

        nodemailer.sendEmail(email, otp)

        res.status(200).json({ type: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// check otp

exports.checkOTP = async (req, res) => {
    try {

        if (!req.session.newOTP) {
            return res.status(401).json({ msg: "OTP Expired", type: 'error' })
        }
        else if (Number(req.query.otp) !== req.session.newOTP) {
            return res.status(401).json({ msg: "Incorect OTP", type: 'error' })
        } else {

            const token = req.session.user
            const isTokenValid = jwt.verify(token, process.env.userSecretCode)
            id = isTokenValid.id
            const user = await User.findById(id)
            const email = req.session.userEmail
            user.email = email
            await user.save()

            delete req.session.userEmail
            delete req.session.newOTP

            res.status(200).json({ msg: 'Email verified successfully', type: 'success', email: email })
        }


    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// change password

exports.changePassword = async (req, res) => {
    try {

        const { oldPassword, newPassword } = req.body

        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)
        id = isTokenValid.id

        const user = await User.findById(id)

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        user.password = hashedPassword
        await user.save()

        res.status(200).json({ msg: 'Password changed successfully', type: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// add address

exports.addAddress = async (req, res) => {
    try {
        const { name, streetAddress, city, district, pincode, phone } = req.body;

        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const customerId = isTokenValid.id;

        const isAddress = await Address.findOne({ customerId });

        if (isAddress) {

            isAddress.addresses.push({
                name,
                streetAddress,
                city,
                district,
                pincode,
                phoneNo: phone
            });

            await isAddress.save();

            const address = await Address.findOne({ customerId });
            return res.status(200).json({ msg: 'Address added successfully', address: address });

        } else {

            const address = new Address({
                customerId,
                addresses: [{
                    name,
                    streetAddress,
                    city,
                    district,
                    pincode,
                    phoneNo: phone
                }]
            });

            await address.save();
            const addresses = await Address.findOne({ customerId });
            return res.status(200).json({ msg: 'Address added successfully', address: addresses });
        }

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};

// get address data

exports.getAddress = async (req, res) => {
    try {

        const index = Number(req.query.index)
        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const customerId = isTokenValid.id;

        const address = await Address.findOne({ customerId });
        const addressData = address.addresses[index]

        res.status(200).json({ address: addressData })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// edit address

exports.editAddress = async (req, res) => {
    try {

        const { name, streetAddress, city, district, pincode, phone, index } = req.body;

        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const customerId = isTokenValid.id;

        const address = await Address.findOne({ customerId });

        address.addresses[index].name = name
        address.addresses[index].streetAddress = streetAddress
        address.addresses[index].city = city
        address.addresses[index].district = district
        address.addresses[index].pincode = pincode
        address.addresses[index].phoneNo = phone

        await address.save()

        const updatedAddress = await Address.findOne({ customerId });
        const addressData = updatedAddress.addresses[index]

        res.status(200).json({ msg: 'Address edited successfully', address: addressData })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// delete address

exports.deleteAddress = async (req, res) => {
    try {

        const index = Number(req.query.index)

        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const customerId = isTokenValid.id;

        const address = await Address.findOne({ customerId });

        address.addresses.splice(index, 1)

        await address.save()

        const addressData = await Address.findOne({ customerId });

        res.status(200).json({ msg: 'Address deleted successfully', address: addressData })


    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// logout user

exports.logout = async (req, res) => {
    try {

        delete req.session.user
        delete req.session.userName
        // delete cart session
        delete req.session.cart
        res.redirect('/home')

    } catch (err) {
        console.log(err);
        res.render('500')
    }
}
