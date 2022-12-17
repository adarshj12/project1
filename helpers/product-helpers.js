var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports = {
    addCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
            const date = new Date()
            categoryData.date=date.toDateString().slice(3)
            // checking category exist
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ name: categoryData.name })
            if (category) {
                resolve({ status: false })
            } else {
                
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryData).then((data) => {
                    let id =data.insertedId;
                    // resolve({ status: true })
                    resolve(id )
                })
            }
        })

    },
    addProduct: (productData) => {
        productData.price= parseInt(productData.price)
        productData.offerprice= parseInt(productData.offerprice)
        productData.stock = parseInt(productData.stock)
        return new Promise(async (resolve, reject) => {
            const date = new Date()
            productData.date=date.toDateString().slice(3)
            {
                ;
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
                    let id =data.insertedId;
                    
                    resolve(id )
                })
            }
        })

    },
    addBanner: (bannerData) => {
        return new Promise(async (resolve, reject) => {
            const date = new Date()
            bannerData.date=date.toDateString().slice(3)
           
            let banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({ name: bannerData.name })
            if (banner) {
                resolve({ status: false })
            } else {
                ;
                db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerData).then((data) => {
                    let id =data.insertedId;
                    resolve(id )
                })
            }
        })

    },

}