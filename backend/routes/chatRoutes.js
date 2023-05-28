const express = require('express')
const { protect } = require('../middlewares/authMiddlewares')
const { accessChat, fetchChats, createGroupChat, renameChat, addToGroup, removeFromGroup, addAdmin, removeAdmin } = require('../controllers/chatControllers')

const router = express.Router()

router.route('/').post(protect, accessChat)
router.route('/').get(protect, fetchChats)
router.route('/group').post(protect, createGroupChat)
router.route('/rename').put(protect, renameChat)
router.route('/groupremove').put(protect, removeFromGroup)
router.route('/groupadd').put(protect, addToGroup)
router.route('/adminadd').put(protect, addAdmin)
router.route('/adminremove').put(protect, removeAdmin)

module.exports = router