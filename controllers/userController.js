const db = require('../config/connection')
// require('dotenv').config()
const userHelpers = require('../helpers/user-helpers');
const productHelpers = require('../helpers/userdetails-helpers');
const cartHelpers = require('../helpers/cart-helpers')
// const otp = require('../helpers/OTPhelpers');
const { ObjectId } = require('mongodb');
// const { use } = require('./admin');
const collection = require('../config/collections')
const userdetailsHelpers = require('../helpers/userdetails-helpers');
const orderHelpers = require('../helpers/order-helpers')
// const client = require('twilio')(otp.accoundSid, otp.authToken);
// const client = require('twilio')(process.env.accoundSid, process.env.authToken);
var easyinvoice = require('easyinvoice');
const { response } = require('express');

module.exports = {
    landingPage: async (req, res, next) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try{
            let user = req.session.user
            req.session.returnTo = req.originalUrl
            // console.log(req.body)
            // console.log(user)
            let bannerdetails = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            let category = await productHelpers.getAllCategories()
            let cartCount = null
    
            //----------------visitor count---------------------------------
    
    
            let newDate = new Date().getDate()
            let visitors = await db.get().collection(collection.VISITOR_COLLECTION).findOne({ name: 'localhost' + newDate })
          
            if (visitors == null || visitors.date != newDate) {
                new db.get().collection(collection.VISITOR_COLLECTION).insertOne({
                    name: 'localhost' + newDate,
                    count: 1,
                    date: newDate,
                })
            } else {
                await db.get().collection(collection.VISITOR_COLLECTION).updateOne({ date: newDate }, {
                    $inc: { count: 1 }
                })
            }
    
            //----------------visitor count---------------------------------
    
            if (user) {
    
                cartCount = await cartHelpers.getCartCount(user._id)
                console.log(cartCount);
                let products = await cartHelpers.getCartProducts(req.session.user._id)
                let totalValue = await cartHelpers.getTotalAmount(user._id)
                let wishCount = await cartHelpers.getWishCount(user._id)
                res.render('users/userHome', { user, category, cartCount, products, totalValue, bannerdetails, wishCount })
            }
            else {
                res.render('users/userHome', { user, category, bannerdetails })
            }
        }catch(error){
            console.log(error)
            res.render('users/404')
        }



    },
    signup: function (req, res, next) {
        res.render('users/userSignup');
    },
    signUP: (req, res) => {
        try{
            let userData = req.body
        userData.isBlocked = false
        userHelpers.doSignup(userData).then((response) => {
            if (response.status == false) {
                console.log(response);
                res.render('users/userSignup', { "emailError": "User Already Exists" })
            } else {
                res.redirect('/signup')
            }
        })
        }catch(error){
            console.log(error);
            res.render('users/404')
        }
    },
    otpPage: function (req, res, next) {
        res.render('users/userMobile');
    },
    homePage: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
       try {
        let user = req.session.user
        console.log(req.body)
        res.redirect('/')
       } catch (error) {
        console.log(error);
        res.render('users/404')
       }
    },
    loginpage: (req, res) => {
       try {
        if (req.session.loggedIn) {
            res.redirect('/')
            console.log('hhhhhhh')
        } else {
            res.render('users/userLogin', { "loginError": req.session.loginError })
            //req.session.loginError = false
        }
       } catch (error) {
        console.log(error);
        res.render('users/404')
       }

    },
    loginPage: async (req, res) => {
        try{
            userHelpers.doLogin(req.body).then((response) => {
                console.log('mongo atlas',response);
                if (response.isBlocked) {
                    console.log('blocked user');
                    req.session.loginError = "You are blocked";
                    // res.render('users/userLogin', { userblockedErr: req.session.loginErr })
                    res.redirect('/login')
                  
                } else {
                    if (response.status) {
                        req.session.loggedIn = true
                        req.session.user = response.user
                        console.log(req.body)
                        res.redirect(req.session.returnTo)
                        // res.redirect('/')
    
                    }
                    else {
                        req.session.loginError = "invalid login id or password"
                        // res.render('users/userLogin', { loginError: req.session.loginErr })
                        res.redirect('/login')
                    }
                }
            })
        }catch(error){
            console.log(error);
            res.render('users/404')
        }
    },
    // otpLogin: async (req, res) => {
    //     console.log('hhhhhhhhhhhhhhhhhhhhhhh');
    //     client
    //     .verify
    //     // .services(otp.serviceId)
    //     .services(process.env.serviceId)
    //     .verifications
    //     .create({
    //         to: `+${req.query.phoneNumber}`,
    //         channel: req.query.channel,
    //     })
    //     .then((data) => {
    //         console.log(data);
    //         res.status(200).send(data)
    //     })
    // },
    // otpVerify: (req, res) => {

    //     client
    //         .verify
    //         // .services(otp.serviceId)
    //         .services(process.env.serviceId)
    //         .verificationChecks
    //         .create({
    //             to: `+${req.query.phoneNumber}`,
    //             code: req.query.code
    //         })
    //         .then(async (data) => {
    //             console.log(data);
    //             if (data.valid) {
    //                 let Number = data.to.slice(3);
    //                 let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: Number });
    //                 if (userData?.mobile == Number) {
    //                     req.session.user = userData;
    //                     res.send({ value: 'success' })
    //                 } else {
    //                     res.send({ value: 'failed' })
    //                 }

    //             } else {
    //                 res.send({ value: 'failed' })
    //             }
    //         })
    // },
    logout: (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            req.session.user = null;
        req.session.loggedIn = false
        // res.redirect('/');
        res.redirect(req.session.returnTo);
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    productView: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try{
            let user = req.session.user
        req.session.returnTo = req.originalUrl
        console.log(req.body)
        let cartCount = null
        let wishCount = null
        let totalValue = null
        let cartProd = null
        if (user) {
            cartCount = await cartHelpers.getCartCount(user._id)
            wishCount = await cartHelpers.getWishCount(user._id)
            totalValue = await cartHelpers.getTotalAmount(user._id)
            cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        }
        // console.log(user)
        const id = req.query.id;
        let category = await productHelpers.getAllCategories()
        let categoryDetails = await userdetailsHelpers.getCategoryDetails(id)
        //console.log(categoryDetails);
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: categoryDetails.name }).toArray()
        // console.log(products)
        res.render('users/userProductView', { user, products, cartCount, category, wishCount,totalValue, cartProd })
        }catch(err){
            console.log(err);
            res.render('users/404')
        }
    },
    singleProductView: async (req, res) => {


        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            req.session.returnTo = req.originalUrl
        let user = req.session.user
        const id = req.query.id;
        var stk = 0
        let userCart = null
        let max = null
        console.log('this is user cart', userCart);
        let product = await productHelpers.getProductDetails(id)
        let category = await productHelpers.getAllCategories()    
        let totalValue = null
        let cartProd = null
        if (user) {
            // let pro = await userdetailsHelpers.getProductDetails(id)
            console.log('dhoom', product.stock);
            stk = product.stock
            var stockDetails = null
            if (product.stock == 1) {
                stockDetails = true
            }
            console.log(stockDetails);

            var cartCount = await cartHelpers.getCartCount(user._id)
            userCart = await cartHelpers.getUserCart(user._id, id)
            max = userCart[0]?.limit - product.stock
            var wishCount = await cartHelpers.getWishCount(user._id)
            totalValue = await cartHelpers.getTotalAmount(user._id)
            cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        }

        console.log('dgsg', max);
        res.render('users/singleProductView', { user, product, cartCount,cartProd,totalValue, stockDetails, stk, userCart, max ,wishCount,category})

        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    bannerShop:async(req,res)=>{
        try{
        let bannerId = req.query.id
        let banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({_id:ObjectId(bannerId)})
        console.log(banner);
        let user = req.session.user
        req.session.returnTo = req.originalUrl
        console.log(req.body)
        let cartCount = null
        let wishCount = null
        let totalValue = null
        let cartProd = null
        if (user) {
            cartCount = await cartHelpers.getCartCount(user._id)
            wishCount = await cartHelpers.getWishCount(user._id)
            totalValue = await cartHelpers.getTotalAmount(user._id)
            cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        }
        // console.log(user)
        const id = req.query.id;
        let category = await productHelpers.getAllCategories()
        // let categoryDetails = await userdetailsHelpers.getCategoryDetails(categoryId)
        // console.log(categoryDetails);
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: banner.category }).toArray()
        // console.log(products)
        res.render('users/userProductView', { user, products, cartCount, category, wishCount,totalValue, cartProd })
        }catch(error){
            console.log(error);
            res.render('users/404')
        }

    },
    addToCart: async (req, res) => {
       try {
        console.log('api call');
        let id = req.params.id
        let user = req.session.user
        let products = await productHelpers.getProductDetails(id)
        let userCart = await cartHelpers.getUserCart(user._id, id)
        console.log('djfgsdgfkdfbgjksdbgjksdbgk', products, 'dfksdfbvksdfbsjk', userCart, 'abhksebgsjkbgrgberk');
        console.log('king', id);
        let cartCount = null
        if (user) {
            cartCount = await cartHelpers.getCartCount(user._id)

            cartHelpers.addToCart(req.params.id, req.session.user._id).then((result) => {
                // res.json(result)
                res.json({ status: true, products, userCart,cartCount })
            })
        }
       } catch (error) {
            console.log(error);
            res.render('users/404')
       }
    },
     viewCart: async (req, res) => {
        try{
            res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        let user = req.session.user
        let category = await productHelpers.getAllCategories()
        // console.log(user)
        if (user) {
            let products = await cartHelpers.getCartProducts(req.session.user._id)
            cartCount = await cartHelpers.getCartCount(req.session.user._id)
            if (products.length > 0) {
                let totalValue = await cartHelpers.getTotalAmount(user._id)
                res.render('users/cart', { user, products, totalValue, cartCount,category })
            }
            else {
                res.render('users/emptyCart')
            }

        } else {
            res.redirect('/')
        }
        }catch(error){
            console.log(error);
            res.render('users/404')
        }

    },
    changeProductQuantity: (req, res, next) => {
        try {
            let user = req.session.user._id
        cartHelpers.changeProductQuantity(req.body).then(async (response) => {
            console.log(response);
            response.total = await cartHelpers.getTotalAmount(req.body.user)
            res.json(response)
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    deleteCartProduct: async (req, res) => {
        try {
            let proId = req.query.id
        console.log(proId);
        let user = req.session.user._id
        cartHelpers.deleteCartProduct(user, proId)
        res.redirect('/view-cart')
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    emptyCart: async (req, res) => {  //not working
        try {
        let id = req.query.id
        let user = req.session.user
        console.log(id);
        cartHelpers.deleteProduct(id, user)
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    placeorder: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user
            let usera = req.session.user
            console.log("asdfghjklfg", user);
            let total = await cartHelpers.getTotalAmount(user._id)
            let category = await productHelpers.getAllCategories()
            cartCount = await cartHelpers.getCartCount(req.session.user._id)
            let user1 = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(user._id) })
            console.log('agaagsgsdggssgsssgsgsgsgsggssgsgs',user1);
            let address = user1.Address
            
            res.render('users/checkout', { user, total, user1, cartCount, usera,address,category })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    placeOrder: async (req, res) => {
        try {
            console.log(req.body)
            let user = req.session.user
            let products = await cartHelpers.getCartProductList(req.body.userId)
            let totalPrice = await cartHelpers.getTotalAmount(req.body.userId)
            let prodArr = new Array()
            for (let i = 0; i < products.length; i++) {
                let prod = await userdetailsHelpers.getProductDetails(products[i].item)
                prodArr.push(prod.stock)
            }
    
            let verifyCoupon = await orderHelpers.couponVerify(user._id);
            console.log(verifyCoupon,'kkkkkkkkkkkkkkkkkkkkkkk');
            console.log(verifyCoupon.code, '123333333333333333');
            console.log(req.body.couponName, "3255555555555555555555")
    
            if (verifyCoupon.code == req.body.couponName) {
                let discountAmount = (totalPrice * parseInt(verifyCoupon.value)) / 100;
    
                let amount = totalPrice - discountAmount;
                console.log(discountAmount, "thi is dicsount++++++++++++++++++++++++")
                console.log(amount, "this is original--------------- ")
                cartHelpers.placeOrder(req.body, products, amount, prodArr).then((orderId) => {
                    if (req.body['paymentMethod'] === 'cod') {
                        // res.json(response)
                        res.json({ codSuccess: true })
                    } else if (req.body['paymentMethod'] === 'razorpay') {
                        cartHelpers.generateRazorpay(orderId, amount).then((response) => {
                            response.razorpay = true;
                            res.json(response)
                        })
                    }else if (req.body['paymentMethod'] === 'wallet') {
                        cartHelpers.walletPayment(user._id,orderId).then((response)=>{
                            response.wallet = true
                            console.log(response);
                            res.json(response)
                        })
                      
                    }
                    else if (req.body["paymentMethod"] === "paypal") {
    
                        cartHelpers.convertRate(amount).then((data) => { // converting inr to usd
                            convertedRate = Math.round(data)
                            console.log(convertedRate);
    
    
                            cartHelpers.generatePayPal(orderId.toString(), convertedRate).then((response) => {
                                cartHelpers.changePaymentStatus(orderId)
                                console.log(response);
                                response.insertedId = orderId
                                response.payPal = true;
                                res.json(response);
    
                            });
                        })
                    }
                    else {
                        console.log('something happened to error ');
                    }
    
    
                })
            } else {
                cartHelpers.placeOrder(req.body, products, totalPrice, prodArr).then((orderId) => {
                    if (req.body['paymentMethod'] === 'cod') {
                        // res.json(response)
                        res.json({ codSuccess: true })
                    } else if (req.body['paymentMethod'] === 'razorpay') {
                        cartHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
                            response.razorpay = true;
                            res.json(response)
                        })
                    }else if (req.body['paymentMethod'] === 'wallet') {
                        cartHelpers.walletPayment(user._id,orderId).then((response)=>{
                            response.wallet = true
                            console.log(response);
                            res.json(response)
                        })
                      
                    }
                    else if (req.body["paymentMethod"] === "paypal") {
    
                        cartHelpers.convertRate(totalPrice).then((data) => { // converting inr to usd
                            convertedRate = Math.round(data)
                            console.log(convertedRate);
    
    
                            cartHelpers.generatePayPal(orderId.toString(), convertedRate).then((response) => {
                                cartHelpers.changePaymentStatus(orderId)
                                console.log(response);
                                response.insertedId = orderId
                                response.payPal = true;
                                res.json(response);
    
                            });
                        })
                    }
                    else {
                        console.log('something happened to error ');
                    }
    
    
                })
            }
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }


    },
    verifyPayment: (req, res) => {
        console.log(req.body);
        cartHelpers.verifyPayment(req.body).then(() => {
            cartHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false, errMsg: '' })
        })
    },
    orderSuccess: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user

        let newDate = new Date().getDate()
        let visitors = await db.get().collection(collection.PURCHASE_COLLECTION).findOne({ name: 'purchase' + newDate })
        let category = await productHelpers.getAllCategories()
        if (visitors == null || visitors.date != newDate) {
            new db.get().collection(collection.PURCHASE_COLLECTION).insertOne({
                name: 'purchase' + newDate,
                count: 1,
                date: newDate,
            })
        } else {
            await db.get().collection(collection.PURCHASE_COLLECTION).updateOne({ date: newDate }, {
                $inc: { count: 1 }
            })
        }
        res.render('users/orderPlaced', { user,category })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    cancelorder: async (req, res) => {   //not work
        try {
            let id = req.query.id
        console.log(id);
        cartHelpers.deleteOrder(id).then((response) => {
            res.redirect('/orders')
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    cancelPayment: async (req, res) => {
        try {
             let user= req.session.user   
             let category = await productHelpers.getAllCategories()
            await cartHelpers.deletePendingOrder(req.query.id).then(()=>{
                res.render('users/transaction_failed',{user,category})
            })
          
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    otp: (req, res) => {
        console.log('hii');
        res.render("users/userMobile");
    },
    accountHome: async(req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user
            let coupons = await orderHelpers.getAllCoupons()
            let user1 = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(user._id)})
            console.log(user1);
            let cartCount = await cartHelpers.getCartCount(user._id)
            let category = await productHelpers.getAllCategories()
            let wishCount = await cartHelpers.getWishCount(user._id)
            let totalValue = await cartHelpers.getTotalAmount(user._id)
            let cartProd = await cartHelpers.getCartProducts(req.session.user._id)
            res.render('users/accountHome', { user ,coupons,user1,cartCount,wishCount,totalValue,cartProd,category})
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    ordersHome: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let userId = req.session.user._id
        let user = req.session.user
        let orders = await cartHelpers.getUserOrders(userId)
        let category = await productHelpers.getAllCategories()
        let cartCount = await cartHelpers.getCartCount(user._id)
            let wishCount = await cartHelpers.getWishCount(user._id)
            let totalValue = await cartHelpers.getTotalAmount(user._id)
            let cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        res.render('users/myOrders', { user, orders,cartCount,wishCount,totalValue,cartProd,category })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    orderDetail: async (req, res) => {
        try {
        let user = req.session.user
        let id = req.query.id
        let oId = id
        let products = await cartHelpers.getOrderProducts(id)
        let category = await productHelpers.getAllCategories()
        let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(oId) })
        let cartCount = await cartHelpers.getCartCount(user._id)
            let wishCount = await cartHelpers.getWishCount(user._id)
            let totalValue = await cartHelpers.getTotalAmount(user._id)
            let cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        res.render('users/viewOrderProducts', { user, products, order,cartCount,wishCount,totalValue,cartProd,category })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    addressList: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user
        let user1 = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(user._id) })
        // console.log("/////////////////////////////////////////////////////////////////////////////////////////////////////////////",user1,"/////////////////////////////////////////////////////////////////////////////////////////////////////////////");
        // let address= user.Address
        let category = await productHelpers.getAllCategories()
        let address= user1.Address
        let cartCount = await cartHelpers.getCartCount(user._id)
            let wishCount = await cartHelpers.getWishCount(user._id)
            let totalValue = await cartHelpers.getTotalAmount(user._id)
            let cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        res.render('users/userProfile', { user,address,cartCount,wishCount,totalValue,cartProd,category})
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    addressDelete: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let address = req.query.id
        let user = req.session.user._id
        userHelpers.deleteAddress(user, address).then((response) => {
            console.log(response);
            res.redirect('/address')
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    profileupdate: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let userdetails = req.session.user
            let user =  req.session.user
        // console.log(req.session.user);
         let category = await productHelpers.getAllCategories()
        let cartCount = await cartHelpers.getCartCount(user._id)
            let wishCount = await cartHelpers.getWishCount(user._id)
            let totalValue = await cartHelpers.getTotalAmount(user._id)
            let cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        res.render('users/updateProfile', { userdetails,cartCount,wishCount,totalValue,cartProd,category,user })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    addressEdit: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user
        let aid = req.query.id
        console.log(user._id, aid);
        let category = await productHelpers.getAllCategories()
        let cartCount = await cartHelpers.getCartCount(user._id)
            let wishCount = await cartHelpers.getWishCount(user._id)
            let totalValue = await cartHelpers.getTotalAmount(user._id)
            let cartProd = await cartHelpers.getCartProducts(req.session.user._id)
        userHelpers.getAddress(user._id, aid).then((address) => {
            console.log(address);
            
            res.render('users/editAddress', { user, address,cartCount,wishCount,totalValue,cartProd,category })
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    addressAdd: (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user._id
        console.log(req.body);
        userHelpers.addAddress(req.body, user).then((response) => {
            console.log(response);
            res.redirect('/address')
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    updateProfile: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user._id
        console.log(req.body);
        let data = req.body
        userHelpers.editProfile(user, data).then((response) => {
            console.log(response);
            req.session.user = null;
            req.session.loggedIn = false
            res.redirect('/');
            // res.redirect('/account')
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    addressUpdate: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user._id
        console.log(req.body);
        let data = req.body
        userHelpers.editAddress(user, data).then((response) => {
            console.log(response);
            res.redirect('/address');

        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    orderCancel: async (req, res) => {
        try {
            let prodId = req.body.proId
        let ordId = req.body.orderId
        console.log(prodId, ordId);
        // res.redirect('/view-order-details')
        cartHelpers.changeProductStatus(prodId, 'canceled', ordId).then((response) => {
            console.log(response);
            res.redirect('/view-order-details')
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    returnProduct: async (req, res) => {
        try {
            let proId = req.body.pId
        let proQuant = req.body.pQ
        let OrdId = req.body.oId
        let user = req.session.user
        console.log(proId, proQuant);
        let pro = await userdetailsHelpers.getProductDetails(proId)
        console.log('spazone', pro.stock);
        cartHelpers.changeProductStatus(proId, 'returned', OrdId)
        orderHelpers.returnProduct(proId, pro.stock, proQuant,user._id).then((respo) => {
            console.log(respo);
            res.redirect('/view-order-details')
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    couponApply: async (req, res) => {
        try {
            console.log('hyhyhhyyhyyyh');
        let user = req.session.user._id;
        const date = new Date();
        let totalAmount = await cartHelpers.getTotalAmount(user)
        let Total = totalAmount;

        if (req.body.coupon == '') {

            res.json({ noCoupon: true, Total })

        }
        else {
            let couponres = await orderHelpers.applyCoupon(req.body, user, date, totalAmount)
            console.log('couponres', couponres, 'haitony');
            if (couponres.verify) {

                let discountAmount = (totalAmount * parseInt(couponres.couponData.value)) / 100;
                console.log('tonystark', discountAmount);
                let amount = totalAmount - discountAmount
                couponres.discountAmount = Math.round(discountAmount)
                couponres.amount = Math.round(amount);
                res.json(couponres)
                console.log('argentina', couponres, 'haitony');
            } else {

                couponres.Total = totalAmount;
                res.json(couponres)

            }

        }

        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    addToWishList: async (req, res) => {
        try {
            console.log('api call');
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        let user = req.session.user
        let id = req.params.id
        console.log('productId is', id);
        cartHelpers.addToWishlist(id, user._id).then((result) => {
            res.json(result)
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    },
    getWishListProducts: async (req, res) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,Pragma, no-cache,Expires, -1"
        );
        try {
            let user = req.session.user
        let totalValue = null
        let cartProd = null
        let category = await productHelpers.getAllCategories()
        if (user) {
            let u = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(user._id)})
            totalValue = await cartHelpers.getTotalAmount(user._id)
            cartProd = await cartHelpers.getCartProducts(req.session.user._id)
            var cartCount = await cartHelpers.getCartCount(user._id)
            if(u){
                let products = await cartHelpers.getWishProducts(user._id)
            console.log('wishst products', products);
            let pro = products[0]?.output
            console.log(products[0]?.output);
            wishCount = await cartHelpers.getWishCount(user._id)
            if (products.length > 0) {
                res.render('users/wishlist', { user, pro, wishCount,cartProd,totalValue,cartCount,category })
            }
            else {
                res.render('users/emptyWish',{ user, pro, wishCount,cartProd,totalValue,cartCount,category })
            }
            }else{
                res.render('users/emptyWish',{ user, pro, wishCount,cartProd,totalValue,cartCount,category })
            }

        } else {
            res.redirect('/')
        }
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }

    },
    removeProductWishlist: (req, res) => {
        try {
            let user = req.session.user
        let id = req.query.id
        cartHelpers.removeFromWishlist(user._id, id).then((respo) => {
            res.redirect('/wishlist')
        })
        } catch (error) {
            console.log(error);
            res.render('users/404')
        }
    }

}