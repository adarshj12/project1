var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')

module.exports={
    doSignup:(userData)=>{
             return new Promise(async(resolve,reject)=>{
                // checking email if exist
                // let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.useremail})
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
                if(user){
                    resolve({status:false})
                }else{
                    // userData.userpassword =await bcrypt.hash(userData.userpassword,10)
                    userData.password =await bcrypt.hash(userData.password,10)
                    userData.wallet = parseInt(0)
                    console.log(userData);
                    db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                        resolve({status:true})    
                    })
                }
               
             
        })
       
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
           let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
           if (user?.isBlocked) {
            response.isBlocked=true
                      resolve(response)
           } else {
            if(user){
              
                bcrypt.compare(userData.password,user.password).then((status)=>{
                  if(status){
                      console.log("login success")
                      response.user=user
                      response.status=true
                      console.log('uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',response,'sddddddddddddddddddddddddddddddddddddd');
                    //   resolve(response)
                    resolve(response)
                  }else{
                      
                      console.log("login failed")
                      response.status=false
                      resolve(response)
                  }
                })
             }else{
              console.log("user not entered")
              console.log("login failed");
              response.status=false
              resolve(response)
             }
           }
           
        })
    },
    verifyMobile:(mobileNumber)=>{
        return new Promise(async(resolve,reject)=>{
                let user= await db.get().collection(collection.USER_COLLECTION).findOne({mobile:mobileNumber})
                if(user){
                    resolve({status:true})
                }else
                resolve({status:false})
        })
    },
    addAddress: (entry,userId) => {
        console.log(entry);
        return new Promise(async(resolve, reject) => {
            let Address ={
                        _id: new ObjectId(),
                        CustomerName: entry.name,
                        contactNumber: entry.contactNumber,
                        email: entry.email,
                        address: entry.address,
                        state: entry.state,
                        country: entry.country,
                        pincode: entry.pin
                }
            
         
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $push:{
                    
                    Address
                }
            })
            .then((response) => {
                console.log(response); 
                resolve(response)
                
            })
        })
    },
    deleteAddress:(userId,addrId)=>{
        console.log(userId+'-'+addrId);
        return new Promise(async(resolve, reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                $pull:{
                    Address:{_id:ObjectId(addrId)}
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    editProfile:async(userId,userdetails)=>{
        console.log(userId,userdetails);
        let passw = await bcrypt.hash(userdetails.password,10)
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{
                
                $set:{
                    name: userdetails.name,
                    mobile: userdetails.contactNumber,
                    email: userdetails.email ,
                    password: passw
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    editAddress: async(userId,userdetails)=>{
        console.log('saasasasasasasaas',userId,userdetails);
        let Adrid = userdetails._id
        console.log(Adrid);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId),"Address._id":ObjectId(Adrid)},{
                $set:{
                    "Address.$.CustomerName":userdetails.name,
                    "Address.$.contactNumber":userdetails.contactNumber,
                    "Address.$.email":userdetails.email,
                    "Address.$.address":userdetails.address,
                    "Address.$.state":userdetails.state,
                    "Address.$.country":userdetails.country,
                    "Address.$.pincode":userdetails.pin
                }
            }).then((response)=>{
                resolve(response)
                console.log(response);
            })
        })
    },
    getAddress: async(userId,addrId)=>{
        {
            console.log(userId);
            return new Promise((resolve, reject) => {
             let address=   db.get().collection(collection.USER_COLLECTION).
                aggregate([
                  {
                    $match: { _id: ObjectId(userId) },
                  },
                  {
                    $unwind: "$Address",
                  },
                  {
                    $project: {
                      CustomerName: "$Address.CustomerName",
                      contactNumber: "$Address.contactNumber",
                      email: "$Address.email",
                      address: "$Address.address",
                      state: "$Address.state",
                      country: "$Address.country",
                      pincode:"$Address.pincode", 
                      _id:"$Address._id",
                    },
                  },
             
                  {
                    $project: {
                        CustomerName:1,
                        contactNumber:1,
                        email:1,
                        address:1,
                        state:1,
                        country: 1,
                        pincode:1,
                        _id:1
                    },
                  },
                  {
                    $match: { _id: ObjectId(addrId) },
                  },
                 
                ]).toArray()
                resolve(address)
            })
          
          }
    }
}