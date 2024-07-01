const Order = require('../../model/user/order')
const Wallet = require('../../model/user/wallet')
const Varient = require('../../model/admin/varient')

// get orders page

exports.getOrderPage = async (req, res) => {
    try {

        const admin = req.session.adminName
        const orders = await Order.find({})
        res.render('order', { admin, orders })

    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
}

// get order details page

exports.orderDetails = async (req, res) => {
    try {

        const orderId = req.query.orderId
        const orders = await Order.findOne({ _id: orderId })
        const admin = req.session.adminName

        if (!orders) {
            return res.redirect('/admin/orders')
        }

        res.render('ordersDetails', { admin, orders })

    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
}

// change order status

exports.changeOrderStatus = async (req, res) => {
    try {

        const { userId, orderId, itemIndex, orderStatus } = req.body

        const order = await Order.findOne({ _id: orderId })

        const orderedItem = order.orderedItems[itemIndex]

        if (orderedItem.orderStatus === 'Cancelled') {
            return res.status(200).json({ msg: 'enable to updated', item: orderedItem, orders: order ,type:'success'});
        }

        if (orderStatus === 'Shipped') {
            orderedItem.orderStatus = 'Shipped';
            orderedItem.shippedDate = new Date();
        } else if (orderStatus === 'Delivered') {
            orderedItem.orderStatus = 'Delivered';
            orderedItem.deliveredDate = new Date();
            orderedItem.paymentStatus = 'Success'

            if (order.paymentMethod === 'COD') {
                let sts = true
                order.orderedItems.forEach(item => {
                    if (item.paymentStatus !== 'Success' && item.paymentStatus !== 'Refunded' && item.paymentStatus !== 'Done') {
                        sts = false;
                    }
                });
                if (sts === true) {

                    order.orderStatus = 'Completed'
                    order.paymentStatus = 'Done'
                }
            } else {

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


            }
        } else {
            orderedItem.orderStatus = orderStatus;
        }

        // Save the updated order
        const orders = await order.save();
        const item = orders.orderedItems[itemIndex]

        res.status(200).json({ msg: 'updated successfully', item, orders ,type:'success'});

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// request accept or reject for return 

exports.changeRequestStatus = async (req, res) => {
    try {

        const { userId, orderId, itemIndex, requestStatus } = req.body

        const order = await Order.findOne({ _id: orderId })

        const orderedItem = order.orderedItems[itemIndex]

        if (requestStatus === 'Accept') {

            orderedItem.orderStatus = 'RequestAccepted'
            orderedItem.requestAcceptedDate = new Date();

            // Save the updated order
            const orders = await order.save();
            const item = orders.orderedItems[itemIndex]

            return res.status(200).json({ msg: 'Request accepted successfully', item, orders ,type:'success'});

        } else {

            orderedItem.orderStatus = 'RequestRejected'
            orderedItem.requestRejectedDate = new Date();
            orderedItem.paymentStatus = 'Success'
            order.orderStatus = 'Completed'


            // Save the updated order
            const orders = await order.save();
            const item = orders.orderedItems[itemIndex]

            return res.status(200).json({ msg: 'Request rejected successfully', item, orders ,type:'success'});

        }


    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// recieve returned order

exports.recieveReturned = async (req, res) => {
    try {

        const { userId, orderId, itemIndex } = req.body

        const order = await Order.findOne({ _id: orderId })

        const orderedItem = order.orderedItems[itemIndex]

        orderedItem.orderStatus = 'Returned'
        orderedItem.returnedDate = new Date();
        orderedItem.paymentStatus = 'Refunded'

        if (order.paymentMethod === 'COD') {

            if (order.discount !== 0) {

                for (const item of order.orderedItems) {
                    if (item.orderStatus === 'Delivered') {
                        item.orderStatus = 'RequestedReturn';
                        item.reasonForReturn = orderedItem.reason
                        item.paymentStatus = 'Pending';
                        item.requestedDate = new Date();
                    }
                }


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


            }


            let sts = true
            order.orderedItems.forEach(item => {
                if (item.paymentStatus !== 'Success' && item.paymentStatus !== 'Refunded' && item.paymentStatus !== 'Done') {
                    sts = false;
                }
            });
            if (sts === true) {
                order.orderStatus = 'Completed'
                order.paymentStatus = 'Done'
            }

        } else {


            if (order.paymentMethod !== 'COD' && order.discount !== 0) {
                for (const item of order.orderedItems) {

                    if (item.orderStatus === 'Delivered') {
                        item.orderStatus = 'RequestedReturn'
                        item.paymentStatus = 'Pending'
                        item.requestedDate = new Date();
                        item.reasonForReturn = orderedItem.reason

                        order.orderStatus = 'Pending'
                        order.paymentStatus = 'Done'

                    } else {


                        if (item.orderStatus === 'Pending' || item.orderStatus === 'Shipping') {
                            item.orderStatus = 'Cancelled'
                            item.paymentStatus = 'Refunded'
                            item.cancelledDate = new Date();


                            // update varients stock 
                            const varient = await Varient.findById(item.varientId)
                            const index = varient.size.indexOf(item.sizeId)
                            let stock = varient.stock[index]
                            stock += item.quantity
                            varient.stock[index] = stock
                            await varient.save()

                            // update wallet
                            let wallet = await Wallet.findOne({ customerId: userId })

                            if (wallet) {

                                if (order.paymentMethod !== 'COD') {
                                    wallet.transaction_history.push({
                                        amount: item.totalAmount,
                                        type: 'Credited',
                                        discription: 'Money added through cancelling order'
                                    });
                                    wallet.balance += item.totalAmount;
                                    await wallet.save();
                                }

                            } else {

                                if (order.paymentMethod !== 'COD') {
                                    wallet = new Wallet({
                                        customerId: id,
                                        transaction_history: [{
                                            amount: item.totalAmount,
                                            type: 'Credited',
                                            discription: 'Money added through cancelling order'
                                        }],
                                        balance: item.totalAmount
                                    });
                                    await wallet.save();
                                }
                            }
                        }

                    }



                }

                // Save the updated order
                // const orders = await order.save();
                // items = orders.orderedItems
                // return res.status(200).json({ msg: 'You have requested to return', items, type: 'success' });
            }


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
        }

        // update varients stock 
        const varient = await Varient.findById(orderedItem.varientId)
        const index = varient.size.indexOf(orderedItem.sizeId)
        let stock = varient.stock[index]
        stock += orderedItem.quantity
        varient.stock[index] = stock
        await varient.save()

        // calculate Money


        // Save the updated order
        const orders = await order.save();
        const item = orders.orderedItems[itemIndex]


        let wallet = await Wallet.findOne({ customerId: userId })

        if (wallet) {

            wallet.transaction_history.push({
                amount: item.totalAmount,
                type: 'Credited',
                discription: 'Returned a product'
            });
            wallet.balance += item.totalAmount;
            await wallet.save();

        } else {

            wallet = new Wallet({
                customerId: id,
                transaction_history: [{
                    amount: item.totalAmount,
                    type: 'Credited',
                    discription: 'Returned a product'
                }],
                balance: item.totalAmount
            });
            await wallet.save();
        }


        res.status(200).json({ msg: 'Return recieved successfully', item, orders ,type:'success'});

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}