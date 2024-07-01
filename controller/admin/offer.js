const Offer = require("../../model/admin/offer");
const Product = require('../../model/admin/product')
const Category = require('../../model/admin/catgory')
// const Coupon = require("../../model/admin/");

// get Add offers page
exports.getAddOfferPage = async (req, res) => {
    try {
        const admin = req.session.adminName;
        res.render('addOffer', { admin })
    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
}

// get offer lists page

exports.getListsOffers = async (req, res) => {
    try {
        const admin = req.session.adminName;
        const offers = await Offer.find({})
        res.render('listOffer', { admin, offers })
    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
}

// add offers

exports.addOffers = async (req, res) => {
    try {

        const { offer_name, offerType, itemId, typeName, offer, redeem_amount } = req.body
        // console.log(req.body);

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Validation for coupon code
        if (!namePattern.test(offer_name.trim())) {
            return res.status(401).json({ msg: "Enter only alphabets and numbers", type: "offerName" });
        }

        if (offerType === 'product') {

            const isOfferProductPromise = Offer.findOne({ offer: offer, offerType: offerType, productId: itemId });
            const productPromise = Product.findById(itemId)

            const [isOfferProduct, product] = await Promise.all([isOfferProductPromise, productPromise])

            if (isOfferProduct) {
                return res.status(401).json({ msg: "This product offer is already exists", type: "offerName" });
            }

            const newOffer = new Offer({ offer_name, offerType, productId: itemId, typeName, offer: Number(offer), redeem_amount })

            product.productOffer = Number(offer);
            await Promise.all([product.save(), newOffer.save()])

        } else {

            const isOfferCategoryPromise = Offer.findOne({ offer: offer, offerType: offerType, categoryId: itemId });
            const categoryPromise = Category.findById(itemId)

            const [isOfferCategory, category] = await Promise.all([isOfferCategoryPromise, categoryPromise])



            if (isOfferCategory) {
                return res.status(401).json({ msg: "This category offer is already exists", type: "offerName" });
            }

            const newOffer = new Offer({ offer_name, offerType, categoryId: itemId, typeName, offer: Number(offer), redeem_amount })

            category.categoryOffer = Number(offer)
            await Promise.all([category.save(), newOffer.save()])

        }

        res.status(200).json({ type: 'success', msg: 'Offer Addedd Successfully' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// get perticular types

exports.getTypes = async (req, res) => {
    try {

        const type = req.query.type

        if (type === 'product') {
            const product = await Product.find({})
            return res.status(200).json({ product: product, type: 'success' })
        }

        const category = await Category.find({})
        res.status(200).json({ category: category, type: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// edit offers

exports.editOffers = async (req, res) => {
    try {

        const { offerId, offer_name, offerType, itemId, typeName, offer, redeem_amount} = req.body


        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Validation for coupon code
        if (!namePattern.test(offer_name.trim())) {
            return res.status(401).json({ msg: "Enter only alphabets and numbers", type: "offerName" });
        }

        if (offerType === 'product') {

            const isOfferProductPromise = Offer.findOne({ $and: [{ _id: { $ne: offerId } }, { offer: offer, offerType: offerType, productId: itemId }] });
            const productPromise = Product.findById(itemId)

            const [isOfferProduct, product] = await Promise.all([isOfferProductPromise, productPromise])

            if (isOfferProduct) {
                return res
                    .status(401)
                    .json({ msg: "This product offer is already exists", type: "invalid" });
            }

            const offerToEdit = await Offer.findById(offerId)

            const p = await Product.findById(offerToEdit.productId)

            offerToEdit.offer_name = offer_name
            offerToEdit.offerType = offerType
            offerToEdit.productId = itemId
            offerToEdit.offer = Number(offer)
            offerToEdit.typeName = typeName
            offerToEdit.redeem_amount = redeem_amount

            p.productOffer = null
            await p.save()

            product.productOffer = Number(offer);

            await Promise.all([product.save(), offerToEdit.save()])


        } else {

            const isOfferCategoryPromise = Offer.findOne({ $and: [{ _id: { $ne: offerId } }, { offer: offer, offerType: offerType, categoryId: itemId }] });
            const categoryPromise = Category.findById(itemId)

            const [isOfferCategory, category] = await Promise.all([isOfferCategoryPromise, categoryPromise])

            if (isOfferCategory) {
                return res.status(401).json({ msg: "This category offer is already exists", type: "invalid" });
            }

            const offerToEdit = await Offer.findById(offerId)

            const c = await Category.findById(offerToEdit.categoryId)

            offerToEdit.offer_name = offer_name
            offerToEdit.offerType = offerType
            offerToEdit.categoryId = itemId
            offerToEdit.typeName = typeName
            offerToEdit.offer = Number(offer)
            offerToEdit.redeem_amount = redeem_amount

            c.categoryOffer = null
            await c.save()

            category.categoryOffer = Number(offer)

            await Promise.all([category.save(), offerToEdit.save()])



        }

        res.status(200).json({ msg: 'Edited Successfully', type: 'success' })

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// actovation offer

exports.activationOffer = async (req, res) => {
    try {
        const offerId = req.query.offerId;
        const offer = await Offer.findOne({ _id: offerId });

        if (!offer) {
            return res.status(401).json({ msg: "This coupon doesn't exist", type: "invalid" });
        }

        let item;
        if (offer.offerType === 'product') {

            item = await Product.findById(offer.productId);

        } else if (offer.offerType === 'category') {

            item = await Category.findById(offer.categoryId);

        } else {
            return res.status(400).json({ msg: "Invalid offer type", type: "invalid" });
        }

        if (offer.isActive === false) {
            offer.isActive = true;

            if (offer.offerType === 'product') {
                item.productOffer = Number(offer.offer);
            } else {
                item.categoryOffer = Number(offer.offer);
            }

            await Promise.all([item.save(), offer.save()]);
            return res.status(200).json({ msg: "Activated Successfully", type: "Activate" });
        } else {
            if (offer.offerType === 'product') {
                item.productOffer = null;
            } else {
                item.categoryOffer = null;
            }

            offer.isActive = false;
            await Promise.all([item.save(), offer.save()]);

            return res.status(200).json({ msg: "Deactivated Successfully", type: "Deactivate" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};

// remove an offer

exports.removeOffer = async (req, res) => {
    try {

        const offerId = req.query.offerId

        const offer = await Offer.findOne({ _id: offerId });

        // await Category.updateMany({}, { $unset: { redeem_amount: 1 } });

        if (!offer) {
            return res.status(401).json({ msg: "This coupon doesn't exists", type: "invalid" });
        }

        if (offer.offerType === 'product') {

            let item = await Product.findById(offer.productId)
            item.productOffer = null
            await Promise.all([Offer.deleteOne({ _id: offer }), item.save()])

        } else {

            let item = await Category.findById(offer.categoryId)
            item.categoryOffer = null
            await Promise.all([Offer.deleteOne({ _id: offer }), item.save()])

        }


        res.status(200).json({ msg: "Removed Successfully", type: "success" });

    }
    catch (err) {
        console.log(err);
        res.status(500).end()
    }
}