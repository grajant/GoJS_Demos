import * as go from 'gojs'

let myDiagram: go.Diagram;

export function init() {
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram =
        $(go.Diagram, "myDiagramDiv",
            {
                layout: $(go.TreeLayout,
                    { layerSpacing: 150, arrangementSpacing: new go.Size(2, 2), setsPortSpot: false, setsChildPortSpot: false })
            });

    // this typically represents a person
    myDiagram.nodeTemplate =
        $(go.Node, "Vertical",
            $(go.Shape, "Circle",
                { desiredSize: new go.Size(28, 28), fill: "white", strokeWidth: 1.5, portId: "" },
                new go.Binding("figure")),
            $(go.TextBlock, "name",
                new go.Binding("text"))
        );

    // this template works for all kinds of relationships
    myDiagram.linkTemplate =
        $(go.Link, go.Link.Orthogonal,  // slightly curved, by default
            { reshapable: true },  // users can reshape the link route
            $(go.Shape,  // the link's path shape
                { isPanelMain: true, stroke: "transparent" },
                new go.Binding("stroke", "patt", function(f) { return (f === "") ? "black" : "transparent"; }),
                new go.Binding("pathPattern", "patt", convertPathPatternToShape)),
            $(go.Shape,  // the link's path shape
                { isPanelMain: true, stroke: "transparent", strokeWidth: 3 },
                new go.Binding("pathPattern", "patt2", convertPathPatternToShape)),
            $(go.Shape,  // the "to" arrowhead
                { toArrow: "", fill: null, scale: 1.2 },
                new go.Binding("toArrow"),
                new go.Binding("stroke", "patt", convertPathPatternToColor)),
            $(go.TextBlock,  // show the path object name
                { segmentOffset: new go.Point(0, 12) },
                new go.Binding("text", "patt")),
            $(go.TextBlock,  // show the second path object name, if any
                { segmentOffset: new go.Point(0, -12) },
                new go.Binding("text", "patt2"))
        );


    // Conversion functions that make use of the PathPatterns store of pattern Shapes
    function convertPathPatternToShape(name: unknown) {
        if (!name) return null;
        return PathPatterns.get(name);
    }

    function convertPathPatternToColor(name: unknown) {
        var pattobj = convertPathPatternToShape(name);
        // @ts-ignore
        return (pattobj !== null) ? pattobj?.stroke : "transparent";
    }


    // Define a bunch of small Shapes that can be used as values for Shape.pathPattern
    var PathPatterns = new go.Map();

    function definePathPattern(name: string, geostr: string, color?: string, width?: number, cap?: any) {
        if (typeof name !== 'string' || typeof geostr !== 'string') throw new Error("invalid name or geometry string argument: " + name + " " + geostr);
        if (color === undefined) color = "black";
        if (width === undefined) width = 1;
        if (cap === undefined) cap = "square";
        PathPatterns.set(name,
            $(go.Shape,
                {
                    geometryString: geostr,
                    fill: "transparent",
                    stroke: color,
                    strokeWidth: width,
                    strokeCap: cap
                }
            ));
    }

    definePathPattern("Single", "M0 0 L1 0", "red");
    definePathPattern("Double", "M0 0 L1 0 M0 3 L1 3");
    definePathPattern("Triple", "M0 0 L1 0 M0 3 L1 3 M0 6 L1 6");
    definePathPattern("DashR", "M0 0 M3 0 L6 0", "red");
    definePathPattern("DoubleDashR", "M0 0 M3 0 L6 0 M3 3 L6 3", "red");
    definePathPattern("TripleDashR", "M0 0 M3 0 L6 0 M3 3 L6 3 M3 6 L6 6", "red");
    definePathPattern("Dash", "M0 0 M3 0 L6 0");
    definePathPattern("DoubleDash", "M0 0 M3 0 L6 0 M3 3 L6 3");
    //definePathPattern("TripleDash", "M0 0 M3 0 L6 0 M3 3 L6 3 M3 6 L6 6");
    definePathPattern("Dot", "M0 0 M4 0 L4.1 0", "black", 2, "round");
    definePathPattern("DoubleDot", "M0 0 M4 0 L4.1 0 M4 3 L4.1 3", "black", 2, "round");
    definePathPattern("SingleG", "M0 0 L1 0", "green");
    definePathPattern("DoubleG", "M0 0 L1 0 M0 3 L1 3", "green");
    definePathPattern("SingleR", "M0 0 L1 0", "red");
    definePathPattern("TripleR", "M0 0 L1 0 M0 3 L1 3 M0 6 L1 6", "red");
    definePathPattern("ZigzagB", "M0 3 L1 0 3 6 4 3", "blue");
    definePathPattern("ZigzagR", "M0 3 L1 0 3 6 4 3", "red");
    definePathPattern("BigZigzagR", "M0 4 L2 0 6 8 8 4", "red");
    definePathPattern("DoubleZigzagB", "M0 3 L1 0 3 6 4 3 M0 9 L1 6 3 12 4 9", "blue");
    definePathPattern("CrossG", "M0 0 M3 0 M1 0 L1 8", "green");
    definePathPattern("CrossR", "M0 8 M32 8 L24 0 M32 8 L24 16", "red");
    //definePathPattern("Railroad", "M0 2 L3 2 M0 6 L3 6 M1 0 L1 8");  // also == Double & Cross
    definePathPattern("BackSlash", "M0 3 L2 6 M1 0 L5 6 M4 0 L6 3");
    definePathPattern("Slash", "M0 3 L2 0 M1 6 L5 0 M4 6 L6 3");
    definePathPattern("Coil", "M0 0 C2.5 0  5 2.5  5 5  C5 7.5  5 10  2.5 10  C0 10  0 7.5  0 5  C0 2.5  2.5 0  5 0");
    definePathPattern("Square", "M0 0 M1 0 L7 0 7 6 1 6z");
    definePathPattern("Circle", "M0 3 A3 3 0 1 0 6 4  A3 3 0 1 0 0 3");
    definePathPattern("BigCircle", "M0 5 A5 5 0 1 0 10 5  A5 5 0 1 0 0 5");
    definePathPattern("Triangle", "M0 0 L4 4 0 8z");
    definePathPattern("Diamond", "M0 4 L4 0 8 4 4 8z");
    definePathPattern("Dentil", "M0 0 L2 0  2 6  6 6  6 0  8 0");
    definePathPattern("Greek", "M0 0 L1 0  1 3  0 3  M0 6 L4 6  4 0  8 0  M8 3 L7 3  7 6  8 6");
    definePathPattern("Seed", "M0 0 A9 9 0 0 0 12 0  A9 9 180 0 0 0 0");
    definePathPattern("SemiCircle", "M0 0 A4 4 0 0 1 8 0");
    definePathPattern("BlindHem", "M0 4 L2 4  4 0  6 4  8 4");
    definePathPattern("Zipper", "M0 4 L1 4 1 0 8 0 8 4 9 4  M0 6 L3 6 3 2 6 2 6 6 9 6");
    //definePathPattern("Zipper2", "M0 4 L1 4 1 0 8 0 8 4 9 4  M0 7 L3 7 3 3 6 3 6 7 9 7");
    definePathPattern("Herringbone", "M0 2 L2 4 0 6  M2 0 L4 2  M4 6 L2 8");
    definePathPattern("Sawtooth", "M0 3 L4 0 2 6 6 3");


    // helper function for creating sequential chains of nodes
    function addLinks(patt1a: any, patt1b: any, patt2a: any, patt2b: any, patt3a: any, patt3b: any) {
        var arrow = "OpenTriangle";

        var left = { figure: "Square" };
        myDiagram.model.addNodeData(left);
        var middle = { figure: "Circle" };
        myDiagram.model.addNodeData(middle);
        // @ts-ignore
        myDiagram.model.addLinkData({ from: left.key, to: middle.key, patt: patt1a, patt2: patt1b, toArrow: arrow });

        if (patt2a) {
            var right = { figure: "Triangle" };
            myDiagram.model.addNodeData(right);
            // @ts-ignore
            myDiagram.model.addLinkData({ from: middle.key, to: right.key, patt: patt2a, patt2: patt2b, toArrow: arrow });

            if (patt3a) {
                var farright = { figure: "Diamond" };
                myDiagram.model.addNodeData(farright);
                // @ts-ignore
                myDiagram.model.addLinkData({ from: right.key, to: farright.key, patt: patt3a, patt2: patt3b, toArrow: arrow });
            }
        }
    }

    // simple path objects
    var it = PathPatterns.iteratorKeys;
    while (it.next()) {
        // @ts-ignore
        addLinks(it.value, "", it.next() ? it.value : "", "", it.next() ? it.value : "");
    }
    // compound path objects
    // @ts-ignore
    addLinks("DoubleG", "CrossG", "Single", "CrossR");
    // @ts-ignore
    addLinks("Dash", "ZigzagR", "Dash", "BigZigzagR");
    // @ts-ignore
    addLinks("Double", "ZigzagR", "Double", "BigZigzagR");
    // @ts-ignore
    addLinks("Triple", "ZigzagR", "Triple", "BigZigzagR");
}
