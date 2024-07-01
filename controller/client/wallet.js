const User = require('../../model/user/user')
const Wallet = require('../../model/user/wallet')
const jwt = require('jsonwebtoken');
const razorPayController = require('../../controller/client/razorpay')
const crypto = require('crypto')
// create wallet order id

exports.createOrderId = async (req, res) => {
    try {

        const amount = req.body.amount;

        const resp = await razorPayController.createOrderId({
            "amount": amount * 100,
            "currency": "INR"
        })

        if (resp.ok) {
            const data = await resp.json();
            return res.status(200).json({ msg: 'orderid created', orderId: data.id, type: 'success' });
        } else {
            return res.status(resp.status).json({ msg: 'Failed to create order ID', type: 'network' });
        }


    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// verify payment 

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        // console.log(req.body);

        const verificationHashed = crypto.createHmac('sha256', process.env.razor_pay_key_secret);
        verificationHashed.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const signature = verificationHashed.digest('hex');

        if (signature === razorpay_signature) {

            const token = req.session.user
            const isTokenValid = jwt.verify(token, process.env.userSecretCode)
            const id = isTokenValid.id

            let wallet = await Wallet.findOne({ customerId: id })
            let newWallet;

            if (wallet) {

                wallet.transaction_history.push({
                    amount: amount,
                    type: 'Credited',
                    discription: 'Money added through razorpay'
                });
                wallet.balance += amount;
                newWallet = await wallet.save();

            } else {

                wallet = new Wallet({
                    customerId: id,
                    transaction_history: [{
                        amount: amount,
                        type: 'Credited',
                        discription: 'Money added through razorpay'
                    }],
                    balance: amount
                });
                newWallet =  await wallet.save();
            }
            return res.status(201).json({ paymentStatus: 'Success', type: 'success',wallet:newWallet});
        } else {
            return res.status(400).json({ paymentStatus: 'Failure' });
        }

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};
