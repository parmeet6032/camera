// Database create/open
// Database objectStore --> gallery
// photo capture / video record
// format:
// data = {
//     mId: 2718321931,
//     type: "img"/ "vid",
//     media: actual content (URL (c.toDataUrl) for photo, BLOB for video)
// }

// Database: Camera
// Version: 1
let dbAccess;
let request = indexedDB.open("Camera-App", 1);

// occurs on success of request
request.addEventListener("success", function() {
    dbAccess = request.result; // stores access of db
    console.log("success");
});

// occurs when new database created or version changed
// in our case, only when new database is created
// as version remains same 
request.addEventListener("upgradeneeded", function() {
    let db = request.result; // database access, variable not required outside this scope
    // after this event, in 'success' event dbAccess will be stored globally
    db.createObjectStore("gallery", { keyPath: "mId" });
    console.log("upgraded");

});

// occurs when there is error
request.addEventListener("error", function() {
    alert("some error occurred");
});

// function to add media to database
function addMedia(type, media) {
    let tx = dbAccess.transaction("gallery", "readwrite"); // transaction
    let galleryObjectStore = tx.objectStore("gallery"); // select object store
    let data = {
        mId: Date.now(),
        type,
        media
    };
    // console.log(data);
    galleryObjectStore.add(data); // add data
}

// function to display media on Gallery.html
function viewMedia() {
    // Assumption: dbAccess granted
    let tx = dbAccess.transaction("gallery", "readonly");
    let galleryObjectStore = tx.objectStore("gallery");
    let req = galleryObjectStore.openCursor();

    let container = document.querySelector(".media");

    req.addEventListener("success", function() {
        let cursor = req.result;
        if (cursor) {
            let div = document.createElement("div");
            div.classList.add("media-card");
            div.innerHTML = `
                <div class="media-container">
                </div>
                <div class="action-container">
                    <button class="media-download" data-id="${cursor.value.mId}">
                        Download
                    </button>
                    <button class="media-delete" data-id="${cursor.value.mId}">
                        Delete
                    </button>
                </div>
            `;

            let deleteButton = div.querySelector(".media-delete");
            deleteButton.addEventListener("click", (e) => {
                // get the ID that we wish to delete from DB
                let mId = e.currentTarget.getAttribute("data-id");
                // delete from UI
                e.currentTarget.parentElement.parentElement.remove();
                // delete from DB
                deleteMediaFromDB(mId);
            });

            let downloadButton = div.querySelector(".media-download");
            if (cursor.value.type == "img") {
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                img.src = cursor.value.media;

                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);

                downloadButton.addEventListener("click", (e) => {
                    let a = document.createElement("a");
                    let mId = e.currentTarget.parentElement.children[1].getAttribute("data-id");
                    a.download = `image_${mId}.png`;
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src;
                    a.click();
                    a.remove();
                });
            } else {
                let video = document.createElement("video");

                video.classList.add("media-gallery");
                video.src = window.URL.createObjectURL(cursor.value.media);

                video.addEventListener("mouseenter", () => {
                    video.currentTime = 0;
                    video.play();
                });
                video.addEventListener("mouseleave", () => {
                    video.pause();
                });

                video.controls = true;
                video.loop = true;

                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(video);

                downloadButton.addEventListener("click", (e) => {
                    let a = document.createElement("a");
                    let mId = e.currentTarget.parentElement.children[1].getAttribute("data-id");
                    a.download = `video_${mId}.mp4`;
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src;
                    a.click();
                    a.remove();
                });
            }
            container.appendChild(div);
            cursor.continue();
        }
    })
}

// function to delete data from DB
function deleteMediaFromDB(mId) {
    let tx = dbAccess.transaction("gallery", "readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    galleryObjectStore.delete(Number(mId));
}