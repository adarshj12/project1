var db = require('../config/connection')
var collection = require('../config/collections');
const userdetailsHelpers = require('./userdetails-helpers');
// const { response } = require('../app');
const ObjectId = require('mongodb').ObjectId
module.exports = {
  totalRevenue: () => {

    return new Promise(async (resolve, reject) => {
      const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
        { $project: { _id: 0 } },
      ]).toArray().then((respo) => {
        //  console.log(respo[0].sum);       
        resolve(respo[0]?.sum)
      })
    })

  },

  /* -------------------------------------------------------------------------- */
  /*                      GET DAILY SALES GRAPH                                 */
  /* -------------------------------------------------------------------------- */


  getDailySalesGraph: () => {
    return new Promise(async (resolve, reject) => {
      let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $project: { date: 1, totalAmount: 1 }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%d", date: "$date" } },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: {
            _id: 1,
          }
        },
        {
          $limit: 31
        }
      ]).toArray().then((respo) => {
        resolve(respo)
        // console.log(respo);
      })


    })
  },


  /* -------------------------------------------------------------------------- */
  /*                      GET MONTHLY SALES GRAPH                                */
  /* -------------------------------------------------------------------------- */

  getMonthlySalesGraph: () => {
    return new Promise(async (resolve, reject) => {
      let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $project: { date: 1, totalAmount: 1 }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m", date: "$date" } },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: {
            _id: 1,
          }
        },
        {
          $limit: 12
        }
      ]).toArray().then((respo) => {
        resolve(respo)
        // console.log(respo);
      })


    })
  },


  /* -------------------------------------------------------------------------- */
  /*                      GET YEARLY SALES GRAPH                                */
  /* -------------------------------------------------------------------------- */

  getYearlySalesGraph: () => {
    return new Promise(async (resolve, reject) => {
      let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $project: { date: 1, totalAmount: 1 }
        },

        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            _id: 1
          }
        },
        {
          $limit: 7
        }
      ]).toArray()
      resolve(sales)
    })
  },
  getVisitorGraph: () => {
    return new Promise(async (resolve, reject) => {
      var visit = await db.get().collection(collection.VISITOR_COLLECTION).aggregate([
        {
          $project: { date: 1, count: 1 }
        },
        {
          $sort: {
            date: 1
          }
        }
      ]).toArray().then((respo) => {
        // resolve(respo)
        // console.log(respo);
        // console.log('fkfkkffkfkfkfkfkfkf', respo);
        var date = new Array()
        var total = new Array()
        for (let index = 0; index < respo.length; index++) {
          date[index] = respo[index].date
          total[index] = respo[index].count

        }

        // console.log( date);
        resolve({ total, date })
      })


    })

  },
  getPurchaseGraph: () => {

    return new Promise(async (resolve, reject) => {
      var visit = await db.get().collection(collection.PURCHASE_COLLECTION).aggregate([
        {
          $project: { date: 1, count: 1 }
        },
        {
          $sort: {
            date: 1
          }
        }
      ]).toArray().then((respo) => {
        // resolve(respo)

        var date = new Array()
        var total = new Array()
        for (let index = 0; index < respo.length; index++) {
          date[index] = respo[index].date
          total[index] = respo[index].count

        }
        resolve({ total, date })
      })


    })

  },
  getSalesData: () => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          '$unwind': {
            'path': '$products'
          }
        }, {
          '$lookup': {
            'from': 'product',
            'localField': 'products.item',
            'foreignField': '_id',
            'as': 'products'
          }
        }, {
          '$unwind': {
            'path': '$products'
          }
        }, {
          '$project': {
            '_id': 0,
            'date': 1,
            'products.category': 1,
            'totalAmount': 1
          }
        }, {
          '$group': {
            '_id': '$products.category',
            'total': {
              '$sum': '$totalAmount'
            },
            'date': {
              '$first': '$date'
            }
          }
        },
      ]).toArray().then((respo) => {
        console.log(respo);
        resolve(respo)
      })
    })
  },
  returnProduct: (proId, proStck, proQuant,uId) => {
    let prodQuant = parseInt(proQuant)
    console.log(proId, 'and', proStck, 'and', prodQuant);
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) },
        {
          $set: {
            stock: proStck + prodQuant
          }
        }).then((respo) => {
          console.log(respo);
          resolve(respo)
        })
        let proDet = await userdetailsHelpers.getProductDetails(proId)
        let amount = parseInt(proDet.price*prodQuant)
        let uDet = await userdetailsHelpers.getUserDetails(uId)
        let uWallet = parseInt(uDet.wallet)
        await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(uId)},{
          $set:{
            wallet:amount+uWallet
          }
        })
    })
  },
  
  /* -------------------------------------------------------------------------- */
  /*                         COUPON APPLY                                       */
  /* -------------------------------------------------------------------------- */
  addCouponsIn:(data)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.COUPON_COLLECTION).insertOne(data).then(()=>{
        resolve()
      })
    })
  },
  getAllCoupons:()=>{
    return new Promise(async(resolve,reject)=>{
     let coupons=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
     resolve(coupons)
    })
   },

  applyCoupon:(details, userId, date,totalAmount)=>{
    return new Promise(async(resolve,reject)=>{
      let response={};
      
      let coupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({code:details.coupon});
      if(coupon){

        const expDate=new Date(coupon.endingdate)
       
        response.couponData = coupon;
       

        let user=await db.get().collection(collection.COUPON_COLLECTION).findOne({code:details.coupon,Users:ObjectId(userId)})
         
        if(user){
          
          response.used="Coupon Already Applied"
          resolve(response)
         

        }else{

          if(date <=expDate){

              response.dateValid=true;
              resolve(response);

              let total=totalAmount;

              if(total >= coupon.minAmount){
                
                response.verifyMinAmount=true;
                resolve(response)

                if(total <= coupon.maxAmount){

                  response.verifyMaxAmount=true;
                  resolve(response)
                }
                else{
                  response.maxAmountMsg="Your Maximum Purchase should be "+ coupon.maxAmount;
                  response.maxAmount=true;
                  resolve(response)
                }
              }
              else{
                
                response.minAmountMsg="Your Minimum purchase should be "+coupon.minAmount;
                response.minAmount=true;
                resolve(response)
              }   

          }else{
            response.invalidDateMsg = 'Coupon Expired'
            response.invalidDate = true
            response.Coupenused = false

            resolve(response)
            console.log('invalid date');
          }
        }
        
      }else{
        response.invalidCoupon=true;
        response.invalidCouponMsg="Invalid Coupon";
    
        resolve(response)
      }

      if(response.dateValid && response.verifyMaxAmount && response.verifyMinAmount)
      {
        response.verify=true;
        db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
        {
          $set:{
            coupon:ObjectId(coupon._id)
          }  
        })
        resolve(response)
      }
    })
  },


  /* -------------------------------------------------------------------------- */
  /*                        VERIFY  COUPON                                       */
  /* -------------------------------------------------------------------------- */



  couponVerify:(userId)=>{
    return new Promise(async(resolve,reject)=>{

      let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
      console.log('aaaaaaaaaaaaaaaaa',userCart,'bbbbbbbbbbbbbbbbbbbbb');
     //if(userCart.coupon){
      if(userCart.coupon){
          
        let couponData=await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:ObjectId(userCart.coupon)});
       
        resolve(couponData)
      }
      resolve(userCart);
    

    })

  },
  /* -------------------------------------------------------------------------- */
  /*                         REMOVE COUPON                                       */
  /* -------------------------------------------------------------------------- */

  removeCoupon:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{
          $unset:{
            coupon:""
          }
        }).then((response)=>{
          resolve(response)
        })
    })
  },
  getMonthlySalesReport:(month)=>{
    return new Promise(async(resolve,reject)=>{
      console.log(month);
      let monthlyReport=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          '$match': {
            'orderMonth': month
          }
        }, {
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
            '_id': '$output.category', 
            'totalAmount': {
              '$sum': '$totalAmount'
            }
          }
        }, {
          '$project': {
            '_id': 1, 
            'totalAmount': 1
          }
        }
      ]).toArray();
      console.log(monthlyReport);
      resolve(monthlyReport)
    })
  },
  getDailySalesReport:(start,end)=>{
    return new Promise(async(resolve,reject)=>{
      console.log(start,end);
      let dailyReport=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
       
        {
          $match: { orderDate: {$gte:start,$lte:end}} 
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
            '_id': '$output.category', 
            'totalAmount': {
              '$sum': '$totalAmount'
            }
          }
        }, {
          '$project': {
            '_id': 1, 
            'totalAmount': 1
          }
        }
      ]).toArray();
      console.log(dailyReport);
      resolve(dailyReport)
    })
  },
  getYearlySalesReport:(year)=>{
    return new Promise(async(resolve,reject)=>{
      console.log(year);
      let YearlyReport=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
       
        {
          $match: { orderYear: year} 
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
            '_id': '$output.category', 
            'totalAmount': {
              '$sum': '$totalAmount'
            }
          }
        }, {
          '$project': {
            '_id': 1, 
            'totalAmount': 1
          }
        }
      ]).toArray();
      console.log(YearlyReport);
      resolve(YearlyReport)
    })
  },
  paymentMethod:()=>{
    console.log('dgdsgbsdbgj');
    return new Promise(async(resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          '$project': {
            'paymentMethod': 1, 
            '_id': 0
          }
        }, {
          '$group': {
            '_id': '$paymentMethod', 
            'count': {
              '$sum': 1
            }
          }
        }
      ]).toArray().then((response)=>{
        resolve(response)
      })
    })
  },
  getCurrentMonthSalesReport:(month)=>{
    return new Promise(async(resolve,reject)=>{
      console.log('jhjhjhjjhjhjhjhhjhjhjh',month);
      let monthlyReport=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          '$match': {
            'orderMonth': month
          }
        }, 
         
        {
          '$group': {
            '_id': null, 
            'totalAmount': {
              '$sum': '$totalAmount'
            }
          }
        }, 
        {
          '$project': {
            '_id': 0, 
            'totalAmount': 1
          }
        }
      ]).toArray();
      console.log(monthlyReport);
      resolve(monthlyReport)
    })
  },

}