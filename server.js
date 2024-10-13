const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const nocache = require('nocache')
const morgan = require('morgan')


// env file
require('dotenv').config()

// admin side routes
const admin_route = require('./router/admin/admin')
const admin_user_route = require('./router/admin/user')
const admin_type_route = require('./router/admin/type')
const admin_category_route = require('./router/admin/category')
const admin_size_route = require('./router/admin/size')
const admin_product_route = require('./router/admin/product')
const admin_color_route = require('./router/admin/color')
const admin_order_route = require('./router/admin/order')
const admin_salesReport_route = require('./router/admin/salesReport')
const admin_coupon_route = require('./router/admin/coupon')
const admin_offer_route = require('./router/admin/offer')
const _500_admin_page = require('./router/page/500Admin')

// user side roues
const user_route = require('./router/client/user')
const user_home_route = require('./router/client/home')
const user_products_route = require('./router/client/product') 
const user_cart_route = require('./router/client/cart')
const user_profile_route = require('./router/client/profile')
const user_checout_route = require('./router/client/checkout')
const user_order_route = require('./router/client/order')
const user_wishlist_route = require('./router/client/wishlist')
const user_wallet_route = require('./router/client/wallet')
const user_coupon_route = require('./router/client/coupon')
const _505_page = require('./router/page/500')
const user_contact_route = require('./router/client/contact')

// setting
app.set('view engine', 'ejs')

// set view folder for admin and user
app.set('views',[
    path.join(__dirname, 'views/client/user'),
    path.join(__dirname, 'views/client/home'),
    path.join(__dirname, 'views/client/product'),
    path.join(__dirname, 'views/client/profile'),
    path.join(__dirname, 'views/client/cart'),
    path.join(__dirname, 'views/client/checkout'),
    path.join(__dirname, 'views/client/checkout'),
    path.join(__dirname, 'views/client/order'),
    path.join(__dirname, 'views/client/pages'),
    path.join(__dirname, 'views/client/contact'),
    path.join(__dirname, 'views/admin/admin'),
    path.join(__dirname, 'views/admin/user'),
    path.join(__dirname, 'views/admin/type'),
    path.join(__dirname, 'views/admin/category'),
    path.join(__dirname, 'views/admin/size'),
    path.join(__dirname, 'views/admin/colour'),
    path.join(__dirname, 'views/admin/product'), 
    path.join(__dirname, 'views/admin/order'), 
    path.join(__dirname, 'views/admin/salesReport'), 
    path.join(__dirname, 'views/admin/coupon'), 
    path.join(__dirname, 'views/admin/offer'), 
    path.join(__dirname, 'views/admin/pages'), 
])



// mongoDB coonection
const url = process.env.mongoDB_url
mongoose.connect(url)
    .then(() => console.log("connected with mongoDB"))
    .catch((err) => { 
        console.log(err)
        process.exit(1);
    })


// middle wears
app.use(session({
    secret: process.env.sessionSecreCode,
    resave: false,
    saveUninitialized: true
}));

app.use(nocache())
app.use(express.static('public'))
app.use(express.json())
app.use(morgan('dev'))

// ===================== Admin side routes ==========================
// admin 
app.use('/', admin_route)

// users
app.use('/', admin_user_route)

// types
app.use('/', admin_type_route)

// category
app.use('/', admin_category_route)

// ṣize
app.use('/', admin_size_route)

// product
app.use('/', admin_product_route)

// color
app.use('/',admin_color_route)

// orders
app.use('/', admin_order_route)

// sales report

app.use('/',admin_salesReport_route)

// coupon
app.use('/',admin_coupon_route)

// offer
app.use('/', admin_offer_route)

// 500 page
app.use('/',_500_admin_page)

// ======================= User side routes ==========================

// home

app.use('/',user_home_route)

// product
app.use('/', user_route,user_products_route)

// cart
app.use('/', user_cart_route)

// profile
app.use('/', user_profile_route)

// checkout
app.use('/', user_checout_route)

// order
app.use('/', user_order_route)

// google
app.use('/user/google', user_home_route)

// wishlist
app.use('/', user_wishlist_route)

// wallet 
app.use('/', user_wallet_route)

// coupon
app.use('/', user_coupon_route)

// 505 page
app.use('/', _505_page)

// error pages 

app.use('/', user_contact_route)

app.use('/admin/*', (req, res) => {
    res.status(404).render('404Admin');
})

app.use('*', (req, res) => {
    res.status(404).render('404');
})

// Example error handling middleware
app.use((err, req, res, next) => {
    console.log(err);
    res.render('500');
});


app.listen(process.env.PORT, () => {
    console.log("Server is running on port 3000");
})

module.exports = app