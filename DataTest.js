/*
$(function () {
    function loadJSON(callback){

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('Get', 'sankeygreenhouse.json', true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    function init() {
        loadJSON(function(response) {
            var actual_JSON = JSON.parse(response);
            console.log(actual_JSON);
        });
    }
  init();

})(document, 'script', 'json info');
*/
function getData2() {
    return {
        "nodes": [{
            "node": 0,
            "name": "Promote awareness of IT Services",
            "color": "#58cb84",
            "xPos": 1
        }, {
            "node": 1,
            "name": "Provide end-user training and knowledge",
            "color": "#58cb84",
            "xPos": 1
        }, {
            "node": 2,
            "name": "Ensure Access to services",
            "color": "#58cb84",
            "xPos": 1
        }, {
            "node": 3,
            "name": "Provide end-user help and support",
            "color": "#58cb84",
            "xPos": 1
        }, {
            "node": 4,
            "name":"Contribute to effective service designs & roll outs",
            "color": "#58cb84",
            "xPos": 1
        }, {
            "node": 5,
            "name": "Help ensure high quality of services provided",
            "color": "#58cb84",
            "xPos": 1
        }, {
            "node": 6,
            "name": "Provide data and insights to IT & the business",
            "color": "#58cb84",
            "xPos": 1
        }, {
            "node": 7,
            "color": "#82b2cb",
            "name": "Project 1"
        }, {
            "node": 8,
            "color": "#82b2cb",
            "name": "Project 2"
        }, {
            "node": 9,
            "color": "#82b2cb",
            "name": "Project 3"
        }, {
            "node": 10,
            "color": "#82b2cb",
            "name": "Project 4"
        }, {
            "node": 11,
            "color": "#82b2cb",
            "name":"Project 5"
        }, {
            "node": 12,
            "color": "#82b2cb",
            "name": "Project 6"
        }, {
            "node": 13,
            "color": "#82b2cb",
            "name": "Project 7"
        },  {
            "node": 14,
            "color": "#82b2cb",
            "name": "Project 8"
        }, {
            "node": 15,
            "color": "#82b2cb",
            "name": "Project 9"
        }, {
            "node": 16,
            "color": "#82b2cb",
            "name": "Project 10"
        }, {
            "node": 17,
            "color": "#82b2cb",
            "name": "Project 11"
        }, {
            "node": 18,
            "color": "#82b2cb",
            "name":"Project 12"
        }, {
            "node": 19,
            "color": "#82b2cb",
            "name": "Project 13"
        }, {
            "node": 20,
            "color": "#82b2cb",
            "name": "Project 14"
        }, {
            "node": 21,
            "color": "#a69e00",
            "name": "Incidents can be linked to projects to ensure we solve the right problems"
        }, {
            "node": 22,
            "color": "#a69e00",
            "name": "End-users can identify and locate the services and support they need"
        }, {
            "node": 23,
            "color": "#a69e00",
            "name": "End-users are more likely to adopt & utilize IT services"
        }, {
            "node": 24,
            "color": "#a69e00",
            "name": "End-users know how to leverage technology to improve performance"
        }, {
            "node": 25,
            "color": "#a69e00",
            "name": "Reduced duplication of effort & use of shadow IT across the org"
        }, {
            "node": 26,
            "color": "#a69e00",
            "name": "Greater Organizational capacity for innovation"
        }, {
            "node": 27,
            "color": "#a69e00",
            "name": "End-users get help quickly so they can get back to work"
        }, {
            "node": 28,
            "color": "#a69e00",
            "name": "Cost-savings"
        }, {
            "node": 29,
            "color": "#a69e00",
            "name": "Users have a positive experience with IT services throughout the service lifecycle"
        }, {
            "node": 30,
            "color": "#a69e00",
            "name": "Higher quality of teaching, learning, and research"
        }, {
            "node": 31,
            "color": "#a69e00",
            "name": "IT is more reliable"
        }],
        "links": [{
            "source": 21,
            "color": "#a69e00",
            "target": 1,
            "value": 6
        }, {
            "source": 22,
            "color": "#a69e00",
            "target": 0,
            "value": 6
        }, {
            "source": 23,
            "color": "#a69e00",
            "target": 1,
            "value": 1.5
        }, {
            "source": 23,
            "color": "#a69e00",
            "target": 0,
            "value": 1.5
        }, {
            "source": 23,
            "color": "#a69e00",
            "target": 2,
            "value": 1.5
        }, {
            "source": 23,
            "color": "#a69e00",
            "target": 3,
            "value": 1.5
        }, {
            "source": 24,
            "color": "#a69e00",
            "target": 6,
            "value": 6
        }, {
            "source": 25,
            "color": "#a69e00",
            "target": 1,
            "value": 6
        }, {
            "source": 26,
            "color": "#a69e00",
            "target": 4,
            "value": 2
        }, {
            "source": 27,
            "color": "#a69e00",
            "target": 5,
            "value": 6
        }, {
            "source": 28,
            "color": "#a69e00",
            "target": 3,
            "value": 6
        }, {
            "source": 29,
            "color": "#a69e00",
            "target": 5,
            "value": 6
        }, {
            "source": 30,
            "color": "#a69e00",
            "target": 3,
            "value": 3
        }, {
            "source": 30,
            "color": "#a69e00",
            "target": 4,
            "value": 2
        }, {
            "source": 31,
            "color": "#a69e00",
            "target": 1,
            "value": 1.5
        }, {
            "source": 31,
            "color": "#a69e00",
            "target": 2,
            "value": 1.5
        }, {
            "source": 31,
            "color": "#a69e00",
            "target": 4,
            "value": 2
        }, {
            "source": 31,
            "color": "#a69e00",
            "target": 5,
            "value": 1.5
        }, {
            "source": 0,
            "color": "#58cb84",
            "target": 14,
            "value": 6
        }, {
            "source": 1,
            "color": "#58cb84",
            "target": 8,
            "value": 6
        }, {
            "source": 2,
            "color": "#58cb84",
            "target": 18,
            "value": 6
        }, {
            "source": 3,
            "color": "#58cb84",
            "target": 17,
            "value": 6
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 7,
            "value": 6
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 9,
            "value": 6
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 10,
            "value": 6
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 11,
            "value": 6
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 12,
            "value": 6
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 13,
            "value": 6
        }, {
            "source": 5,
            "color": "#58cb84",
            "target": 19,
            "value": 6
        }, {
            "source": 6,
            "color": "#58cb84",
            "target": 16,
            "value": 6
        }, {
            "source": 7,
            "color": "#58cb84",
            "target": 20,
            "value": 6
        }, {
            "source": 8,
            "color": "#58cb84",
            "target": 15,
            "value": 6
        }]};
}
