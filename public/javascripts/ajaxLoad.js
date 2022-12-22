//var count = 0

 
//function addTocart(proId) {
 //   console.log('hello',proId)
  //  var elem = document.getElementById("img-container")
////var stk = elem.getAttribute("value")
//var limStk = document.getElementById("limitedstock")
 //   Swal.fire({
 //       position: 'center',
 //       icon: 'success',
 //       title: 'Item added to cart',
 //       showConfirmButton: false,
  // //     timer: 1500
  //    }).then(()=>{
 //       $.ajax({
 //           url:'/add-to-cart/'+proId,
  ///          method:'get',
 //           success:(response)=>{
 ///             console.log(response)
 //            console.log("stock",response.products.stock);
 //              console.log("cart count",response.userCart[0].limit);
 //              if(response.products.stock===response.userCart[0].limit){
 //                limStk.innerHTML="Product Out Of Stock"
 //                document.getElementById("addToCart").disabled = true;
//               }
 //              if (response.status) {
 //               let count=$('#cartCount').html()
 //               count =parseInt(count)+1
 //               $('#cartCount').html(count)
  //             }
 //           }
  //      })
 //     })
   
//}

function addTocart(proId) {

  console.log('hello',proId)
  var elem = document.getElementById("img-container")
var stk = elem.getAttribute("value")
var limStk = document.getElementById("limitedstock")
$.ajax({
  url:'/add-to-cart/'+proId,
  method:'get',
  success:(response)=>{
    console.log(response)
   console.log("stock",response.products.stock);
     console.log("cart count",response.userCart[0].limit);
     if(response.products.stock===response.userCart[0].limit){
       limStk.innerHTML="Product Out Of Stock"
       document.getElementById("addToCart").disabled = true;
     }
     if (response.status) {
      console.log('fffffffffffffff',response.status);
      let count=$('#cartCount').html()
      count =parseInt(count)+1
      $('#cartCount').html(count)
     }
  }
})
 
}