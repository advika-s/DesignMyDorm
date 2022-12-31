// code modified from https://stackoverflow.com/questions/4603289/how-to-detect-that-javascript-and-or-cookies-are-disabled

function checkCookieChrome(){
    var cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled){ 
        document.cookie = "testcookie";
        cookieEnabled = document.cookie.indexOf("testcookie")!=-1;
    }
    return cookieEnabled || showCookieFail();
}

function checkCookieSafari(){
    var cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled){ 
        document.cookie = "testcookie";
        cookieEnabled = document.cookie.indexOf("testcookie")!=0;
    }
    return cookieEnabled || showCookieFail();
}

function showCookieFail(){
  alert("It appears you have cookies disabled. Please enable cookies before continuing"
  + " or you might encounter unexpected errors while using DesignMyDorm.")
}

checkCookieChrome();
checkCookieSafari();