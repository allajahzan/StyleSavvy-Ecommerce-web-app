// get listed products
const Type = require('../../model/admin/types')
const Category = require('../../model/admin/catgory')
const Size = require('../../model/admin/size')
const Color = require('../../model/admin/color')
const Product = require('../../model/admin/product')
const Varient = require('../../model/admin/varient')


exports.getListedProducts = async (req, res) => {
    try {
        await Product.deleteMany({ isVarientAvailable: false })
        const admin = req.session.adminName
        const products = await Product.find({ isListed: true }).populate('type').populate('category').populate('varients')
        const types = await Type.find({ isListed: true })
        const categories = await Category.find({ isListed: true })
        res.render('listedProducts', { admin: admin, products: products, types: types, categories: categories })
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// get unlisted products

exports.getUnListedProducts = async (req, res) => {
    try {
        await Product.deleteMany({ isVarientAvailable: false })
        const admin = req.session.adminName
        const products = await Product.find({ isListed: false }).populate('type').populate('category').populate('varients')
        const types = await Type.find({})
        const categories = await Category.find({})
        res.render('unlistedProducts', { admin: admin, products: products, types: types, categories: categories })
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// get add products page

exports.getAddProducts = async (req, res) => {
    try {
        await Product.deleteMany({ isVarientAvailable: false })
        const admin = req.session.adminName
        const types = await Type.find({})
        const categories = await Category.find({})
        const sizes = await Size.find({})
        const colors = await Color.find({})

        res.render('addProducts', { admin: admin, types: types, categories: categories, sizes: sizes, colors: colors })
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// get categories

exports.getCategories = async (req, res) => {
    try {
        const id = req.query.id
        const categories = await Category.find({ $and: [{ type: id }] })
        res.status(200).json({ cats: categories , type:'success'})
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// add products

exports.addProducts = async (req, res) => {
    try {
        const { product, title, type, category, discription, tags } = req.body
        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        const pname = product[0].toUpperCase() + product.slice(1)

        // Name Validation for product name
        if (!namePattern.test(product.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'name' });
        }

        // Name Validation for product name
        if (!namePattern.test(title.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'title' });
        }

        // Name Validation for product name
        if (tags !== null) {
            if (!namePattern.test(tags.trim())) {
                return res.status(401).json({ msg: 'Enter only alphabets', type: 'tags' });
            }
        }

        const existingProduct = await Product.findOne({ $and: [{ product_name: { $regex: new RegExp('^' + product + '$', 'i') } }, { type: type }, { category: category }, { title: { $regex: new RegExp('^' + title + '$', 'i') } }] })
        if (existingProduct) {
            return res.status(401).json({ msg: 'This Product already exists', type: 'name' });
        }

        let newProduct;
        let p;
        if (tags === null) {
            newProduct = new Product({ product_name: pname, title: title, discription, type, category })
        } else {
            newProduct = new Product({ product_name: pname, title: title, discription, type, category, tags })
        }

        p = await newProduct.save()

        res.status(200).json({ msg: 'Successfully Added', type: 'success', pId: p._id, pname: p.product_name })
    }
    catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// edit products

exports.editProducts = async (req, res) => {
    try {

        const { pId, product_name, title, type, category, discription, tags } = req.body

        const product = await Product.findById(pId)

        const pname = product_name[0].toUpperCase() + product_name.slice(1)

        const namePattern = /^[A-Za-z]+( [A-Za-z]+)*$/;

        // Name Validation for product name
        if (!namePattern.test(product_name.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'name', product_name: product.product_name });
        }

        // Name Validation for product name
        if (!namePattern.test(title.trim())) {
            return res.status(401).json({ msg: 'Enter only alphabets', type: 'title', title: product.title });
        }

        // Name Validation for product name
        if (tags !== '') {
            if (!namePattern.test(tags.trim())) {
                return res.status(401).json({ msg: 'Enter only alphabets', type: 'tags', title: product.tags.tag_name });
            }
        }

        const existingProduct = await Product.findOne({ $and: [{ _id: { $ne: pId } }, { product_name: { $regex: new RegExp('^' + product_name + '$', 'i') } }, { type: type }, { category: category }] })
        if (existingProduct) {
            return res.status(401).json({ msg: 'This Product already exists', type: 'name' });
        }

        let updateOperations;

        if (tags !== '') {

            updateOperations = {
                $set: {
                    product_name: pname,
                    title: title,
                    type: type,
                    category: category,
                    discription: discription
                },

                tags: tags

            };
        } else {

            updateOperations = {
                $set: {
                    product_name: pname,
                    title: title,
                    type: type,
                    category: category,
                    discription: discription
                },

                tags: ''

            };

        }



        await Product.updateOne({ _id: pId }, updateOperations);

        const prod = await Product.findById(pId).populate('type').populate('category').populate('varients')

        res.status(200).json({ msg: 'Successfully Edited', type: 'success', product: prod })


    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// delete product bcz of no varients added

exports.deleteProduct = async (req, res) => {
    try {
        const id = req.query.id
        // console.log(id);
        await Product.deleteOne({ _id: id })
        res.status(200).json({msg:'successfully deleted', type:'success'})
    }
    catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// get product

exports.getProduct = async (req, res) => {
    try {
        const id = req.params.id
        const product = await Product.findOne({ _id: id }).populate('type').populate('category')
        res.status(200).json({ product: product ,type:'success'})
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }

}

// get product details page

exports.getProductDetails = async (req, res) => {
    try {
        id = req.query.id
        sts = req.query.isListed
        const product = await Product.findOne({ _id: id }).populate('type').populate('category');
        if (!product) {
            return res.render('productDetailsA')
        }
        const varients = await Varient.find({ $and: [{ product: id }, { isListed: sts }] }).populate('color')
        if (!varients) {
            return res.render('productDetailsA')
        }
        const colors = await Color.find({ isListed: true })
        const sizes = await Size.find({ isListed: true })

        if (sts === 'true') {
            res.render('productDetailsA', { product: product, varients: varients, colors: colors, sizes: sizes })
        } else {
            res.render('unlistedVarients', { product: product, varients: varients, colors: colors, sizes: sizes })
        }
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}


// unlist products

exports.unlistProduct = async (req, res) => {
    try {
        const pId = req.body.id
        const product = await Product.findById(pId)
        product.isListed = false
        await product.save()

        res.status(200).json({ msg: 'Successfully Unlisted', type: 'success' })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// list products

exports.listProduct = async (req, res) => {
    try {
        const pId = req.body.id
        const product = await Product.findById(pId)
        product.isListed = true
        await product.save()

        res.status(200).json({ msg: 'Successfully Listed', type: 'success' })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

//================================================ varients ==============================================================

exports.addVarients = async (req, res) => {
    try {
        const { pId, size, color, stock, price, actualPrice } = req.body

        // console.log(req.body);

        const file1 = req.files[0].filename
        const file2 = req.files[1].filename
        const file3 = req.files[2].filename
        const file4 = req.files[3].filename

        if (price.length === 0) {
            return res.status(401).json({ msg: 'Add atleast one stock', type: 'error' });
        }

        if (stock.length === 0) {
            return res.status(401).json({ msg: 'Add atleast one stock', type: 'error' });
        }

        let stocks;
        let prices;
        let sizes;

        // console.log(req.body);

        if (stock.length > 0 && price.length > 0) {
            stocks = stock.split(',')
            sizes = size.split(',')
            prices = price.split(',')
        }

        if (prices.length !== stocks.length) {
            return res.status(401).json({ msg: 'Fill all the data in stock', type: 'error' });
        }


        const varientsPromise = Varient.findOne({ $and: [{ product: pId }, { color: color }] })
        const varsPromise = Varient.find({ product: pId })

        const [varients, vars] = await Promise.all([varientsPromise, varsPromise])
        if (varients) {
            return res.status(401).json({ msg: 'This varient already exists', type: 'error' });
        }


        const colorToAdd = color;

        const colors = [colorToAdd, ...vars.map(variant => variant.color)];

        // Prepare the bulk write operations with concise filtering
        const bulkOps = vars.map(variant => ({
            updateOne: {
                filter: { _id: variant._id },
                update: { $push: { colors: color} } // Ensure array for 'colors'
            }
        }));

        // Perform the bulk write operation only if necessary
        if (bulkOps.length > 0) {
            await Varient.bulkWrite(bulkOps);
        }


        const varient = new Varient({ product: pId, color, size: sizes, stock: stocks, price: prices, actualPrice: actualPrice, colors: colors, images: [file1, file2, file3, file4] })
        const newV = await varient.save()

        await Product.updateOne(
            { _id: pId },
            { $set: { isVarientAvailable: true }, $push: { varients: newV._id } }
        )

        const v = await Varient.find({ product: pId }).populate('color')

        res.status(200).json({ msg: 'Successfully Added', type: 'success', varients: v })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// edit varients

exports.editVarients = async (req, res) => {
    try {
        const { pId, vId, color, price, oldColor } = req.body

        const varientPromise = Varient.findById(vId).populate('color')
        const varsPromise = Varient.find({ product: pId })
        const varients = await Varient.findOne({ $and: [{ _id: { $ne: vId } }, { product: pId }, { color: color }] })

        const [varient, vars] = await Promise.all([varientPromise, varsPromise])

        if (varients) {
            return res.status(401).json({ msg: 'This varient already exists', type: 'error', varients: varient });
        }

        // const varient = await Varient.findById(vId)

        const bulkOps = vars.map((doc) => {
            const index = doc.colors.indexOf(oldColor);
            if (index !== -1) {
              doc.colors[index] = color;
              return {
                updateOne: {
                  filter: { _id: doc._id },
                  update: { $set: { colors: doc.colors } }
                }
              };
            }
            return null; // Ensure non-matching docs don't add to bulkOps
          }).filter(op => op !== null); // Filter out null operations
          
          if (bulkOps.length > 0) {
            await Varient.bulkWrite(bulkOps);
          }
          

        varient.color = color
        varient.actualPrice = price

        let array = []
        varient.price.forEach((ele, i) => {
            array.push(price)
        })

        varient.price = array;

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === 'file1') {
                    varient.images[0] = file.filename
                } else if (file.fieldname === 'file2') {
                    varient.images[1] = file.filename
                } else if (file.fieldname === 'file3') {
                    varient.images[2] = file.filename
                } else {
                    varient.images[3] = file.filename
                }
            });
        }

        await Promise.all([varient.save()])

        const vrntsPromise = Varient.findById(vId).populate('color')

        const [vrnts] = await Promise.all([vrntsPromise])

        res.status(200).json({ msg: 'Successfully Edited', type: 'success', varients: vrnts })

    } catch (error) {
        console.log(error)
        res.status(500).end()
    }

}

// unlist varient

exports.unlistVarient = async (req, res) => {
    try {
        const vId = req.body.vId
        const pId = req.body.pId

        const vareintPromise = Varient.findById(vId)
        const varsPromise = Varient.find({ product: pId })
        const [vareint, vars] = await Promise.all([vareintPromise, varsPromise])
        vareint.isListed = false

        const colorToRemove = vareint.color;

        const bulkOps = vars.map((doc) => {
            if (doc._id.toString() !== vId.toString()) {
                const updatedColors = doc.colors.filter(color => color.toString() !== colorToRemove.toString());
                return {
                    updateOne: {
                        filter: { _id: doc._id },
                        update: { $set: { colors: updatedColors } }
                    }
                };
            }
        }).filter(op => op !== undefined); // Filter out undefined values if any
        
        if (bulkOps.length > 0) {
            await Varient.bulkWrite(bulkOps);
        }
        await vareint.save()

        res.status(200).json({ msg: 'Successfully Unlisted', type: 'success' })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// list varient

exports.listVarient = async (req, res) => {
    try {

        const vId = req.body.vId
        const pId = req.body.pId

        // console.log(req.body);

        const vareintPromise = Varient.findById(vId)
        const varsPromise = Varient.find({ product: pId})
        const [vareint, vars] = await Promise.all([vareintPromise, varsPromise])
        vareint.isListed = true


        vareint.isListed = true;
        const updatedVareint = await vareint.save();
        const colorToModify = updatedVareint.color
    
        // Add the color to the colors array of all other variants
        const bulkOps = vars.map((doc) => {
            if (doc._id.toString() !== vId.toString() && !doc.colors.includes(colorToModify)) {
                return {
                    updateOne: {
                        filter: { _id: doc._id },
                        update: { $addToSet: { colors: colorToModify } }
                    }
                };
            }
        }).filter(op => op !== undefined);
    
        if (bulkOps.length > 0) {
            await Varient.bulkWrite(bulkOps);
        }

        res.status(200).json({ msg: 'Successfully Listed', type: 'success' })

    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

//================================================ Stocks ==============================================================

// get stock details of a varient

exports.getStockDetails = async (req, res) => {
    try {

        const vid = req.query.vid;

        const varient = await Varient.findById(vid)
            .populate({
                path: 'product',
                populate: [
                    { path: 'type' },
                    { path: 'category' }
                ]
            })
            .populate('color')
            .populate('size');

        const sizes = varient.size.map(size => ({
            _id: size._id,
            size_name: size.size_name
        }));
        const stocks = varient.stock;
        const prices = varient.price;

        // Create an array of objects containing size, stock, and price
        const varientStocks = sizes.map((size, index) => ({
            no: index + 1,
            vId: varient._id,
            size,
            stock: stocks[index],
            price: prices[index]
        }));

        const size = await Size.find({ isListed: true })

        res.render('stockDetails', { stock: varientStocks, varient: varient, size: size })

    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
}

// edit stock details

exports.editStockDetails = async (req, res) => {
    try {

        const { vId, size, stock, price } = req.body

        let sto = stock.split(',')
        let siz = size.split(',')
        let pri = price.split(',')

        const varient = await Varient.findById(vId)
        varient.size = siz
        varient.stock = sto
        varient.price = pri
        await varient.save()

        const v = await Varient.findById(vId)
            .populate({
                path: 'product',
                populate: [
                    { path: 'type' },
                    { path: 'category' }
                ]
            })
            .populate('color')
            .populate('size');

        const sizes = v.size.map(size => ({
            _id: size._id,
            size_name: size.size_name
        }));
        const stocks = v.stock;
        const prices = v.price;

        // Create an array of objects containing size, stock, and price
        const varientStocks = sizes.map((size, index) => ({
            no: index + 1,
            vId: v._id,
            size,
            stock: stocks[index],
            price: prices[index]
        }));


        res.status(200).json({ msg: "Successfully Edited", stock: varientStocks ,type:'success'})

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }

}


// check new stocks

exports.addStock = async (req, res) => {

    try {

        const { vId, size, stock, price } = req.body

        let sto = stock.split(',')
        let siz = size.split(',')
        let pri = price.split(',')


        await Varient.findById(vId).updateOne({
            $push: {
                stock: { $each: sto },
                size: { $each: siz },
                price: { $each: pri }
            }
        });

        const v = await Varient.findById(vId)
            .populate({
                path: 'product',
                populate: [
                    { path: 'type' },
                    { path: 'category' }
                ]
            })
            .populate('color')
            .populate('size');

        const sizes = v.size.map(size => ({
            _id: size._id,
            size_name: size.size_name
        }));
        const stocks = v.stock;
        const prices = v.price;

        // Create an array of objects containing size, stock, and price
        const varientStocks = sizes.map((size, index) => ({
            no: index + 1,
            vId: v._id,
            size,
            stock: stocks[index],
            price: prices[index]
        }));

        res.status(200).json({ msg: 'Successfully Added', stock: varientStocks ,type:'success'})

    } catch (err) {
        console.log(err);
        res.status(500).end()
    }

}