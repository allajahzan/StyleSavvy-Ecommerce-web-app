const Admin = require('../../model/admin/admin')
const User = require('../../model/user/user')
const Order = require('../../model/user/order')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment');


// get admin  login page

exports.getAdminLoginPage = async(req,res)=>{
    try{

        res.redirect('/admin/signIn')

    }catch(err){
        console.log(err);
        res.render('500Admin')
    }
}

// get admin login page

exports.getLoginPage = async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.render('signIn')
        }

        const token = req.session.admin;
        const isTokenValid = jwt.verify(token, process.env.adminSecretCode)
        if (!isTokenValid) {
            return res.render('signIn')
        }
        const admin = await Admin.findById(isTokenValid.id)
        if (!admin) {
            return res.render('signIn')
        }
        res.redirect('/admin/dashboard')
    }
    catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// admin login

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(401).json({ msg: 'Invalid Email', type: 'email' })
        }

        const isValidPassword = await bcrypt.compare(password, admin.password)
        if (!isValidPassword) {
            return res.status(401).json({ msg: 'Incorrect Password', type: 'password' })
        }

        const token = jwt.sign({ id: admin._id }, process.env.adminSecretCode)

        req.session.admin = token;
        req.session.adminName = admin.name
        res.status(201).json({ msg: 'success' ,type:'success'})
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// get dashboard page

exports.getDashBoard = async (req, res) => {
    try {
        const admin = req.session.adminName
        const usersNo = await User.find().count()


        const report = req.query.report

        let result;
        let type;
        let products;
        let categories;

        if (report !== undefined) {
            if (report === 'Weekly') {

                const endOfDay = moment().endOf('day').toDate();
                const startOfLastWeek = moment().subtract(6, 'days').startOf('day').toDate();


                const lastSevenDays = [];
                for (let i = 0; i < 7; i++) {
                    lastSevenDays.push(moment(startOfLastWeek).add(i, 'days').format('YYYY-MM-DD'));
                }

                let orders
                const categryPromise = getTopCategory()
                const productsPromise = getTopProducts()
                const ordersPromise = Order.aggregate([
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: startOfLastWeek,
                                $lte: endOfDay
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            orderedItems: {
                                $filter: {
                                    input: '$orderedItems',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$item.deliveredDate', startOfLastWeek] },
                                            { $lte: ['$$item.deliveredDate', endOfDay] }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    { $unwind: '$orderedItems' },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderedItems.deliveredDate' } },
                            deliveredItemCount: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { '_id': 1 }
                    }
                ]);

                [products, orders,categories] = await Promise.all([productsPromise, ordersPromise,categryPromise])

                const ordersMap = orders.reduce((acc, order) => {
                    acc[order._id] = order.deliveredItemCount;
                    return acc;
                }, {});

                result = lastSevenDays.map(date => ({
                    _id: date,
                    deliveredItemCount: ordersMap[date] || 0
                }));

                type = 'Weekly'

            } else {


                const today = new Date();
                const sevenYearsAgo = new Date(today);
                sevenYearsAgo.setFullYear(today.getFullYear() - 2);

                const yearDateRanges = [];

                for (let yearOffset = 0; yearOffset <= 2; yearOffset++) {
                    const year = today.getFullYear() - yearOffset;
                    const startOfYear = new Date(year, 0, 1);
                    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
                    yearDateRanges.push({ start: startOfYear, end: endOfYear });
                }

                // console.log(yearDateRanges);

                let ordersByYear;
                const categryPromise = getTopCategory()
                const productsPromise = getTopProducts()
                const ordersByYearPromise = Order.aggregate([
                    {
                        $unwind: '$orderedItems'
                    },
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: sevenYearsAgo,
                                $lte: today
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$orderedItems.deliveredDate' }
                            },
                            totalOrderedCount: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { '_id.year': 1 }
                    }
                ]);


                [products, ordersByYear,categories] = await Promise.all([productsPromise, ordersByYearPromise,categryPromise])

                const yearlyOrderCounts = [];

                // Initialize yearlyOrderCounts with zeros for each year in the range
                for (let yearOffset = 0; yearOffset <= 7; yearOffset++) {
                    const year = today.getFullYear() - yearOffset;
                    yearlyOrderCounts.push({ _id: year, deliveredItemCount: 0 });
                }

                // Update yearlyOrderCounts with actual data from aggregation result
                ordersByYear.forEach(result => {
                    const year = result._id._id;
                    const index = yearlyOrderCounts.findIndex(item => item.year === year);
                    if (index !== -1) {
                        yearlyOrderCounts[index].deliveredItemCount = result.totalOrderedCount;
                    }
                });

                result = yearlyOrderCounts.reverse()

                type = 'Yearly'
            }
        } else {

            const endOfDay = moment().endOf('day').toDate();
            const startOfLastWeek = moment().subtract(6, 'days').startOf('day').toDate();


            const lastSevenDays = [];
            for (let i = 0; i < 7; i++) {
                lastSevenDays.push(moment(startOfLastWeek).add(i, 'days').format('YYYY-MM-DD'));
            }

            let orders
            const categryPromise = getTopCategory()
            const productsPromsie = getTopProducts();
            const ordersPromise = Order.aggregate([
                {
                    $match: {
                        'orderedItems.deliveredDate': {
                            $gte: startOfLastWeek,
                            $lte: endOfDay
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        orderedItems: {
                            $filter: {
                                input: '$orderedItems',
                                as: 'item',
                                cond: {
                                    $and: [
                                        { $gte: ['$$item.deliveredDate', startOfLastWeek] },
                                        { $lte: ['$$item.deliveredDate', endOfDay] }
                                    ]
                                }
                            }
                        }
                    }
                },
                { $unwind: '$orderedItems' },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderedItems.deliveredDate' } },
                        deliveredItemCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id': 1 }
                }
            ]);

            [products, orders, categories] = await Promise.all([productsPromsie, ordersPromise, categryPromise])

            const ordersMap = orders.reduce((acc, order) => {
                acc[order._id] = order.deliveredItemCount;
                return acc;
            }, {});

            result = lastSevenDays.map(date => ({
                _id: date,
                deliveredItemCount: ordersMap[date] || 0
            }));

            type = 'Weekly'
        }


        // console.log(products);

        res.render('dashboard', { admin: admin, usersNo: usersNo, orders: result, type, products ,categories})
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}


// get top 10 products

async function getTopProducts() {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: '$orderedItems' },
            {
                $group: {
                    _id: '$orderedItems.product_name',
                    count: { $sum: 1 },
                    image: { $first: '$orderedItems.image' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return topProducts;
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}

// get top 10 category

async function getTopCategory() {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: '$orderedItems' },
            {
                $group: {
                    _id: '$orderedItems.category',
                    count: { $sum: 1 },
                    image: { $first: '$orderedItems.image' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return topProducts;
    } catch (err) {
        console.log(err);
        res.status(500).end()
    }
}


// admin logout

exports.logout = async (req, res) => {

    try {

        delete req.session.adminName
        delete req.session.admin
        res.redirect('/admin/signIn')

    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }


}