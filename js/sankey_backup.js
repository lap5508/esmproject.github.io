//////////////////////// sankey.js /////////////////////////


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
            // node.x *= kx;
            //the + 250 is how you change the x placement of the nodes
            node.x *= kx + (width - 50);
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


function getData()  {
    var hs = '\uf2b5', sign = '\uf277', lock = '\uf023', money = '\uf0d6';
    return {
        "nodes": [{
            "node": 0,
            "name": "Provide Effective Service Management Processes, Tools, & Roles",
            "color": "#2aa198",
            "xPos": 1,
            "description": "desc 0",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 1,
            "name": "Ensure Streamlined End-User Access to IT Services",
            "color": "#d33682",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 2,
            "name": "Provide World Class End-User Help & Support",
            "color": "#6c71c4",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 3,
            "name": "Contribute to Effective Service Designs, Rollouts, & Changes",
            "color": "#268bd2",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 4,
            "name":"Provide Quality End-User Training & Knowledge Resources",
            "color": "#cb4b16",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 5,
            "name": "Monitor & Resolve/Escalate IT Incidents & Problems",
            "color": "#b58900",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 6,
            "name": "Provide Quality Data Insights to IT & the Business",
            "color": "#859900",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 7,
            "name": "Facilitate Effective Service Retirements",
            "color": "#dc322f",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
        }, {
            "node": 8,
            "name": "Promote IT Engagement & Professional Development",
            "color": "#073642",
            "xPos": 1,
            "description": "desc 0",
            "icons": "",
            "toolbar": "",
            "width" : 250,
            "alignment": "middle",
            "translatex": 135,
            "nodeshift": 0
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
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
            "nodeshift": 135
        },  {
            "node": 21,
            "color": "#eee8d5",
            "name": "Our users can easily find, select, & access the services and support they need",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: Discoverability",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 22,
            "color": "#eee8d5",
            "name": "Users are more likely to adopt & utilize IT services",
            "description": "desc 0",
            "icons": hs  + "   " + money + "   " + lock,
            "toolbar": "Critical Evidence: Adoption & Utilization",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 23,
            "color": "#eee8d5",
            "name": "Users know how to leverage new & existing technologies to improve their teaching, learning, research, and job performance",
            "description": "desc 0",
            "icons": hs  + "   " + sign + "   " + lock,
            "toolbar": "Critical Evidence: User proficiency",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 24,
            "color": "#eee8d5",
            "name": "IT issues are resolved efficiently & effectively so users can get the help they need & get back to work",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: Incident resolution rates",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 25,
            "color": "#eee8d5",
            "name": "Users have a positive perception of IT services & support",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: User satisfaction",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 26,
            "color": "#eee8d5",
            "name": "Consistently high-quality services are delivered to users across the enterprise",
            "description": "desc 0",
            "icons": hs + "   " + money,
            "toolbar": "Critical Evidence: Efficiency & responsiveness to user & university needs",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 27,
            "color": "#eee8d5",
            "name": "Enterprise technology is reliable for all users at all stages of the service lifecycle ",
            "description": "desc 0",
            "icons": hs + "   " + lock,
            "toolbar": "Critical Evidence: Low number of outages & other significant service disruptions",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 28,
            "color": "#eee8d5",
            "name": "Transparency into service/infrastructure performance enables effective problem-solving & decision-making",
            "description": "desc 0",
            "icons": money + "   " + lock + "   " + sign,
            "toolbar": "Critical Evidence: Availability of data & insights",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 29,
            "color": "#eee8d5",
            "name": "Based on data, projects can be created, resourced, & prioritized effectively to ensure outcomes are aligned w/real needs ",
            "description": "desc 0",
            "icons": hs,
            "toolbar": "Critical Evidence: Alignment of projects & needs",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 30,
            "color": "#eee8d5",
            "name": "Commodity services are delivered at scale, reducing duplication of effort across the enterprise ",
            "description": "desc 0",
            "icons": money + "   " + sign,
            "toolbar": "Critical Evidence: Resources freed up for innovation",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
        }, {
            "node": 31,
            "color": "#eee8d5",
            "name": "IT staff & leaders grow their skills/knowledge to enable both operational excellence & innovation",
            "description": "desc 0",
            "icons": sign,
            "toolbar": "Critical Evidence: High levels of IT staff performance & engagement",
            "width" : 15,
            "alignment": "end",
            "translatex": 0,
            "nodeshift": 0
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
            "value": 2
        }, {
            "source": 1,
            "color": "#58cb84",
            "target": 8,
            "value": 2
        }, {
            "source": 2,
            "color": "#58cb84",
            "target": 18,
            "value": 2
        }, {
            "source": 3,
            "color": "#58cb84",
            "target": 17,
            "value": 2
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 7,
            "value": 2
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 9,
            "value": 2
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 10,
            "value": 2
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 11,
            "value": 2
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 12,
            "value": 2
        }, {
            "source": 4,
            "color": "#58cb84",
            "target": 13,
            "value": 2
        }, {
            "source": 5,
            "color": "#58cb84",
            "target": 19,
            "value": 2
        }, {
            "source": 6,
            "color": "#58cb84",
            "target": 16,
            "value": 2
        }]};
}

//////////////////////////////////////////

var margin = {top: 10, right: 10, bottom: 10, left: 1100},
    width = 1200 - margin.left - margin.right,
    height = 740 - margin.top - margin.bottom;

//////////////////////////////////////////

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category20();

//////////////////////////////////////////

var svg = d3.select("#chart").append("svg")
    .attr("width", 2400)
    .attr("height", 800)
    .attr("class", "graph-svg-component")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//////////////////////////////////////////

var sankey = d3.sankey()
    .nodeWidth(15)
    // .nodeWidth(function(d){return d.width;})
    .nodePadding(10)
    .size([width, height]);

//////////////////////////////////////////

var path = sankey.link();

//////////////////////////////////////////

var renderSankey = function(energy) {

    function computeIcon(d){
        var iconnum = Math.floor(Math.random() * (4 - 1)) + 1;
        // console.log(iconnum);
        if(iconnum === 1){return '\uf023'; }
        else if(iconnum === 2){return '\uf129'; }
        else if(iconnum === 3){return '\uf127'; }
        else{return '\uf115'; }
    }

    // var iconkey = computeIcon(getData());
    //  console.log(iconkey);

    window.width = 500;
    sankey
        .nodes(energy.nodes)
        .links(energy.links)
        .layout(32);

    var link = svg.append("g").selectAll(".link")
        .data(energy.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        //Math.max(1, d.dy) --> place this in the return function below to replace the width of the links to resize automatically
        .style("stroke-width", function(d) { return 16; })
        .style("stroke", function(d){return d.color;})//add this to return the color of link
        //.style("distance", 400)
        .on("click", function(d) {
            link.style("opacity", function(l) {
                if (l.source.name == d.name || l.target.name == d.name) {
                    return 1
                } else {
                    console.log(l.source.name);
                    console.log(l.target.name);
                    return 0.1
                }
            })

        })
        /*.on("mouseout", function(d){
            // d3.select(this).select('text.info').remove();
            link.style("opacity", 1)
        })*/
        .sort(function(a, b) { return b.dy - a.dy; });


    link.append("title")
        // .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });
        .text(function(d) { return d.source.description + Math.random(); });

    var node = svg.append("g").selectAll(".node")
        .data(energy.nodes)
        .enter().append("g")
        .attr("width", function (d){return d.width;})
        // .attr("width", function(d){return d.width;})
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style("pointer-events","visible")
        .style("opacity", 1.0)
        /*.on("click",function(d){
            if (d3.event.defaultPrevented) return;
            alert("clicked!"+d.name);
        })*/
        /*.call(d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", function() { this.parentNode.appendChild(this); })
            .on("drag", dragmove))*/
        // .on("click", click)
        /*.on("click", function(d) {
            link.style("opacity", function(l) {
                if (l.source.name == d.name || l.target.name == d.name) {
                    return 1
                } else {
                    return 0.1
                }
            })
            // alert("clicked!"+d.name);
            document.getElementById("additionalInfo").innerHTML=d.name;
        })*/
        /*.on("mouseover", function(d){
            console.log("over");
            var g = d3.select(this);

            // document.getElementById("additionalInfo").innerHTML = d.description;
            // $("additionalInfo").text(d.description);

            $(function(){
                var prev;

                $('.additionalInfo').hover(function(){
                    prev = $(this).text();
                    $(this).text(d.description);
                }, function(){
                    $(this).text(prev)
                });
            })
            // d3.select(this).attr('transform', function(d){ return 'translate(?,?)'})
            //     .text(d.name + ": " + d.id)
            //     .style('display', null);
        })*/
        .on("mouseout", function(d){
            // d3.select(this).select('text.info').remove();
            link.style("opacity", 1)
        });


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
                    return 0.1
                }
            })
            // alert("clicked!"+d.name);
            document.getElementById("additionalInfo").innerHTML=d.name;
        })
        .append("title")
        //this is where the hover function is defined for nodes
        .text(function(d) {
            return d.toolbar; });

    node.append("text")
        .each(function (d) {
            var arr = d.name.split(" ");
            for (i = 0; i < arr.length; i++) {
                d3.select(this).append("tspan")
                    .text(arr[i])
                    .attr("dy", i ? "1.2em" : 0)
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .attr("class", "tspan" + i);}
        })
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d){return d.alignment;} )
        
        .attr("transform", function(d) { return "translate(" + d.translatex + ")"; })
        .attr('font-family', 'FontAwesome')
        .attr("fill", "white")
        .attr("width", 10)
        .attr("class", "text-component")
        .attr('font-size', function(d) { return d.size+'em'} ).attr('font-size', function(d) { return d.size+'em'} )
        .text(function(d) {
            if(d.name != null){
                // var breakText = d3plus.textWrap();
                return(d.name + "  " + d.icons);
            }else{
                // var breakText2 = d3plus.textWrap(d.name);
                return(d.name);
            }
        })
        .filter(function(d) { return d.x < width / -2; })
        .attr("x", 6 + sankey.nodeWidth());

}

var jsondata = 'sankeygreenhouse.json';

renderSankey(getData());




