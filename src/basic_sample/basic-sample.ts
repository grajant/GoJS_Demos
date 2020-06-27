import { $ } from '../kanban_sample/rung.template';
import * as go from 'gojs';
import { generateBoxInstructionTemplate, IInstructionData } from '../kanban_sample/box-instruction.template';
import { generateBitInstructionTemplate } from '../kanban_sample/bit-instruction.template';
import { defineAllFigures, EFigures } from '../kanban_sample/figures.template';

let myDiagram: go.Diagram;

let previousSelection: go.Set<go.Part>;

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
        'textEditingTool.starting': go.TextEditingTool.DoubleClick,
        // start everything in the middle of the viewport
        
        // disallow nodes to be dragged to the diagram's background
      },
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
  
  myDiagram.model = new go.GraphLinksModel(
    [
      { name: 'OTL', shortName: 'L', category: 'BIT', operand: '?', displayType: 'coil', desc: '', isBodySelected: false },
      { name: 'XIC', shortName: '', category: 'BIT', operand: 'LongOperandText', displayType: 'contact', desc: '' },
      { name: 'XIO', shortName: '/', category: 'BIT', operand: 'LongOperandText', displayType: 'contact', desc: '' },
      { name: 'ONS', shortName: undefined, category: 'BIT', operand: 'LongOperandText', displayType: 'contact', desc: '' },
      // instruction,
      // instruction2,
    ],
  );
}
