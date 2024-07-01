const Product = require('../../model/admin/product')
const Varient = require('../../model/admin/varient')
const Address = require('../../model/user/address')
const User = require('../../model/user/user')
const Cart = require('../../model/user/cart')
const Coupon = require('../../model/admin/coupon')
const Wallet = require('../../model/user/wallet')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')


// get check page

exports.getCheckOutpage = async (req, res) => {

    delete req.session.discount
    delete req.session.coupon

    const userToken = req.session.user;
    const cartToken = req.session.cart;


    if (!userToken || !cartToken) {
        if (!userToken) {
            return res.redirect('/signIn');
        } else {
            return res.redirect('/cart');
        }
    }


    try {
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);
        const isCartTokenValid = jwt.verify(cartToken, process.env.cartSecretCode);

        if (!isUserTokenValid || !isCartTokenValid) {
            if (!isUserTokenValid) {
                return res.redirect('/signIn');
            } else {
                return res.redirect('/cart');
            }
        }

        const id = isUserTokenValid.id;
        const userPromise = User.findById(id);
        const addressPromise = Address.findOne({ customerId: id })
        const couponPromise = Coupon.find({ isActive: true })
        const cartPromise = Cart.aggregate([
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

        const walletPromise = await Wallet.find({customerId:id})

        const [user, address, cart, coupon,wallet] = await Promise.all([userPromise, addressPromise, cartPromise, couponPromise,walletPromise]);



        if (!user) {
            return res.redirect('/signIn');
        }
        if (user.isBlocked) {
            return res.redirect('/signIn');
        }

        if (!cart) {
            return res.redirect('/signIn');
        }

        // Update item availability in the background
        await Promise.all(cart[0].items.map(async (item) => {

            const index = item.size.findIndex(size => size.equals(item.sId));

            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }
            await updateItemAvailability(item._id, stock, user._id);
        }));

        const availableItems = cart[0].items.filter(item => item.isAvailable);
        if (availableItems.length === 0) {
            return res.redirect('/cart');
        }

        let itemsToDisplay = [];

        await Promise.all(cart[0].items.map(async (item, no) => {

            const index = item.size.findIndex(size => size.equals(item.sId));

            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }

            if (item.isAvailable) {
                itemsToDisplay.push({
                    index: no,
                    _id: item._id,
                    varientId: item.varientId,
                    product_name: item.product_name,
                    image: item.images[0],
                    type: item.type,
                    category: item.category,
                    price: item.price,
                    totalPrice: item.price,
                    size: item.sizeName,
                    quantity: item.quantity,
                    color: item.color,
                    stock: stock,
                    vId: item.varientId,
                    sId: item.sId,
                    isAvailable: item.isAvailable
                });
            }
        }));

        if (!itemsToDisplay.length > 0) {
            return res.redirect('/cart')
        }

        // Get total price and count
        const result = getTotalPrice(cart);

        return res.render('checkout', { user, cart: itemsToDisplay, items: cart[0].items, total: result.totalPrice, count: result.count, address: address, coupons: coupon ,wallet});
    } catch (err) {
        console.log(err);
        res.render('500')
    }
}


// check items where isAvailable is true in cart, are availvle in checkout 

exports.checkoutAndAvailabilityInCheckout = async (req, res) => {
    try {
        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const userId = isTokenValid.id;

        const { varients } = req.body;

        // Fetch user and cart data
        const [user, cart] = await Promise.all([
            User.findById(userId),
            Cart.aggregate([
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
            ])
        ]);


        // Update item availability in the background
        await Promise.all(cart[0].items.map(async (item) => {
            const index = item.size.findIndex(size => size.equals(item.sId));
            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }
            await updateItemAvailability(item._id, stock, user._id);
        }));


        // to get which items are not available
        const arrayForError = cart[0].items.map((item, no) => {

            if (varients.includes(item.varientId.toString())) {

                const index = item.size.findIndex(size => size.equals(item.sId));

                const stock = item.productIslisted && item.varientIslisted ? item.stock[index] : -1;

                if (item.quantity > stock && stock !== -1 && stock !== 0) {
                    return { name: item.product_name, image: item.images[0], types: item.type, category: item.category, size: item.sizeName, color: item.color, msg: `Only ${stock} stock(s) left`, type: 'error' }
                }

                if (stock === 0) {
                    return { name: item.product_name, image: item.images[0], types: item.type, category: item.category, size: item.sizeName, color: item.color, msg: `No stocks are available`, type: 'error' }
                }

                if (stock === -1) {
                    return { name: item.product_name, image: item.images[0], types: item.type, category: item.category, size: item.sizeName, color: item.color, msg: `Currently unavailable`, type: 'error' }
                }

                return { name: item.product_name, image: item.images[0], types: item.type, category: item.category, size: item.sizeName, color: item.color, msg: `Ready to checkout`, type: 'success' }

            }
        }).filter((item) => item !== undefined)

        if (arrayForError.length === 0) {
            return res.status(401).json({ msg: 'Something went wrong!', type: 'error' })
        }

        res.status(200).json({ msg: 'all clear', type: 'success', arrayForError: arrayForError });
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// checkout total items and also check availability

exports.lastCheckout = async (req, res) => {
    try {

        const token = req.session.user;
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        const id = isTokenValid.id;

        const userPromise = User.findById(id)
        const cartPromise = Cart.aggregate([
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
        ])


        const [user, cart] = await Promise.all([userPromise, cartPromise])

        // Update item availability in the background
        await Promise.all(cart[0].items.map(async (item) => {
            const index = item.size.findIndex(size => size.equals(item.sId));
            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }
            await updateItemAvailability(item._id, stock, user._id);
        }));


        // to get which items are not available

        let count = 0;

        const arrayForError = cart[0].items.map((item, no) => {
            const index = item.size.indexOf(item.size._id);
            const stock = item.stock[index];

            item.isAvailable === true ? count++ : null

            if (item.isAvailable && (stock === 0 || stock < item.quantity)) {
                return {
                    name: item.product_name,
                    image: item.images[0],
                    types: item.type,
                    category: item.category,
                    size: item.sizeName,
                    color: item.color,
                    type: 'error'
                };
            } else {
                return null
            }
        }).filter((item) => item !== null)

        if (arrayForError.length > 0) {
            return res.status(401).json({ msg: 'Reduce the quantity of items', type: 'reduce', arrayForError })
        }

        if (count === 0) {
            return res.status(401).json({ msg: 'No available items in cart', type: 'empty' })
        }

        res.status(200).json({ msg: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// get addressess

exports.getAddresses = async (req, res) => {

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

        const id = isUserTokenValid.id
        const userPromise = User.findById(id)
        const addressPromise = Address.findOne({ customerId: id })

        const [user, address] = await Promise.all([userPromise, addressPromise])

        res.status(200).json({ address: address.addresses, user: user })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

exports.getCheckoutItems = async (req, res) => {

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
        const varients = req.body.varients

        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)

        // get whole items data
        const cart = await getwholecartDataUpdated(isTokenValid.id)

        // get totalprice and count
        const result = getTotalPriceInitail(cart)

        let totalAmount;
        if (req.session.discount) {

            // const coupon = await Coupon.findById(req.session.couponId)
            // console.log(coupon);

            let discountAmount = result.totalPrice * (req.session.discount / 100)

            if (discountAmount > req.session.coupon.redeem_amount) {
                discountAmount = req.session.coupon.redeem_amount
            }

            totalAmount = result.totalPrice - discountAmount
        } else {
            totalAmount = result.totalPrice
        }

        let sts = true
        if (varients.length !== cart.length) {
            sts = false

            delete req.session.discount
            delete req.session.coupon
        }

        // console.log(sts);

        res.status(200).json({ msg: 'success', items: cart, sub_total: Math.round(totalAmount), total: result.totalPrice, count: result.count, sts })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// get total price and count
function getTotalPriceInitail(items) {

    let sum = 0;
    let count = 0;

    items.forEach((item) => {
        if (item.stock > 0 && item.varientIslisted === true && item.productIslisted === true) {
            sum += item.price
            count++;
        }
    })

    return { totalPrice: sum, count: count }
}


// get whole cart details in checkout

async function getwholecartDataUpdated(id) {

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


        // Update item availability in the background
        // await Promise.all(cart[0].items.map(async (item) => {
        //     const index = item.size.findIndex(size => size.equals(item.sId));
        //     let stock = 0;
        //     if (item.productIslisted && item.varientIslisted) {
        //         stock = item.stock[index];
        //     }
        //     await updateItemAvailability(item._id, stock, id);
        // }));
        for (let i = 0; i < cart[0].items.length; i++) {
            const item = cart[0].items[i];
            const index = item.size.findIndex(size => size.equals(item.sId));
            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }
            await updateItemAvailability(item._id, stock, id);
        }

        const itemsToDisplay = cart[0].items.map((item, no) => {
            const index = item.size.findIndex(size => size.equals(item.sId));
            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }


            if (stock > 0) {
                return {
                    index: no,
                    _id: item._id,
                    product_name: item.product_name,
                    varientIslisted: item.varientIslisted,
                    productIslisted: item.productIslisted,
                    image: item.images[0],
                    type: item.type,
                    category: item.category,
                    price: item.price,
                    totalPrice: item.price,
                    size: item.sizeName,
                    quantity: item.quantity,
                    color: item.color,
                    stock: stock,
                    vId: item.varientId,
                    sId: item.sId,
                    isAvailable: item.isAvailable
                };
            }
        }).filter((item) => item !== undefined)

        return itemsToDisplay
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// function to check item stock availability and change the status

async function updateItemAvailability(itemId, stock, userId) {
    try {
        if (stock !== 0) {

            await Cart.updateOne(
                { customerId: userId, 'items._id': itemId },
                { $set: { 'items.$.isAvailable': true } }
            );
        } else {
            await Cart.updateOne(
                { customerId: userId, 'items._id': itemId },
                { $set: { 'items.$.isAvailable': false } }
            );
        }
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