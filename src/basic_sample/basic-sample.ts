import { $ } from '../kanban_sample/rung.template';
import * as go from 'gojs/release/go-debug';

let myDiagram: go.Diagram;

export function initBasic() {
  
  myDiagram =
    $(go.Diagram, 'myDiagramDiv',
      {
        // start everything in the middle of the viewport
        
        // disallow nodes to be dragged to the diagram's background
      },
    );
  
  myDiagram.nodeTemplate =
    $(go.Node, go.Panel.Auto,
      $(go.Shape, 'RoundedRectangle',
        { fill: 'lightgreen' },
      ),
      $(go.TextBlock,
        { minSize: new go.Size(88, 24) },
        new go.Binding('text', 'name'),
      ),
      $(go.Shape, 'Rectangle',
        { fill: 'tomato', minSize: new go.Size(88, 24) },
      ),
    );
  
  load();
}

function load() {
  // myDiagram.model = go.Model
  //   .fromJson((document.getElementById('mySavedModel') as HTMLTextAreaElement).value);
  // myDiagram.delayInitialization(relayoutDiagram);
  myDiagram.model = new go.GraphLinksModel(
    [
      {
        name: 'Test',
        instructionDirection: 'IN',
        key: 20,
        group: 'Problems',
        category: '',
        loc: '12 35.52284749830794',
        desc: 'This is a short description',
      },
    ],
  );
}
