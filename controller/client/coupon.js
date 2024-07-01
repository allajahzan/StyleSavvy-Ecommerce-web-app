const Coupon = require('../../model/admin/coupon')
const User = require('../../model/user/user')
const Cart = require('../../model/user/cart');
const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb');


// get available coupons

exports.getCoupons = async (req, res) => {

    const userToken = req.session.user;
    const cartToken = req.session.cart;

    if (!userToken || !cartToken) {
        if (!userToken) {
            return res.status(401).json({ type: 'redirect' })
        } else {
            return res.status(401).json({ type: 'error' })
        }
    }


    try {
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);
        const isCartTokenValid = jwt.verify(cartToken, process.env.cartSecretCode);

        if (!isUserTokenValid || !isCartTokenValid) {
            if (!isUserTokenValid) {
                return res.status(401).json({ type: 'redirect' })
            } else {
                return res.status(401).json({ type: 'error' })
            }
        }


        const cart = await getwholecart(isUserTokenValid.id)
        console.log(cart);
        const result = getTotalPrice(cart)
        const totalPrice = result.totalPrice

        const coupon = await Coupon.find({ $or: [{ min_amount: { $lte: totalPrice } }] })

        res.status(200).json({ type: 'success', coupons: coupon })

    } catch (err) {
        console.log(err);
    }
}


// apply coupon

exports.applyCoupon = async (req, res) => {

    const userToken = req.session.user;
    const cartToken = req.session.cart;

    if (!userToken || !cartToken) {
        if (!userToken) {
            return res.status(401).json({ type: 'redirect' })
        } else {
            return res.status(401).json({ type: 'error' })
        }
    }


    try {
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);
        const isCartTokenValid = jwt.verify(cartToken, process.env.cartSecretCode);

        if (!isUserTokenValid || !isCartTokenValid) {
            if (!isUserTokenValid) {
                return res.status(401).json({ type: 'redirect' })
            } else {
                return res.status(401).json({ type: 'error' })
            }
        }

        const id = req.query.coupon_id
        const sts = req.query.sts

        // console.log(sts);

        if (sts === 'Apply') {

            if (req.session.discount) {
                return res.status(401).json({ msg: 'You can\'t apply two coupons at a time', type: 'not' })
            }

            const coupon = await Coupon.findOne({ _id: id })
            const discount = coupon.discount;
            const cart = await getwholecart(isUserTokenValid.id)
            const result = getTotalPrice(cart)

            const totalPrice = result.totalPrice

            if (coupon.min_amount > totalPrice) {
                return res.status(401).json({ msg: 'This coupon is not applicable', type: 'not' })
            }

            let discountAmount = totalPrice * (discount / 100)

            if (discountAmount > coupon.redeem_amount) {
                discountAmount = coupon.redeem_amount
            }

            const totalAmount = totalPrice - discountAmount

            req.session.discount = discount
            req.session.coupon = coupon


            return res.status(200).json({ type: 'success', msg: `Discount coupon has been applied`, totalAmount: Math.round(totalAmount), discountAmount: Math.round(discountAmount) })
        }

        let discount = req.session.discount
        delete req.session.discount
        delete req.session.coupon
        const cart = await getwholecart(isUserTokenValid.id)
        const result = getTotalPrice(cart)
        const totalAmount = result.totalPrice
        res.status(200).json({ type: 'success', msg: `Discount coupon has been removed`, totalAmount: Math.round(totalAmount), discountAmount: 0 })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// get whole cart items

async function getwholecart(id) {
    try {
        const cart = await Cart.aggregate([
            {
                $match: { customerId: new ObjectId(id) }
            },
            {
                $unwind: '$items'
            },
            {
                $lookup: {
                    from: 'varients',
                    localField: 'items.varient',
                    foreignField: '_id',
                    as: 'varient'
                }
            },
            {
                $unwind: '$varient'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'varient.product',
                    foreignField: '_id',
                    as: 'varient.product'
                }
            },
            {
                $unwind: '$varient.product'
            },
            {
                $lookup: {
                    from: 'types',
                    localField: 'varient.product.type',
                    foreignField: '_id',
                    as: 'varient.product.type'
                }
            },
            {
                $unwind: {
                    path: '$varient.product.type',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'varient.product.category',
                    foreignField: '_id',
                    as: 'varient.product.category'
                }
            },
            {
                $unwind: {
                    path: '$varient.product.category',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'colors',
                    localField: 'varient.color',
                    foreignField: '_id',
                    as: 'varient.color'
                }
            },
            {
                $unwind: {
                    path: '$varient.color',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sizes',
                    localField: 'items.size',
                    foreignField: '_id',
                    as: 'size'
                }
            },
            {
                $unwind: {
                    path: '$size',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'item._id': '$items._id',
                    'varient.product_name': '$varient.product.product_name',
                    'varient.product.isListed': '$varient.product.isListed',
                    'varient.images': '$varient.images',
                    'varient.isListed': '$varient.isListed',
                    'varient.type': '$varient.product.type.type_name',
                    'varient.category': '$varient.product.category.category_name',
                    'varient.size': '$varient.size',
                    'varient.color': '$varient.color.color_name',
                    'varient.price': '$items.price',
                    'varient.quantity': '$items.quantity',
                    'varient.isAvailable': '$items.isAvailable',
                    'varient.stock': '$varient.stock',
                    'varient.varientId': '$varient._id',
                    'varient.size_name': '$size.size_name',
                    'varient.sId': '$size._id',
                }
            },
            {
                $group: {
                    _id: '$_id',
                    customerId: { $first: '$customerId' },
                    items: {
                        $push: {
                            _id: '$item._id',
                            varientId: '$varient.varientId',
                            varientIslisted: '$varient.isListed',
                            productIslisted: '$varient.product.isListed',
                            product_name: '$varient.product_name',
                            images: '$varient.images',
                            type: '$varient.type',
                            category: '$varient.category',
                            price: '$varient.price',
                            size: '$varient.size',
                            sizeName: '$varient.size_name',
                            quantity: '$varient.quantity',
                            color: '$varient.color',
                            stock: '$varient.stock',
                            sId: '$varient.sId',
                            isAvailable: '$varient.isAvailable'
                        }
                    }
                }
            }
        ]);

        return cart;
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// function to get total price and count
function getTotalPrice(carts) {
    let sum = 0;
    let count = 0;

    carts[0].items.forEach((item) => {
        if (item.productIslisted === true && item.varientIslisted === true && item.isAvailable === true) {
            sum += item.price;
            count++;
        }
    });

    return { totalPrice: sum, count: count };
}