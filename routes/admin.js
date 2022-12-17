var express = require('express');
// const { response, request } = require('../app');
var router = express.Router();
// const homeHelpers = require('../helpers/user-helpers')
// const userHelpers = require('../helpers/userdetails-helpers');
const collection = require('../config/collections')
const db = require('../config/connection')
const cartHelpers = require('../helpers/cart-helpers')
// const productHelpers = require('../helpers/product-helpers')
// const orderHelpers = require('../helpers/order-helpers')
// const fileUpload = require('express-fileupload')
// const multer = require('multer')
// const ObjectId = require('mongodb').ObjectId
// const path=require('path');
// const userdetailsHelpers = require('../helpers/userdetails-helpers')
const adminController = require('../controllers/adminController')
// const { JobInstance } = require('twilio/lib/rest/bulkexports/v1/export/job');
// const { loadavg } = require('os');
// const { log } = require('console');


//-----------------------------------ADMIN SECTION START----------------------------------------

const emailid = "admin@gmail.com";
const passwordId = "12345"

const verifyLogin= (req, res, next) => {
  if (req.session.loggedIn) {
      next();
  }
  else {
      res.redirect('/admin')
  }
}

router.get('/', adminController.admin);



router.get('/admin-dashboard', adminController.dashboard)



router.post('/adminpage', adminController.adminPage)


router.get('/admin-dashboard', async (req, res) => {
  let bannerdetails = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
  
  if (req.session.admin) {
    res.redirect('/admin/admin-dashboard')
  } else {
    res.redirect('/admin')
  }

})




router.get('/adminLogout', adminController.logout)


//--------------------------------ADMIN SECTION END----------------------------------------

//------------------------------PRODUCT SECTION START----------------------------------------

router.get('/add-Category', adminController.addcategory);



router.get('/view-Products', adminController.viewProducts);

router.get('/add-Product',adminController.addproduct);


router.post('/add-Product',adminController.addProduct)


router.get('/view-AllCategories', adminController.viewCategories);

router.post('/add-Category', adminController.addCategory)


router.get('/editCategory', adminController.editcategory)

router.post('/editin-Category/:id', adminController.editCategory)

router.get('/editProduct', adminController.editproduct)


router.post('/editin-Product',adminController.editProduct)


router.get('/deleteCategory/:id', adminController.deleteCategory)

router.get('/deleteProduct/:id', adminController.deleteProduct)

//------------------------------PRODUCT SECTION END----------------------------------------



//-------------------------------USER HANDLING-----------------------------------------


router.get('/view-Users', adminController.viewUsers);


router.get('/block/:id', adminController.blockUser)

//-------------------------------USER HANDLING END-----------------------------------------


//-------------------------------ORDER HANDLING START-----------------------------------------

router.get('/view-orders', adminController.viewOrders)

router.get('/userOrder', adminController.viewOrderDetail)


router.get('/cancel-order', async (req, res) => {
  let id = req.query.id
  cartHelpers.deleteOrder(id).then((response) => {
    res.redirect('/admin/view-orders')
  })
})

router.post('/change-status',adminController.changeOrderStatus)


//-------------------------------ORDER HANDLING END-----------------------------------------




//--------------------------------BANNER START----------------------------------------------

router.get('/banners',adminController.viewBanner)


router.get('/banner-add',adminController.addbanner)

router.post('/add-Banner', adminController.addBanner)

router.get('/deleteBanner', adminController.deleteBanner)

router.get('/editBanner', adminController.editbanner)
//--------------------------------BANNER end----------------------------------------------

//--------------------------------SALES Report-----------------------------------------

router.get('/get-Report',adminController.salesReport)


router.post('/sales-rep-mon',adminController.monthlySalesReport)

router.post('/sales-rep-daily',adminController.dailySalesReport)




//--------------------------------SALES Report-----------------------------------------

router.get('/test',adminController.chart1)

router.get('/test1',adminController.chart2)

router.get('/test2',adminController.chart3)

router.get('/test3',adminController.chart4 )

//-------------------------------coupon-----------------------------------------


//----------------------------------------------------------------- --/
 /*                SHOW COUPONS PAGE                                   */
//-------------------------------------------------------------------/

router.get('/view-coupon',adminController.viewCoupons)



//----------------------------------------------------------------- --/
 /*                SHOW ADD COUPONS PAGE                              */
//-------------------------------------------------------------------/


router.get('/add-coupon',adminController.addcoupon)

 //----------------------------------------------------------------- --/
 /*                ADD COUPONS IN                                      */
 //-------------------------------------------------------------------/


 router.post('/add-coupon',adminController.addCoupon)


//-------------------------------coupon-----------------------------------------


//------------------------------------offer------------------------------

router.get('/viewOffer',adminController.viewOffer)

router.post('/admin-addCategoryOffer',adminController.addCategoryOffer)

//------------------------------------offer------------------------------


module.exports = router;
