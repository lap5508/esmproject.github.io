//////////////////////// sankey.js /////////////////////////

//The following code generates the sankey diagrams properties, positioning, initial some style properties.

d3.sankey = function() {
    var sankey = {},
        nodeWidth = 24,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [];

    sankey.nodeWidth = function(_) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = +_;
        return sankey;
    };

    sankey.nodePadding = function(_) {
        if (!arguments.length) return nodePadding;
        nodePadding = +_;
        return sankey;
    };

    sankey.nodes = function(_) {
        if (!arguments.length) return nodes;
        nodes = _;
        return sankey;
    };

    sankey.links = function(_) {
        if (!arguments.length) return links;
        links = _;
        return sankey;
    };

    sankey.size = function(_) {
        if (!arguments.length) return size;
        size = _;
        return sankey;
    };

    sankey.layout = function(iterations) {
        computeNodeLinks();
        computeNodeValues();
        computeNodeBreadths();
        computeNodeDepths(iterations);
        computeLinkDepths();
        return sankey;
    };

    sankey.relayout = function() {
        computeLinkDepths();
        return sankey;
    };

    sankey.link = function() {
        var curvature = .5;

        function link(d) {
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x ,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                y0 = d.source.y + d.sy + d.dy / 2,
                y1 = d.target.y + d.ty + d.dy / 2;
            return "M" + x0 + "," + y0
                + "C" + x2 + "," + y0
                + " " + x3 + "," + y1
                + " " + x1 + "," + y1;
        }

        link.curvature = function(_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
        };

        return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
        var count = 0;

        nodes.forEach(function(node) {
            
            node.sourceLinks = [];
            node.targetLinks = [];
            console.log(node.targetLinks);
            // console.log("success" + count + node.name);
            // count++;
        });
        links.forEach(function(link) {
            var source = link.source,
                target = link.target;
            if (typeof source === "number") source = link.source = nodes[link.source];
            if (typeof target === "number") target = link.target = nodes[link.target];
            console.log("Count: " + count + " Source: " + link.source);
            source.sourceLinks.push(link);
            target.targetLinks.push(link);
        });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
        nodes.forEach(function(node) {
            node.value = Math.max(
                d3.sum(node.sourceLinks, value),
                d3.sum(node.targetLinks, value)
            );
        });
    }

    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    function computeNodeBreadths() {
        var remainingNodes = nodes,
            nextNodes,
            x = 0;

        while (remainingNodes.length) {
            nextNodes = [];
            remainingNodes.forEach(function(node) {

                if (node.xPos)
                    node.x = node.xPos;
                else
                    node.x = x;

                node.dx = nodeWidth;
                node.sourceLinks.forEach(function(link) {
                    nextNodes.push(link.target);
                });
            });
            remainingNodes = nextNodes;
            ++x;
        }

        //
        moveSinksRight(x);
        scaleNodeBreadths((width - nodeWidth) / (x - 1));
    }

    function moveSourcesRight() {
        nodes.forEach(function(node) {
            if (!node.targetLinks.length) {
                node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
            }
        });
    }

    function moveSinksRight(x) {
        nodes.forEach(function(node) {
            if (!node.sourceLinks.length) {
                node.x = x - 1;
            }
        });
    }

    function scaleNodeBreadths(kx) {
        nodes.forEach(function(node) {
            //this is how you adjust the placement of the nodes along the x-axis
            node.x *= kx + (width + 350);
        });
    }

    function computeNodeDepths(iterations) {
        var nodesByBreadth = d3.nest()
            .key(function(d) { return d.x; })
            .sortKeys(d3.ascending)
            .entries(nodes)
            .map(function(d) { return d.values; });

        //
        initializeNodeDepth();
        resolveCollisions();
        for (var alpha = 1; iterations > 0; --iterations) {
            relaxRightToLeft(alpha *= .99);
            resolveCollisions();
            relaxLeftToRight(alpha);
            resolveCollisions();
        }

        function initializeNodeDepth() {
            var ky = d3.min(nodesByBreadth, function(nodes) {
                return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
            });

            nodesByBreadth.forEach(function(nodes) {
                nodes.forEach(function(node, i) {
                    node.y = i;
                    node.dy = node.value * ky;
                });
            });

            links.forEach(function(link) {
                link.dy = link.value * ky;
            });
        }

        function relaxLeftToRight(alpha) {
            nodesByBreadth.forEach(function(nodes, breadth) {
                nodes.forEach(function(node) {
                    if (node.targetLinks.length) {
                        var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedSource(link) {
                return center(link.source) * link.value;
            }
        }

        function relaxRightToLeft(alpha) {
            nodesByBreadth.slice().reverse().forEach(function(nodes) {
                nodes.forEach(function(node) {
                    if (node.sourceLinks.length) {
                        var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedTarget(link) {
                return center(link.target) * link.value;
            }
        }

        function resolveCollisions() {
            nodesByBreadth.forEach(function(nodes) {
                var node,
                    dy,
                    y0 = 0,
                    n = nodes.length,
                    i;

                // Push any overlapping nodes down.
                nodes.sort(ascendingDepth);
                for (i = 0; i < n; ++i) {
                    node = nodes[i];
                    dy = y0 - node.y;
                    if (dy > 0) node.y += dy;
                    y0 = node.y + node.dy + nodePadding;
                }

                // If the bottommost node goes outside the bounds, push it back up.
                dy = y0 - nodePadding - size[1];
                if (dy > 0) {
                    y0 = node.y -= dy;

                    // Push any overlapping nodes back up.
                    for (i = n - 2; i >= 0; --i) {
                        node = nodes[i];
                        dy = node.y + node.dy + nodePadding - y0;
                        if (dy > 0) node.y -= dy;
                        y0 = node.y;
                    }
                }
            });
        }

        function ascendingDepth(a, b) {
            return a.y - b.y;
        }
    }

    function computeLinkDepths() {
        nodes.forEach(function(node) {
            node.sourceLinks.sort(ascendingTargetDepth);
            node.targetLinks.sort(ascendingSourceDepth);
        });
        nodes.forEach(function(node) {
            var sy = 0, ty = 0;
            node.sourceLinks.forEach(function(link) {
                link.sy = sy;
                sy += link.dy;
            });
            node.targetLinks.forEach(function(link) {
                link.ty = ty;
                ty += link.dy;
            });
        });

        function ascendingSourceDepth(a, b) {
            return a.source.y - b.source.y;
        }

        function ascendingTargetDepth(a, b) {
            return a.target.y - b.target.y;
        }
    }

    function center(node) {
        return node.y + node.dy / 2;
    }

    function value(link) {
        return link.value;
    }

    return sankey;
};


///////////////////////////////////////////



function getData2()  {
    var hs = '\uf2b5', sign = '\uf277', lock = '\uf023', money = '\uf0d6';
    return {
        "nodes": [{
            "node": 0,
            "name": "Provide Mgmt Processes, Tools, & Roles",
            "color": "#2aa198",
            "xPos": 1,
            "description": "desc 0",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 1,
            "name": "Ensure Streamlined End-User Access to IT Services",
            "color": "#d33682",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 2,
            "name": "Provide World Class End-User Help & Support",
            "color": "#6c71c4",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 3,
            "name": "Contribute to Effective Service Designs, Rollouts, & Changes",
            "color": "#268bd2",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 4,
            "name":"Provide Quality End-User Training & Knowledge Resources",
            "color": "#cb4b16",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 5,
            "name": "Monitor, Resolve, & Escalate IT Incidents & Problems",
            "color": "#b58900",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 6,
            "name": "Provide Quality Data Insights to IT & the Business",
            "color": "#859900",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 7,
            "name": "Facilitate Effective Service Retirements",
            "color": "#dc322f",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 8,
            "name": "Promote IT Engagement & Professional Development",
            "color": "#073642",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 300,
            "alignment": "middle",
            "translatex": 160,
            "nodeshift": 0,
            "column": 1
        }, {
            "node": 9,
            "color": "#eee8d5",
            "name": "0365 Rollout",
            "description": "desc 0",
            "icons": money,
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 10,
            "color": "#eee8d5",
            "name": "Ent Project 1",
            "description": "desc 0",
            "icons": lock,
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 11,
            "color": "#eee8d5",
            "name": "Ent Project 2",
            "description": "desc 0",
            "icons": money,
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 12,
            "color": "#eee8d5",
            "name": "Ent Project 3",
            "description": "desc 0",
            "icons": sign,
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 13,
            "color": "#eee8d5",
            "name":"Ent Project 4",
            "description": "desc 0",
            "icons": money,
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 14,
            "color": "#eee8d5",
            "name": "Knowledge 2.0",
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 15,
            "color": "#eee8d5",
            "name": "Portal ReDesign",
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        },  {
            "node": 16,
            "color": "#eee8d5",
            "name": "5hared 5D",
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 17,
            "color": "#eee8d5",
            "name": "Learning Paths Initiative",
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 18,
            "color": "#eee8d5",
            "name": "OC Transformation",
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 19,
            "color": "#eee8d5",
            "name": "IT Dashboards",
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        }, {
            "node": 20,
            "color": "#eee8d5",
            "name":"Internal Skills Inventory",
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 135,
            "column": 2
        },  {
            "node": 21,
            "color": "#eee8d5",
            "name": "End users can easily find, select, & access the services and support they need",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: Discoverability",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 22,
            "color": "#eee8d5",
            "name": "End-users are more likely to adopt & utilize IT services",
            "description": "desc 0",
            "icons": hs  + "   " + money + "   " + lock,
            "toolbar": "Critical Evidence: Adoption & Utilization",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 23,
            "color": "#eee8d5",
            "name": "End-users know how to leverage technology to improve their work(teaching, learning, research, job performance)",
            "description": "desc 0",
            "icons": hs  + "   " + sign + "   " + lock,
            "toolbar": "Critical Evidence: User proficiency",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 24,
            "color": "#eee8d5",
            "name": "Issues are resolved quickly so end-users can get back to work",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: Incident resolution rates",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 25,
            "color": "#eee8d5",
            "name": "Users have a positive perception of IT services & support",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: User satisfaction",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 26,
            "color": "#eee8d5",
            "name": "Consistently high-quality services are delivered to end-users across the enterprise",
            "description": "desc 0",
            "icons": hs + "   " + money,
            "toolbar": "Critical Evidence: Efficiency & responsiveness to user & university needs",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 27,
            "color": "#eee8d5",
            "name": "Enterprise technology is more reliable(fewer outages & major incidents)",
            "description": "desc 0",
            "icons": hs + "   " + lock,
            "toolbar": "Critical Evidence: Low number of outages & other significant service disruptions",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 28,
            "color": "#eee8d5",
            "name": "Transparency into service and infrastructure performance enables effective problem-solving & decision-making",
            "description": "desc 0",
            "icons": money + "   " + lock + "   " + sign,
            "toolbar": "Critical Evidence: Availability of data & insights",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 29,
            "color": "#eee8d5",
            "name": "Based on data, projects can be created, resourced, & prioritized effectively to ensure outcomes are aligned w/real needs ",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: Alignment of projects & needs",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 30,
            "color": "#eee8d5",
            "name": "Commodity services are delivered at scale, reducing duplication of effort across the enterprise ",
            "description": "desc 0",
            "icons": money + "   " + sign,
            "toolbar": "Critical Evidence: Resources freed up for innovation",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }, {
            "node": 31,
            "color": "#eee8d5",
            "name": "IT staff & leaders grow their skills/knowledge to enable both operational excellence & innovation",
            "description": "desc 0",
            "icons": sign,
            "toolbar": "Critical Evidence: High levels of IT staff performance & engagement",
            "width" : 15,
            "alignment": "start",
            "translatex": 30,
            "nodeshift": 0,
            "column": 0
        }],
        "links": [{
            "source": 21,
            "color": "#d33682",
            "target": 1,
            "value": 6
        },  {
            "source": 22,
            "color": "#d33682",
            "target": 1,
            "value": 1.5
        },  {
            "source": 22,
            "color": "#6c71c4",
            "target": 2,
            "value": 1.5
        },  {
            "source": 22,
            "color": "#268bd2",
            "target": 3,
            "value": 1.5
        },  {
            "source": 22,
            "color": "#cb4b16",
            "target": 4,
            "value": 1.5
        },  {
            "source": 23,
            "color": "#6c71c4",
            "target": 2,
            "value": 6
        },  {
            "source": 24,
            "color": "#2aa198",
            "target": 0,
            "value": 2
        },  {
            "source": 24,
            "color": "#d33682",
            "target": 1,
            "value": 2
        },  {
            "source": 24,
            "color": "#b58800",
            "target": 5,
            "value": 2
        },  {
            "source": 25,
            "color": "#6c71c4",
            "target": 2,
            "value": 1.5
        },  {
            "source": 25,
            "color": "#268bd2",
            "target": 3,
            "value": 1.5
        },  {
            "source": 25,
            "color": "#cb4b16",
            "target": 4,
            "value": 1.5
        },  {
            "source": 25,
            "color": "#b58800",
            "target": 5,
            "value": 1.5
        },  {
            "source": 26,
            "color": "#2aa198",
            "target": 0,
            "value": 3
        },  {
            "source": 26,
            "color": "#268bd2",
            "target": 3,
            "value": 3
        },  {
            "source": 27,
            "color": "#2aa198",
            "target": 0,
            "value": 1.2
        },  {
            "source": 27,
            "color": "#268bd2",
            "target": 3,
            "value": 1.2
        },  {
            "source": 27,
            "color": "#b58800",
            "target": 5,
            "value": 1.2
        },  {
            "source": 27,
            "color": "#859900",
            "target": 6,
            "value": 1.2
        },  {
            "source": 27,
            "color": "#dc322f",
            "target": 7,
            "value": 1.2
        },  {
            "source": 28,
            "color": "#859900",
            "target": 6,
            "value": 6
        },  {
            "source": 29,
            "color": "#859900",
            "target": 6,
            "value": 6
        },  {
            "source": 30,
            "color": "#2aa198",
            "target": 0,
            "value": 2
        },  {
            "source": 30,
            "color": "#268bd2",
            "target": 3,
            "value": 2
        },  {
            "source": 30,
            "color": "#dc322f",
            "target": 7,
            "value": 2
        },  {
            "source": 31,
            "color": "#073642",
            "target": 8,
            "value": 6
        },  {
            "source": 0,
            "color": "#2aa198",
            "target": 14,
            "value": 6
        },  {
            "source": 1,
            "color": "#d33682",
            "target": 15,
            "value": 6
        },  {
            "source": 2,
            "color": "#6c71c4",
            "target": 16,
            "value": 6
        },  {
            "source": 3,
            "color": "#268bd2",
            "target": 9,
            "value": 1.5
        },  {
            "source": 3,
            "color": "#268bd2",
            "target": 10,
            "value": 1.5
        },  {
            "source": 3,
            "color": "#268bd2",
            "target": 11,
            "value": 1.5
        },  {
            "source": 3,
            "color": "#268bd2",
            "target": 12,
            "value": 1.5
        },  {
            "source": 4,
            "color": "#cb4b16",
            "target": 17,
            "value": 6
        },  {
            "source": 5,
            "color": "#b58800",
            "target": 18,
            "value": 6
        },  {
            "source": 6,
            "color": "#859900",
            "target": 19,
            "value": 6
        },  {
            "source": 7,
            "color": "#dc322f",
            "target": 13,
            "value": 6
        }, {
            "source": 8,
            "color": "#073642",
            "target": 20,
            "value": 6
        }]};
}

//////////////////////// Retrieving Customized Data /////////////////////////

//The following function is used to define the properties of all of the individual nodes as well as their links.
//It holds information such as the name that is to be shown, the colors of the links and nodes, the description that is to be shown when hovered over,
//the the position along the x-axis, the width of the node, how far the name should be translated to the right, the alignment of the text for the name,
//the icons that are to be appended to each name, and the node id which is synonymous with its name but is assigned an integer for best practice

function getData() {
    var hs = '\uf2b5', sign = '\uf277', lock = '\uf023', money = '\uf0d6';
    getTheData(function(data){
        console.log(data);
        // var savedLinks = data.links;
        // var nodes = data.nodes;
        // console.log(savedLinks);
        // for(var i = 0; i < savedLinks.length; i++){
        //     for(var j = 0; j < nodes.length; j++){
        //         if(savedLinks[i].target == nodes[j].name){
        //             savedLinks[i].target = nodes[j].node;
        //         } else if (savedLinks[i].source == nodes[j].name){
        //             savedLinks[i].source = nodes[j].node;
        //         }
        //     }
        // }

        // console.log(data);

        // data.links = savedLinks;
        renderSankey(data);
        // return data;
    });
}

///////////////////////////////////////////

//////////////////////// Filtering Functions /////////////////////////

//The following functions implement the logic to filter out which node titles are displayed when the IT Strategic Goals buttons are clicked

function filterGoalsMoney(){

    var hs = "", sign = "", lock = "", money = "" ;

    d3.selectAll('g.node text').each(function (d) {
        if(d.icons == money || d.icons == money +"   " + sign || d.icons == hs + "   " + money +"   " + lock || d.icons == hs + "   " + money || d.icons == money + "   " + lock + "   " + sign || d.node <= 8){
            this.style.opacity = 1.0;
            console.log("working");
        } else{
            this.style.opacity = 0.0;
        }

    });
}

function filterGoalsLock(){

    var hs = '\uf2b5', sign = '\uf277', lock = '\uf023', money = '\uf0d6';

    d3.selectAll('g.node text').each(function (d) {
        if(d.icons == lock || d.icons == hs +"   " + lock || d.icons == hs + "   " + money +"   " + lock || d.icons == hs + "   " + sign + "   " + lock || d.icons == money + "   " + lock + "   " + sign ||  d.node <= 8){
            this.style.opacity = 1.0;
            console.log("working");
        } else{
            this.style.opacity = 0.0;
        }
    });
}

function filterGoalsSign(){

    var hs = '\uf2b5', sign = '\uf277', lock = '\uf023', money = '\uf0d6';

    d3.selectAll('g.node text').each(function (d) {
        if(d.icons == sign || d.icons == money +"   " + sign || d.icons == hs + "   " + sign +"   " + lock || d.icons == money + "   " + lock + "   " + sign || d.node <= 8){
            this.style.opacity = 1.0;
            console.log("working");
        } else{
            this.style.opacity = 0.0;
        }
    });
}

function filterGoalsHS(){

    var hs = '\uf2b5', sign = '\uf277', lock = '\uf023', money = '\uf0d6';

    d3.selectAll('g.node text').each(function (d) {
        if(d.icons == hs || d.icons == hs +"   " + money || d.icons == hs + "   " + money +"   " + lock || d.icons == hs + "   " + sign + "   " + lock || d.icons == hs + "   " + lock ||  d.node <= 8){
            this.style.opacity = 1.0;
            console.log("working");
        } else{
            this.style.opacity = 0.0;
        }
    });
}

function refreshGoals(){

    d3.selectAll('g.node text').each(function (d) {
        this.style.opacity =1.0;
    });
}

///////////////////////////////////////////



//////////////////////// Displaying Sankey Diagram & Properties /////////////////////////

//The remainder of the code in this file is all used to set properties and display the sankey diagram

////////////////////////////////////////////////////////////////////////////



//////////////////////// Margins /////////////////////////

//The following variable defines the size of the margins on each side of the sankey diagram

var margin = {top: 50, right: 200, bottom: 10, left: 500},
    width = 1200 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

//////////////////////////////////////////

//////////////////////// SVG Container /////////////////////////

//The following selects the container reserved for the sankey diagram and places it within a hierarchy of containers that will allow it to be responsive
//The initial size of the diagram is also defined here

var svg = d3.select("#chart")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    //3rd argument sets width of sankey which determines the height. 4th argument determines height of the container for the sankey
    .attr("viewBox", "0 0 2600 800")
    //class to make it responsive
    .classed("svg-content-responsive", true);


//////////////////////////////////////////

//////////////////////// Node Size and padding/////////////////////////

//The following defines the initial width of the nodes as well as the padding between each of the nodes

var sankey = d3.sankey()
    .nodeWidth(15)
    // .nodeWidth(function(d){return d.width;})
    .nodePadding(10)
    .size([width, height]);

//////////////////////////////////////////

//////////////////////// Path Definition /////////////////////////

//The following defines path as the function that computes and generates the links along with their curvature

var path = sankey.link();

//////////////////////////////////////////

//////////////////////// Displaying Diagram /////////////////////////

//The following variable is a function that is used to render every component of the sankey diagram including nodes, links, and text.
//It also defines applies the logic for what is to happen when nodes and links are clicked and hovered over as well as what is to happen when the mouse is moved off of the components

var renderSankey = function(sank) {

console.log("called");
    //defines the width of the entire sankey and will only work when the sankey is responsive
    window.width = 635;
    sankey
        //retrieves the nodes that were define in the initial definition of the sankey
        .nodes(sank.nodes)
        //retrieves the links that were define in the initial definition of the sankey
        .links(sank.links)
        //this defines the number of iterations that are to be computed in the iterative relaxion process
        //a higher number generally will result in a more ordered looking diagram
        .layout(4000);

    //Initialized when the renderSankey variable is initialized, this appends all of the links to the svg container, styles their color, width and also sorts them
    var link = svg.append("g").selectAll(".link")
        .data(sank.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        //Math.max(1, d.dy) --> place this in the return function below to replace the width of the links to resize automatically
        .style("stroke-width", function(d) { return 16; })
        .style("stroke", function(d){return d.color;})//add this to return the color of link
        .sort(function(a, b) { return b.dy - a.dy; });

    //this displays the description of each link that is to be shown when they are hovered over
    link.append("title")
        .text(function(d) { return d.source.description + Math.random(); });

    //Initialized when the renderSankey variable is initialized, this appends all of the nodes to the svg container, defines their clickable width, styles their opacity, and reveals all of the links when the mouse is moved out of the node after clicking it
    var node = svg.append("g").selectAll(".node")
        .data(sank.nodes)
        .enter().append("g")
        // .attr("width", sankey.nodeWidth())
        .attr("width", function(d){return d.width;})
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style("pointer-events","visible")
        .style("opacity", 1.0)
        .on("mouseout", function(d){
            link.style("opacity", 1)
        });

    //This is used to actually display the nodes that were created with the previous variable, style their visible width, height, color, and defines what happens when a node is clicked
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        // .attr("width", sankey.nodeWidth())
        .attr("width", function (d){return d.width;})
        // .attr("transform", function(d){return "translate(" + d.nodeshift + ")";})
        .style("fill", function(d) { return d.color;}) // modified node color
        .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2); })
        .style("opacity", 1.0)
        .style("pointer-events", "visible")
        .on("click", function(d) {
            link.style("opacity", function(l) {
                if (l.source.name == d.name || l.target.name == d.name) {
                    return 1
                } else {
                    return 0.0
                }
            })
            document.getElementById("additional-info").innerHTML=d.description;
            // console.log(document.getElementById("top-info-bar").style.borderColor=d.color);
            document.getElementById("top-info-bar").style.borderColor=d.color;
        })
        .on("mouseout", function(d) {
            document.getElementById("additional-info").innerHTML="";
            document.getElementById("top-info-bar").style.borderColor="#393939";

        })
        .append("title")
        //this is where the hover function is defined for nodes
        .text(function(d) {
            return d.toolbar; });

    //This is where the title is appended to each node, the text alignment is defined, the text is moved to the proper position, the text size is defined, the icons are attached, and the font size is defined
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 100; })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d){return d.alignment;} )
        // .attr("text-anchor", function (d){return "end";} )
        .attr("transform", function(d) { return "translate(" + d.translatex + ")"; })
        .attr('font-family', 'FontAwesome')
        .attr("fill", "white")
        .attr("width", 10)
        .attr("class", "text-component")
        .attr('font-size', function(d) { return d.size+'em'} ).attr('font-size', function(d) { return 1.8+'em'} )
        .text(function(d) {
            if(d.name != null){
                return(d.name + "  " + d.icons);
            }else{
                return(d.name);
            }
        })
        .filter(function(d) { return d.x < width / -2; })
        .attr("x", 6 + sankey.nodeWidth());

    //This is where the line breaks are inserted depending on the length of the text
    var insertLinebreaks = function (d) {
        var el = d3.select(this);
            if(d.name != null){
                var tempArray = d.name + "  " + d.icons;
                var words = tempArray.split(' ');
            }else{
                var words = d.name.split(' ');
            }
        el.text('');
        for (var i = 0; i < words.length; i++) {
            var tspan = el.append('tspan').text(words[i] + "\n");
            if(d.alignment == "middle"){
                if(d.node == 6){
                    if(i % 3 === 0){
                        tspan.attr('x', -5).attr('dy', '30');
                    }
                }
                if(i % 4 === 0){
                    tspan.attr('x', -5).attr('dy', '30');
                }
            }
            else{
                if(i % 10 === 0){
                    tspan.attr('x', -5).attr('dy', '30');
                }
            }
        }
    };

    //This is where the line breaking function is initialized
    svg.selectAll('g.node text').each(insertLinebreaks);
}

//This is where the sankey rendering function is initialized

// renderSankey(getData());



