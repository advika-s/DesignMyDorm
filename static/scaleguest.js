var uploaded_image = "";
var img = null;
var ctx = null;
var canvas = null;
var background = null;
const transform = document.getElementById("transform");
const deleteTrans = document.getElementById("delete");
const design = document.getElementById("design");
var array = Array();
var img_url = "https://res.cloudinary.com/dknnedaba/image/upload/v1669617934/Screen_Shot_2022-11-28_at_1.43.44_AM_tu9ocb.png";
const cloudName = "dknnedaba";
const uploadPreset = "ml_default";

try {
    const myWidget = cloudinary.createUploadWidget(
    {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
    },
    (error, result) => {
        if (!error && result && result.event === "success") {
            widthX = window.innerWidth * .8;
            heightY = window.innerWidth * .4;
            img_url = result.info.secure_url;
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            img = new Image();
            img.crossOrigin = "anonymous";
            if (curBackground != null) {
                curBackground.destroy();
            }
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

                uploaded_image = canvas.toDataURL();

                var imageObj = new Image();
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
                    curBackground = background;
                    layer.add(background);
                    background.moveToBottom();
                };
                imageObj.src = uploaded_image;
            }
        }
    }
    );

    document.getElementById("upload_widget").addEventListener(
    "click",
    function () {
        myWidget.open();
    },
    false
    );

    var widthX = window.innerWidth * .8;
    var heightY = window.innerWidth * .4;
                
    var stage = new Konva.Stage({
        container: 'container',
        width: widthX,
        height: heightY,
    });

    stage.container().style.backgroundColor = 'white';

    var layer = new Konva.Layer();
    stage.add(layer);
    var curBackground = null;
    var curBox = null;
    var curTransformer = null;
    var click = 0;

    transform.addEventListener("click", onClickTransform);
    deleteTrans.addEventListener("click", onClickDelete);
    design.addEventListener("click", onClickDesign);

    function onClickDelete() {
        curBox.destroy();
        curTransformer.destroy();
        click = 0;
    }

    function onClickDesign() {
        document.cookie = "img_url=" + img_url;
        let totalArea = 0;
        array.forEach(box => {
            if (box != null) {
                w = box.width() * box.scaleX();
                h = box.height() * box.scaleY();
                totalArea += w * h;
            }
        });
        if (totalArea == 0) {
            alert("Please add boxes that cover your dorm.");
        }
        else {
            let actualArea = document.getElementById("actualArea").value;
            if (actualArea === "" || Number(actualArea) <= 0 || isNaN(actualArea) || isNaN(parseFloat(actualArea))) {
                alert("Please enter valid dimensions for the actual area "
                + "of your dorm. The actual area of your dorm cannot be "
                + "unspecified and must be a number greater than 0.");
            }
            else {
                let scale = (totalArea / actualArea) / window.innerWidth;
                if (scale > 1.4) {
                    alert("Your scale appears to be unreasonable for our  "
                    + "design interface. Please double check your boxes and "
                    + "actual area.");
                }
                else {
                    document.cookie = "scale=" + scale.toString();
                    window.location.href = '/designguest';
                }
            }
        }
    }

    function onClickTransform() {
        createTransformer();
    }

    function createTransformer() {
        var box = new Konva.Rect({
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            fill: 'pink',
            draggable: true,
        });

        var transformer = new Konva.Transformer({
            anchorStroke: 'white',
            anchorFill: 'skyblue',
            anchorSize: 10,
            borderStroke: 'pink',
            borderDash: [3, 3],
            nodes: [box],
            flipEnabled: false,
        });

        setUp(box, transformer);
    }

    function setUp(box, transformer) {
        box.on('dragmove', () => {
            curBox = setBox(box, curBox);
            curTransformer = transformer;
        });

        box.on('click', function() {
            curBox = setBox(box, curBox);
            curTransformer = transformer;
        });

        box.on('transform', function() {
            curBox = setBox(box, curBox);
            curTransformer = transformer;
        });

        array.push(box);
        layer.add(box);
        layer.add(transformer);

        curBox = setBox(box, curBox);
        curTransformer = transformer;
    }

    function bounds(box) {
        if (curTransformer != null) {
            if (String(curTransformer.getActiveAnchor()) == "bottom-left") {
                bounds2(box);
                return;
            }
            if (String(curTransformer.getActiveAnchor()) == "bottom-right") {
                bounds2(box);
                return;
            }
            if (String(curTransformer.getActiveAnchor()) == "top-left") {
                bounds2(box);
                return;
            }
            if (String(curTransformer.getActiveAnchor()) == "top-right") {
                bounds2(box);
                return;
            }
        }
        let rebound = false;
        let rot = box.rotation() % 360;
        if (rot < 0) {
            rot = 360 - Math.abs(rot) 
        }
        rot = (Math.PI * rot) / 180;
        let h = box.height() * box.scaleY();
        let w = box.width() * box.scaleX();
        if (rot < Math.PI / 2) {
            let sine = Math.sin(rot);
            let cosine = Math.cos(rot);
            box.y(Math.max(box.y(), 5));
            box.x(Math.max(box.x(), h * sine + 5));
            box.x(Math.min(box.x(), widthX - w * cosine - 5));
            box.y(Math.min(box.y(), heightY - h * cosine - w * sine - 5));
            if (box.y() < 5 || box.y() > heightY - h * cosine - w * sine - 5) {
                if (box.scaleY() > 0.1) {
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
            if (box.x() < h * sine + 5 || box.x() > widthX - w * cosine - 5) {
                if (box.scaleX() > 0.1) {
                    box.scaleX(.99 * box.scaleX());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
        }
        else if (rot < Math.PI) {
            let sine = Math.sin(rot - (Math.PI / 2));
            let cosine = Math.cos(rot - (Math.PI / 2));
            box.y(Math.max(box.y(), h * sine + 5));
            box.x(Math.max(box.x(), w * sine + h * cosine + 5));
            box.x(Math.min(box.x(), widthX - 5));
            box.y(Math.min(box.y(), heightY - w * cosine - 5));
            if (box.x() < w * sine + h * cosine + 5 || box.x() > widthX - 5) {
                if (box.scaleX() > 0.1) {
                    box.scaleX(.99 * box.scaleX());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
            if (box.y() < h * sine + 5 || box.y() > heightY - w * cosine - 5) {
                if (box.scaleY() > 0.1) {
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
        }
        else if (rot < (Math.PI * 1.5)) {
            let sine = Math.sin(rot - Math.PI);
            let cosine = Math.cos(rot - Math.PI);
            box.y(Math.max(box.y(), h * cosine + w * sine + 5));
            box.x(Math.max(box.x(), w * cosine + 5));
            box.x(Math.min(box.x(), widthX - h * sine - 5));
            box.y(Math.min(box.y(), heightY - 5));
            if (box.x() < w * cosine + 5 || box.x() > widthX - h * sine - 5) {
                if (box.scaleX() > 0.1) {
                    box.scaleX(.99 * box.scaleX());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
            if (box.y() < h * cosine + w * sine + 5 || box.y() > heightY - 5) {
                if (box.scaleY() > 0.1) {
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
        }
        else if (rot < 2 * Math.PI) {
            let sine = Math.sin(rot - (Math.PI * 1.5));
            let cosine = Math.cos(rot - (Math.PI * 1.5));
            box.y(Math.max(box.y(), w * cosine + 5));
            box.x(Math.max(box.x(), 5));
            box.x(Math.min(box.x(), widthX - h * cosine - w * sine - 5));
            box.y(Math.min(box.y(), heightY - h * sine - 5));
            if (box.x() < 5 || box.x() > widthX - h * cosine - w * sine - 5) {
                if (box.scaleX() > 0.1) {
                    box.scaleX(.99 * box.scaleX());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
            if (box.y() < w * cosine + 5 || box.y() > heightY - h * sine - 5) {
                if (box.scaleY() > 0.1) {
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
                else {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
                }
            }
        }
        if (box.scaleX() < .1) {
            box.scaleX(.1);
            return;
        }
        if (box.scaleY() < .1) {
            box.scaleY(.1);
            return;
        }
        if (rebound == true) bounds(box);
    }

    function bounds2(box) {
        let rebound = false;
        let rot = box.rotation() % 360;
        if (rot < 0) {
            rot = 360 - Math.abs(rot) 
        }
        rot = (Math.PI * rot) / 180;
        let h = box.height() * box.scaleY();
        let w = box.width() * box.scaleX();
        if (rot < Math.PI / 2) {
            let sine = Math.sin(rot);
            let cosine = Math.cos(rot);
            box.y(Math.max(box.y(), 5));
            box.x(Math.max(box.x(), h * sine + 5));
            box.x(Math.min(box.x(), widthX - w * cosine - 5));
            box.y(Math.min(box.y(), heightY - h * cosine - w * sine - 5));
            if (box.y() < 5 || box.y() > heightY - h * cosine - w * sine - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
            if (box.x() < h * sine + 5 || box.x() > widthX - w * cosine - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
        }
        else if (rot < Math.PI) {
            let sine = Math.sin(rot - (Math.PI / 2));
            let cosine = Math.cos(rot - (Math.PI / 2));
            box.y(Math.max(box.y(), h * sine + 5));
            box.x(Math.max(box.x(), w * sine + h * cosine + 5));
            box.x(Math.min(box.x(), widthX - 5));
            box.y(Math.min(box.y(), heightY - w * cosine - 5));
            if (box.x() < w * sine + h * cosine + 5 || box.x() > widthX - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
            if (box.y() < h * sine + 5 || box.y() > heightY - w * cosine - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
        }
        else if (rot < (Math.PI * 1.5)) {
            let sine = Math.sin(rot - Math.PI);
            let cosine = Math.cos(rot - Math.PI);
            box.y(Math.max(box.y(), h * cosine + w * sine + 5));
            box.x(Math.max(box.x(), w * cosine + 5));
            box.x(Math.min(box.x(), widthX - h * sine - 5));
            box.y(Math.min(box.y(), heightY - 5));
            if (box.x() < w * cosine + 5 || box.x() > widthX - h * sine - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
            if (box.y() < h * cosine + w * sine + 5 || box.y() > heightY - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
        }
        else if (rot < 2 * Math.PI) {
            let sine = Math.sin(rot - (Math.PI * 1.5));
            let cosine = Math.cos(rot - (Math.PI * 1.5));
            box.y(Math.max(box.y(), w * cosine + 5));
            box.x(Math.max(box.x(), 5));
            box.x(Math.min(box.x(), widthX - h * cosine - w * sine - 5));
            box.y(Math.min(box.y(), heightY - h * sine - 5));
            if (box.x() < 5 || box.x() > widthX - h * cosine - w * sine - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
            if (box.y() < w * cosine + 5 || box.y() > heightY - h * sine - 5) {
                    box.scaleX(.99 * box.scaleX());
                    box.scaleY(.99 * box.scaleY());
                    rebound = true;
            }
        }
        if (box.scaleX() < .1) {
            box.scaleX(.1);
            return;
        }
        if (box.scaleY() < .1) {
            box.scaleY(.1);
            return;
        }
        if (rebound == true) bounds2(box);
    }

    function setBox(box, curBox) {
        if (click == 1) curBox.fill("skyblue");
        box.fill("pink");
        click = 1;
        bounds(box);
        return box;
    }

    function fitStageIntoContainer() {
        var scaleChange = window.innerWidth * .8 / widthX;
        
        stage.width(widthX * scaleChange);
        stage.height(heightY * scaleChange);
        stage.scale({ x : scaleChange, y : scaleChange});

        widthX = window.innerWidth * .8;
        heightY = window.innerWidth * .4;

        if (ctx != null) {
            width = img.naturalWidth;
            height = img.naturalHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
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

            uploaded_image2 = canvas.toDataURL();

            background.x((widthX - width) / 2);
            background.y((heightY - height) / 2);
            background.width(width);
            background.height(height);
            imageObj2 = new Image();
            imageObj2.onload = function() {
                background.fillPatternImage(imageObj2);
            }
            imageObj2.src = uploaded_image2;

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

        array.forEach(box => {
            if (box != null) {
                if (box.width() != 0) {
                    box.scaleX(box.scaleX() * scaleChange);
                    box.scaleY(box.scaleY() * scaleChange);
                    box.x(box.x() * scaleChange);
                    box.y(box.y() * scaleChange);
                }
            }
        });
    }

    window.addEventListener('resize', fitStageIntoContainer);

    var timeout = false;
    var firstTime = true;
} catch(ReferenceError) {
    alert("There appears to be an issue loading this page properly. "
         + "Please try refreshing until you do not get this pop up.");
}