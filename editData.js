var nodes, links;

function readInObject () {
    console.log("inside function");
    var request = new XMLHttpRequest();
    request.open("GET", "data.json", false);
    request.overrideMimeType("application/json");
    request.send(null);
    var my_JSON_object = JSON.parse(request.responseText);
    nodes = my_JSON_object.nodes;
    links = my_JSON_object.links;

    var sel = document.getElementById('nodeDropdown');
    for(var i = 0; i < nodes.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = nodes[i].name;
        opt.value = nodes[i].node;
        sel.appendChild(opt);
    }

    // for(var i = 0; i < nodes.length; i ++){
    //     console.log(nodes[i].name);

    // }
}

function findLinks(){

    console.log("inide");
    var sel = document.getElementById('nodeDropdown');
    var val = sel.options[sel.selectedIndex].value;
    console.log(val);

    var nodeLinks = [];
    for(var i = 0; i < links.length; i++){
        if(links[i].target == val){
            console.log("found target");
            nodeLinks.push(nodes[links[i].source]);
        } else if (links[i].source == val){
            console.log("found source");
            nodeLinks.push(nodes[links[i].target]);
        }
    }

    var sel = document.getElementById('linksDropdown');
    removeOptions(sel);
    for(var i = 0; i < nodeLinks.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = nodeLinks[i].name;
        opt.value = nodeLinks[i].node;
        sel.appendChild(opt);
    }

    findNewPossibleLinks(val);

}

function findNewPossibleLinks(val){
    var possibleLinks = [];
    switch(nodes[val].column){
        case 0:
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].column == 1){
                    possibleLinks.push(nodes[i]);
                }
            }
            break;
        case 1:
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].column == 0 || nodes[i].column == 2){
                    possibleLinks.push(nodes[i]);
                }
            }
            break;
        case 2:
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].column == 1){
                    possibleLinks.push(nodes[i]);
                }
            }
            break;
    }

    var sel2 = document.getElementById('newPossibleLinks');
    removeOptions(sel2);
    for(var i = 0; i < possibleLinks.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = possibleLinks[i].name;
        opt.value = possibleLinks[i].node;
        sel2.appendChild(opt);
    }

}

function createNewLink () {
    var origin = document.getElementById('nodeDropdown');
    var originVal = origin.options[origin.selectedIndex].value;

    var dest = document.getElementById('newPossibleLinks');
    var destVal = dest.options[dest.selectedIndex].value;

    switch(nodes[originVal].column){
        case 0:
            if(nodes[destVal].column == 1){
                //create link with source as origin and target as destination
                links.push({
                    "source": originVal,
                    "color": "#859900",
                    "target": destVal,
                    "value": 6
                });
                console.log(links);
            }
            download();
            break;
        case 1:
            if(nodes[destVal].column == 0){
                //create link with source as destination and target as origin

            } else if (nodes[destVal].column == 2){
                //create link with source as origin and target as destination

            }
            break;
        case 2:
            if(nodes[destVal].column == 1){
                //create link with source as destination and target as origin

            }
            break;
    }

    console.log(originVal);
    console.log(destVal);
}

function removeOptions(selectBox){
    for(var i = 0; i < selectBox.options.length; i++){
        selectBox.options[i] = null;
    }
}

function download(){
    //var a = document.createElement("a");
    var string1 = JSON.stringify(nodes);
    var string2 = JSON.stringify(links);
    var finalString = string1.concat(string2);
    //console.log(finalString);
    // var file = new Blob(links, {type: "text/json"});
    // a.href= URL.createObjectURL(file);
    // a.download= "newData.json";
    // a.click();
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(finalString));
    a.setAttribute('download', "newData.json");
    a.click();
}