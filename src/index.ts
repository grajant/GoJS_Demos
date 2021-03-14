import { addRung, initGridLayout } from './kanban_sample/kanban_sample';
import * as go from 'gojs';
import { initBasic } from './basic_sample/basic-sample';
// import { initSerpentineLayout } from './serpentine_sample/serpentine_sample';

const endRung: go.ObjectData = {
    key: 'EndRung',
    text: '(End)',
    isGroup: true,
    color: '0',
    loc: '800 23.52284749830794',
    diagnostics: null,
};

const otherRungNode: go.ObjectData = {
    'key': 20,
    'text': 'text for twoA',
    'group': '1',
    'color': '1',
    'loc': '121 35.52284749830794',
    category: 'newbutton',
    desc: '',
};
const otherRung = Object.assign({}, endRung)
otherRung.key = '1';
otherRung.text = '100';
otherRung.diagnostics = [{errorCode: 15}];
console.log(otherRung);

initKanbanSample();

// const div = document.querySelector('#myDiagramDiv') as HTMLDivElement;
// const mixinDiagram = new MixinClass();
//
// mixinDiagram.div = div;
// mixinDiagram.setDiagramModel();

// initBasic();

function initKanbanSample() {
    initGridLayout();
    
    addRung(otherRung);
    addRung(Object.assign({ key: '467', text: '10' }, endRung));
    addRung(Object.assign({ key: '7987', text: '15' }, endRung));
    addRung(Object.assign({ key: '77', text: '16' }, endRung));
    addRung(endRung);
}
