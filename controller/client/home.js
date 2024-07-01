const Product = require('../../model/admin/product')
const Varient = require('../../model/admin/varient')
const Type = require('../../model/admin/types')
const User = require('../../model/user/user')
const Cart = require('../../model/user/cart')
const Wishlist = require('../../model/user/wishlist')
const Order = require('../../model/user/order')
const jwt = require('jsonwebtoken')

// get page load

exports.pageLoad = async (req, res) => {
  try {
    res.redirect('/home')
  } catch (err) {
    console.log(err);
    res.render('500')
  }
}

// get home page

exports.getHomePage = async (req, res) => {
  try {

    // delete cart session
    delete req.session.cart

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
        $skip: 0
      },
      {
        $limit: 8
      },

    ]);

    // const categoriesPromise = Type.find({ isListed: true })

    const topVarientsPromise = getTopVariants()


    const [varients, topVarients] = await Promise.all([varientsPromise, topVarientsPromise])

    if (!req.session.user) {
      return res.render('home', { varients, topVarients})
    }

    const token = req.session.user;
    const isTokenValid = jwt.verify(token, process.env.userSecretCode)
    if (!isTokenValid) {
      delete req.session.user
      delete req.session.userName
      return res.render('home',{ varients, topVarients})
    }
    const user = await User.findById(isTokenValid.id)
    if (!user) {
      delete req.session.user
      delete req.session.userName
      return res.render('home',{ varients, topVarients})
    }

    if (user.isBlocked) {
      delete req.session.user
      delete req.session.userName
      return res.render('home',{ varients, topVarients})
    }

    const cartPromise = Cart.findOne({customerId: isTokenValid.id})
    const wishlistPromise = Wishlist.findOne({customerId: isTokenValid.id})

    const [cart, wishlist] = await Promise.all([cartPromise,wishlistPromise])

    let cartCount = 0;
    let wishlistCount = 0;
    if(cart){
      cartCount = cart.items.length
    }

    if(wishlist){
      wishlistCount = wishlist.items.length
    }



    res.render('home', { user, varients, topVarients,cartCount,wishlistCount})
  } catch (err) {
    console.log(err);
    res.render('500')
  }
}

// get top varients

async function getTopVariants() {
  try {
      
      const topVariants = await Order.aggregate([
          { $unwind: '$orderedItems' },
          {
              $group: {
                  _id: '$orderedItems.product_name',
                  count: { $sum: 1 },
                  varientId: { $first: '$orderedItems.varientId' } 
              }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
      ]);

      const topVariantIds = topVariants.map(variant => variant.varientId);

    
      const varientsPromise = Varient.aggregate([
          {
              $match: { 
                  _id: { $in: topVariantIds },
                  isListed: true 
              }
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
              $limit: 12
          }
      ]);

      return varientsPromise;
  } catch (err) {
      console.log(err);
      res.render('505')
  }
}


// get perticular varient of a perticular product with color

exports.getVarientWithColor = async (req, res) => {

  try {
    const pId = req.query.pId
    const cId = req.query.cId
    const varient = await Varient.findOne({ $and: [{ product: pId }, { color: cId }, { isListed: true }] }).populate('color')
    res.status(200).json({ varient: varient })

  } catch (err) {
    console.log(err);
    res.status(500).end()
  }
}

