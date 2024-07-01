const express = require('express')
const router = express.Router()

const isAuth = require('../../middlewears/admin/auth')
const isAuthFetch = require('../../middlewears/admin/authFetch')
const controller = require('../../controller/admin/user')

// get active users page
router.get('/admin/activeUsers', isAuth, controller.getActiveUsers)

// get blocked users page
router.get('/admin/blockedUsers', isAuth, controller.getBlockedUsers)

// block users
router.patch('/admin/user/block', isAuthFetch, controller.blockUser)

// unblock users
router.patch('/admin/user/unblock', isAuthFetch, controller.unblockUser)

module.exports = router