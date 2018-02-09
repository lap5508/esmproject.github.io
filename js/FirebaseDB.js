// Initialize Firebase
var config = {
    apiKey: "AIzaSyDq4rnUqqUrdDLahomivoqSibmPye8mddM",
    authDomain: "esm-project-fb18e.firebaseapp.com",
    databaseURL: "https://esm-project-fb18e.firebaseio.com",
    projectId: "esm-project-fb18e",
    storageBucket: "esm-project-fb18e.appspot.com",
    messagingSenderId: "19502975565"
};
firebase.initializeApp(config);
var database = firebase.database();

function setNodes(nodes) {
    console.log("saved nodes to Firebase");
    database.ref("Data/nodes/").set(nodes);
}

function setLinks(links) {
    console.log("saved links to Firebase");
    database.ref("Data/links/").set(links);
}

function getTheData(callback){
    database.ref("Data/").once("value").then(snapshot => {
        callback(snapshot.val());
});
}
