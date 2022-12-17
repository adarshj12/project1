var firstNameError = document.getElementById("name-error");
var emailError = document.getElementById("email-error")
var mobileError = document.getElementById("mobile-error")
var addressError = document.getElementById("address-error")
var countryError = document.getElementById("country-error")
var stateError = document.getElementById("state-error")
var pinError = document.getElementById("pin-error")
var submitError = document.getElementById("submit-error");




function validateCName(){
    var fname = document.getElementById("Contactname").value;
    if(fname.length ==0){
        firstNameError.innerHTML ='First Name required';
        return false;
    }
    if(!fname.match(/(^[a-zA-Z][a-zA-Z\s]{0,20}[a-zA-Z]$)/)){

        firstNameError.innerHTML = 'Invalid name';
        return false;
    }
    else{
    firstNameError.innerHTML = '' ;
    return true ;
    }
}


function validateCEmail(){
    var email = document.getElementById("email").value;
    if(email.length==0){
        emailError.innerHTML="Email required";
        return false;
    }
    if(!email.match(/^[a-zA-Z0-9.!#$%&’+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/)){

        emailError.innerHTML = 'Email Invalid';
        return false;

    }
    emailError.innerHTML="";
    return true;
}

function validateAddress(){
  var address = document.getElementById("address").value;
    if(address.length==0){
        addressError.innerHTML="Address required";
        return false;
    }
    addressError.innerHTML="";
    return true;
}

function validateCountry(){
  var country = document.getElementById("country").value;
    if(country.length==0){
        countryError.innerHTML="Country required";
        return false;
    }
    countryError.innerHTML="";
    return true;
}

function validateState(){
  var state = document.getElementById("state").value;
    if(state.length==0){
        stateError.innerHTML="State required";
        return false;
    }
    stateError.innerHTML="";
    return true;
}

function validatePin(){
    var pin = document.getElementById("pin").value;
    if(pin.length==0){
        pinError.innerHTML="Enter 6 digit ZIP code";
        return false;
    }
    if(!pin.match(/^\d{6}$/)){
    pinError.innerHTML="Enter valid ZIP code";
    return false;
    }
    pinError.innerHTML="";
    return true;
}

function validateCMobile(){
    var mobile = document.getElementById("contactNumber").value;
    if(mobile.length==0){
        mobileError.innerHTML="Enter 10 digit mobile number";
        return false;
    }
    if(!mobile.match(/^\d{10}$/)){
    mobileError.innerHTML="Enter valid mobile number";
    return false;
    }
    mobileError.innerHTML="";
    return true;
}


function validateCForm(){
    if(!validateCName()  || !validateCEmail() || !validateAddress() || !validateCMobile() || !validatePin()){
    
        submitError.innerHTML = 'Please select an address or fill the fields to submit';
        setTimeout(function(){submitError.style.display = 'none';} , 4000)
        return false;
    }

}