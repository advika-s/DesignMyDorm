

/* ourButton = document.getElementById("mybutton"); */
ourButton = document.getElementById("mybutton");
theImgDiv = document.getElementById("card");
theImage = document.getElementById("cardimage");
click1 = 0;

ourButton2 = document.getElementById("mybutton2");
theImgDiv2 = document.getElementById("desk");
theImage2 = document.getElementById("deskimage");
click2 = 0;

ourButton.addEventListener("click", onClick1);
ourButton2.addEventListener("click", onClick2);

c = document.getElementById("canvas");

function onNav1mouseover() {
    
} 

function onNav1mouseoff() {
}
    

function onClick1() {
    if (click1 < 1) {
        theImgDiv.style.display = "block";
        click1 = 1;
    }
    else {
        theImgDiv.style.display = "none";
        click1 = 0;
    }
} 

function onNav2mouseover() {
    
} 

function onNav2mouseoff() {
    
} 

function onClick2() {
    ctx = c.getContext("2d");
    if (click2 < 1) {
        ctx.beginPath();
        ctx.lineWidth = "6";
        ctx.strokeStyle = "white";
        ctx.rect(5, 5, 200, 100); 
        ctx.stroke();
        click2 = 1;
    }
    else if (click2 < 2) {
        ctx.beginPath();
        ctx.lineWidth = "6";
        ctx.strokeStyle = "white";
        ctx.rect(220, 5, 200, 100); 
        ctx.stroke();
        click2 = 2;
    }
    else {
        ctx.beginPath();
        ctx.lineWidth = "6";
        ctx.strokeStyle = "skyblue";
        ctx.rect(5, 5, 200, 100);  
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = "6";
        ctx.strokeStyle = "skyblue";
        ctx.rect(220, 5, 200, 100); 
        ctx.stroke();
        click2 = 0;
    }
} 