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
let request = indexedDB.open("Camera", 1);

// occurs on success of request
request.addEventListener("success", function() {
    dbAccess = request.result; // stores access of db
});

// occurs when new database created or version changed
// in our case, only when new database is created
// as version remains same 
request.addEventListener("upgradeneeded", function() {
    let db = request.result; // database access, variable not required outside this scope
    // after this event, in 'success' event dbAccess will be stored globally
    db.createObjectStore("gallery", { keyPath: "mId" });
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
    galleryObjectStore.add(data); // add data
}