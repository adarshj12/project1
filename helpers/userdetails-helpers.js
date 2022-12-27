var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('mongodb')
const { response } = require('express')
// const { response } = require('../app')
var objectId = require('mongodb').ObjectId
module.exports = {
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let usersdetails = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(usersdetails)
        })
    },
    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) }).then((response) => {
                //    console.log(response)
                resolve(response)
            })
        })
    },
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((userdetails) => {
                resolve(userdetails)
            })
        })
    },
    updateUser: (userId, userD) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    name: userD.name,
                    email: userD.email
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let productdetails = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(productdetails)
        })
    },
    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) }).then((response) => {
                //    console.log(response)
                resolve(response)
            })
        })
    },
    getProductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((productdetails) => {
                resolve(productdetails)
            })
        })
    },
    updateProduct: (productId, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) }, {
                $set: {
                    name: productDetails.name,
                    price: productDetails.price,
                    description:productDetails.description,
                    category: productDetails.category
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categorydetails = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categorydetails)
        })
    },
    deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(categoryId) }).then((response) => {
                //    console.log(response)
                resolve(response)
            })
        })
    },
    getCategoryDetails: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(categoryId) }).then((caegorydetails) => {
                resolve(caegorydetails)
            })
        })
    },



    updateCategory: (categoryId, categoryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(categoryId) }, {
                $set: {
                    name: categoryDetails.name,
                    description: categoryDetails.description
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    
    // updateCategory: (categoryId, categoryDetails) =>{
    //     return new Promise((resolve,reject)=>{
    //       db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:ObjectId(categoryId)},{
    //         $set:{
    //           category:categoryDetails.category,
    //         }
    //       }).then((response)=>{
    //         resolve()
    //       })
    //     })
    //   }
    getAllBanners: () => {
        return new Promise(async (resolve, reject) => {
            let categorydetails = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(categorydetails)
        })
    },
    deleteBanner: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(bannerId) }).then((response) => {
                //    console.log(response)
                resolve(response)
            })
        })
    },
    getBannerDetails: (bannerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(bannerId) }).then((bannerdetails) => {
                resolve(bannerdetails)
            })
        })
    },
    updateBanner: (bannerId, bannerDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) }, {
                $set: {
                    name: bannerDetails.name,
                    description: bannerDetails.description
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    /* -------------------------------------------------------------------------- */
  /*                    ADD CATEGORY OFFER                                      */
  /* -------------------------------------------------------------------------- */

  addCategoryOffer:({category,offerPercentage,expDate})=>{
    let categoryOffer=parseInt(offerPercentage);
    offer=categoryOffer;
    
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CATEGORY_COLLECTION).updateOne({name:category},{
        $set:{
          offer:offer,
          ExpiryDate:expDate,
          offerApply:true
        }
      },{upsert:true}).then(()=>{
        resolve(category)
      })
    })
  },




  getProductForOffer:(category)=>{
    return new Promise(async(resolve,reject)=>{
      let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category}).toArray()
      resolve(products)
    })
  },



  addOfferToProduct:({category,offerPercentage},product)=>{
  
    let offerP=parseInt(offerPercentage);
    offerPercentage=offerP;
    let productPricee=parseInt(product.price);
    product.price=productPricee;

    let offerPrice=parseInt((offerPercentage/100)*product.price);
    let totalPrice=product.price-offerPrice;
    totalPrice = Math.round(totalPrice)
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:product._id,category:category},
        {
          $set:{
            discountPercentage:offerPercentage,
            categoryDiscount:offerPrice,
            price:totalPrice,
            originalPrice:product.price
          }
        }).then(()=>{
          resolve()
        })
    })
},
removeCategoryOffer:(catId)=>{
    return new Promise(async(resolve,reject)=>{
        let catDet = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
        let category = catDet.name
        console.log('this is cat details',catDet)
          db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{
            $unset:{
                    ExpiryDate:"",
                    offerApply:"",
                    offer:""
                }
        }).then((response)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateMany({category:category},{
                $unset:{
                    categoryDiscount: "",
                    discountPercentage: "",
                    originalPrice:""
                }
            }).then((respo)=>{
                resolve(respo)
            })
        })
        
        
    })
}
   
}