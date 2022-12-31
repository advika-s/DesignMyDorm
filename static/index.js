const bed = document.getElementById("bed");
const desk = document.getElementById("desk");
const dresser = document.getElementById("dresser");
const wardrobe = document.getElementById("wardrobe");
const bookshelf = document.getElementById("bookshelf");
const rotateClockwise = document.getElementById("rotateClockwise");
const rotateCC = document.getElementById("rotateCC");
const deleteOne = document.getElementById("deleteOne");
const deleteAll = document.getElementById("deleteAll");
const save = document.getElementById("save");
const custom = document.getElementById("custom");
const exportPNG = document.getElementById("export");
const load = document.getElementById("load");

var widthX = window.innerWidth * .8;
var heightY = window.innerWidth * .4;

var stage = new Konva.Stage({
    container: 'container',
    width: widthX,
    height: heightY,
});

stage.container().style.backgroundColor = 'white';

var rectX = 5;
var rectY = 5;

var layer = new Konva.Layer();
stage.add(layer);

var array = Array();

var curBox = null;
var click = 0;
var scale = .003 * Number(document.currentScript.getAttribute('scale')) * window.innerWidth;
var theta = 15;
var x = document.currentScript.getAttribute('json_string');
var png_name = String(document.currentScript.getAttribute('save_name')) + ".png";

bed.addEventListener("click", onClickBed);
desk.addEventListener("click", onClickDesk);
dresser.addEventListener("click", onClickDresser);
wardrobe.addEventListener("click", onClickWardrobe);
bookshelf.addEventListener("click", onClickBookshelf);
rotateClockwise.addEventListener("click", onClickRotateClockwise);
rotateCC.addEventListener("click", onClickRotateCC);
deleteOne.addEventListener("click", onClickDeleteOne);
deleteAll.addEventListener("click", onClickDeleteAll);
save.addEventListener("click", onClickSave);
custom.addEventListener("click", onClickCustom);
exportPNG.addEventListener("click", onClickExport);

img_url = document.currentScript.getAttribute('img_url')
document.cookie = "img_url=" + img_url;

var background = null;
var backdrop = null;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var img = new Image();
img.crossOrigin = "anonymous";
img.src = img_url;
img.onload = function() {
    var width = img.naturalWidth;
    var height = img.naturalHeight;
    wScale = widthX / width;
    hScale = heightY / height;
    if (wScale > hScale) {
        width *= hScale;
        height = heightY;
    }
    else {
        height *= wScale;
        width = widthX;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    let uploaded_image = canvas.toDataURL();

    imageObj = new Image();
    imageObj.onload = function() {
            xCoord = (widthX - width) / 2;
            yCoord = (heightY - height) / 2;
            background = new Konva.Rect({
                x: xCoord,
                y: yCoord,
                width: width,
                height: height
            });
        background.fillPatternImage(imageObj);
        layer.add(background);
        background.moveToBottom();

        backdrop = new Konva.Rect({
            x: 0,
            y: 0,
            width: widthX,
            height: heightY,
            fill: 'white'
        });
        
        layer.add(backdrop);
        backdrop.moveToBottom();
    };
    imageObj.src = uploaded_image;
}

function fitStageIntoContainer() {
        oldWidthX = widthX;
        newWidthX = window.innerWidth * .8;
        newHeightY = window.innerWidth * .4;
        let scaleChange = window.innerWidth * .8 / oldWidthX;
        
        stage.width(oldWidthX * scaleChange);
        stage.height(heightY * scaleChange);
        stage.scale({ x : scaleChange, y : scaleChange });

        width = img.naturalWidth;
        height = img.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        wScale = newWidthX / width;
        hScale = newHeightY / height;
        if (wScale > hScale) {
            width *= hScale;
            height = newHeightY;
        }
        else {
            height *= wScale;
            width = newWidthX;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let uploaded_image2 = canvas.toDataURL();

        background.x((newWidthX - width) / 2);
        background.y((newHeightY - height) / 2);
        background.width(width);
        background.height(height);
        imageObj2 = new Image();
        imageObj2.onload = function() {
            background.fillPatternImage(imageObj2);
        }
        imageObj2.src = uploaded_image2;

        backdrop.width(newWidthX);
        backdrop.height(newHeightY);

        array.forEach(box => {
            if (box != null) {
                if (box.width() != 0) {
                    box.width(box.width() * scaleChange);
                    box.height(box.height() * scaleChange);
                    box.x(box.x() * scaleChange);
                    box.y(box.y() * scaleChange);
                    resizeFurnitureImage(box, curBox);
                }
            }
        });
        widthX = window.innerWidth * .8;
        heightY = window.innerWidth * .4;
        scale = scale * scaleChange;
        if (firstTime) {
            clearTimeout(timeout);
            timeout = setTimeout(fitStageIntoContainer, 0);
            timeout = false;
            firstTime = false;
        }
        else {
            firstTime = true;
        }
}

var firstTime = true;

function resizeFurnitureImage(box, curBox) {
    if (box == curBox) {
        img_string = "static/" + String(box.name()) + "clicked.png";
    }
    else {
        img_string = "static/" + String(box.name()) + ".png";
    }
    addTransparentLayer(box, img_string);
}

window.addEventListener('resize', fitStageIntoContainer);

var timeout = false;

function onClickBed() {
    createBox(scale * 38, scale * 84, "bed");
} 

function onClickDesk() {
    createBox(scale * 42, scale * 24, "desk");
} 

function onClickDresser() {
    createBox(scale * 24, scale * 24, "dresser");
} 

function onClickWardrobe() {
    createBox(scale * 48, scale * 24, "wardrobe");
}

function onClickBookshelf() {
    createBox(scale * 24, scale * 12, "bookshelf");
}

function onClickCustom() {
    let customW = document.getElementById("customW").value;
    let customH = document.getElementById("customH").value;
    if (customW === "" || customH === "" || Number(customW) <= 0 || Number(customH) <= 0 ||
    isNaN(customW) || isNaN(parseFloat(customW)) || isNaN(customH) || isNaN(parseFloat(customH))) {
        alert("Please enter valid dimensions for custom furniture. " +
        "Dimensions cannot be unspecified and must be a number greater than 0.");
    }
    customW = scale * Number(customW);
    customH = scale * Number(customH);
    if (customW > heightY * 0.7 || customH > heightY * 0.7) {
        alert("This custom furniture appears to be too big for our "
        + "design interface. Please try smaller custom furniture.");
    }
    else {
        createBox(customW, customH, "custom");
    }
}

function onClickDeleteAll() {
    if (confirm("Are you sure you want to delete all furniture? "
    + "Clicking OK will remove your current design, which will NOT be "
    + "saved automatically.")) {
        array.forEach(box => box.destroy());
        click = 0;
        array = []
    }
}

function onClickDeleteOne() {
    curBox.destroy();
    curBox.width(0);
    click = 0;
}

function onClickRotateClockwise() {
    curBox.rotate(theta);
    bounds(curBox);
}

function onClickRotateCC() {
    curBox.rotate(-theta);
    bounds(curBox);
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function onClickSave() {
    let savename = document.getElementById("savename").value;
    if (savename=== "") {
        alert("Please enter a valid Design Name.");
    }
    else if (isASCII(savename)==false) {
        alert("Please enter a valid Design Name. Design Name cannot "
        + "contain non-ASCII characters.");
    }
    else if (savename.length > 15) {
        alert("Design Name cannot exceed 15 characters. ")
    }
    else {
        furniture = []
        // width, height, x-coord, y-coord, angle, furniture type
        array.forEach(box => {
            if (box != null) {
                if (box.width() != 0) {
                    furniture.push(box.name());
                    furniture.push(box.width() / scale);
                    furniture.push(box.height() / scale);
                    furniture.push(box.rotation());
                    furniture.push(box.x() / scale);
                    furniture.push(box.y() / scale);
                }
            }
        });
        if (furniture.length == 0) {
            alert("Cannot save an empty floorplan.");
        }
        else {
            var json_string = JSON.stringify(furniture);
            document.cookie = "json_string=" + json_string;
            document.cookie = "savename=" + savename;
            document.cookie = "scale=" + (scale / (window.innerWidth * .003));
            window.location.href = '/save';
        }
    }
}

if (x != '') {
    x = JSON.parse(x)
    x = x.slice(1, x.length - 1)
    a = x.split(',')
    loadAll()  
}

function loadAll() {
    var i = 0;
    while (i < a.length) {
        loadBox(a[i], a[i + 1], a[i + 2], a[i + 3], a[i + 4], a[i+5]);
        i += 6;
    }
}

function loadBox(name, width, height, rotate, x, y) {
    var box = new Konva.Rect({
        x: Number(x * scale),
        y: Number(y * scale),
        width: Number(width * scale),
        height: Number(height * scale),
        stroke: 'black',
        strokeWidth: 4,
        draggable: true,
        name: name,
    })

    box.rotate(Number(rotate));

    img_string = "static/" + String(box.name()) + ".png";
    addTransparentLayer(box, img_string);

    setUpLoad(box);
}

function createBox(width, height, name) {
    var box = new Konva.Rect({
        x: rectX,
        y: rectY,
        width: width,
        height: height,
        stroke: 'black',
        strokeWidth: 4,
        draggable: true,
        name: name,
    });

    img_string = "static/" + String(box.name()) + "clicked.png";
    addTransparentLayer(box, img_string);

    setUp(box);
}

function setUpLoad(box) {
    box.on('dragmove', () => {
        curBox = setBox(box, curBox);
        bounds(box);
    });

    box.on('click', function() {
        curBox = setBox(box, curBox);
    });

    array.push(box);
    layer.add(box);
}

function setUp(box) {
    box.on('dragmove', () => {
        curBox = setBox(box, curBox);
        bounds(box);
    });

    box.on('click', function() {
        curBox = setBox(box, curBox);
    });

    array.push(box);
    layer.add(box);

    curBox = setBox(box, curBox);
}

function bounds(box) {
    let rot = box.rotation() % 360;
    if (rot < 0) {
        rot = 360 - Math.abs(rot) 
    }
    rot = (Math.PI * rot) / 180;
    let h = box.height();
    let w = box.width();
    if (rot < Math.PI / 2) {
        let sine = Math.sin(rot);
        let cosine = Math.cos(rot);
        box.y(Math.max(box.y(), 5));
        box.x(Math.max(box.x(), h * sine + 5));
        box.x(Math.min(box.x(), widthX - w * cosine - 5));
        box.y(Math.min(box.y(), heightY - h * cosine - w * sine - 5));
    }
    else if (rot < Math.PI) {
        let sine = Math.sin(rot - (Math.PI / 2));
        let cosine = Math.cos(rot - (Math.PI / 2));
        box.y(Math.max(box.y(), h * sine + 5));
        box.x(Math.max(box.x(), w * sine + h * cosine + 5));
        box.x(Math.min(box.x(), widthX - 5));
        box.y(Math.min(box.y(), heightY - w * cosine - 5));
    }
    else if (rot < (Math.PI * 1.5)) {
        let sine = Math.sin(rot - Math.PI);
        let cosine = Math.cos(rot - Math.PI);
        box.y(Math.max(box.y(), h * cosine + w * sine + 5));
        box.x(Math.max(box.x(), w * cosine + 5));
        box.x(Math.min(box.x(), widthX - h * sine - 5));
        box.y(Math.min(box.y(), heightY - 5));
    }
    else if (rot < 2 * Math.PI) {
        let sine = Math.sin(rot - (Math.PI * 1.5));
        let cosine = Math.cos(rot - (Math.PI * 1.5));
        box.y(Math.max(box.y(), w * cosine + 5));
        box.x(Math.max(box.x(), 5));
        box.x(Math.min(box.x(), widthX - h * cosine - w * sine - 5));
        box.y(Math.min(box.y(), heightY - h * sine - 5));
    }
}

function setBox(box, curBox) {
    if (click == 1) { 
        if (curBox != box) {
            img_string = "static/" + String(curBox.name()) + ".png";
            addTransparentLayer(curBox, img_string);
        }
    }
    img_string = "static/" + String(box.name()) + "clicked.png";
    addTransparentLayer(box, img_string);
    click = 1;
    return box;
}

function downloadURI(uri, name) {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function onClickExport() {
    var dataURL = stage.toDataURL({ pixelRatio: 3 });
    downloadURI(dataURL, png_name);
} 

function addTransparentLayer(box, img_string) {
    var canvas = document.createElement("canvas");
    var temp_ctx = canvas.getContext("2d");
    var temp_img = new Image();
    temp_img.crossOrigin = "anonymous";
    temp_img.src = img_string;
    temp_img.onload = function() {
        let temp_width = temp_img.naturalWidth;
        let temp_height = temp_img.naturalHeight;
        let temp_hScale = box.height() / temp_height;
        temp_width = box.width();
        temp_height = box.height();

        canvas.width = box.width();
        canvas.height = box.height();
        temp_ctx.drawImage(temp_img, 0, 0, temp_width, temp_height);
    
        let temp_uploaded_image = canvas.toDataURL();
    
        let temp_imageObj = new Image();
        temp_imageObj.onload = function() {      
            box.fillPatternImage(temp_imageObj);
        };
        
        temp_imageObj.src = temp_uploaded_image;
    }
}