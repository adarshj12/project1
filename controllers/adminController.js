var express = require('express');
// const { response } = require('../app');
var router = express.Router();
const userHelpers = require('../helpers/userdetails-helpers');
const collection = require('../config/collections')
const db = require('../config/connection')
const cartHelpers = require('../helpers/cart-helpers')
const productHelpers = require('../helpers/product-helpers')
const orderHelpers = require('../helpers/order-helpers')
const fileUpload = require('express-fileupload');
const userdetailsHelpers = require('../helpers/userdetails-helpers');
const ObjectId = require('mongodb').ObjectId

const emailid = "admin@gmail.com";
const passwordId = "12345"

module.exports = {
    admin: function (req, res, next) {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1");
        let admin1 = req.session.admin
        if (admin1) {
            res.redirect('/admin/admin-dashboard')
        }
        else {
            console.log(admin1);
            res.render('admin/adminLogin', { layout: false })
            req.session.adminLoginError = false
        }

    },
    adminPage: (req, res) => {

        const adminData = { email, password } = req.body;
        if (emailid === email && passwordId === password) {

            req.session.admin = adminData
            req.session.adminLoggedIn = true
            res.redirect('/admin/admin-dashboard')
        } else {
            req.session.adminLoginError = "invalid admin id or password"
            console.log("error")
            res.redirect('/admin');

        }

    },
    dashboard: async (req, res) => {
        let adminId = req.session.admin
        // console.log(adminId)
        if (adminId) {
            res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");

            let userDetail = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()

            let rev = await orderHelpers.totalRevenue()
            let pro = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            let cat = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            let date = new Date()
            let Year = date.getFullYear()
            let Month = date.getMonth()
            let mon = Year + '-' + Month
            console.log(mon);
            let mG = await orderHelpers.getCurrentMonthSalesReport(mon)
            let revMon = mG[0].totalAmount
            console.log(mG, mG[0].totalAmount);

            res.render('admin/adminHome', { layout: 'adminLayout', userDetail, rev, pro, cat, revMon, Month })

        } else {
            console.log("error")
            res.redirect('/admin')
        }


    },
    logout: function (req, res) {
        console.log('working of admin logout');
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        req.session.admin = false
        req.session.LoggedIn = false
        res.redirect('/admin')
    },
    viewCategories: (req, res, next) => {
        return new Promise(async (resolve, reject) => {
            let categorydetails = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            //console.log(categorydetails);
            res.render('admin/categoryView', { categorydetails, layout: 'adminLayout' });

        })
    },
    addcategory: function (req, res, next) {
        res.render('admin/addCategory', { layout: 'adminLayout' });
    },
    addCategory: (req, res) => {
        console.log(req.body,req.files);
        productHelpers.addCategory(req.body).then((id) => {
            let name = id;
            req.files?.image?.mv("./public/images/" + name + ".jpg")
            res.redirect('/admin/view-AllCategories')
        })
    },
    editcategory: async (req, res) => {
        const id = req.query.id;
        let category = await userHelpers.getCategoryDetails(id)
        res.render('admin/editCategory', { layout: 'adminLayout', category });
    },
    editCategory: (req, res) => {
        const id = req.params.id;
        console.log(req.files);
        userHelpers.updateCategory(id, req.body).then((response) => {
  
            req.files?.image?.mv("./public/images/" + id + ".jpg", (err, done) => {
                if (!err) {
                    console.log("product updated");
                } else {
                    console.log(err);
                }
            }
            );
            res.redirect('/admin/view-AllCategories')
        })

    },
    deleteCategory: (req, res) => {
        let categoryId = req.params.id
        console.log(categoryId);
        userHelpers.deleteCategory(categoryId).then((response) => {
            console.log(response);
            res.redirect('/admin/view-AllCategories')
        })
    },
    viewProducts: (req, res, next) => {
        return new Promise(async (resolve, reject) => {
            let productdetails = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            //console.log(productdetails);
            res.render('admin/viewProducts', { productdetails, layout: 'adminLayout' });

        })
    },
    addproduct: function (req, res, next) {
        userHelpers.getAllCategories().then((category) => {
            res.render('admin/addProducts', { layout: 'adminLayout', category });
        })

    },
    addProduct: (req, res) => {
        productHelpers.addProduct(req.body).then((insertedId) => {
            let name = insertedId;
            req.files?.image?.forEach((element, index) => {
                element.mv("./public/productImages/" + name + index + ".jpg",
                    (err, done) => {
                        if (!err) {
                            console.log("product add");
                        } else {
                            console.log(err);
                        }
                    }
                );
            });
            res.redirect("/admin/view-Products");
        })
            .catch((err) => console.log(err));
    },
    editproduct: async (req, res) => {
        const id = req.query.id;
        let product = await userHelpers.getProductDetails(id)
        let category = await userHelpers.getAllCategories()
        // console.log(category);
        res.render('admin/editProduct', { layout: 'adminLayout', product, category });
    },
    editProduct: (req, res) => {
        const id = req.query.id;
        let body = req.body;
        userHelpers.updateProduct(id, body).then(() => {
            req.files?.image1?.mv("./public/productImages/" + id + "0.jpg"),
                req.files?.image2?.mv("./public/productImages/" + id + "1.jpg"),
                req.files?.image3?.mv("./public/productImages/" + id + "2.jpg"),
                req.files?.image4?.mv("./public/productImages/" + id + "3.jpg"),
                req.files?.image5?.mv("./public/productImages/" + id + "4.jpg"),
                res.redirect("/admin/view-Products");
        }).catch((err) => console.log(err));
    },
    deleteProduct: (req, res) => {
        let productId = req.params.id
        console.log(productId);
        userHelpers.deleteProduct(productId).then((response) => {
            console.log(response);
            res.redirect('/admin/view-Products')
        })
    },
    viewUsers: (req, res, next) => {
        return new Promise(async (resolve, reject) => {
            let usersdetails = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            //console.log(usersdetails);
            res.render('admin/viewUsers', { usersdetails, layout: 'adminLayout' });

        })
    },
    blockUser: async (req, res) => {
        console.log("block user");
        let userId = req.params.id;
        let user = await db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: ObjectId(userId) },
            [
                {
                    $set:
                    {
                        isBlocked: { $not: "$isBlocked" }
                    }
                },
            ]
        ).then((result) => {
            console.log(result);
            res.redirect("/admin/view-Users");
        });
    },
    viewOrders: async (req, res) => {
        const pageNum = req.query.page
        const perPage = 10
        let userDetails = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        // console.log(userDetails);
        // .skip((pageNum-1)+perPage).limit(perPage).
        res.render('admin/viewUserOrders', { layout: 'adminLayout', userDetails })
    },
    viewOrderDetail: async (req, res) => {
        let id = req.query.id
        let userDetail = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: ObjectId(id) }).toArray()
        // console.log(userDetail);
        let products = await cartHelpers.getOrderProducts(id)
        // console.log(products);
        res.render('admin/userOrderDetail', { layout: 'adminLayout', products, userDetail })
    },
    changeOrderStatus: async (req, res) => {
        // console.log(req.body);
        // console.log(req.body.id,req.body.change);
        cartHelpers.changeProductStatus(req.body.id, req.body.change, req.body.oId).then((response) => {
            console.log(response);
            res.redirect('/admin/view-Products')
        })

    },
    cancelOrder: async (req, res) => {
        let id = req.query.id
        cartHelpers.deleteOrder(id).then((response) => {
            res.redirect('/admin/view-orders')
        })
    },
    viewBanner: async (req, res) => {
        let bannerdetails = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
        res.render('admin/banners', { layout: 'adminLayout', bannerdetails })
    },
    addbanner: async (req, res) => {
       let category =  await userdetailsHelpers.getAllCategories()
        res.render('admin/addbanner', { layout: 'adminLayout',category })
    },
    addBanner: (req, res) => {
        console.log(req.body);
        console.log(req.files);
        productHelpers.addBanner(req.body).then((id) => {
            let name = id;
            req.files?.banner?.mv("./public/bannerImages/" + name + ".jpg")
            res.redirect('/admin/banners')
        })

    },
    deleteBanner: (req, res) => {
        let banId = req.query.id
        console.log(banId);
        userHelpers.deleteBanner(banId).then((response) => {
            console.log(response);
            res.redirect('/admin/banners')
        })

    },
    editbanner: async (req, res) => {
        let banId = req.query.id
        console.log(banId);
        let banDet = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
        console.log(banDet);
        res.render('admin/editbanner', { layout: 'adminLayout', banDet })


    },
    salesReport: async (req, res) => {
        res.render('admin/selectReportPeriod', { layout: 'adminLayout' })
    },
    monthlySalesReport: async (req, res) => {

        console.log('dxgdgdgdg');
        let mon = req.body.month
        let month = "2022-" + req.body.month
        console.log(month);
        let result = await orderHelpers.getMonthlySalesReport(month)
        // res.render('admin/reportMonthly', { layout: 'adminLayout', result })
        res.render('admin/selectReportPeriod', { layout: 'adminLayout',result,mon,monthly:true })


    },
    dailySalesReport: async (req, res) => {

        console.log('dxgdgdgdg');
        console.log(req.body.start, req.body.end);
        let startDate = req.body.start.slice(8,10)  
        let endDate = req.body.end.slice(8,10)  
        let startMon = req.body.start.slice(5,7) 
        let endMon = req.body.end.slice(5,7)
        console.log(startMon,'and',endMon,'with',startDate,'and',endDate); 
        let result = await orderHelpers.getDailySalesReport(req.body.start, req.body.end)
        console.log(result);
        res.render('admin/selectReportPeriod', { layout: 'adminLayout', result ,startMon,endMon,startDate,endDate,date:true})


    },
    yearlySalesReport: async (req, res) => {

        console.log('dxgdgdgdg');
        let year = req.body.year
        let result = await orderHelpers.getYearlySalesReport(year)
        console.log(result);
        // res.render('admin/reportMonthly', { layout: 'adminLayout', result })
        res.render('admin/selectReportPeriod', { layout: 'adminLayout',result,year,yearly:true })


    },
    viewCoupons: async (req, res) => {
        let coupons = await orderHelpers.getAllCoupons()
        res.render('admin/viewCoupons', { layout: 'adminLayout', coupons })
    },
    addcoupon: (req, res) => {
        res.render('admin/addCoupon', { layout: 'adminLayout' })

    },
    addCoupon: (req, res) => {

        orderHelpers.addCouponsIn(req.body).then(() => {
            console.log(req.body, "HEY THIS IS THE COUPON DATA")
            res.redirect('/admin/view-coupon')
        })
    },
    viewOffer: async (req, res) => {

        let category = await userHelpers.getAllCategories()
        res.render('admin/viewOffer', { layout: 'adminLayout', category })
    },
    addCategoryOffer: (req, res) => {

        userHelpers.addCategoryOffer(req.body).then((category) => {

            userHelpers.getProductForOffer(category).then((products) => {
                products.forEach(element => {

                    userHelpers.addOfferToProduct(req.body, element)
                });
                res.redirect('/admin/viewOffer')
            }).catch((error) => {
                console.log(error)
                res.render('404', { layout: null })
            })
        }).catch((error) => {
            console.log(error)
            res.render('404', { layout: null })
        })
    },
    removeCategoryOffer: async(req,res)=>{
      let id =req.params.id
      console.log('category id',id);
      userHelpers.removeCategoryOffer(id)
      res.redirect('/admin/viewOffer')
    },
    chart1: async (req, res) => {
        await orderHelpers.getDailySalesGraph().then((response) => {
            res.json(response)

        })

    },
    chart2: async (req, res) => {
        await orderHelpers.getVisitorGraph().then((response) => {
            res.json(response)

        })
    },
    chart3: async (req, res) => {
        await orderHelpers.getPurchaseGraph().then((response) => {
            res.json(response)

        })
    },
    chart4: async (req, res) => {
        await orderHelpers.paymentMethod().then((response) => {
            res.json(response)

        })
    }
}