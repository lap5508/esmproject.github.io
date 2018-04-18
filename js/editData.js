var nodes, links;
var selectedColumn = -1;
var nodeTitle, iconSet, nodeDesc, selectedNodeDropdown, selLinkCreateDropdown, selLinkDeleteDropdown;

function readInObject () {

    getTheData(function(data){
        // console.log(data);
        nodes = data.nodes;
        links = data.links;
        clearDropdowns();
        sortByColumnImpacts();
        sortByColumnProjectsAndInitiatives();
        sortByColumnWWD();
        addDefaultSelOptions();
        addNullOptionOnCreate()
        addNullOptionOnDelete();
        hideButtons();
    });
}

$(document).ready(function() {

    //Handles hiding and showing the delete link button based on selection
    $("#pAndILinkDeleteDropdown").click(function() {
        $("#wwdLinkDeleteDropdown").prop("disabled", true);
        $("#impactLinkDeleteDropdown").prop("disabled", true);
        $("#pAndILinkDeleteDropdown").prop("disabled", false);
        $("#deleteLinkButton").show();

        $("#pAndILinkDeleteDropdown").css('background-color', '#ffffb3');
    });

    $("#impactLinkDeleteDropdown").click(function() {
        $("#wwdLinkDeleteDropdown").prop("disabled", true);
        $("#impactLinkDeleteDropdown").prop("disabled", false);
        $("#pAndILinkDeleteDropdown").prop("disabled", true);
        $("#deleteLinkButton").show();

        $("#impactLinkDeleteDropdown").css('background-color', '#ffffb3');
    });

    $("#wwdLinkDeleteDropdown").click(function() {
        $("#wwdLinkDeleteDropdown").prop("disabled", false);
        $("#impactLinkDeleteDropdown").prop("disabled", true);
        $("#pAndILinkDeleteDropdown").prop("disabled", true);
        $("#deleteLinkButton").show();

        $("#wwdLinkDeleteDropdown").css('background-color', '#ffffb3');
    });

    $("#clearDeleteLinkSel").click(function() {
        $("#wwdLinkDeleteDropdown").prop("disabled", false);
        $("#impactLinkDeleteDropdown").prop("disabled", false);
        $("#pAndILinkDeleteDropdown").prop("disabled", false);
        $("#deleteLinkButton").hide();

        $("#pAndILinkDeleteDropdown").css('background-color', 'white');
        $("#impactLinkDeleteDropdown").css('background-color', 'white');
        $("#wwdLinkDeleteDropdown").css('background-color', 'white');

        if(selectedNodeDropdown == 0){
            $("#impactLinkCreateDropdown").prop("disabled", true);
            $("#impactLinkDeleteDropdown").prop("disabled", true);
        } else if(selectedNodeDropdown == 1){
            $("#wwdLinkCreateDropdown").prop("disabled", true);
            $("#wwdLinkDeleteDropdown").prop("disabled", true);
        } else{
            $("#pAndILinkCreateDropdown").prop("disabled", true);
            $("#pAndILinkDeleteDropdown").prop("disabled", true);
        }
    });

    //Handles hiding and showing the create link button based on selection
    $("#pAndILinkCreateDropdown").click(function() {
        $("#wwdLinkCreateDropdown").prop("disabled", true);
        $("#impactLinkCreateDropdown").prop("disabled", true);
        $("#pAndILinkDeleteDropdown").prop("disabled", false);
        $("#createLinkButton").show();

        $("#pAndILinkCreateDropdown").css('background-color', '#ffffb3');
    });

    $("#impactLinkCreateDropdown").click(function() {
        $("#wwdLinkCreateDropdown").prop("disabled", true);
        $("#impactLinkCreateDropdown").prop("disabled", false);
        $("#pAndILinkCreateDropdown").prop("disabled", true);
        $("#createLinkButton").show();

        $("#impactLinkCreateDropdown").css('background-color', '#ffffb3');
    });

    $("#wwdLinkCreateDropdown").click(function() {
        $("#wwdLinkCreateDropdown").prop("disabled", false);
        $("#impactLinkCreateDropdown").prop("disabled", true);
        $("#pAndILinkCreateDropdown").prop("disabled", true);
        $("#createLinkButton").show();

        $("#wwdLinkCreateDropdown").css('background-color', '#ffffb3');
    });

    $("#clearCreateLinkSel").click(function() {
        $("#wwdLinkCreateDropdown").prop("disabled", false);
        $("#impactLinkCreateDropdown").prop("disabled", false);
        $("#pAndILinkCreateDropdown").prop("disabled", false);
        $("#createLinkButton").hide();

        $("#pAndILinkCreateDropdown").css('background-color', 'white');
        $("#impactLinkCreateDropdown").css('background-color', 'white');
        $("#wwdLinkCreateDropdown").css('background-color', 'white');

        if(selectedNodeDropdown == 0){
            $("#impactLinkCreateDropdown").prop("disabled", true);
            $("#impactLinkDeleteDropdown").prop("disabled", true);
        } else if(selectedNodeDropdown == 1){
            $("#wwdLinkCreateDropdown").prop("disabled", true);
            $("#wwdLinkDeleteDropdown").prop("disabled", true);
        } else{
            $("#pAndILinkCreateDropdown").prop("disabled", true);
            $("#pAndILinkDeleteDropdown").prop("disabled", true);
        }
    });

    //Handles disabling dropdowns based on node column selection
    $("#impactDropdown").click(function() {
        $("#wwdLinkCreateDropdown").prop("disabled", false);
        $("#wwdLinkDeleteDropdown").prop("disabled", false);

        $("#pAndILinkCreateDropdown").prop("disabled", true);
        $("#pAndILinkDeleteDropdown").prop("disabled", true);

        $("#impactLinkCreateDropdown").prop("disabled", true);
        $("#impactLinkDeleteDropdown").prop("disabled", true);

        $("#impactDropdown").css('background-color', '#ffffb3');
        $("#wwdDropdown").css('background-color', 'white');
        $("#pAndIDropdown").css('background-color', 'white');
        $("#pAndIDropdown").css('background-color', 'white');

        $("#impactLinkCreateDropdown").css('background-color', 'white');
        $("#impactLinkDeleteDropdown").css('background-color', 'white');
        $("#wwdLinkCreateDropdown").css('background-color', 'white');
        $("#wwdLinkDeleteDropdown").css('background-color', 'white');
        $("#pAndILinkCreateDropdown").css('background-color', 'white');
        $("#pAndILinkDeleteDropdown").css('background-color', 'white');
    });

    $("#wwdDropdown").click(function() {
        $("#wwdLinkCreateDropdown").prop("disabled", true);
        $("#wwdLinkDeleteDropdown").prop("disabled", true);

        $("#pAndILinkCreateDropdown").prop("disabled", false);
        $("#pAndILinkDeleteDropdown").prop("disabled", false);

        $("#impactLinkCreateDropdown").prop("disabled", false);
        $("#impactLinkDeleteDropdown").prop("disabled", false);

        $("#impactDropdown").css('background-color', 'white');
        $("#wwdDropdown").css('background-color', '#ffffb3');
        $("#pAndIDropdown").css('background-color', 'white');

        $("#impactLinkCreateDropdown").css('background-color', 'white');
        $("#impactLinkDeleteDropdown").css('background-color', 'white');
        $("#wwdLinkCreateDropdown").css('background-color', 'white');
        $("#wwdLinkDeleteDropdown").css('background-color', 'white');
        $("#pAndILinkCreateDropdown").css('background-color', 'white');
        $("#pAndILinkDeleteDropdown").css('background-color', 'white');
    });

    $("#pAndIDropdown").click(function() {
        $("#wwdLinkCreateDropdown").prop("disabled", false);
        $("#wwdLinkDeleteDropdown").prop("disabled", false);

        $("#pAndILinkCreateDropdown").prop("disabled", true);
        $("#pAndILinkDeleteDropdown").prop("disabled", true);

        $("#impactLinkCreateDropdown").prop("disabled", true);
        $("#impactLinkDeleteDropdown").prop("disabled", true);

        $("#impactDropdown").css('background-color', 'white');
        $("#wwdDropdown").css('background-color', 'white');
        $("#pAndIDropdown").css('background-color', '#ffffb3');

        $("#impactLinkCreateDropdown").css('background-color', 'white');
        $("#impactLinkDeleteDropdown").css('background-color', 'white');
        $("#wwdLinkCreateDropdown").css('background-color', 'white');
        $("#wwdLinkDeleteDropdown").css('background-color', 'white');
        $("#pAndILinkCreateDropdown").css('background-color', 'white');
        $("#pAndILinkDeleteDropdown").css('background-color', 'white');
    });


});

function hideButtons(){

    $("#createLinkButton").hide();
    $("#deleteLinkButton").hide();

}

function addDefaultSelOptions(){

    var createWWD = document.getElementById('wwdLinkCreateDropdown');
    $("wwdLinkCreateDropdown").empty();
    var defCreateWWD = document.createElement('option');
    defCreateWWD.innerHTML = "";
    createWWD.appendChild(defCreateWWD);

    var createImpact = document.getElementById('impactLinkCreateDropdown');
    $("impactLinkCreateDropdown").empty();
    var defCreateImpact = document.createElement('option');
    defCreateImpact.innerHTML = "";
    createImpact.appendChild(defCreateImpact);

    var createPAndI = document.getElementById('pAndILinkCreateDropdown');
    $("pAndILinkCreateDropdown").empty();
    var defCreatePAndI = document.createElement('option');
    defCreatePAndI.innerHTML = "";
    createPAndI.appendChild(defCreatePAndI);

    //add options to create column
    for(var i = 0; i < nodes.length; i++) {
        var opt = document.createElement('option');
        if(nodes[i].column == 0){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            createImpact.appendChild(opt);
        }
        if(nodes[i].column == 1){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            createWWD.appendChild(opt);
        }
        if(nodes[i].column == 2){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            createPAndI.appendChild(opt);
        }
    }

}

function sortByColumnWWD(){

    selectedColumn = 1;
    // console.log("filtering");

    var sel = document.getElementById('wwdDropdown');
    $("#wwdDropdown").empty();
    var defOpt = document.createElement('option');
    defOpt.innerHTML = "Select an existing node...";
    sel.appendChild(defOpt);

    for(var i = 0; i < nodes.length; i++) {
        var opt = document.createElement('option');

        if(nodes[i].column == 1){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            sel.appendChild(opt);
        }
    }

    emptyDeleteColumn();
}

function sortByColumnImpacts(){

    $("wwdLinkDeleteDropdown").empty();

    selectedColumn = 0;

    var sel = document.getElementById('impactDropdown');
    $("#impactsDropdown").empty();
    var defOpt = document.createElement('option');
    defOpt.innerHTML = "Select an existing node...";
    sel.appendChild(defOpt);

    for(var i = 0; i < nodes.length; i++) {

        var opt = document.createElement('option');

        if(nodes[i].column == 0){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            sel.appendChild(opt);
        }
    }
}

function sortByColumnProjectsAndInitiatives(){

    $("wwdLinkDeleteDropdown").empty();

    selectedColumn = 2;

    var sel = document.getElementById('pAndIDropdown');
    $("#pAndIDropdown").empty();
    var defOpt = document.createElement('option');
    defOpt.innerHTML = "Select an existing node...";
    sel.appendChild(defOpt);

    for(var i = 0; i < nodes.length; i++) {

        var opt = document.createElement('option');

        if(nodes[i].column == 2){
            opt.innerHTML = nodes[i].name;
            opt.value = nodes[i].node;
            sel.appendChild(opt);
        }
    }
}

function emptyDeleteColumn(){
    var select = document.getElementById("wwdLinkDeleteDropdown");
    var length = select.options.length;
    for (i = 0; i < length; i++) {
        select.options[i] = null;
    }
}

function setTempTitle(){
    nodeTitle = document.getElementById("newNodeTitle").value;
}

function setTempDesc(){
    nodeDesc = document.getElementById("newNodeDesc").value;
}

function setIconSet(){
    var hs = '\uf2b5', sign = '\uf277', lock = '\uf023', money = '\uf0d6';
    iconSet = "";

    if(document.getElementById('hs').checked){
        iconSet = iconSet + " " + hs;
        // console.log(iconSet);
    }
    if(document.getElementById('money').checked){
        iconSet = iconSet + " " + money;
        // console.log(iconSet);
    }
    if(document.getElementById('lock').checked){
        iconSet = iconSet + " " + lock;
        // console.log(iconSet);
    }
    if(document.getElementById('sign').checked){
        iconSet = iconSet + " " + sign;
        // console.log(iconSet);
    }

    return iconSet;
}

function findLinks2(col){

    switch(col){
        case 0:
            // console.log("impacts dropdown");
            var sel = document.getElementById('impactDropdown');
            selectedNodeDropdown = 0;
            break;
        case 1:
            // console.log("wwd dropdown");
            var sel = document.getElementById('wwdDropdown');
            selectedNodeDropdown = 1;
            break;
        case 2:
            // console.log("pandi dropdown");
            var sel = document.getElementById('pAndIDropdown');
            selectedNodeDropdown = 2;
            break;
    }

    var val = sel.options[sel.selectedIndex].value;

    var nodeLinks = [];
    for(var i = 0; i < links.length; i++){
        if(links[i].target == val){
            nodeLinks.push(nodes[links[i].source]);
        } else if (links[i].source == val){
            nodeLinks.push(nodes[links[i].target]);
        }
    }


    var selImpact = document.getElementById('impactLinkDeleteDropdown');
    removeOptions(selImpact);

    var selWWD = document.getElementById('wwdLinkDeleteDropdown');
    removeOptions(selWWD);

    var selPAndI = document.getElementById('pAndILinkDeleteDropdown');
    removeOptions(selPAndI);


    for(var i = 0; i < nodeLinks.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = nodeLinks[i].name;
        // console.log(nodeLinks[i].name);
        opt.value = nodeLinks[i].node;
        if(nodeLinks[i].column == 0){
            console.log("Impact " + i + ":" + nodeLinks[i].name);
            selImpact.appendChild(opt);
        }
        if(nodeLinks[i].column == 1){
            // console.log("What We Do " + i + ":" + nodeLinks[i].name);
            selWWD.appendChild(opt);
        }
        if(nodeLinks[i].column == 2){
            // console.log("Projects & Initiatives " + i + ":" + nodeLinks[i].name);
            selPAndI.appendChild(opt);
        }

    }

    /*for(var i = 0; i < nodes.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = nodes[i].name;
        console.log(nodes[i].name);
        opt.value = nodes[i].node;
        if(nodes[i].column == 0){
            console.log("Impact " + i + ":" + nodes[i].name);
            selImpact.appendChild(opt);
        }
        if(nodes[i].column == 1){
            console.log("What We Do " + i + ":" + nodes[i].name);
            selWWD.appendChild(opt);
        }
        if(nodes[i].column == 2){
            console.log("Projects & Initiatives " + i + ":" + nodes[i].name);
            selPAndI.appendChild(opt);
        }

    }*/

    // findNewPossibleLinks(val);
}

function findLinks(col){

    switch(col){
        case 0:
            // console.log("impacts dropdown");
            var sel = document.getElementById('impactDropdown');
            selectedNodeDropdown = 0;
            break;
        case 1:
            // console.log("wwd dropdown");
            var sel = document.getElementById('wwdDropdown');
            selectedNodeDropdown = 1;
            break;
        case 2:
            // console.log("pandi dropdown");
            var sel = document.getElementById('pAndIDropdown');
            selectedNodeDropdown = 2;
            break;
    }



    var val = sel.options[sel.selectedIndex].value;
    var valName = sel.options[sel.selectedIndex].innerHTML;
    // console.log("VALUE: " + val);
    var title = sel.options[sel.selectedIndex].innerHTML;
    var titleArray = title.split(" ");
    if (titleArray.length > 12){
        title = "";
        for(var i = 0; i < 11; i++){
            title = title + " " + titleArray[i];
        }
        title = title + "...";
    }
    // console.log(val + " col: " + col);

    $(createLinkDesc).text( title );
    $(createLinkDesc).css('text-decoration', 'underline');
    $(createLinkDesc).text(function(i, value) {
        return value.replace(/&/g, "&&");
    });
    $(createLinkDesc).text(function(i, value) {
        return value.replace(/&amp;/g, "");
    });
    $(createLinkDesc).css("color", "white");
    $(deleteLinkDesc).text( title );
    $(deleteLinkDesc).css('text-decoration', 'underline');
    $(deleteLinkDesc).text(function(i, value) {
        return value.replace(/&/g, "&&");
    });
    $(deleteLinkDesc).text(function(i, value) {
        return value.replace(/&amp;/g, "");
    });
    $(deleteLinkDesc).css("color", "white");

    var nodeLinksDelete = [];
    for(var i = 0; i < links.length; i++){
        if(links[i].target == val){
            // console.log("found target");
            nodeLinksDelete.push(nodes[links[i].source]);
        } else if (links[i].source == val){
            // console.log("found source");
            nodeLinksDelete.push(nodes[links[i].target]);
        }
    }

    var selImpactDelete = document.getElementById('impactLinkDeleteDropdown');
    removeOptions(selImpactDelete);

    var selWWDDelete = document.getElementById('wwdLinkDeleteDropdown');
    removeOptions(selWWDDelete);

    var selPAndIDelete = document.getElementById('pAndILinkDeleteDropdown');
    removeOptions(selPAndIDelete);



    addNullOptionOnDelete();
    addNullOptionOnCreate()

    for(var i = 0; i < nodeLinksDelete.length; i++) {
        var optD = document.createElement('option');
        optD.innerHTML = nodeLinksDelete[i].name;
        // console.log(nodeLinksDelete[i].name);
        optD.value = nodeLinksDelete[i].node;
        if(nodeLinksDelete[i].column == 0){
            // console.log("Impact " + i + ":" + nodeLinksDelete[i].name);
            selImpactDelete.appendChild(optD);
        }
        if(nodeLinksDelete[i].column == 1){
            // console.log("What We Do " + i + ":" + nodeLinksDelete[i].name);
            selWWDDelete.appendChild(optD);
        }
        if(nodeLinksDelete[i].column == 2){
            // console.log("Projects & Initiatives " + i + ":" + nodeLinksDelete[i].name);
            selPAndIDelete.appendChild(optD);
        }

    }



    findNewPossibleLinks(val);
    console.log("val: " + val);

}

function addNullOptionOnDelete(){

    var opt = document.createElement('option');
    opt.innerHTML ="";

    var opt1 = document.createElement('option');
    opt1.innerHTML ="";

    var opt2 = document.createElement('option');
    opt2.innerHTML ="";

    var selImpactDel = document.getElementById('impactLinkDeleteDropdown');
    selImpactDel.appendChild(opt);

    var selWWDDel = document.getElementById('wwdLinkDeleteDropdown');
    selWWDDel.appendChild(opt1);

    var selPAndIDel = document.getElementById('pAndILinkDeleteDropdown');
    selPAndIDel.appendChild(opt2);

}

function addNullOptionOnCreate(){

    var opt = document.createElement('option');
    opt.innerHTML ="";

    var opt1 = document.createElement('option');
    opt1.innerHTML ="";

    var opt2 = document.createElement('option');
    opt2.innerHTML ="";

    var selImpactDel = document.getElementById('impactLinkCreateDropdown');
    selImpactDel.appendChild(opt);

    var selWWDDel = document.getElementById('wwdLinkCreateDropdown');
    selWWDDel.appendChild(opt1);

    var selPAndIDel = document.getElementById('pAndILinkCreateDropdown');
    selPAndIDel.appendChild(opt2);

}

function selectedLinkCreateDropdown(col){
    switch(col){
        case 0:
            selLinkCreateDropdown = 0;
            break;
        case 1:
            selLinkCreateDropdown = 1;
            break;
        case 2:
            selLinkCreateDropdown = 2;
            break;
    }
}

function selectedLinkDeleteDropdown(col){
    // console.log("delete col switched");
    switch(col){
        case 0:
            selLinkDeleteDropdown = 0;
            break;
        case 1:
            selLinkDeleteDropdown = 1;
            break;
        case 2:
            selLinkDeleteDropdown = 2;
            break;
    }
}

function deleteNode () {

    var delTrue = confirm("Are you sure you want to delete this link?");

    if(delTrue){
        switch(selectedNodeDropdown){
            case 0:
                // console.log("impacts origin node");
                var sel = document.getElementById('impactDropdown');
                break;
            case 1:
                // console.log("wwd origin node");
                var sel = document.getElementById('wwdDropdown');
                break;
            case 2:
                // console.log("pAndI origin node");
                var sel = document.getElementById('pAndIDropdown');
                break;
        }

        var val = sel.options[sel.selectedIndex].value;


        for(var i =0; i < links.length; i++){
            if(links[i].source == val || links[i].target == val){
                linkToDelete = i;
                links.splice(linkToDelete,1);
                i--;
            }
        }

        nodes.splice(val,1);

        setNodes(nodes);
        setLinks(links, nodes);

        /*switch (selectedColumn){
            case 0:
                sortByColumnImpacts();
                break;
            case 1:
                sortByColumnWWD();
                break;
            case 2:
                sortByProjectsAndInitiatives();
                break;
        }*/

        alert("A node had been deleted!");

        sortByColumnImpacts();
        sortByColumnProjectsAndInitiatives();
        sortByColumnWWD();
    }
}


function addNode () {
    var name = nodeTitle;
    var desc = nodeDesc;
    // var iconset = iconSet;
    // console.log(name);
    var iconset = setIconSet();
    // console.log(nodes.length);
    var newNode;


    var newNodeCol = document.getElementById('newNodeColumnDropdown');
    var newNodeColVal = newNodeCol.options[newNodeCol.selectedIndex].innerHTML;
    // console.log("new node col val: " + newNodeColVal);

    switch (newNodeColVal) {
        case -1:
            window.alert("You must select a group first!")
            break;
        case "Impact":
            newNode = {
                alignment: "start",
                color: "#eee8d5",
                column: 0,
                description: desc,
                name: name,
                node: nodes.length,
                nodeshift: 0,
                icons: iconset,
                toolbar: "",
                translatex: 30,
                width: 15
            };
            // sortByColumnImpacts();
            break;
        case "What We Do":
            newNode = {
                alignment: "middle",
                color: "#2aa198",
                column: 1,
                description: desc,
                name: name,
                icons: iconset,
                node: nodes.length,
                nodeshift: 0,
                toolbar: "",
                translatex: 160,
                width: 300,
                xPos: 1
            };
            // sortByColumnWWD();
            break;
        case "Projects &amp; Initiatives":
            newNode = {
                alignment: "end",
                color: "#eee8d5",
                column: 2,
                description: desc,
                name: name,
                icons: iconset,
                node: nodes.length,
                nodeshift: 135,
                toolbar: "",
                translatex: 0,
                width: 15,
                xPos: 1
            };
            // sortByProjectsAndInitiatives();
            break;
    }
    nodes.push(newNode);
    // console.log(newNode);
    setNodes(nodes);
    alert("A new node has been created!");
}

/*function findNewPossibleLinks(val){
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

    var selImpact = document.getElementById('impactLinkCreateDropdown');
    removeOptions(selImpact);

    var selWWD = document.getElementById('wwdLinkCreateDropdown');
    removeOptions(selWWD);

    var selPAndI = document.getElementById('pAndILinkCreateDropdown');
    removeOptions(selPAndI);

    for(var i = 0; i < possibleLinks.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = possibleLinks[i].name;
        opt.value = possibleLinks[i].node;

        if(possibleLinks[i].column == 0){
            selImpact.appendChild(opt);
        }
        if(possibleLinks[i].column == 1){
            selWWD.appendChild(opt);
        }
        if(possibleLinks[i].column == 2){
            selPAndI.appendChild(opt);
        }

    }

}*/

function findNewPossibleLinks(valName){

    var newPossibleLinks = [];
    console.log(newPossibleLinks);
    if(selectedNodeDropdown == 0){
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i].column == 1){
                newPossibleLinks.push(nodes[i]);
            }
        }
    } else if(selectedNodeDropdown == 1){
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i].column == 0 || nodes[i].column == 2){
                newPossibleLinks.push(nodes[i]);
            }
        }
    } else{
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i].column == 1){
                newPossibleLinks.push(nodes[i]);
            }
        }
    }


    var selImpactCreate = document.getElementById('impactLinkCreateDropdown');
    removeOptions(selImpactCreate);

    var selWWDCreate = document.getElementById('wwdLinkCreateDropdown');
    removeOptions(selWWDCreate);

    var selPAndICreate = document.getElementById('pAndILinkCreateDropdown');
    removeOptions(selPAndICreate);

    // console.log("Node Links Create: " + nodeLinksCreate);

    for(var i=0; i < newPossibleLinks.length; i++){
        console.log("For ech: " + newPossibleLinks[i].name + i);
    }
    // console.log("Node Links Length: " + nodeLinksCreate.length);
    for(var i = 0; i < newPossibleLinks.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = newPossibleLinks[i].name;
        opt.value = newPossibleLinks[i].node;

        // console.log("Node Link " + i +": " + nodeLinksCreate[i]);

        if(newPossibleLinks[i].column == 0){
            selImpactCreate.appendChild(opt);
        } else if(newPossibleLinks[i].column == 1){
            selWWDCreate.appendChild(opt);
        } else{
            selPAndICreate.appendChild(opt);
        }

    }

}



function createNewLink () {

    switch(selectedNodeDropdown){
        case 0:
            // console.log("impacts origin node");
            var origin = document.getElementById('impactDropdown');
            break;
        case 1:
            // console.log("wwd origin node");
            var origin = document.getElementById('wwdDropdown');
            break;
        case 2:
            // console.log("pAndI origin node");
            var origin = document.getElementById('pAndIDropdown');
            break;
    }

    var originVal = parseInt(origin.options[origin.selectedIndex].value);


    switch(selLinkCreateDropdown){
        case 0:
            // console.log("impacts origin node");
            var dest = document.getElementById('impactLinkCreateDropdown');
            break;
        case 1:
            // console.log("wwd origin node");
            var dest = document.getElementById('wwdLinkCreateDropdown');
            break;
        case 2:
            // console.log("pAndI origin node");
            var dest = document.getElementById('pAndILinkCreateDropdown');
            break;
    }


    var destVal = parseInt(dest.options[dest.selectedIndex].value);
    var destVal1 = dest.options[dest.selectedIndex];
    var color;
    var value = 6;


    //calculate value and color here based on nodes other existing links
    if(nodes[destVal].column == 1){
        color = nodes[destVal].color;
    } else if(nodes[originVal].column == 1){
        color = nodes[originVal].color;
    }

    var exists = false;


    for(var i = 0; i < links.length; i++){
        if(originVal == links[i].source && destVal == links[i].target){
            exists = true;
        } else if(originVal == links[i].target && destVal == links[i].source){
            exists = true;
        }
    }


    console.log(exists);

    if(exists == true){
        alert("That link already exists!");
    } else{
        switch(nodes[originVal].column){
            case 0:
                if(nodes[destVal].column == 1){
                    //create link with source as origin and target as destination
                    links.push({
                        "source": nodes[originVal].name,
                        "color": color,
                        "target": nodes[destVal].name,
                        "value": 6
                    });
                    // console.log(links);
                }
                break;
            case 1:
                if(nodes[destVal].column == 0){
                    //create link with source as destination and target as origin
                    links.push({
                        "source": nodes[destVal].name,
                        "color": color,
                        "target": nodes[originVal].name,
                        "value": 6
                    });
                    // console.log(links);

                } else if (nodes[destVal].column == 2){
                    links.push({
                        "source": nodes[originVal].name,
                        "color": color,
                        "target": nodes[destVal].name,
                        "value": 6
                    });
                    // console.log(links);
                }
                break;
            case 2:
                if(nodes[destVal].column == 1){
                    //create link with source as destination and target as origin
                    links.push({
                        "source": nodes[destVal].name,
                        "color": color,
                        "target": nodes[originVal].name,
                        "value": 6
                    });
                    // console.log(links);
                }
                break;
        }

        setLinks(links, nodes);

        readInObject();

        alert("A new link has been created!");
    }

}

function deleteLink(){

    var delTrue = confirm("Are you sure you want to delete this link?");

    if(delTrue == true){
        switch(selectedNodeDropdown){
            case 0:
                // console.log("impacts origin node");
                var origin = document.getElementById('impactDropdown');
                break;
            case 1:
                // console.log("wwd origin node");
                var origin = document.getElementById('wwdDropdown');
                break;
            case 2:
                // console.log("pAndI origin node");
                var origin = document.getElementById('pAndIDropdown');
                break;
        }


        var originVal = origin.options[origin.selectedIndex].value;

        switch(selLinkDeleteDropdown){
            case 0:
                // console.log("impacts origin node");
                var dest = document.getElementById('impactLinkDeleteDropdown');
                break;
            case 1:
                // console.log("wwd origin node");
                var dest = document.getElementById('wwdLinkDeleteDropdown');
                break;
            case 2:
                // console.log("pAndI origin node");
                var dest = document.getElementById('pAndILinkDeleteDropdown');
                break;
        }

        console.log(dest);
        var destVal = dest.options[dest.selectedIndex].value;
        // console.log(destVal);
        // console.log(originVal);

        var found = false;
        var linkToDelete = -1;
        for(var i =0; i < links.length && !found; i++){

            if(links[i].source == originVal && links[i].target == destVal ||
                links[i].target == originVal && links[i].source == destVal){
                linkToDelete = i;
                found = true;
                // console.log(links[i]);
            }
        }

        links.splice(linkToDelete,1);
        setLinks(links, nodes);

        readInObject();
        // alert("A link has been deleted!");
    }

}

function clearDropdowns(){
    $("#wwdLinkCreateDropdown").empty();
    $("#impactLinkCreateDropdown").empty();
    $("#pAndILinkCreateDropdown").empty();

    $("#wwdLinkDeleteDropdown").empty();
    $("#impactLinkDeleteDropdown").empty();
    $("#pAndILinkDeleteDropdown").empty();

    $("#wwdDropdown").empty();
    $("#impactDropdown").empty();
    $("#pAndIDropdown").empty();
}

function removeOptions(selectBox){
    $(selectBox).empty();
}
