import { $ } from '../kanban_sample/rung.template';
import * as go from 'gojs';
import { generateBoxInstructionTemplate, IInstructionData } from '../kanban_sample/box-instruction.template';
import { generateBitInstructionTemplate } from '../kanban_sample/bit-instruction.template';
import { defineAllFigures, EFigures } from '../kanban_sample/figures.template';
import { NonRealtimeDraggingTool } from '../ghost_dragging/ghost-dragging';

let myDiagram: go.Diagram;

let previousSelection: go.Set<go.Part>;
let myLinkData: go.ObjectData | null;
const originalPoints = [new go.Point(0, 0), new go.Point(5, 0)];

class MyDraggingTool extends go.DraggingTool {
  // private
  
  public doActivate(): void {
    console.warn('obj point', this.currentPart?.getDocumentPoint(go.Spot.TopLeft));
    const linkData = { linkKey: 'branchLink', points: new go.List(originalPoints) }
    super.doActivate();
  }
  
  public doMouseMove(): void {
    
    // super.doMouseMove();
  }
  
  public doDragOver(pt: go.Point, obj: go.GraphObject | null): void {
    const point1 = new go.Point(pt.x, originalPoints[0].y);
    const point2 = new go.Point(pt.x, pt.y);
    const linkOriginalPoints = [originalPoints[0], point1, point2];
    if (myLinkData) myDiagram.model.set(myLinkData, 'points', new go.List(linkOriginalPoints))
    // super.doDragOver(pt, obj);
  }
}

export function initBasic() {
  defineAllFigures();
  
  myDiagram =
    $(go.Diagram, 'myDiagramDiv',
      {
        'ChangingSelection': (event: go.DiagramEvent) => {
          previousSelection = event.subject.copy();
        },
        'ChangedSelection': (event: go.DiagramEvent) => {
          const currentSelection = event.subject as go.Set<go.Part>;
          previousSelection.each((part: go.Part) => {
            if (!currentSelection.contains(part)) {
              // @ts-ignore
              part.diagram?.model.setDataProperty(part.data, 'isBodySelected', false);
              // @ts-ignore
              part.diagram?.model.setDataProperty(part.data, 'isHeaderSelected', false);
            }
          })
        },
        'draggingTool': new NonRealtimeDraggingTool(),
        'textEditingTool.starting': go.TextEditingTool.DoubleClick,
        "linkingTool.isUnconnectedLinkValid": true,
        "linkingTool.portGravity": 20,
        "relinkingTool.isUnconnectedLinkValid": true,
        "relinkingTool.portGravity": 20,
        "linkReshapingTool.handleArchetype":
          $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
        "rotatingTool.handleAngle": 270,
        "rotatingTool.handleDistance": 30,
        "rotatingTool.snapAngleMultiple": 15,
        "rotatingTool.snapAngleEpsilon": 15,
        "undoManager.isEnabled": true
      },
    );
  
  myDiagram.linkTemplate =
    $(go.Link,  // the whole link panel
      { selectable: true, },
      { relinkableFrom: true, relinkableTo: true, reshapable: true },
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 0,
        toShortLength: 8
      },
      new go.Binding("points").makeTwoWay(),
      $(go.Shape,  // the link path shape
        { isPanelMain: true, strokeWidth: 1 }),
      $(go.Shape,  // the arrowhead
        { toArrow: "Rectangle", stroke: null, fill: '#2b98ca', width: 8, height: 16 }),
    );
  // myDiagram.nodeTemplate =
  //   $(go.Node, go.Panel.Horizontal,
  //     {
  //       height: 16,
  //       background: 'lightgreen',
  //     },
  //     $(go.Shape, EFigures.HALF_CIRCLE_LEFT,
  //       {
  //         desiredSize: new go.Size(8, 16),
  //         fill: 'white',
  //       },
  //     ),
  //     $(go.Panel, go.Panel.Horizontal,
  //       {
  //         background: 'white',
  //         padding: new go.Margin(0, 4, 0, 4),
  //       },
  //       $(go.TextBlock,
  //         {
  //           minSize: new go.Size(8, 16),
  //           background: 'white',
  //           font: '14px Verdana',
  //           textAlign: 'center',
  //           verticalAlignment: go.Spot.Bottom,
  //         },
  //         new go.Binding('text', 'name'),
  //       ),
  //     ),
  //     $(go.Shape, EFigures.HALF_CIRCLE_RIGHT,
  //       {
  //         desiredSize: new go.Size(8, 16),
  //         fill: 'white',
  //       },
  //     ),
  //     $(go.Shape, 'Arrow',
  //       {
  //         desiredSize: new go.Size(12, 8),
  //         // Arrow-head width
  //         parameter1: 5,
  //
  //         // Arrow-tail height
  //         parameter2: 4,
  //         fill: 'black',
  //         strokeWidth: 0,
  //       },
  //     ),
  //   );
  
  myDiagram.nodeTemplateMap.add(
    'BIT',
    generateBitInstructionTemplate(),
  );
  
  myDiagram.nodeTemplateMap.add('BOX', generateBoxInstructionTemplate());
  
  load();
}

function load() {
  // myDiagram.model = go.Model
  //   .fromJson((document.getElementById('mySavedModel') as HTMLTextAreaElement).value);
  // myDiagram.delayInitialization(relayoutDiagram);
  
  const instruction: IInstructionData = {
    name: 'TEST',
    category: 'BOX',
    instructionDirection: 'IN',
    displayType: 'box',
    bitLegDictatingRungState: true,
    bitLegParameters: [
      {
        paramName: 'LongOutName',
        isEditable: false,
        hasOperand: false,
      },
      {
        paramName: 'OUT2',
        isEditable: false,
        hasOperand: false,
      },
      {
        paramName: 'OUT3',
        isEditable: false,
        hasOperand: false,
      },
      {
        paramName: 'OUT4',
        isEditable: false,
        hasOperand: false,
      },
      {
        paramName: 'OUT5',
        isEditable: false,
        hasOperand: false,
      },
    ],
    onFaceParameters: [
      {
        paramName: 'Param1',
        isEditable: true,
        hasOperand: true,
      },
      {
        paramName: '',
        isEditable: false,
        hasOperand: false,
        dataSourceIndex: 0,
      },
      {
        paramName: 'Param2',
        isEditable: true,
        hasOperand: true,
      },
      {
        paramName: '',
        isEditable: false,
        hasOperand: false,
        dataSourceIndex: 2,
      },
    ],
  };
  const instruction2 = { ...instruction, bitLegDictatingRungState: false };
  
  myDiagram.model = $(go.GraphLinksModel, {
    linkKeyProperty: 'linkKey',
    nodeDataArray: [
      { name: 'OTL', shortName: 'L', category: 'BIT', operand: '?', displayType: 'coil', desc: '' },
      // { name: 'OTE', shortName: '', category: 'BIT', operand: '?', displayType: 'coil', desc: '' },
      // { name: 'XIC', shortName: '', category: 'BIT', operand: 'LongOperandText', displayType: 'contact', desc: '' },
      // { name: 'XIO', shortName: '/', category: 'BIT', operand: 'LongOperandText', displayType: 'contact', desc: '' },
      // { name: 'ONS', shortName: undefined, category: 'BIT', operand: 'LongOperandText', displayType: 'contact', desc: '' },
      // instruction,
      // instruction2,
    ],
    linkDataArray: [
    ]
  });
  
  myLinkData = (myDiagram.model as go.GraphLinksModel).findLinkDataForKey('myLink');
  console.warn('link data', myLinkData);
  console.warn('link', myDiagram.findLinkForKey('myLink'));
}
