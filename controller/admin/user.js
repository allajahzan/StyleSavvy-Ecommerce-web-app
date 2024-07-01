
const User = require('../../model/user/user')
const jwt = require('jsonwebtoken')

// get active user data

exports.getActiveUsers = async (req, res) => {
    try {
        const admin = req.session.adminName
        const users = await User.find({ isBlocked: false })
        res.render('activeUsers', { admin: admin, users: users })
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// get blokced user data

exports.getBlockedUsers = async (req, res) => {
    try {
        const admin = req.session.adminName
        const users = await User.find({ isBlocked: true })
        res.render('blockedUsers', { admin: admin, users: users })
    } catch (error) {
        console.log(error);
        res.render('500Admin')
    }
}

// block users

exports.blockUser = async (req, res) => {

    try {
        const id = req.body.id
        const user = await User.findById(id)
        user.isBlocked = true
        await user.save()

        res.status(200).json({ msg: 'Successfully Blocked', type: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}

// unblock users

exports.unblockUser = async (req, res) => {

    try {
        const id = req.body.id
        const user = await User.findById(id)
        user.isBlocked = false
        await user.save()

        res.status(200).json({ msg: 'Successfully Unblocked', type: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).end()
    }
}
