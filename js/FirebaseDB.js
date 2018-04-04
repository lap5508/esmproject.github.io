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

function iconStuff(){
    database.ref("Data/nodes/19/icons/").set("'\uf0d6'");
}

function setLinks(links, nodes) {
    console.log("saved links to Firebase");
    for(var i = 0; i < links.length; i++){
        for(var j = 0; j < nodes.length; j++){
            if(links[i].source == nodes[j].node){
                links[i].source = nodes[j].name;
            } else if (links[i].target == nodes[j].node){
                links[i].target = nodes[j].name;
            }
        }
    }
    database.ref("Data/links/").set(links);
}

function getTheData(callback){
    database.ref("Data/").once("value").then(snapshot => {
        var data = snapshot.val();
        var savedLinks = data.links;
        var nodes = data.nodes;
        console.log(savedLinks);
        for(var i = 0; i < savedLinks.length; i++){
            for(var j = 0; j < nodes.length; j++){
                nodes[j].node = j;
                if(savedLinks[i].target == nodes[j].name){
                    savedLinks[i].target = nodes[j].node;
                } else if (savedLinks[i].source == nodes[j].name){
                    savedLinks[i].source = nodes[j].node;
                }
            }
        }

        console.log(data);

        data.links = savedLinks;

        callback(data);
});
}
