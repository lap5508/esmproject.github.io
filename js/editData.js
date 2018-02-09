var nodes, links;

function readInObject () {
    //CHANGE THIS TO USE FIREBASE!!!!!!!!

    getTheData(function(data){
        console.log(data);
        nodes = data.nodes;
        links = data.links;
    });

    // console.log("inside function");
    // var request = new XMLHttpRequest();
    // request.open("GET", "data.json", false);
    // request.overrideMimeType("application/json");
    // request.send(null);
    // var my_JSON_object = JSON.parse(request.responseText);
    // nodes = my_JSON_object.nodes;
    // links = my_JSON_object.links;
}

function sortByColumnWWD(){

    console.log("filtering");

    var sel = document.getElementById('nodeDropdown');

    console.log(sel.options.length);

    $("#nodeHeader").text("Select ESM: What We Do");
    $("#nodeDropdown").empty();

    for(var i = 0; i < nodes.length; i++) {
        console.log(nodes[i].column);
        var opt = document.createElement('option');
        if(nodes[i].column == 1){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            sel.appendChild(opt);
        }
    }
}

function sortByColumnImpacts(){

    console.log("filtering");

    var sel = document.getElementById('nodeDropdown');

    console.log(sel.options.length);

    $("#nodeHeader").text("Select Impact");
    $("#nodeDropdown").empty();

    for(var i = 0; i < nodes.length; i++) {
        console.log(nodes[i].column);
        var opt = document.createElement('option');
        if(nodes[i].column == 0){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            sel.appendChild(opt);
        }
    }
}

function sortByProjectsAndInitiatives(){

    console.log("filtering");

    var sel = document.getElementById('nodeDropdown');

    console.log(sel.options.length);

    $("#nodeHeader").text("Select Project & Initiative");
    $("#nodeDropdown").empty();

    for(var i = 0; i < nodes.length; i++) {
        console.log(nodes[i].column);
        var opt = document.createElement('option');
        if(nodes[i].column == 2){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            sel.appendChild(opt);
        }
    }
}


function findLinks(){
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
    var originVal = parseInt(origin.options[origin.selectedIndex].value);

    var dest = document.getElementById('newPossibleLinks');
    var destVal = parseInt(dest.options[dest.selectedIndex].value);
    var color;
    var value = 6;

    //calculate value and color here based on nodes other existing links
    if(nodes[destVal].column == 1){
        color = nodes[destVal].color;
    } else if(nodes[originVal].column == 1){
        color = nodes[originVal].color;
    }

    switch(nodes[originVal].column){
        case 0:
            if(nodes[destVal].column == 1){
                //create link with source as origin and target as destination
                links.push({
                    "source": originVal,
                    "color": color,
                    "target": destVal,
                    "value": 6
                });
                console.log(links);
            }
            break;
        case 1:
            if(nodes[destVal].column == 0){
                //create link with source as destination and target as origin
                links.push({
                    "source": destVal,
                    "color": color,
                    "target": originVal,
                    "value": 6
                });
                console.log(links);

            } else if (nodes[destVal].column == 2){
                links.push({
                    "source": originVal,
                    "color": color,
                    "target": destVal,
                    "value": 6
                });
                console.log(links);
            }
            break;
        case 2:
            if(nodes[destVal].column == 1){
                //create link with source as destination and target as origin
                links.push({
                    "source": destVal,
                    "color": color,
                    "target": originVal,
                    "value": 6
                });
                console.log(links);
            }
            break;
    }
    
    setLinks(links);
}

function deleteLink(){
    var origin = document.getElementById('nodeDropdown');
    var originVal = origin.options[origin.selectedIndex].value;

    var dest = document.getElementById('linksDropdown');
    var destVal = dest.options[dest.selectedIndex].value;
    console.log(destVal);
    console.log(originVal);

    var found = false;
    var linkToDelete = -1;
    for(var i =0; i < links.length && !found; i++){
        if(links[i].source == originVal && links[i].target == destVal ||
            links[i].target == originVal && links[i].source == destVal){
                linkToDelete = i;
                found = true;
                console.log(links[i]);
        }
    }

    links.splice(linkToDelete,1);
    setLinks(links);
}

function removeOptions(selectBox){
    for(var i = 0; i < selectBox.options.length; i++){
        selectBox.options[i] = null;
    }
}
