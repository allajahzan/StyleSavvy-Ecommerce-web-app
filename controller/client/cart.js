const Product = require('../../model/admin/product')
const Varient = require('../../model/admin/varient')
const User = require('../../model/user/user')
const Cart = require('../../model/user/cart')
const Wishlist = require('../../model/user/wishlist')
const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb')

// get cart page
exports.getCartPage = async (req, res) => {
    try {
        // delete cart session
        delete req.session.cart

        const token = req.session.user;
        if (!token) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn');
        }
        const isTokenValid = jwt.verify(token, process.env.userSecretCode);
        if (!isTokenValid) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn');
        }
        const id = isTokenValid.id;

        const userPromise = User.findById(id);
        const wishlistPromise = Wishlist.findOne({ customerId: id })
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

        const [user, cart, wishlist] = await Promise.all([userPromise, cartPromise, wishlistPromise]);

        if (!user) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn');
        }

        if (user.isBlocked) {
            delete req.session.user
            delete req.session.userName
            return res.redirect('/signIn');
        }

        if (cart.length === 0) {
            return res.render('cart', { user , wishlist});
        }

        // Update item availability in the background
        await Promise.all(cart[0].items.map(async (item) => {
            const index = item.size.findIndex(size => size.equals(item.sId));
            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }
            await updateItemAvailability(item._id, stock, id);
        }));

        const itemsToDisplay = cart[0].items.map((item, no) => {
            const index = item.size.findIndex(size => size.equals(item.sId));
            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }

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
        });

        if (!itemsToDisplay.length > 0) {
            return res.redirect('/cart')
        }

        // Get total price and count
        const result = getTotalPrice(cart)

        res.render('cart', { user,wishlist, cart: itemsToDisplay, items: cart[0].items, total: result.totalPrice, count: result.count});
    } catch (err) {
        console.log(err);
        res.render('500')
    }
};

// add to cart
exports.addToCart = async (req, res) => {

    try {

        const { vId, quantity, price, sizeId } = req.body

        const token = req.session.user
        if (!token) {
            delete req.session.user
            delete req.session.userName
            return res.status(401).json({ type: 'error' })
        }

        const isTokenValid = jwt.verify(token, process.env.userSecretCode)
        if (!isTokenValid) {
            delete req.session.user
            delete req.session.userName
            return res.status(401).json({ type: 'error' })
        }

        const id = isTokenValid.id;
        const userPromise = User.findById(id);
        const cartPromise = Cart.findOne({ customerId: id })
        const varientPromise = Varient.aggregate([
            { $match: { _id: new ObjectId(vId) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } }
        ]);



        // 2 promises together , user and cart
        const [user, cart, varient] = await Promise.all([userPromise, cartPromise, varientPromise]);


        if (!user) {
            delete req.session.user
            delete req.session.userName
            return res.status(401).json({ type: 'error' })
        }


        if (user.isBlocked) {
            delete req.session.user
            delete req.session.userName
            return res.status(401).json({ type: 'error' })
        }

        let totalPrice = Number(quantity) * Number(price)

        const index = varient[0].size.findIndex(size => size.equals(sizeId));
        const stock = varient[0].stock[index]

        if (stock === 0 || !varient[0].productDetails.isListed || !varient[0].isListed) {
            return res.status(200).json({ msg: 'This item can\'t add to cart', type: 'failure' });
        }

        let isAvailable = true;

        if (stock === 0 || !varient[0].productDetails.isListed || !varient[0].isListed) {
            isAvailable = false;
        }

        if (!cart) {
            let newCart;

            let offer1 = varient[0].productDetails.productOffer ? varient[0].productDetails.productOffer : 0
            let offer2 = varient[0].categoryDetails.categoryOffer ? varient[0].categoryDetails.categoryOffer : 0




            if (offer1 !== 0 || offer2 !== 0) {
                if (offer1 > offer2) {
                    let discount = totalPrice * (offer1 / 100)
                    let lastTotal = totalPrice - discount
                    newCart = new Cart({ customerId: user._id, items: [{ varient: vId, quantity: quantity, price: Math.round(lastTotal), size: sizeId, isAvailable, offer: offer1 }] });
                } else {
                    let discount = totalPrice * (offer2 / 100)
                    let lastTotal = totalPrice - discount
                    newCart = new Cart({ customerId: user._id, items: [{ varient: vId, quantity: quantity, price: Math.round(lastTotal), size: sizeId, isAvailable, offer: offer2 }] });
                }
            } else {
                newCart = new Cart({ customerId: user._id, items: [{ varient: vId, quantity: quantity, price: totalPrice, size: sizeId, isAvailable, offer: 0 }] });
            }


            const mycart = await newCart.save();
            return res.status(200).json({ msg: 'Successfully added to cart', type: 'success' ,count: mycart.items.length});
        }

        const isItemAvailable = cart.items.some(item =>
            item.varient.equals(vId) && item.size.equals(sizeId)
        );

        if (isItemAvailable) {
            return res.status(200).json({ msg: 'Already added to cart', type: 'success', count: cart.items.length });
        }

        let offer1 = varient[0].productDetails.productOffer ? varient[0].productDetails.productOffer : 0
        let offer2 = varient[0].categoryDetails.categoryOffer ? varient[0].categoryDetails.categoryOffer : 0

        if (offer1 !== 0 || offer2 !== 0) {
            if (offer1 > offer2) {
                let discount = totalPrice * (offer1 / 100)
                let lastTotal = totalPrice - discount
                cart.items.push({ varient: vId, quantity: quantity, price: Math.round(lastTotal), size: sizeId, isAvailable, offer: offer1 });

            } else {
                let discount = totalPrice * (offer2 / 100)
                let lastTotal = totalPrice - discount
                cart.items.push({ varient: vId, quantity: quantity, price: Math.round(lastTotal), size: sizeId, isAvailable, offer: offer2 });
            }
        } else {
            cart.items.push({ varient: vId, quantity: quantity, price: totalPrice, size: sizeId, isAvailable, offer: 0 });
        }


        const myCart = await cart.save();
        let count = myCart.items.length
        return res.status(200).json({ msg: 'Successfully added to cart', type: 'success', count });


    } catch (err) {
        console.log(err);
        res.status(500).end()
    }

}

// check stocks available

exports.updateCart = async (req, res) => {
    try {

        delete req.session.discount
        delete req.session.coupon

        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)

        const { itemId, vId, sId, quantity } = req.body

        // user promise
        const userPromise = User.findById(isTokenValid.id)

        // varient promise
        const varientPromise = Varient.aggregate([
            { $match: { _id: new ObjectId(vId) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
        ]);


        // cart
        const cartPromise = getwholecartData(isTokenValid.id)

        // get all primise data 
        const [user, varient, cart] = await Promise.all([userPromise, varientPromise, cartPromise])


        const index = varient.findIndex(varient => varient.size.some(sizeId => sizeId.equals(sId)));
        const itemIndex = cart[0].items.findIndex(item => item._id.equals(itemId));
        const varientIndex = cart[0].items.findIndex(item => item.varientId.equals(vId));

        if (itemIndex === -1 || index === -1 || varientIndex === -1) {
            return res.status(404).json({ msg: 'Something went wrong!', type: 'network' });
        }

        const stock = varient[0].stock[index]

        // when item is unlisted 
        if (varient[0].product.isListed === false || varient[0].isListed === false) {


            // Update item availability in the background
            await Promise.all(cart[0].items.map(async (item) => {
                const index = item.size.findIndex(size => size.equals(item.sId));
                let stock = 0;
                if (item.productIslisted && item.varientIslisted) {
                    stock = item.stock[index];
                }
                await updateItemAvailability(item._id, stock, user._id);
            }));

            // get total price and count
            const result = getTotalPrice(cart)

            return res.status(401).json({ msg: `We are sorry! This item is Currently Unavailable`, type: 'unavailable', total: result.totalPrice, count: result.count, items: cart[0] })
        }


        // when stock is zero
        if (stock === 0) {
            await Cart.updateOne(
                { customerId: user._id, 'items._id': itemId },
                { $set: { 'items.$.isAvailable': false } }
            );

            // get cart
            const cart = await getwholecartData(isTokenValid.id)

            // get total price and count
            const result = getTotalPrice(cart)

            return res.status(401).json({ msg: `We are sorry! Only ${stock} stocks are available`, type: 'error', stock: stock, total: result.totalPrice, count: result.count })
        }

        // when more quantity than stock
        if (quantity > stock) {

            // get cart
            const cart = await getwholecartData(isTokenValid.id)

            // get total price and count
            const result = getTotalPrice(cart)


            let stockPrice;


            let offer1 = varient[0].product.productOffer ? varient[0].product.productOffer : 0
            let offer2 = varient[0].category.categoryOffer ? varient[0].category.categoryOffer : 0

            if (offer1 !== 0 || offer2 !== 0) {
                if (offer1 > offer2) {
                    let discount = varient[0].actualPrice * (offer1 / 100)
                    let lastTotal = varient[0].actualPrice - discount
                    stockPrice = Math.round(lastTotal)
                } else {
                    let discount = varient[0].actualPrice * (offer2 / 100)
                    let lastTotal = varient[0].actualPrice - discount
                    stockPrice = Math.round(lastTotal)
                }
            } else {
                stockPrice = varient[0].price[index]
            }

            const totalPrice = stockPrice * stock

            await Cart.updateOne(
                { customerId: user._id, 'items._id': itemId },
                { $set: { 'items.$.quantity': stock, 'items.$.price': totalPrice } }
            );

            return res.status(401).json({ msg: `We are sorry! Only ${stock} stocks are available`, type: 'error', stock: stock, total: result.totalPrice, count: result.count })
        }

        // more than 5 quantity
        if (quantity >= 6) {

            // get cart
            const cart = await getwholecartData(isTokenValid.id)

            // get total price and count
            const result = getTotalPrice(cart)

            return res.status(401).json({ msg: 'You can buy only up to 5 unit(s) of this product', type: 'error', stock: stock, total: result.totalPrice, count: result.count })
        }

        let stockPrice;

        let offer1 = varient[0].product.productOffer ? varient[0].product.productOffer : 0
        let offer2 = varient[0].category.categoryOffer ? varient[0].category.categoryOffer : 0

        if (offer1 !== 0 || offer2 !== 0) {
            if (offer1 > offer2) {
                let discount = varient[0].actualPrice * (offer1 / 100)
                let lastTotal = varient[0].actualPrice - discount
                stockPrice = Math.round(lastTotal)
            } else {
                let discount = varient[0].actualPrice * (offer2 / 100)
                let lastTotal = varient[0].actualPrice - discount
                stockPrice = Math.round(lastTotal)
            }
        } else {
            stockPrice = varient[0].price[index]
        }

        const totalPrice = stockPrice * quantity

        await Cart.updateOne(
            { customerId: user._id, 'items._id': itemId },
            { $set: { 'items.$.quantity': quantity, 'items.$.price': totalPrice } }
        );

        // get cart
        const carts = await getwholecartData(isTokenValid.id)

        // get total price and count
        const result = getTotalPrice(carts)

        res.status(200).json({ type: 'success', price: totalPrice, stock: stock, total: result.totalPrice, count: result.count })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// remove item

exports.removeItem = async (req, res) => {
    try {

        delete req.session.discount
        delete req.session.coupon

        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)

        const userPromise = User.findById(isTokenValid.id)
        const cartPromise = getwholecartData(isTokenValid.id)

        const [user, cart] = await Promise.all([userPromise, cartPromise])

        if (!cart) {
            return res.status(401).json({ type: 'redirect' });
        }

        const itemId = req.query.itemId

        const itemIndex = cart[0].items.findIndex(item => item._id.equals(itemId));

        if (itemIndex === -1) {
            return res.status(404).json({ msg: 'Item not found!', type: 'error' });
        }

        // Remove the item if it exists
        cart[0].items.splice(itemIndex, 1);

        // Update the cart document by using $pull to remove the item
        await Cart.updateOne(
            { _id: cart[0]._id },
            { $pull: { items: { _id: itemId } } }
        );

        // get totalprice
        const result = getTotalPrice(cart)

        let cartCount = cart[0].items.length


        res.status(200).json({ msg: 'Successfully removed the item', items: cart[0].items, type: 'success', total: result.totalPrice, count: result.count, cartCount })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

//get whole cart items

exports.getCartItems = async (req, res) => {
    try {


        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)

        // get whole items data
        const cart = await getwholecartDataUpdated(isTokenValid.id)

        // get totalprice and count
        const result = getTotalPriceInitail(cart)

        res.status(200).json({ msg: 'success', items: cart, total: result.totalPrice, count: result.count })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// checkout and check items are available in cart

exports.checkoutAndAvailabilityInCart = async (req, res) => {
    try {

        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)
        const id = isTokenValid.id
        // user promise
        const userPromise = User.findById(id)

        // cart promise
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
        const arrayForError = cart[0].items.map((item, no) => {

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

        })

        // store a cartId token in session
        const cartToken = jwt.sign({ id: cart._id }, process.env.cartSecretCode)
        req.session.cart = cartToken

        return res.status(200).json({ msg: 'all clear', type: 'success', arrayForError })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// store token 

exports.storeToken = async (req, res) => {
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
            return res.status(200).json({ msg: 'Reduce the quantity of items', type: 'reduce', arrayForError })
        }

        if (count === 0) {
            return res.status(200).json({ msg: 'No available items in cart', type: 'empty' })
        }

        // store a cartId token in session
        const cartToken = jwt.sign({ id: cart._id }, process.env.cartSecretCode)
        req.session.cart = cartToken

        res.status(200).json({ msg: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

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

// function to get whole cart data

async function getwholecartData(id) {

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
        await Promise.all(cart[0].items.map(async (item) => {
            const index = item.size.findIndex(size => size.equals(item.sId));
            let stock = 0;
            if (item.productIslisted && item.varientIslisted) {
                stock = item.stock[index];
            }
            await updateItemAvailability(item._id, stock, id);
        }));

        return cart
    } catch (err) {
        res.status(500).end()
    }
}


// get whole cart data to update cart

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

        });

        return itemsToDisplay
    } catch (err) {
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
        res.status(500).end()
    }

}