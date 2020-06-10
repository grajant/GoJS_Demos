import { SerpentineLayout } from './serpentine-layout';
import * as go from 'gojs';
import { MultiArrowLink } from './multi-arrow-link';

let myDiagram: go.Diagram;

// export function initSerpentineLayout() {
//     const $ = go.GraphObject.make;
//
//     myDiagram =
//         $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
//             {
//                 isTreePathToChildren: false,  // links go from child to parent
//                 padding: 0,
//                 layout: $(SerpentineLayout),  // defined in SerpentineLayout.js
//                 positionComputation: (d: go.Diagram, pt: go.Point): go.Point => {
//                     return new go.Point(Math.max(0, pt.x), Math.max(-100, pt.y));
//                 }
//             });
//
//     myDiagram.nodeTemplate =
//         $(go.Node, go.Panel.Spot,
//             $(go.Shape, { figure: "RoundedRectangle", fill: "white", desiredSize: new go.Size(60, 50) },
//                 new go.Binding("fill", "color"),
//                 new go.Binding('height', 'height'),
//             ),
//             $(go.TextBlock, { margin: 4 },
//                 new go.Binding("text", "key")
//             ),
//             $(go.Shape,
//                 {
//                     height: 1, fill: 'transparent',
//                     fromSpot: go.Spot.Right,
//                     toSpot: go.Spot.Left,
//                     alignment: new go.Spot(0, 0, 0, 20),
//                     alignmentFocus: go.Spot.TopLeft,
//                     stretch: go.GraphObject.Horizontal,
//                     strokeWidth: 0, portId: '',
//                 },
//             )
//         );
//
//     myDiagram.linkTemplate =
//         $(MultiArrowLink, // go.Link.Orthogonal,
//             { fromEndSegmentLength: 26, toEndSegmentLength: 16 },
//             $(go.Shape),
//         );
//
//     const model = new go.GraphLinksModel();
//     // model.nodeParentKeyProperty = "next";
//     model.nodeDataArray = [
//         { instructionDirection: 'IN',key: "Alpha", color: "coral" },
//         { instructionDirection: 'IN',key: "Beta", color: "tomato" },
//         { instructionDirection: 'IN',key: "Gamma", color: "goldenrod", height: 240 },
//         { instructionDirection: 'IN',key: "Delta", color: "orange" },
//         { instructionDirection: 'OUT',key: "Epsilon", color: "coral" },
//         { instructionDirection: 'IN',key: "Zeta", color: "tomato" },
//         { instructionDirection: 'IN',key: "Eta", color: "goldenrod" },
//         { instructionDirection: 'IN',key: "Theta", color: "orange" },
//         { instructionDirection: 'IN',key: "Iota", color: "coral" },
//         { instructionDirection: 'IN',key: "Kappa", color: "tomato", height: 50 },
//         { instructionDirection: 'IN',key: "Lambda", color: "goldenrod", height: 60 },
//         { instructionDirection: 'IN',key: "Mu", color: "orange", height: 30 },
//         { instructionDirection: 'OUT',key: "Nu", color: "coral" },
//         { instructionDirection: 'OUT',key: "Xi", color: "tomato" },
//         { instructionDirection: 'OUT',key: "Omicron", color: "goldenrod" },
//         { instructionDirection: 'OUT',key: "Pi", color: "orange" },
//         { instructionDirection: 'OUT',key: "Rho", color: "coral" },
//         // { instructionDirection: 'OUT',key: "Sigma", color: "tomato" },
//         // { instructionDirection: 'OUT',key: "Tau", color: "goldenrod" },
//         // { instructionDirection: 'OUT',key: "Upsilon", color: "orange" },
//         // { instructionDirection: 'OUT',key: "Phi", color: "coral" },
//         // { instructionDirection: 'OUT',key: "Chi", color: "tomato" },
//         // { instructionDirection: 'OUT',key: "Psi", color: "goldenrod" },
//         // { instructionDirection: 'OUT',key: "Omega", color: "orange" }
//     ];
//     myDiagram.model = model;
// }
