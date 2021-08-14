const express = require('express')
const userRouter = require('../Controllers/userController')
const authController = require('../Controllers/authController')
const router = express.Router()
const fs = require('fs')
const userController = require('../Controllers/userController')

const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));

router.post('/signup',authController.signup)
router.get('/login',authController.login)

router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:id',authController.resetPassword)
router.patch('/updatePassword',authController.protect,authController.updatePassword)
router.patch('/updateMe',authController.protect,userController.updateMe)
router.delete('/deleteMe',authController.protect,userController.deleteMe)

router.route('/').get(userRouter.getAllUsers).post(userRouter.createUser)
router.route('/:id').get(userRouter.getUser).patch(userRouter.updateUser).delete(userRouter.deleteUser)

module.exports = router