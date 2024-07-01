const Size = require('../../model/admin/size')

// get listed sizes pages

exports.getListedSizes = async (req, res) => {

    try {
        const admin = req.session.adminName
        const sizes = await Size.find({ isListed: true })
        res.render('listedSizes', { admin: admin, sizes: sizes })
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// get unlisted sizes pages

exports.getUnListedSizes = async (req, res) => {

    try {
        const admin = req.session.adminName
        const sizes = await Size.find({ isListed: false })
        res.render('unlistedSizes', { admin: admin, sizes: sizes })
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// add sizes

exports.addSizes = async (req, res) => {
    try {

        const size = req.body.size

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Name Validation
        if (!namePattern.test(size.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'error' });
        }

        const existingSize = await Size.findOne({ size_name: { $regex: new RegExp('^' + size + '$', 'i') } })
        if (existingSize) {
            return res.status(401).json({ msg: 'This Size already exists', type: 'error' });
        }

        const sizes = new Size({ size_name: size })
        await sizes.save()

        const Sizes = await Size.find({ isListed: true })

        res.status(200).json({ msg: 'Successfully Added', type: 'success', sizes: Sizes })


    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// edit sizes

exports.editSizes = async (req, res) => {
    try {
        const { size: size_name, id } = req.body

        const size = await Size.findById(id)

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Name Validation
        if (!namePattern.test(size_name.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'error', text: size.size_name });
        }

        const existingSize = await Size.findOne({ $and: [{ _id: { $ne: id } }, { size_name: { $regex: new RegExp('^' + size_name + '$', 'i') } }] })
        if (existingSize) {
            return res.status(401).json({ msg: 'This Size already exists', type: 'error', text: size.size_name });
        }

        size.size_name = size_name
        await size.save()

        res.status(200).json({ msg: 'Successfully Edited', type: 'success', text: size_name })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// unlist size

exports.unlistSizes = async (req, res) => {
    try {
        const id = req.body.id

        const size = await Size.findById(id)
        size.isListed = false
        await size.save()

        res.status(200).json({ msg: 'Successfully Unlisted', type: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// list size

exports.listSizes = async (req, res) => {
    try {
        const id = req.body.id

        const size = await Size.findById(id)
        size.isListed = true
        await size.save()

        res.status(200).json({ msg: 'Successfully Listed', type: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}