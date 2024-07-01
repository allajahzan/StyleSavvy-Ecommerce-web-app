const colorNames = require('colornames')
const Color = require('../../model/admin/color')

// get listed colors page

exports.getListedColors = async (req, res) => {
    try{
    const admin = req.session.adminName
    const Colors = await Color.find({ isListed: true })
    res.render('listedColors', { admin: admin, colors: Colors })
    }catch(error){
        console.log(error);
        res.render('500Admin')
    }
}

// get unlsited colors page

exports.getUnListedSizes = async (req, res) => {
    try {
        const admin = req.session.adminName
        const Colors = await Color.find({ isListed: false })
        res.render('unlistedColors', { admin: admin, colors: Colors })
    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
}

// add colors

exports.addColors = async (req, res) => {

    try {
        const clr = req.body.color
        const hexacode = req.body.hexcode

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Name Validation
        if (!namePattern.test(clr.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'error' });
        }

        const clrName = clr.split(' ').join('').toLowerCase()

        const existingColor = await Color.findOne({ color_name: { $regex: new RegExp('^' + clrName + '$', 'i') }, color_code: hexacode })
        if (existingColor) {
            return res.status(401).json({ msg: 'This Color already exists', type: 'error' });
        }

        // Regular expression to match a valid hex color code
        const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;

        function isValidHexColor(hex) {
            return hexColorRegex.test(hex);
        }

        const hexCode = isValidHexColor(hexacode)
        if (!hexCode) {
            return res.status(401).json({ msg: 'Enter a valid color hexa code', type: 'error1' });
        }

        const color = new Color({ color_name: clrName, color_code: hexacode })
        await color.save()

        const colors = await Color.find({ isListed: true })

        res.status(200).json({ msg: 'Successfully Added', type: 'success', colors: colors })


    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// edit color

exports.editColors = async (req, res) => {

    try {
        const { id, color } = req.body
        const clr = await Color.findById(id)
        const hexacode = req.body.hexacode
        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        const clrName = color.split(' ').join('').toLowerCase()

        // Name Validation
        if (!namePattern.test(color.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'error', text: clr.color_name });
        }

        const existingColor = await Color.findOne({ $and: [{ _id: { $ne: id } }, { $or: [{ color_name: { $regex: new RegExp('^' + clrName + '$', 'i') } }, { color_code: hexacode }] }] })
        if (existingColor) {
            return res.status(401).json({ msg: 'This Color already exists', type: 'error', text: clr.color_name });
        }

        // Regular expression to match a valid hex color code
        const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;

        function isValidHexColor(hex) {
            return hexColorRegex.test(hex);
        }

        const hexCode = isValidHexColor(hexacode)
        if (!hexCode) {
            return res.status(401).json({ msg: 'Enter a valid color hexa code', type: 'error1', text: clr.color_code });
        }

        clr.color_name = clrName
        clr.color_code = hexacode
        await clr.save()

        res.status(200).json({ msg: 'Successfully Edited', type: 'success', text: clrName, code: hexacode })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }

}

// unlist color

exports.unlistColors = async (req, res) => {
    try {
        const id = req.body.id

        const clr = await Color.findById(id)
        clr.isListed = false
        await clr.save()

        res.status(200).json({ msg: 'Successfully Unlisted', type: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// list color

exports.listColors = async (req, res) => {
    try {
        const id = req.body.id

        const clr = await Color.findById(id)
        clr.isListed = true
        await clr.save()

        res.status(200).json({ msg: 'Successfully Listed', type: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}