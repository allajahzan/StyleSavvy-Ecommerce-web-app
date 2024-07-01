const Product = require('../../model/admin/product')
const Varient = require('../../model/admin/varient')
const Address = require('../../model/user/address')
const User = require('../../model/user/user')
const Cart = require('../../model/user/cart')
const Order = require('../../model/user/order')
const Wallet = require('../../model/user/wallet')
const Wishlist = require('../../model/user/wishlist')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const razorPayController = require('../client/razorpay')
const { ObjectId } = require('mongodb')
const { types } = require('util')
const Coupon = require('../../model/admin/coupon')


// create razorpay order id

exports.createOrderIdRazorPay = async (req, res) => {
    try {

        const userToken = req.session.user;

        if (!userToken) {
            return res.status(401).json({ type: 'redirect' })
        }
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);

        if (!isUserTokenValid) {
            return res.status(401).json({ type: 'redirect' })
        }

        const placedOrderId = req.query.orderId
        let totalPrice;

        if (!placedOrderId) {
            const cart = await Cart.aggregate([
                {
                    $match: { customerId: new ObjectId(isUserTokenValid.id) }
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
                    $group: {
                        _id: '$_id',
                        customerId: { $first: '$customerId' },
                        items: {
                            $push: {
                                varient: '$varient',
                                quantity: '$items.quantity',
                                price: '$items.price',
                                size: '$size',
                                isAvailable: '$items.isAvailable'
                            }
                        }
                    }
                }
            ])

            totalPrice = getTotalPrice(cart[0])

        } else {
            const order = await Order.findOne({ _id: placedOrderId })
            totalPrice = order.totalAmount
        }

        let totalAmount;
        if (req.session.discount) {

            // const coupon = await Coupon.findById(req.session.couponId)
            // console.log(coupon);

            let discountAmount = totalPrice * (req.session.discount / 100)

            if (discountAmount > req.session.coupon.redeem_amount) {
                discountAmount = req.session.coupon.redeem_amount
            }

            totalAmount = totalPrice - discountAmount

        } else {
            totalAmount = totalPrice
        }

        const amount = Math.round(totalAmount)
        const resp = await razorPayController.createOrderId({
            "amount": amount * 100,
            "currency": "INR"
        })

        if (resp.ok) {
            const data = await resp.json()
            return res.status(200).json({ orderId: data.id, totalPrice: totalAmount, razorPayKey: process.env.razor_pay_key_id, type: 'success' })
        } else {
            return res.status(200).json({ type: 'network', msg: 'Network error' })
        }

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// check items in repayment

exports.checkItemsInRepayment = async (req, res) => {

    const userToken = req.session.user;

    if (!userToken) {
        return res.status(401).json({ type: 'redirect' })
    }

    try {
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);

        if (!isUserTokenValid) {
            return res.status(401).json({ type: 'redirect' })
        }

        const { orderId } = req.body;


        const order = await Order.findOne({ _id: orderId })

        let arrayOfItems = [];

        await Promise.all(order.orderedItems.map(async (item) => {

            const varient = await Varient.aggregate([
                {
                    $match: { _id: item.varientId }
                },
                {
                    $lookup: {
                        from: 'sizes',
                        localField: 'size',
                        foreignField: '_id',
                        as: 'size'
                    }
                },
                {
                    $lookup: {
                        from: 'colors',
                        localField: 'color',
                        foreignField: '_id',
                        as: 'color'
                    }
                },
                {
                    $unwind: '$color'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $lookup: {
                        from: 'types',
                        localField: 'product.type',
                        foreignField: '_id',
                        as: 'product.type'
                    }
                },
                {
                    $unwind: '$product.type'
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'product.category',
                        foreignField: '_id',
                        as: 'product.category'
                    }
                },
                {
                    $unwind: '$product.category'
                }
            ]);

            // console.log(varient);

            if (!varient) {
                return res.status(401).json({ msg: 'Something went wrong!', type: 'network' })
            }

            const index = varient[0].size.findIndex((size) => size._id.toString() === item.sizeId.toString())

            if (index === -1) {
                return res.status(401).json({ msg: 'Something went wrong!', type: 'network' })
            }

            const stock = varient[0].stock[index];
            const sizeName = varient[0].size[index].size_name

            // console.log(stock);

            if (stock === 0) {
                arrayOfItems.push({
                    name: varient[0].product.product_name,
                    types: varient[0].product.type.type_name,
                    category: varient[0].product.category.category_name,
                    color: varient[0].color.color_name,
                    size: sizeName,
                    image: varient[0].images[0],
                    msg: 'Out of stock'
                });
            } else if (!varient[0].isListed || !varient[0].product.isListed) {
                arrayOfItems.push({
                    name: varient[0].product.product_name,
                    types: varient[0].product.type.type_name,
                    category: varient[0].product.category.category_name,
                    color: varient[0].color.color_name,
                    size: sizeName,
                    image: varient[0].images[0],
                    msg: 'Currently unavailable'
                });
            }

        }))


        res.status(200).json({ arrayOfItems, type: 'success' });

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// verify payment 

exports.verifyPayment = async (req, res) => {

    const userToken = req.session.user;

    if (!userToken) {
        return res.status(401).json({ type: 'redirect' })
    }

    try {
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);
        if (!isUserTokenValid) {
            return res.status(401).json({ type: 'redirect' })
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, placedOrderId } = req.body;

        const verificationHashed = crypto.createHmac('sha256', process.env.razor_pay_key_secret);
        verificationHashed.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const signature = verificationHashed.digest('hex');

        if (signature === razorpay_signature) {
            await Order.updateOne(
                { _id: placedOrderId },
                {
                    $set: {
                        paymentStatus: 'Done',
                        'orderedItems.$[].paymentStatus': 'Success'
                    }
                }
            );

            return res.status(200).json({ paymentStatus: 'Success', msg: 'Successfully ordered the item' });
        } else {
            return res.status(400).json({ paymentStatus: 'Failure', msg: 'Order has been failed' });
        }

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};


// re payment verification

exports.verifyRePayment = async (req, res) => {

    const userToken = req.session.user;

    if (!userToken) {
        return res.status(401).json({ type: 'redirect' })
    }

    try {
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);
        if (!isUserTokenValid) {
            return res.status(401).json({ type: 'redirect' })
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, placedOrderId } = req.body;

        const verificationHashed = crypto.createHmac('sha256', process.env.razor_pay_key_secret);
        verificationHashed.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const signature = verificationHashed.digest('hex');

        if (signature === razorpay_signature) {

            const [updated, order] = await Promise.all([
                Order.updateOne(
                    { _id: placedOrderId },
                    {
                        $set: {
                            paymentStatus: 'Done',
                            'orderedItems.$[].paymentStatus': 'Success'
                        }
                    }
                ),
                Order.findById(placedOrderId)
            ])


            for (let i = 0; i < order.orderedItems.length; i++) {
                const item = order.orderedItems[i];
                const varient = await Varient.findById(item.varientId);
                const index = varient.size.indexOf(item.sizeId);
                varient.stock[index] -= item.quantity;
                await varient.save();
            }


            return res.status(200).json({ paymentStatus: 'Success', msg: 'Successfully ordered the item' });
        } else {
            return res.status(400).json({ paymentStatus: 'Failure', msg: 'Order has been failed' });
        }

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};

// increase quantity for order failed or dissmised

exports.increaseQuantity = async (req, res) => {
    try {

        const userToken = req.session.user;

        if (!userToken) {
            return res.status(401).json({ type: 'redirect' })
        }
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);

        if (!isUserTokenValid) {
            return res.status(401).json({ type: 'redirect' })
        }

        const { placedOrderId } = req.body

        const orderPromise = Order.findById(placedOrderId)

        const [order] = await Promise.all([orderPromise])

        for (let i = 0; i < order.orderedItems.length; i++) {
            const item = order.orderedItems[i];
            const varient = await Varient.findById(item.varientId);
            const index = varient.size.indexOf(item.sizeId);
            varient.stock[index] += item.quantity;
            await varient.save();
        }

        res.status(200).json({type:'success'})

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// order items

exports.orderItems = async (req, res) => {

    const userToken = req.session.user;

    if (!userToken) {
        return res.status(401).json({ type: 'redirect' })
    }

    try {
        const isUserTokenValid = jwt.verify(userToken, process.env.userSecretCode);

        if (!isUserTokenValid) {
            return res.status(401).json({ type: 'redirect' })
        }

        const { addressIndex, paymentMethod } = req.body;

        const id = isUserTokenValid.id;
        const userPromise = User.findById(id);
        const addressPromise = Address.findOne({ customerId: id });
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
                $group: {
                    _id: '$_id',
                    customerId: { $first: '$customerId' },
                    items: {
                        $push: {
                            varient: '$varient',
                            quantity: '$items.quantity',
                            price: '$items.price',
                            offer: '$items.offer',
                            size: '$size',
                            isAvailable: '$items.isAvailable'
                        }
                    }
                }
            }
        ])


        const [user, address, cart] = await Promise.all([userPromise, addressPromise, cartPromise]);

        if (!user) {
            return res.status(401).json({ type: 'redirect' });
        }

        const totalPrice = getTotalPrice(cart[0])

        let totalAmount;
        if (req.session.discount) {

            // const coupon = await Coupon.findById(req.session.coupon._id)
            // console.log(coupon);

            let discountAmount = totalPrice * (req.session.discount / 100)

            if (discountAmount > req.session.coupon.redeem_amount) {
                discountAmount = req.session.coupon.redeem_amount
            }

            totalAmount = totalPrice - discountAmount

        } else {
            totalAmount = totalPrice
        }

        const orderedItems = [];
        const cartUpdates = [];

        // Filter cart items where isAvailable is true
        const availableItems = cart[0].items.filter(item => item.isAvailable);


        // console.log(availableItems);

        await Promise.all(availableItems.map(async (item) => {

            let discountItemAmount
            if (req.session.discount) {

                // const coupon = await Coupon.findById(req.session.coupon._id)
                // // console.log(coupon);

                let discountAmount = totalPrice * (req.session.discount / 100)

                if (discountAmount > req.session.coupon.redeem_amount) {
                    discountAmount = req.session.coupon.redeem_amount
                }

                discountItemAmount = discountAmount / availableItems.length

            } else {
                discountItemAmount = 0
            }

            let totalItemAmount = item.price - discountItemAmount

            let offerPrice = item.varient.actualPrice * (item.offer / 100)
            let realPrice = item.varient.actualPrice - offerPrice

            orderedItems.push({
                varientId: item.varient._id,
                sizeId: item.size._id,
                product_name: item.varient.product.product_name,
                quantity: item.quantity,
                offer: item.offer,
                price: item.varient.actualPrice,
                realPrice: Math.round(realPrice),
                totalPrice: item.price,
                discountAmount: Math.round(discountItemAmount),
                totalAmount: Math.round(totalItemAmount),
                type: item.varient.product.type.type_name,
                category: item.varient.product.category.category_name,
                color: item.varient.color.color_name,
                size: item.size.size_name,
                discription: item.varient.product.discription,
                image: item.varient.images[0],
                paymentStatus: paymentMethod === 'Wallet' ? 'Success' : 'Pending'
            });
        }))

        if (orderedItems.length === 0) {
            return res.status(401).json({ msg: "None of these products are availble", type: 'error' })
        }

        const add = address.addresses[addressIndex]

        const orderedAddress = {
            name: add.name,
            email: user.email,
            phoneNo: add.phoneNo,
            address: add.streetAddress,
            city: add.city,
            district: add.district,
            pincode: add.pincode
        }

        if (paymentMethod === 'COD' && Math.round(totalAmount) > 1000) {
            return res.status(400).json({ msg: 'More than Rs 1000 can\'t order in COD', type: 'cod' })
        }

        let wallet;
        let order;
        if (paymentMethod === 'Wallet') {

            wallet = await Wallet.findOne({ customerId: id })
            if (wallet && Math.round(totalAmount) > wallet.balance) {
                return res.status(400).json({ msg: 'Insufficient amount in wallet', type: 'wallet' })
            } else if (!wallet) {
                return res.status(400).json({ msg: 'Insufficient amount in wallet', type: 'wallet' })
            } else {
                wallet.transaction_history.push({
                    amount: Math.round(totalAmount),
                    type: 'Debited',
                    discription: 'Money used for ordering Products'
                });
                wallet.balance -= Math.round(totalAmount);
                await wallet.save();
            }

            order = new Order({ customerId: user._id, orderedItems: orderedItems, address: orderedAddress, totalPrice: Math.round(totalPrice), totalAmount: Math.round(totalAmount), discount: req.session.discount, coupon_minAmount: req.session.coupon ? req.session.coupon.min_amount : 0, coupon_redeemAmount: req.session.coupon ? req.session.coupon.redeem_amount : 0, paymentMethod: paymentMethod, paymentStatus: 'Done' })
        } else {
            order = new Order({ customerId: user._id, orderedItems: orderedItems, address: orderedAddress, totalPrice: Math.round(totalPrice), totalAmount: Math.round(totalAmount), discount: req.session.discount, coupon_minAmount: req.session.coupon ? req.session.coupon.min_amount : 0, coupon_redeemAmount: req.session.coupon ? req.session.coupon.redeem_amount : 0, paymentMethod: paymentMethod })
        }

        // update varient stock 
        await Promise.all(availableItems.map(async (item) => {

            const varient = await Varient.findById(item.varient._id);
            const index = varient.size.indexOf(item.size._id)

            // Update variant stock
            varient.stock[index] -= item.quantity;
            await varient.save();

            cartUpdates.push(item.varient._id);

        }));

        await Promise.all([
            order.save(),
            Cart.updateOne(
                { customerId: new ObjectId(id) },
                { $pull: { items: { varient: { $in: cartUpdates } } } }
            )
        ])

        delete req.session.cart
        delete req.session.discount
        delete req.session.coupon

        return res.status(200).json({ msg: 'Successfully ordered the item', type: 'success', placedOrderId: order._id, totalPrice: totalAmount })


    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// function to get total price

function getTotalPrice(carts) {

    let sum = 0;
    carts.items.map((item) => {
        if (item.varient.product.isListed === true && item.varient.isListed === true && item.isAvailable === true) {
            sum = sum + item.price
        } else {
            return null;
        }
    }).filter(item => item !== null);

    return sum
}


// get orderes page

exports.getOrdersPage = async (req, res) => {
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
        const ordersPromise = Order.find({ customerId: id })
        const cartPromise = Cart.findOne({customerId:isTokenValid.id})
        const wishlistPromise = Wishlist.findOne({customerId:isTokenValid.id})

        const [user, orders,cart,wishlist] = await Promise.all([userPromise, ordersPromise, cartPromise, wishlistPromise]);

        // if (orders.length === 0) {
        //     return res.redirect('/profile')
        // }

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

        res.render('orders', { user, orders ,cart, wishlist})

    } catch (err) {
        console.log(err);
        res.render('500')
    }
}


// cancel the order

exports.cancelOrder = async (req, res) => {
    try {

        const { orderId, itemIndex } = req.body

        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)
        const id = isTokenValid.id

        const order = await Order.findOne({ _id: orderId, customerId: id })
        let orders;

        const orderedItem = order.orderedItems[itemIndex]

        if (orderedItem.orderStatus === 'Delivered') {
            return res.status(200).json({ msg: 'You order has been delivered', item: orderedItem, type: 'error' });
        }

        if (order.paymentMethod === 'COD') {


            if (order.discount !== 0) {

                for (const item of order.orderedItems) {
                    if (item.orderStatus === 'Delivered') {
                        item.orderStatus = 'RequestedReturn';
                        item.paymentStatus = 'Pending';
                        item.requestedDate = new Date();
                    }
                }

                orderedItem.paymentStatus = 'Done'
                orderedItem.orderStatus = 'Cancelled'
                orderedItem.cancelledDate = new Date();
                // const orders = await order.save();
                const discount = order.discount
                const min_amount = order.coupon_minAmount
                const redeem_amount = order.coupon_redeemAmount

                let sum = 0;
                let count = 0;
                for (const item of order.orderedItems) {
                    if (item.orderStatus === 'Pending' || item.orderStatus === 'Shipped') {
                        sum = sum + item.totalPrice
                        count++
                    }
                }



                if (sum >= min_amount) {

                    // console.log(sum);

                    let discountAmount = sum * (discount / 100)

                    if (discountAmount > redeem_amount) {
                        discountAmount = redeem_amount
                    }

                    discountAmount = Math.round(discountAmount)

                    const discountForSingleItem = discountAmount / count

                    let lastSum = 0;
                    for (const item of order.orderedItems) {
                        if (item.orderStatus === 'Pending' || item.orderStatus === 'Shipped') {
                            item.discountAmount = discountForSingleItem
                            item.totalAmount = item.totalPrice - discountForSingleItem

                            lastSum = lastSum + item.totalAmount
                        }
                    }

                    // change total Amount
                    let totalPrice = 0;
                    let totalAmount = 0;
                    for (const item of order.orderedItems) {
                        totalPrice = totalPrice + item.totalPrice
                        totalAmount = totalAmount + item.totalAmount
                    }

                    order.totalPrice = totalPrice
                    order.totalAmount = totalAmount

                    // 
                    // order.totalPrice = sum
                    // order.totalAmount = lastSum

                } else {


                    for (const item of order.orderedItems) {
                        if (item.orderStatus === 'Pending' || item.orderStatus === 'Shipped') {
                            item.discountAmount = 0
                            item.totalAmount = orderedItem.totalPrice
                            order.totalPrice = sum
                            order.totalAmount = sum
                            order.discount = 0
                        }
                    }



                }


                // update varients stock 
                const varient = await Varient.findById(orderedItem.varientId)
                const index = varient.size.indexOf(orderedItem.sizeId)
                let stock = varient.stock[index]
                stock += orderedItem.quantity
                varient.stock[index] = stock
                await varient.save()

            } else {
                orderedItem.paymentStatus = 'Done'
                orderedItem.orderStatus = 'Cancelled'
                orderedItem.cancelledDate = new Date();


                // update varients stock 
                const varient = await Varient.findById(orderedItem.varientId)
                const index = varient.size.indexOf(orderedItem.sizeId)
                let stock = varient.stock[index]
                stock += orderedItem.quantity
                varient.stock[index] = stock
                await varient.save()

            }

            let sts = true
            order.orderedItems.forEach(item => {
                if (item.paymentStatus !== 'Success' && item.paymentStatus !== 'Done' && item.paymentStatus !== 'Refunded') {
                    sts = false;
                }
            });
            if (sts === true) {
                order.orderStatus = 'Completed'
                order.paymentStatus = 'Done'
            }


            orders = await order.save();

        } else {

            if (order.discount !== 0 && order.paymentMethod !== 'COD') {
                for (const item of order.orderedItems) {
                    if (item.orderStatus !== 'Delivered') {
                        item.orderStatus = 'Cancelled';
                        item.paymentStatus = 'Refunded';
                        item.cancelledDate = new Date();

                        // update varients stock 
                        const varient = await Varient.findById(item.varientId)
                        const index = varient.size.indexOf(item.sizeId)
                        let stock = varient.stock[index]
                        stock += item.quantity
                        varient.stock[index] = stock
                        await varient.save()

                    } else {
                        item.orderStatus = 'RequestedReturn';
                        item.paymentStatus = 'Pending';
                        item.requestedDate = new Date();
                    }
                }
            } else {
                orderedItem.orderStatus = 'Cancelled'
                orderedItem.paymentStatus = 'Refunded'
                orderedItem.cancelledDate = new Date();

                // update varients stock 
                const varient = await Varient.findById(orderedItem.varientId)
                const index = varient.size.indexOf(orderedItem.sizeId)
                let stock = varient.stock[index]
                stock += orderedItem.quantity
                varient.stock[index] = stock
                await varient.save()
            }

            // // change total Amount
            // let totalPrice = 0;
            // let totalAmount = 0;
            // for (const item of order.orderedItems) {
            //     if (item.orderStatus === 'Pending' || item.orderStatus === 'Shipped') {
            //         totalPrice = totalPrice + item.totalPrice
            //         totalAmount = totalAmount + item.totalAmount
            //     }
            // }

            // order.totalPrice = totalPrice
            // order.totalAmount = totalAmount

            let sts = true
            order.orderedItems.forEach(item => {
                if (item.paymentStatus !== 'Refunded' && item.orderStatus !== 'Delivered') {
                    sts = false;
                }
            });
            if (sts === true) {
                order.orderStatus = 'Completed'
                order.paymentStatus = 'Done'
            }

            orders = await order.save();

        }

        // Save the updated order


        // console.log(orders);

        let totalAmount;
        let item;
        let items;

        if (order.paymentMethod === 'COD') {

            if (orders.discount !== 0) {
                items = orders.orderedItems
            } else {
                item = orders.orderedItems[itemIndex]
            }

        } else {
            if (orders.discount !== 0) {
                let sum = 0;
                for (const item of orders.orderedItems) {
                    if (item.orderStatus !== 'Delivered' && item.orderStatus !== 'RequestedReturn') {
                        sum += item.totalAmount;
                    }
                }
                totalAmount = sum
                items = orders.orderedItems
            } else {
                item = orders.orderedItems[itemIndex]
                totalAmount = item.totalAmount
            }
        }


        let wallet = await Wallet.findOne({ customerId: id })

        if (wallet) {

            if (order.paymentMethod !== 'COD') {
                wallet.transaction_history.push({
                    amount: totalAmount,
                    type: 'Credited',
                    discription: 'Money added through cancelling order'
                });
                wallet.balance += totalAmount;
                await wallet.save();
            }

        } else {

            if (order.paymentMethod !== 'COD') {
                wallet = new Wallet({
                    customerId: id,
                    transaction_history: [{
                        amount: totalAmount,
                        type: 'Credited',
                        discription: 'Money added through cancelling order'
                    }],
                    balance: totalAmount
                });
                await wallet.save();
            }
        }


        if (order.discount !== 0) {
            return res.status(200).json({ msg: 'Order cancelled successfully', items: items.length > 1 ? items : items, type: 'success', orders });
        }

        res.status(200).json({ msg: 'Order cancelled successfully', items: [item], type: 'success', orders });

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// requested return

exports.requestReturn = async (req, res) => {
    try {

        const { orderId, itemIndex, reason } = req.body

        const reasonPattern = /^[a-zA-Z,'"\-\(\)\s]*$/

        // reason Validation
        if (!reasonPattern.test(reason.trim())) {
            return res.status(401).json({ msg: 'Invalid Reason', type: 'error' });
        }

        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)
        const id = isTokenValid.id

        const order = await Order.findOne({ _id: orderId, customerId: id })


        let items;
        

        const orderedItem = order.orderedItems[itemIndex]

        orderedItem.orderStatus = 'RequestedReturn'
        orderedItem.paymentStatus = 'Pending'
        orderedItem.requestedDate = new Date();
        orderedItem.reasonForReturn = reason
        order.orderStatus = 'Pending'
        order.paymentStatus = 'Done'

        // Save the updated order
        const orders = await order.save();
        items = orders.orderedItems[itemIndex]

        res.status(200).json({ msg: 'You have requested to return', items: [items], type: 'success' });

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// orderDetails page

exports.getOrderDetails = async (req, res) => {
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

        const id = req.query.orderId;

        const userPromise = User.findById(isTokenValid.id)
        const orderPromise = Order.findOne({ _id: id, customerId: isTokenValid.id })
        const cartPromise = Cart.findOne({customerId:isTokenValid.id})
        const wishlistPromise = Wishlist.findOne({customerId:isTokenValid.id})

        const [user, orders, cart, wishlist] = await Promise.all([userPromise, orderPromise,cartPromise,wishlistPromise])

        if (!orders) {
            return res.redirect('/orders')
        }

        res.render('orderDetails', { user, orders: orders ,cart, wishlist})

    } catch (err) {
        console.log(err);
        res.render('500')
    }
}


// get total price
function getTotalPrice(carts) {

    let sum = 0;
    carts.items.map((item) => {
        if (item.varient.product.isListed === true && item.varient.isListed === true && item.isAvailable === true) {
            sum = sum + item.price
        } else {
            return null;
        }
    }).filter(item => item !== null);

    return sum
}
