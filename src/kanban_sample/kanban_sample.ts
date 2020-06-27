import * as go from 'gojs';
import { PoolLayout } from './pool-layout';
import { $, ENodeElements, generateGroupTemplate } from './rung.template';
import { MultiArrowLink } from '../serpentine_sample/multi-arrow-link';
import { NonRealtimeDraggingTool } from '../ghost_dragging/ghost-dragging';
import { generateBitInstructionTemplate } from './bit-instruction.template';
import { generateBoxInstructionTemplate, IInstructionData } from './box-instruction.template';

let myDiagram: go.Diagram;


// some shared functions

// this is called after nodes have been moved
function relayoutDiagram() {
  myDiagram.selection.each(function (part: go.Part) {
    if (part instanceof go.Group) {
    } else {
      const nodeDescSpacing = part.findObject(ENodeElements.DESC_SPACING);
      
      if (nodeDescSpacing) {
        nodeDescSpacing.height = 0;
      }
    }
    
    
    // part.invalidateLayout();
    console.log('Will validate layout');
  });
  
  myDiagram.layoutDiagram(true);
}

let wasCopiedOrMoved = false;

function onSelectionCopied(event: go.DiagramEvent) {
  wasCopiedOrMoved = true;
  // console.warn('selection copied');
  event.subject.each((part: go.Part) => {
    part.invalidateLayout();
  });
  relayoutDiagram();
}

function onLayoutCompleted() {
  if (wasCopiedOrMoved) {
    relayoutDiagram();
    wasCopiedOrMoved = false;
  }
}

export function initGridLayout() {
  
  myDiagram =
    $(go.Diagram, 'myDiagramDiv',
      {
        // start everything in the middle of the viewport
        contentAlignment: go.Spot.TopLeft,
        // use a simple layout to stack the top-level Groups next to each other
        layout: $(PoolLayout),
        positionComputation: (_d: go.Diagram, p: go.Point): go.Point => {
          return new go.Point(Math.max(0, p.x), Math.max(-4, p.y));
        },
        draggingTool: new NonRealtimeDraggingTool(),
        // disallow nodes to be dragged to the diagram's background
        mouseDrop: function (e: any) {
          e.diagram.currentTool.doCancel();
        },
        // a clipboard copied node is pasted into the original node's group (i.e. lane).
        'commandHandler.copiesGroupKey': true,
        'linkingTool.isUnconnectedLinkValid': true,
        // automatically re-layout the swim lanes after dragging the selection
        'SelectionMoved': onSelectionCopied,  // this DiagramEvent listener is
        'ClipboardPasted': onSelectionCopied, // defined above
        'LayoutCompleted': onLayoutCompleted,
        'animationManager.isEnabled': false,
        'undoManager.isEnabled': true,
        // allow TextEditingTool to start without selecting first
        'textEditingTool.starting': go.TextEditingTool.DoubleClick,
      },
    );
  
  // Customize the dragging tool:
  // When dragging a Node set its opacity to 0.7 and move it to the foreground layer
  // myDiagram.toolManager.draggingTool.doActivate = function () {
  //   go.DraggingTool.prototype.doActivate.call(this);
  //   if (this.currentPart) {
  //     this.currentPart.opacity = 0.7;
  //     this.currentPart.layerName = 'Foreground';
  //   }
  //
  // };
  // myDiagram.toolManager.draggingTool.doDeactivate = function () {
  //   if (this.currentPart) {
  //     this.currentPart.opacity = 1;
  //     this.currentPart.layerName = '';
  //   }
  //
  //   go.DraggingTool.prototype.doDeactivate.call(this);
  // };
  
  let copiedPosition: go.Point | undefined;
  myDiagram.commandHandler.copyToClipboard = function (partCollection: go.Iterable<go.Part>): void {
    copiedPosition = partCollection.first()?.position;
    go.CommandHandler.prototype.copyToClipboard.call(this, partCollection);
  };
  
  myDiagram.commandHandler.pasteFromClipboard = function () {
    const partCollection = go.CommandHandler.prototype.pasteFromClipboard.call(this);
    
    // if (copiedPosition) {
    //   if (partCollection.first()) {
    //     // @ts-ignore
    //     partCollection.first().position = copiedPosition;
    //     // @ts-ignore
    //     partCollection.first().x = 100;
    //   }
    // }
    // this.diagram.moveParts(coll, this._lastPasteOffset);
    // this._lastPasteOffset.add(this.pasteOffset);
    return new go.Set();
  };
  
  // There are only three note colors by default, blue, red, and yellow but you could add more here:
  const noteColors = ['#009CCC', '#CC293D', '#FFD700'];
  
  function getNoteColor(num: number) {
    return noteColors[Math.min(num, noteColors.length - 1)];
  }
  
  myDiagram.nodeTemplate =
    $(go.Node, 'Auto', { zOrder: 10 },
      // new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, 'Rectangle', {
          fill: '#009CCC', strokeWidth: 1, stroke: '#009CCC',
          width: 6, stretch: go.GraphObject.Vertical, alignment: go.Spot.Left,
          // if a user clicks the colored portion of a node, cycle through colors
          click: function (e: any, obj: any) {
            myDiagram.startTransaction('Update node color');
            let newColor = parseInt(obj.part.data.color) + 1;
            if (newColor > noteColors.length - 1) newColor = 0;
            myDiagram.model.setDataProperty(obj.part.data, 'color', newColor);
            myDiagram.commitTransaction('Update node color');
          },
        },
        new go.Binding('fill', 'color', getNoteColor),
        new go.Binding('stroke', 'color', getNoteColor),
      ),
      $(go.Panel, 'Auto',
        $(go.Shape, 'Rectangle', { fill: 'white', stroke: '#CCCCCC' }),
        $(go.Panel, 'Table',
          { width: 130, minSize: new go.Size(NaN, 50) },
          $(go.TextBlock,
            {
              name: 'TEXT',
              margin: 6, font: '11px Lato, sans-serif', editable: true,
              stroke: '#000', maxSize: new go.Size(130, NaN),
              alignment: go.Spot.TopLeft,
            },
            new go.Binding('text', 'text').makeTwoWay()),
        ),
      ),
    );
  
  myDiagram.linkTemplate =
    $(MultiArrowLink, // go.Link.Orthogonal,
      { fromEndSegmentLength: 26, toEndSegmentLength: 16 },
      $(go.Shape,
        new go.Binding('stroke', 'color'),
      ),
      new go.Binding('points'),
    );
  
  // unmovable node that acts as a button
  myDiagram.nodeTemplateMap.add(
    'BIT',
    generateBitInstructionTemplate(),
  );
  
  myDiagram.nodeTemplateMap.add(
    'BOX',
    generateBoxInstructionTemplate(),
  );
  
  myDiagram.groupTemplate = generateGroupTemplate(myDiagram);
  
  
  load();
  
}  // end init

// Show the diagram's model in JSON format
function save() {
  // document.getElementById('mySavedModel').v = myDiagram.model.toJson();
  // myDiagram.isModified = false;
}

function load() {
  // myDiagram.model = go.Model
  //   .fromJson((document.getElementById('mySavedModel') as HTMLTextAreaElement).value);
  // myDiagram.delayInitialization(relayoutDiagram);
  const instruction: IInstructionData = {
    key: 'BoxTest',
    name: 'TEST',
    category: 'BOX',
    instructionDirection: 'IN',
    displayType: 'box',
    group: 'Problems',
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
      linkFromPortIdProperty: 'fromPort',  // required information:
      linkToPortIdProperty: 'toPort',      // identifies data property names
      nodeDataArray: [
        instruction,
        instruction2,
        {
          instructionDirection: 'IN',
          key: -1,
          group: 'Problems',
          category: 'BIT',
          loc: '12 35.52284749830794',
          desc: '',
        },
        { instructionDirection: 'IN', key: -2, group: 'Problems', category: 'BIT', desc: '' },
        {
          group: 'Problems',
          instructionDirection: 'OUT',
          key: 'Xi',
          color: 'tomato',
          category: 'BIT',
          height: 150,
          desc: '',
        },
        {
          group: 'Problems',
          instructionDirection: 'OUT',
          key: 'Omicron',
          color: 'goldenrod',
          category: 'BIT',
          desc: '',
        },
        { group: 'Problems', instructionDirection: 'OUT', key: 'Pi', color: 'orange', category: 'BIT', desc: '' },
        { group: 'Problems', instructionDirection: 'OUT', key: 'Rho', color: 'coral', category: 'BIT', desc: '' },
        {
          group: 'Problems',
          instructionDirection: 'OUT',
          key: 'Sigma',
          color: 'tomato',
          category: 'BIT',
          desc: '',
        },
        {
          group: 'Problems',
          instructionDirection: 'OUT',
          key: 'Tau',
          color: 'goldenrod',
          category: 'BIT',
          desc: '',
        },
        {
          group: 'Problems',
          instructionDirection: 'OUT',
          key: 'Upsilon',
          color: 'orange',
          category: 'BIT',
          desc: '',
        },
        { group: 'Problems', instructionDirection: 'OUT', key: 'Phi', color: 'coral', category: 'BIT', desc: '' },
        { group: 'Problems', instructionDirection: 'OUT', key: 'Chi', color: 'tomato', category: 'BIT', desc: '' },
        {
          group: 'Problems',
          instructionDirection: 'OUT',
          key: 'Psi',
          color: 'goldenrod',
          category: 'BIT',
          desc: '',
        },
        {
          group: 'Problems',
          instructionDirection: 'OUT',
          key: 'Omega',
          color: 'orange',
          category: 'BIT',
          desc: 'Last out node test',
        },
        { key: 'Problems', text: '0', isGroup: true, loc: '0 23.52284749830794', diagnostics: [] },
      ],
    },
  );
  myDiagram.delayInitialization(relayoutDiagram);
}

export function addRung(rungData: go.ObjectData) {
  myDiagram.model.addNodeData(rungData);
}
