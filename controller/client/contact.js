const jwt = require('jsonwebtoken')
const User = require('../../model/user/user')
const Cart = require('../../model/user/cart')
const Wishlist = require('../../model/user/wishlist')

exports.getContactPage = async (req, res) => {
    try {
        const token = req.session.user;
        if (token) {
            const isTokenValid = jwt.verify(token, process.env.userSecretCode);
            const id = isTokenValid.id;
            const userPromise = User.findById(id);
            const cartPromise = Cart.findOne({customerId:id})
            const wishlistPromise = Wishlist.findOne({customerId:id})

            const [user,cart,wishlist] = await Promise.all([userPromise, cartPromise, wishlistPromise])

            return res.render('contact', { user ,cart, wishlist})
        }

        res.render('contact')
    } catch (err) {
        console.log(err);
        res.render('500')
    }
}