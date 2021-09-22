// GLOBAL VARIABLES
// filters (declared below)
// zoom variables (declared below)

// query selector
let body = document.querySelector("body");
let video = document.querySelector("video");
let videobtn = document.querySelector("button#record");
let imagebtn = document.querySelector("button#capture");
// let audio = document.querySelector("audio");

let mediaRecorder; // initialized at line 34
let isRecording = false; // recording flag
let chunks = []; // stores video data in parts
let filter = ""; // current filter, will be used for 2 tasks:-
// 1. apply filter to UI
// 2. apply filter to image while downloading

// recording video functionality **************************************************************************************************************
videobtn.addEventListener("click", () => {
    // let recordButton = document.querySelector(".record-circle");
    let recordButton = videobtn.querySelector("div"); // same as above
    if (isRecording) {
        isRecording = false;
        mediaRecorder.stop();
        recordButton.classList.remove("record-animation"); // removes animation property
    } else {
        isRecording = true;
        // this project doesn't do filtering in recording video
        // as it requires a certain algo to smoothen the process, without algo it is GPU extensive
        filter = "";
        removeFilter();
        // same reason as above for not zooming in video
        currZoom = 1;
        video.style.transform = "scale(1)";

        mediaRecorder.start();
        recordButton.classList.add("record-animation"); // adds animation property
    }
});


// constraints is object that we pass in the following function
let constraints = { video: true, audio: false };
// navigator is BOM element (Browser Object Model)
// mediaDevices is all the hardware that browser can access
// getUserMedia is a promise
navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
        video.srcObject = mediaStream; // giving source to video tag
        // audio.srcObject = mediaStream;   // with audio:true in constraints

        mediaRecorder = new MediaRecorder(mediaStream);
        // is data is available, means video is being recorded
        mediaRecorder.addEventListener("dataavailable", (e) => {
            chunks.push(e.data);
        });

        mediaRecorder.addEventListener("stop", () => {
            let blob = new Blob(chunks, { type: "video/mp4" });
            chunks = []; // reset chunks

            // // OLD CODE - for downloading the file
            // let url = URL.createObjectURL(blob);
            // let a = document.createElement("a");
            // a.href = url;
            // a.download = "video.mp4";
            // a.click();
            // a.remove();

            // saving file to database
            addMedia("vid", blob);
        });
    });

// adding event listener to capture button ****************************************************************************************
imagebtn.addEventListener("click", () => {
    // let captureButton = document.querySelector("div.capture-circle");
    let captureButton = imagebtn.querySelector("div"); // same as above
    captureButton.classList.add("capture-animation"); // adds capture-animation class
    setTimeout(function() {
        captureButton.classList.remove("capture-animation"); // removes capture-animation class after 400ms
    }, 400);
    capture(); // capture image function
});

// function to capture the current frame in the video tag
function capture() {
    let c = document.createElement("canvas");
    c.width = video.videoWidth; // videoWidth = width of current content
    c.height = video.videoHeight; // videoHeight = height of current content

    let ctx = c.getContext("2d");

    ctx.translate(c.width / 2, c.height / 2); // shift origin from top-left (0,0) to center of image
    ctx.scale(currZoom, currZoom); // increases the size of the content in the canvas, canvas width & height remain same
    ctx.translate(-c.width / 2, -c.height / 2); // shift origin back to top-left (0,0) to capture the zoomed image in next step

    ctx.drawImage(video, 0, 0); // current frame of video tag acts as an image

    // applying filter to the image
    if (filter != "") {
        ctx.fillStyle = filter;
        ctx.fillRect(0, 0, c.width, c.height);
    }

    // // OLD CODE - downloading
    // let a = document.createElement("a");
    // a.download = "img.png";
    // a.href = c.toDataURL(); // canvas method to get dataURL directly 
    // a.click();
    // a.remove();

    // saving file to database
    // c.toDataUrl() returns a URL with the image in binary format included
    addMedia("img", c.toDataURL());
}

// apply eventListeners to all filters ****************************************************************************************************
let filters = document.querySelectorAll(".filter");
filters.forEach((ftr) => {
    ftr.addEventListener("click", function(e) {
        // global variable declared
        filter = e.currentTarget.style.backgroundColor;
        // 1. apply filter to UI
        removeFilter(); // from UI
        applyFilter(filter); // to UI
    });
});

// function to remove current filter
function removeFilter() {
    let filterDiv = document.querySelector(".filter-div");
    if (filterDiv) { // check if filterDiv exists
        filterDiv.remove();
    }
}

// function to apply new filter
function applyFilter(ftr) {
    if (ftr != "") { // proceed if filter is available
        let filterDiv = document.createElement("div");
        filterDiv.classList.add("filter-div"); // apply predefined properties 
        filterDiv.style.backgroundColor = ftr; // apply new filter to filterDiv
        body.appendChild(filterDiv); // append to body
    }
}

// zoom button functionality and its variables *********************************************************************************************
let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");

let minZoom = 1; // minimum zoom scale
let maxZoom = 3; // maximum zoom scale
let currZoom = 1; // current zoom scale

zoomIn.addEventListener("click", function() {
    if (currZoom < maxZoom) {
        currZoom += 0.1;
        video.style.transform = `scale(${currZoom})`; // only changes on UI
    }
});

zoomOut.addEventListener("click", function() {
    if (currZoom > minZoom) {
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`; // only changes on UI
    }
});

// *********** GALLERY ***********
let galleryButton = document.querySelector(".gallery");
galleryButton.addEventListener("click", () => {
    location.assign("./gallery.html");
});