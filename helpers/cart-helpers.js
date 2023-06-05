var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const userdetailsHelpers=require('../helpers/userdetails-helpers')
// const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_lAB3d9vBuWE8JR',
    key_secret: 'fCycgzvxJHEwsHhwsLaUiC0J',
});
const CC = require("currency-converter-lt");
const paypal = require('paypal-rest-sdk');
const { response } = require('express');
paypal.configure({mode: "sandbox", client_id:"AecHksbtC6IuMHKBoZ7U9CE-pg7IGnV6jWtXFztswfbBhJEJhodjFTMyzd0Ot8Dt2CTYO8Msm2jOHjZU", client_secret:"EI0LvJxazdTsn9hg-QYJQ_8pOIo7wcedcCfKGXcp5ka3-d0p7VRU5EcKiDuZKlTVolfGbndNsDhqGTn8"});

const moment = require('moment');
const { resolve } = require('path');
module.exports = {
    addToCart: (prodId, userId) => {
        let proObj = {
            item: ObjectId(prodId),
            quantity: 1,
          //  status:"placed"
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log(userCart);
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == prodId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        // .updateOne({ 'products.item': ObjectId(prodId) },
                        .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(prodId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then((res) => {
                                console.log(res);
                                resolve()
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION).
                        updateOne({ user: ObjectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve({ status: true })
                        })
                }


            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((res) => {
                    console.log(res);
                    resolve()
                })
            }
        })
    },
    
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        '$match': {
                            user: ObjectId(userId)

                        }
                    },
                    {
                        '$unwind': {
                            'path': '$products'
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'product',
                            'localField': 'products.item',
                            'foreignField': '_id',
                            'as': 'product'
                        }
                    },
                    {
                        '$project':
                        {
                            'product': 1,
                            'quantity': '$products.quantity',
                            'status':'$products.status'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: {
                                $arrayElemAt: ['$product', 0]
                            }
                        }
                    }
                ]
            ).toArray()
            // console.log(cartItems);
            // console.log(cartItems[0].products.products,'asdfghjklkjhgfdsdfghjkl,m');
            resolve(cartItems)
            // console.log(cartItems[0].product)
            // console.log(cartItems[1].product)
        })
    },
    getUserCart:(userId,id)=>{
        console.log('111',userId,id,'3333');
        return new Promise(async(resolve, reject) => {
              db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                  $match:{user:ObjectId(userId)}
                },
                {
                    $unwind: "$products" 
                },
               {
                  $project:{
                    limit:"$products.quantity",
                    item:"$products.item"
                  }
                },
                {
                  $match:{item:ObjectId(id)}
                }
              ]).toArray().then((response)=>{
                console.log(response);
                resolve(response)
              })
        })
      },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {

                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
            } else {


                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        // resolve(true)
                        resolve({ status: true })
                    }
                    )
            }
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate(


                [
                    {
                        '$match': {
                            user: ObjectId(userId)

                        }
                    },
                    {
                        '$unwind': {
                            'path': '$products'
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'product',
                            'localField': 'products.item',
                            'foreignField': '_id',
                            'as': 'product'
                        }
                    },
                    {
                        '$project':
                        {
                            'product': 1,
                            'quantity': '$products.quantity'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: {
                                $arrayElemAt: ['$product', 0]
                            }
                        }
                    },
                    {
                        // $project:{
                        //     total:{$sum:{$multiply:[{$toInt:"$quantity"},{$toInt:"$product.price"}]}}
                        // }
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: [{ $toInt: "$quantity" }, { $toInt: "$product.price" }] } }
                        }
                    }
                ]
            ).toArray()
            console.log(total[0]?.total);
            console.log(total);
            // resolve(total)
            resolve(total[0]?.total)

        })
    },
    // getCartProductList: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
    //         console.log(cart);
    //         resolve(cart.products)
    //     })
    // },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            // console.log(cart);
            if(cart){
                resolve(cart.products)
            }else{
                resolve(0)
            }
           
        })
    },                           
    placeOrder: (order, products, total,stockArr) => {
        return new Promise(async(resolve, reject) => {
            // console.log(products,products.length);
            console.log(stockArr);
            let userdetails = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(order.userId) })
            let status = order.paymentMethod === 'cod' ? 'placed' : 'pending'
            products.forEach(products => {
                products.status=status;
               });
            let orderObj = {
                deliveryDetails: {
                    CustomerName: userdetails.name,
                    contactNumber: userdetails.mobile,
                    email: userdetails.email,
                    address: order.address,
                    state: order.state,
                    country: order.country,
                    pincode: order.pin
                },
                userId: ObjectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalAmount: total,
                status: status,
                date:new Date(),
                orderDate:moment().format('YYYY-MM-D'),
                orderMonth:moment().format('YYYY-MM'),
                orderYear:moment().format('YYYY'),
            }
            if(order.couponName){
          
                await db.get().collection(collection.COUPON_COLLECTION).updateOne({code:order.couponName},
                  {
                    $push:{
                      Users:ObjectId(order.userId)
                    }
                  })
      
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                     db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })
                     for(let i=0;i<products.length;i++){
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(products[i].item)},
                     {
                       $set:{
                                stock:stockArr[i]-products[i].quantity
                            }
                     })
                     }
                console.log(response.insertedId);
                resolve(response.insertedId)
          
            })
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
                .find({ userId: ObjectId(userId) }).sort({$natural:-1}).toArray()
            // console.log(orders);
            resolve(orders)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status:'$products.status'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },status:1
                    }
                }
            ]).toArray()
            // console.log(orderItems);
            resolve(orderItems)
        })
    },
    deleteOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: ObjectId(orderId) })
                .then((response) => {
                    resolve(response)
                    // console.log(response);
                })
        })
    },
    deleteCart: (cartId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ _id: ObjectId(cartId) })
                .then((response) => {
                    resolve(response)
                    // console.log(response);
                })
        })
    },
    deleteProduct: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(proId);
            console.log(userId);
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            // console.log(cart.products[0]);
            console.log('sdf');
            console.log(cart[0]);
        })
    },
    generateRazorpay: (orderId, total) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: '' + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('New Order:', order);
                    resolve(order)
                }


            });
        })
    },
     convertRate: (totalinr) => {
        console.log(totalinr);
        let fromCurrency = "INR";
        let toCurrency = "USD";
        let amountToConvert = totalinr;
        let currencyConverter = new CC({from: fromCurrency, to: toCurrency, amount: amountToConvert});
        return new Promise(async (resolve, reject) => {
            await currencyConverter.convert().then((response) => {
                resolve(response)
                console.log(response);
            });
        })
      },
      
      //paypal
      
      generatePayPal: (orderId, totalPrice) => {
        console.log(orderId, totalPrice);
        console.log('reached at generate payPal');
      
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    // return_url: "http://localhost:3000/order-success",
                    return_url: "https://furns.store/order-success",
                    // cancel_url: "http://localhost:3000/cancel-payment"
                    cancel_url: "http://furns.store/cancel-payment"
                },
                "transactions": [
                    {
                        "item_list": {
                            "items": [
                                {
                                    "name": "Red Sox Hat",
                                    "sku": "001",
                                    "price": totalPrice,
                                    "currency": "USD",
                                    "quantity": 1
                                }
                            ]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": totalPrice
                        },
                        "description": "Hat for the best team ever"
                    }
                ]
            };
      
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
              
                    throw error;
      
                } else {
                    resolve(payment);
                }
            });
        });
      },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            let hmac = crypto.createHmac('sha256', 'fCycgzvxJHEwsHhwsLaUiC0J')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    createPaypal:(payment)=>{
        return new Promise((resolve,reject)=>{
         paypal.payment.create(payment, function (error, payment) {
           if (error) {
               reject(error)
           } else {
               console.log("Create Payment Response");
               console.log(payment);
               resolve(payment);
           }
           });
        })
       },
    // changePaymentStatus:(orderId)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.ORDER_COLLECTION)
    //         .updateOne({_id:ObjectId(orderId)},
    //         {
    //             $set:{
    //                 status:'placed'
    //             }
    //         }).then(()=>{
    //             resolve()
    //         })
    //     })
    // },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    status:'placed',
                  'products.$[].status':'placed'
                }
              }).then(()=>{
                resolve()
            })
        })
    },
    changeProductStatus:(proId,stat,orderId)=>{
        console.log(proId,orderId,stat);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:ObjectId(orderId),"products.item":ObjectId(proId)},
            {
                $set:{
                    "products.$.status":stat
                }
            }).then((response)=>{
                resolve(response)
                console.log(response);
   
            })
        })
    },
    deleteCartProduct:(uId,prodId)=>{
        console.log(uId+'-'+prodId);
        return new Promise(async(resolve, reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(uId)},{
                $pull:{
                    products:{item:ObjectId(prodId)}
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    addToWishlist:(pId,uId)=>{
        console.log(pId,'+',uId);
        let proObj = {
            item: ObjectId(pId),
        }
        
        return new Promise(async(resolve,reject)=>{
            let userWish = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(uId) })
            console.log(userWish);
            if (userWish) {
                let proExist = userWish.products.findIndex(product => product.item == pId)
                console.log(proExist);
                if (proExist != -1) {
                    response.status = false
                    resolve(response)
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION).
                        updateOne({ user: ObjectId(uId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            response.status= true 
                            resolve(response)
                        })
                }


            } else {
                let wishObj = {
                    user: ObjectId(uId),
                    products: [proObj],
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((res) => {
                    console.log(res);
                    res.status=true
                    resolve(res)
                })
            }
        })
    },
    getWishProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
             await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },
                {
                    '$unwind': {
                        'path': '$products'
                    }
                }, {
                    '$lookup': {
                        'from': 'product', 
                        'localField': 'products.item', 
                        'foreignField': '_id', 
                        'as': 'output'
                    }
                }, {
                    '$unwind': {
                        'path': '$output'
                    }
                }, {
                    '$group': {
                        '_id': '$_id', 
                        'output': {
                            '$addToSet': '$output'
                        }
                    }
                }
            ]).toArray().then((respo) => {
                //  console.log(respo[0].sum);       
                resolve(respo)
              })
        })
    },
    getWishCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wish = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
            if (wish) {
                count = wish.products.length
            }
            resolve(count)
        })
    },
    removeFromWishlist: (uId,prodId)=>{
        console.log(uId+'-'+prodId);
        return new Promise(async(resolve, reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(uId)},{
                $pull:{
                    products:{item:ObjectId(prodId)}
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    walletPayment:(uId,oId)=>{
        return new Promise(async(resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(oId)})
            console.log('this is order',order);
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(oId)},{
                $set:{
                    status: "placed"
                }
            })
            let uDet = await userdetailsHelpers.getUserDetails(uId)
            let uWallet = parseInt(uDet.wallet)
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(uId)},{
                $set:{
                    wallet:uWallet-order.totalAmount
                }
            }).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    deletePendingOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id:ObjectId(orderId)});
          resolve()
        })
    },
    
   



}