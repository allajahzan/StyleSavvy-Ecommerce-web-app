const Order = require('../../model/user/order'); // Adjust the path as needed


// get sale report page
exports.getSalesReportPage = async (req, res) => {
    try {
        const filter = req.query?.report;
        const { startDate, endDate } = req.query;

        let admin;
        let orders;
        let filterType;
        let type;
        let date

        if (filter === undefined && (startDate === undefined || endDate === undefined)) {
            orders = await Order.find({});
            filterType = 'All sales report'
            type = 'all'
        } else if (filter !== undefined && (startDate === undefined && endDate === undefined)) {
            const currentDate = new Date();

            if (filter === 'daily') {
                filterType = 'Daily sales report'
                type = 'daily'
                const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
                const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

                orders = await Order.aggregate([
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: startOfDay,
                                $lte: endOfDay
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId:1,
                            paymentMethod:1,
                            otherFields: 1,  // Replace with other fields you want to keep from the order document
                            orderedItems: {
                                $filter: {
                                    input: '$orderedItems',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$item.deliveredDate', startOfDay] },
                                            { $lte: ['$$item.deliveredDate', endOfDay] }
                                        ]
                                    }
                                }
                            },
                            address:1,
                        }
                    }
                ]);

            } else if (filter === 'weekly') {
                filterType = 'Weekly sales report'
                type = 'weekly'
                const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - 7));
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date();
                endOfWeek.setHours(23, 59, 59, 999);

                orders = await Order.aggregate([
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: startOfWeek,
                                $lte: endOfWeek
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId:1,
                            paymentMethod:1,
                            otherFields: 1,  // Replace with other fields you want to keep from the order document
                            orderedItems: {
                                $filter: {
                                    input: '$orderedItems',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$item.deliveredDate', startOfWeek] },
                                            { $lte: ['$$item.deliveredDate', endOfWeek] }
                                        ]
                                    }
                                }
                            },
                            address:1,
                        }
                    }
                ]);

            } else if (filter === 'yearly') {
                filterType = 'Yearly sales report'
                type = 'yearly'
                const today = new Date();
                const lastYear = new Date(today);
                lastYear.setFullYear(today.getFullYear() - 1);

                const startDateYear = lastYear;
                const endDate = today;

                orders = await Order.aggregate([
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: startDateYear,
                                $lte: endDate
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId:1,

                            paymentMethod:1,
                            otherFields: 1,  // Replace with other fields you want to keep from the order document
                            orderedItems: {
                                $filter: {
                                    input: '$orderedItems',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$item.deliveredDate', startDateYear] },
                                            { $lte: ['$$item.deliveredDate', endDate] }
                                        ]
                                    }
                                }
                            },
                            address:1,
                        }
                    }
                ]);

            } else if (filter === 'monthly') {
                filterType = 'Monthly sales report';
                type = 'monthly';
                const startOfLast30Days = new Date(currentDate.setDate(currentDate.getDate() - 30));
                startOfLast30Days.setHours(0, 0, 0, 0);
                const endOfToday = new Date();
                endOfToday.setHours(23, 59, 59, 999);

                orders = await Order.aggregate([
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: startOfLast30Days,
                                $lte: endOfToday
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId:1,
                            paymentMethod:1,
                            otherFields: 1,  // Replace with other fields you want to keep from the order document
                            orderedItems: {
                                $filter: {
                                    input: '$orderedItems',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$item.deliveredDate', startOfLast30Days] },
                                            { $lte: ['$$item.deliveredDate', endOfToday] }
                                        ]
                                    }
                                }
                            },
                            address:1,
                        }
                    }
                ]);

            } else {
                // Add other filters as needed
                filterType = 'All sales report'
                type = 'all'
                orders = await Order.find({});
            }
        } else if (startDate !== undefined || endDate !== undefined) {
            if (startDate !== undefined && endDate === undefined) {

                filterType = `Sales report on ${startDate}`;
                type = 'all';
                date = `${startDate}`

                const startOfDay = new Date(startDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(startDate);
                endOfDay.setHours(23, 59, 59, 999);

                orders = await Order.aggregate([
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: startOfDay,
                                $lte: endOfDay
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId:1,
                            paymentMethod:1,
                            otherFields: 1,  // Replace with other fields you want to keep from the order document
                            orderedItems: {
                                $filter: {
                                    input: '$orderedItems',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$item.deliveredDate', startOfDay] },
                                            { $lte: ['$$item.deliveredDate', endOfDay] }
                                        ]
                                    }
                                }
                            },
                            address:1,
                        }
                    }
                ]);


            } else if (startDate !== undefined && endDate !== undefined) {

                filterType = `Sales report from ${startDate} to ${endDate}`;
                type = 'all';
                date = `${startDate} to ${endDate}`

                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                orders = await Order.aggregate([
                    {
                        $match: {
                            'orderedItems.deliveredDate': {
                                $gte: start,
                                $lte: end
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId:1,
                            paymentMethod:1,
                            otherFields: 1,  // Replace with other fields you want to keep from the order document
                            orderedItems: {
                                $filter: {
                                    input: '$orderedItems',
                                    as: 'item',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$item.deliveredDate', start] },
                                            { $lte: ['$$item.deliveredDate', end] }
                                        ]
                                    }
                                }
                            },
                            address:1,
                        }
                    }
                ]);

            } else {
                // Add other filters as needed
                filterType = 'All sales report'
                type = 'all'
                orders = await Order.find({});
            }
        } else {
            // Add other filters as needed
            filterType = 'All sales report'
            type = 'all'
            orders = await Order.find({});
        }


        admin = req.session.adminName;
        return res.render('salesReport', { admin, orders, filterType, type, date });
    } catch (err) {
        console.log(err);
        res.render('500Admin')
    }
};
