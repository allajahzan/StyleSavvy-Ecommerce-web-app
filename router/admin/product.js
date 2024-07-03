const express = require('express')
const router = express.Router()
const multer = require('multer');

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')

const controller = require('../../controller/admin/product')

router.use(bodyParser.json({ limit: '100mb' }));
router.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/products/uploads/');
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const upload = multer({
  storage: storage,
});

// get listed products page
router.get('/admin/listedProducts', isAuth, controller.getListedProducts)

// get unlisted products page
router.get('/admin/unlistedProducts', isAuth, controller.getUnListedProducts)

// get add products page
router.get('/admin/addProducts', isAuth, controller.getAddProducts)

// get categories
router.get('/admin/categories',isAuthFetch,controller.getCategories)

// add products 
router.post('/admin/addProducts',isAuthFetch,controller.addProducts)

// edit products
router.patch('/admin/editProducts',isAuthFetch,controller.editProducts)

// get products details
router.get('/admin/product/:id',isAuthFetch,controller.getProduct)

// delete products 
router.delete('/admin/deleteProduct',isAuthFetch,controller.deleteProduct)

// get products details page
router.get('/admin/products',isAuth,controller.getProductDetails)

// unlist products 
router.patch('/admin/product/unlist',isAuthFetch,controller.unlistProduct)

// list products 
router.patch('/admin/product/list',isAuthFetch,controller.listProduct)


// ======================= varients ===============================

// add varient 
router.post('/admin/addVarients',isAuthFetch,upload.any(),controller.addVarients)

// edit varient 
router.patch('/admin/editVarients',isAuthFetch,upload.any(),controller.editVarients)

// unlist varient 
router.patch('/admin/varient/unlist',isAuthFetch,controller.unlistVarient)

// List varient 
router.patch('/admin/varient/list',isAuthFetch,controller.listVarient)


// ======================= stocks ===============================

// get varirnts stock details page
router.get('/admin/variant',isAuth,controller.getStockDetails)

// edit stock details
router.patch('/admin/varient/stockUpdate',isAuthFetch,controller.editStockDetails)

// add  new stocks
router.post('/admin/varient/addStock',isAuthFetch,controller.addStock)

module.exports = router

