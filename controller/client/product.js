const User = require('../../model/user/user')
const Product = require('../../model/admin/product')
const Varient = require('../../model/admin/varient')
const Category = require('../../model/admin/catgory')
const Type = require('../../model/admin/types')
const Offer = require('../../model/admin/offer')
const Color = require('../../model/admin/color')
const Cart = require('../../model/user/cart')
const Wishlist = require('../../model/user/wishlist')
const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb')

// get products page

exports.getProductsPage = async (req, res) => {
  try {

    // delete cart session
    delete req.session.cart

    //  queries
    const currentPage = req.query.page ? req.query.page : 1
    const sortby = req.query?.sortby
    const order = req.query?.order

    let filter = req.query.subcategory || '';
    if (filter === 'all') {
      filter = ''
    }

    let typeSelected = req.query.category || '';
    if (typeSelected === 'all') {
      typeSelected = ''
    }

    let colorSelected = req.query.color || '';
    if (colorSelected === 'all') {
      colorSelected = ''
    }

    const searchQuery = req.query.search || '';
    if(searchQuery == '*'){
      searchQuery = ''
    }


    let orderQuery;
    let orderValue;
    let select;

    if (sortby !== undefined && order !== undefined && currentPage) {

      if (sortby === 'name' && order === 'ascending') {

        orderQuery = 'product.product_name';
        orderValue = 1;
        select = 1;

      }

      if (sortby === 'name' && order === 'descending') {

        orderQuery = 'product.product_name';
        orderValue = -1;
        select = 2;

      }

      if (sortby === 'price' && order === 'ascending') {

        orderQuery = 'actualPrice';
        orderValue = 1;
        select = 3;

      }

      if (sortby === 'price' && order === 'descending') {

        orderQuery = 'actualPrice';
        orderValue = -1;
        select = 4;

      }

    } else {

      orderQuery = 'addedDateTime';
      orderValue = -1;
      select = 0;

    }

    // filtered varients with full details
    const varientsPromise = Varient.aggregate([
      {
        $match: { isListed: true }
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
        $addFields: { originalColorOrder: "$colors" }
      },
      {
        $lookup: {
          from: 'colors',
          localField: 'colors',
          foreignField: '_id',
          as: 'allColors'
        }
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
        $unwind: {
          path: '$product.type',
          preserveNullAndEmptyArrays: true
        }
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
        $unwind: {
          path: '$product.category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          allColors: {
            $map: {
              input: "$originalColorOrder",
              as: "colorId",
              in: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$allColors",
                      as: "color",
                      cond: { $eq: ["$$color._id", "$$colorId"] }
                    }
                  },
                  0
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          'product._id': 1,
          'product.product_name': 1,
          'product.isListed': 1,
          'product.title': 1,
          'product.productOffer': 1,
          'product.category.category_name': 1,
          'product.category.isListed': 1,
          'product.category.categoryOffer': 1,
          'product.type.type_name': 1,
          'product.type.isListed': 1,
          _id: 1,
          isListed: 1,
          images: 1,
          color:1,
          actualPrice: 1,
          allColors: 1,
          stock: 1,
          size: 1,
          addedDateTime: 1
        }
      },
      {
        $sort: { [orderQuery]: orderValue }
      },
      {
        $match: { 'product.isListed': true }
      },
      {
        $match: { isListed: true }
      },
      {
        $match: { 'product.category.isListed': true }
      },
      {
        $match: { 'product.type.isListed': true }
      },
      {
        $match: {
          $or: [
            { 'color.color_name': { $regex: colorSelected.replace(/\s+/g, '\\s*'), $options: 'i' } },
          ]
        }
      },
      {
        $match: {
          $or: [
            { 'product.category.category_name': { $regex: filter.replace(/\s+/g, '\\s*'), $options: 'i' } },
          ]
        }
      },
      {
        $match: {
          $or: [
            { 'product.type.type_name': { $regex: typeSelected.replace(/\s+/g, '\\s*'), $options: 'i' } },
          ]
        }
      },
      {
        $match: {
          $or: [
            { 'product.product_name': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } },
            { 'product.category.category_name': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } },
            { 'product.type.type_name': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } },
            { 'product.title': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } }
          ]
        }
      },
      {
        $skip: (currentPage - 1) * 12
      },
      {
        $limit: 12
      },

    ]);

    // filtered varients 
    let filteredVarientsPromise = Varient.aggregate([
      {
        $lookup: {
          from: 'colors',
          localField: 'color',
          foreignField: '_id',
          as: 'color'
        }
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
      $unwind: {
        path: '$product.type',
        preserveNullAndEmptyArrays: true
      }
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
      $unwind: {
        path: '$product.category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: { 'product.isListed': true }
    },
    {
      $match: { isListed: true }
    },
    {
      $match: { 'product.category.isListed': true }
    },
    {
      $match: { 'product.type.isListed': true }
    },
    {
      $match: {
        $or: [
          { 'color.color_name': { $regex: colorSelected.replace(/\s+/g, '\\s*'), $options: 'i' } },
        ]
      }
    },
    {
      $match: {
        $or: [
          { 'product.category.category_name': { $regex: filter.replace(/\s+/g, '\\s*'), $options: 'i' } },
        ]
      }
    },
    {
      $match: {
        $or: [
          { 'product.type.type_name': { $regex: typeSelected.replace(/\s+/g, '\\s*'), $options: 'i' } },
        ]
      }
    },
    {
      $match: {
        $or: [
          { 'product.product_name': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } },
          { 'product.category.category_name': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } },
          { 'product.type.type_name': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } },
          { 'product.title': { $regex: searchQuery.replace(/\s+/g, '\\s*'), $options: 'i' } }
        ]
      }
    },
    ])


    const typePromise = Type.find({ isListed: true })
    const categoryPromise = Category.find({ isListed: true })
    const colorPromise = Color.find({ isListed: true })

    // get all with promise.all

    const [varients, filteredVarients, type, category, colors] = await Promise.all([varientsPromise, filteredVarientsPromise, typePromise, categoryPromise,colorPromise])


    totalVarients = filteredVarients.length
    let varientsPerPage = 12;
    let totalPages = Math.ceil(totalVarients / varientsPerPage)

    // user Name
    if (!req.session.user) {
      return res.render('products', { varients: varients, totalPages, currentPage, totalVarients, select, type, category, colors ,searchQuery })

    }
    const token = req.session.user
    const isTokenValid = jwt.verify(token, process.env.userSecretCode,)
    if (!isTokenValid) {
      delete req.session.user
      delete req.session.userName
      return res.render('products', { varients: varients, totalPages, currentPage, totalVarients, select, type, category, colors ,searchQuery})
    }

    const userPromise = User.findById(isTokenValid.id)
    const cartPromise = Cart.findOne({customerId:isTokenValid.id})
    const wishlistPromise = Wishlist.findOne({customerId:isTokenValid.id})

    const [ user, cart, wishlist] = await Promise.all([userPromise, cartPromise, wishlistPromise]) 

    if (!user) {
      delete req.session.user
      delete req.session.userName
      return res.render('products', { varients: varients, totalPages, currentPage, totalVarients, select, type, category, colors ,searchQuery})
    }

    if (user.isBlocked) {
      delete req.session.user
      delete req.session.userName
      return res.render('products', { varients: varients, totalPages, currentPage, totalVarients, select, type, category, colors ,searchQuery})
    }

    res.render('products', { user: user.name, varients: varients, totalPages, currentPage, totalVarients, select, type, category, colors ,searchQuery, cart, wishlist})
  } catch (err) {
    console.log(err);
    res.render('500')
  }
}


// get product details page

exports.getProductsDetails = async (req, res) => {

  // delete checkout session
  delete req.session.cart

  const pid = req.query.pId
  const vid = req.query.vId

  try {
    
      const varientsPromise = Varient.aggregate([
        {
          $match: { isListed: true , _id: new ObjectId(vid), product: new ObjectId(pid)}
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
          $addFields: { originalColorOrder: "$colors" }
        },
        {
          $lookup: {
            from: 'colors',
            localField: 'colors',
            foreignField: '_id',
            as: 'allColors'
          }
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
          $unwind: {
            path: '$product.type',
            preserveNullAndEmptyArrays: true
          }
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
          $unwind: {
            path: '$product.category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'varients',
            localField: 'product.varients',
            foreignField: '_id',
            as: 'product.varients'
          }
        },
        {
          $addFields: {
            allColors: {
              $map: {
                input: "$originalColorOrder",
                as: "colorId",
                in: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$allColors",
                        as: "color",
                        cond: { $eq: ["$$color._id", "$$colorId"] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            'product._id': 1,
            'product.product_name': 1,
            'product.discription': 1,
            'product.isListed': 1,
            'product.title': 1,
            'product.productOffer': 1,
            'product.category.category_name': 1,
            'product.category.isListed': 1,
            'product.category.categoryOffer': 1,
            'product.type.type_name': 1,
            'product.type.isListed': 1,
            'product.type.isListed': 1,
            'product.varients':1,
            _id: 1,
            isListed: 1,
            images: 1,
            color: 1,
            actualPrice: 1,
            allColors: 1,
            stock: 1,
            size: 1,
            addedDateTime: 1
          }
        },
        {
          $match: { 'product.isListed': true }
        },
        {
          $match: { isListed: true }
        },
        {
          $match: { 'product.category.isListed': true }
        },
        {
          $match: { 'product.type.isListed': true }
        },
  
      ]);

      const [varient] = await Promise.all([varientsPromise])

      if (varient) {

        const title = varient[0].product.title
        const type_name = varient[0].product.type.type_name

        const relatedProductsPromise = Varient.aggregate([
          {
            $match: { isListed: true , _id: { $ne: new ObjectId(vid) }}
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
            $addFields: { originalColorOrder: "$colors" }
          },
          {
            $lookup: {
              from: 'colors',
              localField: 'colors',
              foreignField: '_id',
              as: 'allColors'
            }
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
            $unwind: {
              path: '$product.type',
              preserveNullAndEmptyArrays: true
            }
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
            $unwind: {
              path: '$product.category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'varients',
              localField: 'product.varients',
              foreignField: '_id',
              as: 'product.varients'
            }
          },
          {
            $addFields: {
              allColors: {
                $map: {
                  input: "$originalColorOrder",
                  as: "colorId",
                  in: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$allColors",
                          as: "color",
                          cond: { $eq: ["$$color._id", "$$colorId"] }
                        }
                      },
                      0
                    ]
                  }
                }
              }
            }
          },
          {
            $project: {
              'product._id': 1,
              'product.product_name': 1,
              'product.discription': 1,
              'product.isListed': 1,
              'product.title': 1,
              'product.productOffer': 1,
              'product.category.category_name': 1,
              'product.category.isListed': 1,
              'product.category.categoryOffer': 1,
              'product.type.type_name': 1,
              'product.type.isListed': 1,
              'product.type.isListed': 1,
              'product.varients':1,
              _id: 1,
              isListed: 1,
              images: 1,
              color: 1,
              actualPrice: 1,
              allColors: 1,
              stock: 1,
              size: 1,
              addedDateTime: 1
            }
          },
          {
            $match: { 'product.isListed': true }
          },
          {
            $match: { isListed: true }
          },
          {
            $match: { 'product.category.isListed': true }
          },
          {
            $match: { 'product.type.isListed': true }
          },
          {
            $match: { 'product.type.type_name': type_name }
          },
          {
            $match: { 'product.title': title }
          },
    
        ]);


        const [relatedProducts] = await Promise.all([relatedProductsPromise])


        // user Name
        if (!req.session.user) {
          return res.render('productDetails', { varient:varient[0] , relatedProducts:relatedProducts})

        }
        const token = req.session.user
        const isTokenValid = jwt.verify(token, process.env.userSecretCode)
        if (!isTokenValid) {
          delete req.session.user
          delete req.session.userName
          return res.render('productDetails', { varient:varient[0] , relatedProducts:relatedProducts })
        }

        const userPromise = User.findById(isTokenValid.id)
        const cartPromise = Cart.findOne({customerId:isTokenValid.id})
        const wishlistPromise = Wishlist.findOne({customerId:isTokenValid.id})

        
        const [user, cart, wishlist] = await Promise.all([userPromise, cartPromise, wishlistPromise])


        if (!user) {
          delete req.session.user
          delete req.session.userName
          return res.render('productDetails', { varient:varient[0] , relatedProducts:relatedProducts })
        }

        if (user.isBlocked) {
          delete req.session.user
          delete req.session.userName
          return res.render('productDetails', { varient:varient[0] , relatedProducts:relatedProducts })
        }

       

        res.render('productDetails', { user: user.name, varient:varient[0] , relatedProducts:relatedProducts ,cart, wishlist})


      } else { //if varient is not listed or null

        const varient = await Varient.findOne({ $and: [{ product: pid }, { isListed: true }] })  //another listed varient of that product
        if (varient) {
          const vId = varient._id
          const pId = pid
          res.redirect(`/product?pId=${pId}&vId=${vId}`)
          return;
        } else {
          res.redirect('/shop')
          return
        }

      }
    // } else {
    //   res.redirect('/shop')
    //   return
    // }

  } catch (err) {
    console.log(err);
    // res.render('500')
    res.redirect('/shop')
  }
}



// get varient data

exports.getVarientData = async (req, res) => {


  try {

    const pId = req.query.pId
    const vId = req.query.vId
    const sId = req.query.sId

    const product = await Product.findOne({ $and: [{ _id: pId }, { isListed: true }] })
    if (product) {

      const varient = await Varient.findOne({ $and: [{ _id: vId }, { isListed: true }] }).populate('size')
      if (varient) {
        const size = varient.size

        const index = size.findIndex(item => String(item._id) === sId);

        const quantity = varient.stock[index]
        const price = varient.price[index]

        return res.status(200).json({ msg: 'stock', quantity, price });
      } else {
        const varient = await Varient.findOne({ $and: [{ product: pId }, { isListed: true }] })

        if (varient) {
          const pid = pId
          const vid = varient._id
          return res.status(401).json({ msg: 'unlisted', pid, vid });
        } else {
          return res.status(401).json({ msg: 'redirect' });
        }
      }

    } else {
      return res.status(401).json({ msg: 'redirect' });
    }

  } catch (err) {
    console.log(err);
    res.status(500).end()
  }

}

// get varients size data

exports.getVarientSizes = async (req, res) => {
  try {

    const vid = req.query.vId
    const variant = await Varient.findById(vid).populate('size')
    const sizes = variant.size
    res.status(200).json({ sizes })

  } catch (err) {
    console.log(err);
    res.status(500).end()
  }
}

// check stocks available

exports.checkStock = async (req, res) => {
  try {

    const vId = req.query.vId
    const size = req.query.sId
    const quantity = req.query.quantity

    const varient = await Varient.findOne({ _id: vId })
    const sizes = varient.size

    const index = sizes.indexOf(size)
    const stock = varient.stock[index]

    if (quantity > stock) {
      return res.status(401).json({ msg: `We are sorry! Only ${stock} stocks are available`, type: 'error' })
    }

    res.status(200).json({ type: 'success' })

  } catch (err) {
    console.log(err);
    res.status(500).end()
  }
}
