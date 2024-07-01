const Category = require('../../model/admin/catgory')
const Type = require('../../model/admin/types')
const Product = require('../../model/admin/product')
const Varient = require('../../model/admin/varient')

// get listed categories page

exports.getListedCategories = async (req, res) => {

    try {

        const admin = req.session.adminName;

        const types = await Type.find({ isListed: true });

        const categories = await Category.find({ isListed: true }).populate('type');

        res.render('listedCategories', { admin: admin, types: types, cats: categories });
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
};

// get  unlisted categories page

exports.getUnListedCategories = async (req, res) => {
    try {
        const admin = req.session.adminName

        const types = await Type.find({ isListed: true });

        const categories = await Category.find({ isListed: false }).populate('type');

        res.render('unlistedCategories', { admin: admin, types: types, cats: categories });

    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// add category 

exports.addCategories = async (req, res) => {
    try {
        const { category, typeId } = req.body;

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Name Validation
        if (!namePattern.test(category.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'error' });
        }

        const existingCategories = await Category.find({ $and: [{ category_name: { $regex: new RegExp('^' + category + '$', 'i') } }, { type: typeId }] })
        if (existingCategories.length !== 0) {
            return res.status(401).json({ msg: 'This category already exists', type: 'error' });
        }


        const newCategory = new Category({ category_name: category, type: typeId });
        await newCategory.save();

        const cats = await Category.find({ isListed: true }).populate('type')

        res.status(200).json({ msg: 'Successfully Added', type: 'success', cats: cats });
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
};

// edit categories

exports.editCategories = async (req, res) => {

    try {
        const { category, catId, typeId } = req.body

        const category_ = await Category.findById(catId)

        // Name Validation

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        if (!namePattern.test(category.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'error', text: category_.category_name });
        }

        const existingCategories = await Category.find({ $and: [{ _id: { $ne: catId } }, { category_name: { $regex: new RegExp('^' + category + '$', 'i') } }, { type: typeId }] })
        if (existingCategories.length > 0) {
            return res.status(401).json({ msg: 'This category already exists', type: 'error', text: category_.category_name });
        }

        category_.category_name = category
        category_.type = typeId
        await category_.save()

        const categories = await Category.findOne({ _id: catId }).populate('type')
        const cat_name = categories.category_name
        const type_name = categories.type.type_name

        res.status(200).json({ msg: 'Successfully Edited', type: 'success', cat_name: cat_name, type_name: type_name })
    }
    catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// unlists categories

exports.unlistCategories = async (req, res) => {

    try {
        const catId = req.body.id
        const category = await Category.findById(catId)
        category.isListed = false

        const products = await Product.find({ category: category._id });
        const productIds = products.map(product => product._id);

        await Promise.all([ 
            Product.updateMany({category:category._id},{isListed: false}),
            Varient.updateMany({ product: { $in: productIds } }, { isListed: false }),
            category.save()
        ])

        const categories = await Category.find({ isListed: true })

        res.status(200).json({ msg: 'Successfully Unlisted', type: 'success', cats: categories })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// lists categories

exports.listCategories = async (req, res) => {

    try {
        const catId = req.body.id
        const category = await Category.findById(catId)
        category.isListed = true
        
        const products = await Product.find({ category: category._id });
        const productIds = products.map(product => product._id);

        await Promise.all([ 
            Product.updateMany({category:category._id},{isListed: true}),
            Varient.updateMany({ product: { $in: productIds } }, { isListed: true }),
            category.save()
        ])


        const categories = await Category.find({ isListed: false })

        res.status(200).json({ msg: 'Successfully Listed', type: 'success', cats: categories })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }

}