(
    function (){
     var total = parseInt(document.getElementById("totalAmount").innerText)
     var elem = document.getElementById("userWallet")
     var userWallet = elem.getAttribute("value")
     console.log(total,userWallet);
     console.log(typeof(total));
     if (total>userWallet){
        document.getElementById("walletErr").innerText='Wallet Amount Insufficient to make payment'
        document.getElementById("wallet").disabled = true;
        setTimeout("document.getElementById('walletErr').style.display='none';", 3000);
     }
    }
)();