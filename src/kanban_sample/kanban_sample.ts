import * as go from 'gojs/release/go-debug';
import { PoolLayout } from './pool-layout';
import { $, ENodeElements, generateGroupTemplate } from './rung.template';
import { MultiArrowLink } from '../serpentine_sample/multi-arrow-link';
import { NonRealtimeDraggingTool } from '../ghost_dragging/ghost-dragging';

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

let wasCopied = false;

function onSelectionCopied(event: go.DiagramEvent) {
  wasCopied = true;
  // console.warn('selection copied');
  event.subject.each((part: go.Part) => {
    const nodeDescSpacing = part.findObject(ENodeElements.DESC_SPACING);
    
    if (nodeDescSpacing) {
      nodeDescSpacing.height = 5;
    }
  });
  relayoutDiagram();
}

function onLayoutCompleted() {
  console.warn('init layout');
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
        'SelectionMoved': relayoutDiagram,  // this DiagramEvent listener is
        'ClipboardPasted': onSelectionCopied, // defined above
        'InitialLayoutCompleted': onLayoutCompleted,
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
    
    if (copiedPosition) {
      if (partCollection.first()) {
        // @ts-ignore
        partCollection.first().position = copiedPosition;
        // @ts-ignore
        partCollection.first().x = 100;
      }
    }
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
  myDiagram.nodeTemplateMap.add('newbutton',
    $(go.Node, go.Panel.Table,
      {
        defaultColumnSeparatorStrokeWidth: 0,
        defaultRowSeparatorStrokeWidth: 0,
        defaultSeparatorPadding: 0,
        background: 'transparent',
        // zOrder: 2,
      },
      $(go.RowColumnDefinition, { column: 3, maximum: 16 }),
      
      $(go.Panel, 'Auto', {
          row: 1,
          rowSpan: 2,
          column: 0,
          columnSpan: 3,
          stretch: go.GraphObject.Fill,
          minSize: new go.Size(60, NaN),
        },
        $(go.Shape, 'RoundedRectangle',
          {
            strokeWidth: 1, fill: 'white', stretch: go.GraphObject.Fill,
          },
          new go.Binding('stroke', 'isSelected',
            (isSelected: boolean) => isSelected ? 'lightblue' : 'grey')
            .ofObject(),
        ),
      ),
      
      // Desc Row
      $(go.Panel, go.Panel.TableRow, { row: 0 },
        $(go.Panel, go.Panel.Vertical, { column: 0, columnSpan: 3 },
          $(go.Shape, 'Rectangle',
            {
              name: ENodeElements.DESC_SPACING,
              width: 0, height: 0,
              strokeWidth: 0,
            },
          ),
          $(go.Panel, 'Auto',
            { name: ENodeElements.DESC_CONTENT },
            $(go.Shape, 'Rectangle',
              {
                fill: '#dddddd', strokeWidth: 0,
                minSize: new go.Size(0, 0),
              },
            ),
            $(go.TextBlock,
              { stroke: '#000', margin: 8 },
              new go.Binding('text', 'desc'),
            ),
            // new go.Binding('visible', 'desc', (desc: string): boolean => desc.length > 0),
            new go.Binding('height', 'desc', (desc: string): number => desc.length > 0 ? NaN : 0),
          ),
        ),
      ),
      
      // Operand Row
      $(go.Panel, go.Panel.TableRow, { row: 1 },
        $(go.Panel, 'Auto',
          {
            column: 0, columnSpan: 3,
          },
          $(go.Shape, 'Rectangle',
            {
              stretch: go.GraphObject.Horizontal,
              height: 24, strokeWidth: 0,
            },
            new go.Binding('fill', 'isSelected',
              (isSelected: boolean) => isSelected ? 'lightblue' : 'transparent')
              .ofObject(),
          ),
          $(go.TextBlock,
            {
              name: 'OperandShape',
              column: 0, columnSpan: 3,
              alignment: go.Spot.Center,
              text: '?',
              textAlign: 'center',
              minSize: new go.Size(80, NaN),
              margin: new go.Margin(0, 4, 0, 4),
            },
            new go.Binding('stroke', 'isSelected',
              (isSelected: boolean) => isSelected ? 'white' : 'black')
              .ofObject(),
            new go.Binding('text', 'key'),
          ),
        ),
      ),
      
      // Instruction Shape Row
      $(go.Panel, go.Panel.TableRow,
        { row: 2 },
        $(go.Panel, go.Panel.Vertical,
          {
            column: 0, columnSpan: 3,
            stretch: go.GraphObject.Horizontal,
            padding: new go.Margin(16, 0, 0, 0),
            height: 32,
          },
          $(go.Shape, 'Rectangle',
            {
              stretch: go.GraphObject.Horizontal,
              alignment: go.Spot.Left,
              height: 0, strokeWidth: 1,
              fromSpot: go.Spot.MiddleRight,
              toSpot: go.Spot.MiddleLeft,
              portId: '',
            },
            new go.Binding('width', 'width', (width: number): number => {
              console.log('shape w', width);
              return width / 2;
            }).ofObject('OperandShape'),
          ),
          new go.Binding('height', 'height'),
        ),
        $(go.Panel, go.Panel.Vertical,
          {
            background: 'transparent',
            column: 3, height: 32,
            stretch: go.GraphObject.Horizontal,
            padding: new go.Margin(12, 0, 0, 4),
          },
          $(go.Shape, 'Rectangle',
            {
              alignment: go.Spot.TopLeft,
              desiredSize: new go.Size(7, 7),
              strokeWidth: 1,
              fill: 'green',
              visible: true,
            },
          ),
          new go.Binding('height', 'height'),
        ),
      ),
    ),
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
  myDiagram.model = new go.GraphLinksModel(
    [
      {
        instructionDirection: 'IN',
        key: -1,
        group: 'Problems',
        category: 'newbutton',
        loc: '12 35.52284749830794',
        desc: 'This is a short description',
      },
      { instructionDirection: 'IN', key: -2, group: 'Problems', category: 'newbutton', desc: '' },
      {
        group: 'Problems',
        instructionDirection: 'OUT',
        key: 'Xi',
        color: 'tomato',
        category: 'newbutton',
        height: 150,
        desc: '',
      },
      {
        group: 'Problems',
        instructionDirection: 'OUT',
        key: 'Omicron',
        color: 'goldenrod',
        category: 'newbutton',
        desc: '',
      },
      { group: 'Problems', instructionDirection: 'OUT', key: 'Pi', color: 'orange', category: 'newbutton', desc: '' },
      { group: 'Problems', instructionDirection: 'OUT', key: 'Rho', color: 'coral', category: 'newbutton', desc: '' },
      {
        group: 'Problems',
        instructionDirection: 'OUT',
        key: 'Sigma',
        color: 'tomato',
        category: 'newbutton',
        desc: '',
      },
      {
        group: 'Problems',
        instructionDirection: 'OUT',
        key: 'Tau',
        color: 'goldenrod',
        category: 'newbutton',
        desc: '',
      },
      {
        group: 'Problems',
        instructionDirection: 'OUT',
        key: 'Upsilon',
        color: 'orange',
        category: 'newbutton',
        desc: '',
      },
      { group: 'Problems', instructionDirection: 'OUT', key: 'Phi', color: 'coral', category: 'newbutton', desc: '' },
      { group: 'Problems', instructionDirection: 'OUT', key: 'Chi', color: 'tomato', category: 'newbutton', desc: '' },
      {
        group: 'Problems',
        instructionDirection: 'OUT',
        key: 'Psi',
        color: 'goldenrod',
        category: 'newbutton',
        desc: '',
      },
      {
        group: 'Problems',
        instructionDirection: 'OUT',
        key: 'Omega',
        color: 'orange',
        category: 'newbutton',
        desc: '',
      },
      { key: 'Problems', text: '0', isGroup: true, loc: '0 23.52284749830794', diagnostics: [] },
    ],
  );
  myDiagram.delayInitialization(relayoutDiagram);
}

export function addRung(rungData: go.ObjectData) {
  myDiagram.model.addNodeData(rungData);
}
