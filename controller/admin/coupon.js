const colorNames = require("colornames");
const Coupon = require("../../model/admin/coupon");

// get listed colors page

exports.getAddCouponPage = async (req, res) => {
    try {
        const admin = req.session.adminName;
        res.render("addCoupons", { admin });
    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
};

// add coupons

exports.addCoupons = async (req, res) => {
    try {
        const {
            coupon_code,
            discription,
            discount,
            min_amount,
            max_amount,
            expiryDate,
        } = req.body;

        codePattern = /^[a-zA-Z0-9]+$/;

        // Validation for coupon code
        if (!codePattern.test(coupon_code.trim())) {
            return res
                .status(401)
                .json({ msg: "Enter only alphabets and numbers", type: "code" });
        }

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Validation for discription
        if (!namePattern.test(discription.trim())) {
            return res.status(401).json({ msg: "Enter only alphabets", type: "discription" });
        }

        const isCoupon = await Coupon.findOne({ coupon_code: coupon_code });
        if (isCoupon) {
            return res.status(401).json({ msg: "This coupon is already exists", type: "code" });
        }

        const code = coupon_code.toUpperCase();
        // console.log(code);

        const coupon = new Coupon({
            coupon_code: code,
            discription,
            discount,
            min_amount,
            redeem_amount: max_amount,
            expiryDate,
        });
        await coupon.save();

        res.status(200).json({ msg: "Coupon added successfully", type: "success" });
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};

// lists coupons page

exports.listsCoupons = async (req, res) => {
    try {
        const admin = req.session.adminName;
        const coupons = await Coupon.find({});
        res.render("listsCoupons", { admin, coupons });
    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
};

// edit coupons

exports.editCoupons = async (req, res) => {
    try {
        const {
            coupon_id,
            code,
            discription,
            discount,
            min_amount,
            redeem_amount,
            expiry_date,
        } = req.body;
        // console.log(req.body);

        const coupon = await Coupon.findOne({ _id: coupon_id });

        if (!coupon) {
            return res
                .status(401)
                .json({ msg: "This coupon doesn't exists", type: "invalid" });
        }

        const newCode = code.toUpperCase();
        const isCoupon = await Coupon.findOne({
            $and: [{ _id: { $ne: coupon_id } }, { coupon_code: newCode }],
        });

        if (isCoupon) {
            return res
                .status(401)
                .json({ msg: "This coupon is already exists", type: "code" });
        }

        codePattern = /^[a-zA-Z0-9]+$/;

        // Validation for coupon code
        if (!codePattern.test(code.trim())) {
            return res.status(401).json({ msg: "Enter only alphabets and numbers", type: "code" });
        }

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Validation for discription
        if (!namePattern.test(discription.trim())) {
            return res.status(401).json({ msg: "Enter only alphabets", type: "discription" });
        }

        coupon.coupon_code = newCode;
        (coupon.discription = discription),
            (coupon.discount = discount),
            (coupon.min_amount = min_amount),
            (coupon.redeem_amount = redeem_amount),
            (coupon.expiryDate = expiry_date);
        await coupon.save();

        res.status(200).json({ msg: "Successfully Edited", type: "success" });
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};

// activation of coupons

exports.activateCoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId;

        const coupon = await Coupon.findOne({ _id: couponId });

        if (!coupon) {
            return res.status(401).json({ msg: "This coupon doesn't exists", type: "invalid" });
        }

        if (coupon.isActive === false) {
            coupon.isActive = true;
            await coupon.save();

            return res.status(200).json({ msg: "Activated Successfully", type: "Activate" });
        }

        coupon.isActive = false;
        await coupon.save();

        res.status(200).json({ msg: "Deactivated Successfully", type: "Deactivate" });
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
};


// remove a coupon

exports.removeCoupon = async (req, res) => {
    try {

        const couponId = req.query.couponId

        const coupon = await Coupon.findOne({ _id: couponId });

        if (!coupon) {
            return res.status(401).json({ msg: "This coupon doesn't exists", type: "invalid" });
        }

        await Coupon.deleteOne({ _id: couponId })

        res.status(200).json({ msg: "Removed Successfully", type: "success" });

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}