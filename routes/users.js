var express = require('express');
// const { response, resource } = require('../app');
var router = express.Router();
// const userHelpers = require('../helpers/user-helpers');
// const productHelpers = require('../helpers/userdetails-helpers');
const otp = require('../helpers/OTPhelpers');
const cartHelpers = require('../helpers/cart-helpers')
// const { use } = require('./admin');
const collection = require('../config/collections')
const db = require('../config/connection');

const { CATEGORY_COLLECTION, USER_COLLECTION } = require('../config/collections');
// const userdetailsHelpers = require('../helpers/userdetails-helpers');
// const orderHelpers = require('../helpers/order-helpers')
const { ObjectId } = require('mongodb');
// const client = require("twilio")(otp.accoundSid, otp.authToken);
// const fs = require('fs')
// const pdf = require('pdf-creator-node')
// const path = require('path')
// var easyinvoice = require('easyinvoice');
const userController = require('../controllers/userController')
// const { resolve } = require('path');


//----------------------------------HOME PAGE ROUTE START --------------------------------
const verifyLogin= (req, res, next) => {
  if (req.session.loggedIn) {
      next();
  }
  else {
      res.redirect('/login')
  }
}



router.get('/', userController.landingPage)

router.get('/signup', userController.signup);

router.get('/OTPlogin', userController.otpPage);

router.get('/home', userController.homePage)

router.post('/signup', userController.signUP)

//----------------------------------HOME PAGE ROUTE END --------------------------------

//---------------------LOGIN PAGE ROUTING START HERE-----------------------


router.get('/login', userController.loginpage)

router.post('/login', userController.loginPage)

router.get('/logout', userController.logout)







//---------------------LOGIN PAGE ROUTING ENDS HERE-----------------------

//---------------------------------PRODUCT VIEW START-------------------------------------


router.get('/Product-View', userController.productView)

router.get('/singleProduct-View', userController.singleProductView)






//---------------------------------PRODUCT VIEW END-----------------------------------------


//---------------------------------CART SECTION START-----------------------------------------



router.get('/add-to-cart/:id',verifyLogin, userController.addToCart)



router.get('/view-cart',verifyLogin, userController.viewCart)


router.post('/change-product-quantity',verifyLogin, userController.changeProductQuantity)

router.get('/delete-cart-product',verifyLogin, userController.deleteCartProduct)


router.get('/empty-cart', async (req, res) => {
  let id = req.query.id
  let user = req.session.user._id
  console.log(id);
  cartHelpers.deleteProduct(id, user)
})

//---------------------------------CART SECTION END-----------------------------------------


//--------------------------------CHECKOUT START-----------------------------------------

router.get('/place-order',verifyLogin, userController.placeorder)


router.post('/place-order',verifyLogin, userController.placeOrder)




router.post('/verify-payment',verifyLogin, userController.verifyPayment)


//--------------------------------CHECKOUT END---------------------------------------

//---------------------------------ORDERS START-------------------------------------------




router.get('/order-success', userController.orderSuccess)




router.get('/cancel-order', async (req, res) => {
  let id = req.query.id
  console.log(id);
  cartHelpers.deleteOrder(id).then((response) => {
    res.redirect('/orders')
  })
})

router.get('/cancel-payment',userController.cancelPayment)



//---------------------------------ORDERS END-------------------------------------------


//-------------------------------OTP LOGIN SECTION START-----------------------------------------

router.get('/otp_page', (req, res) => {
  console.log('hii');
  res.render("users/userMobile");
})


// router.get('/otp_verify', userController.otpVerify),




//   router.get('/otp_login', userController.otpLogin),



  //-------------------------------OTP LOGIN SECTION END-----------------------------------------


  //-------------------------------USER ACCOUNT DASHBOARD START--------------------------------------
  router.get('/account',verifyLogin, userController.accountHome)


router.get('/orders',verifyLogin, userController.ordersHome)

router.get('/view-order-details',verifyLogin, userController.orderDetail)

router.get('/address',verifyLogin, userController.addressList)


router.post('/add-address',verifyLogin, userController.addressAdd)

router.get('/delete-address',verifyLogin, userController.addressDelete)

router.post('/cancel-order-product', async (req, res) => {
  res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
  );
  let ordId = req.body.oId
  let proId = req.body.pId
  cartHelpers.deleteOrderProduct(proId, ordId).then((response) => {
    res.redirect('/view-order-details')
  })

})

router.get('/update-profile',verifyLogin, userController.profileupdate)

router.post('/update-user-profile',verifyLogin, userController.updateProfile)

router.get('/edit-address',verifyLogin, userController.addressEdit)


router.post('/update-user-address',verifyLogin, userController.addressUpdate)

router.post('/cancel-order',verifyLogin, userController.orderCancel)

router.post('/return-product',verifyLogin,userController.returnProduct)


//-------------------------------USER ACCOUNT DASHBOARD END-----------------------------------------

//-------------------------------------wishlist-------------------------------------------



router.get('/add-to-wishlist/:id',verifyLogin, userController.addToWishList)

router.get('/wishlist',verifyLogin, userController.getWishListProducts)

router.get('/removeFrom-Wish',verifyLogin,userController.removeProductWishlist)

router.post('/applyCoupon',verifyLogin,userController.couponApply)



module.exports = router;