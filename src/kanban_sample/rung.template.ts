import * as go from 'gojs/release/go-debug';
import { ERungMeasures, MIN_WIDTH_HEADER, PLACEHOLDER_OFFSET, PoolLayout } from './pool-layout';

export namespace LibraryColors {
  export const PRIMARY_600_CONTRAST = '#FFF';
  export const BG_6_CONTRAST = '#000';
  export const SECONDARY_600 = '#235D9F';
  export const STATUS_ERROR = '#AA0000';
}

export const enum ERungElements {
  HEADER = 'HEADER',
  HEADER_SEL = 'HEADER_SELECTION',
  HEADER_CONTENT = 'HEADER_CONTENT',
  HEADER_TEXT = 'HEADER_TEXT',
  RUNG_CONTENT = 'RUNG_CONTENT',
  INIT_RAIL_LINE = 'RungLine',
  END_RAIL_LINE = 'EndRailLine',
  INIT_RAIL = 'InitRail',
}

export const enum ENodeElements {
  DESC_CONTENT = 'DescContent',
  DESC_SPACING = 'DescSpacing',
}

export namespace RungColors {
  export const TRANSPARENT = 'rgba(0,0,0,0)';
  export const HEADER_SELECTED = LibraryColors.SECONDARY_600;
  export const RAIL_NORMAL = LibraryColors.BG_6_CONTRAST;
  export const RAIL_ERROR = LibraryColors.STATUS_ERROR;
  export const TEXT_NORMAL = LibraryColors.BG_6_CONTRAST;
  export const TEXT_SELECTED = LibraryColors.PRIMARY_600_CONTRAST;
  export const ERROR_ICON_STROKE = LibraryColors.PRIMARY_600_CONTRAST;
}

export const END_RUNG_KEY = 'EndRung';
export const $ = go.GraphObject.make;

export function generateGroupTemplate(diagram: go.Diagram): go.Group {
  return $(go.Group, 'Horizontal',
    {
      movable: true,
      selectable: true,
      selectionAdorned: false,
      selectionObjectName: ERungElements.HEADER_SEL, // even though its not selectable, this is used in the layout
      locationObjectName: 'PlaceholderShape',
      layerName: 'Background',  // all lanes are always behind all nodes and links
      layout: $(go.GridLayout,  // automatically lay out the lane's subgraph
          {
              wrappingColumn: Infinity,
              cellSize: new go.Size(1, 1),
              spacing: new go.Size(0, 0),
              alignment: go.GridLayout.Location,
              // comparer: function (a: go.Part, b: go.Part) {  // can re-order tasks within a lane
              //     return PoolLayout.comparer(a, b, false);
              // }
          }),
      computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
      handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
      mouseDragEnter: function (e, grp, _prev) {
        highlightGroup(grp, true, diagram);
      },
      mouseDragLeave: function (e, grp, _next) {
        highlightGroup(grp, false, diagram);
      },
      mouseDrop: function (e, grp) {  // dropping a copy of some Nodes and Links onto this Group adds them to this Group
        // don't allow drag-and-dropping a mix of regular Nodes and Groups
        if (e.diagram.selection.all(function (n) {
          return !(n instanceof go.Group);
        })) {
          const group = grp as go.Group;
          if (group.diagram) {
            const ok = group.addMembers(group.diagram.selection, true);
            if (!ok) group?.diagram?.currentTool.doCancel();
          }

        }
      },
    },
    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
    new go.Binding('isSubGraphExpanded', 'expanded').makeTwoWay(),
    new go.Binding('selectable', 'key', endRungValidation),
    rungHeaderTemplate(),
    rungBodyTemplate(),
  );  // end Group
}

// While dragging, highlight the dragged-over group
function highlightGroup(grp: any, show: any, diagram: go.Diagram) {
  if (show) {
    const part = diagram.toolManager.draggingTool.currentPart;
    if (part?.containingGroup !== grp) {
      grp.isHighlighted = true;
      return;
    }
  }
  grp.isHighlighted = false;
}

function rungHeaderTemplate(): go.Panel {
  return $(go.Panel, 'Spot',
    {
      name: ERungElements.HEADER,
      alignment: go.Spot.TopLeft,
      background: RungColors.TRANSPARENT,
      defaultStretch: go.GraphObject.Horizontal,
    },
    $(go.Shape, 'Rectangle',
      {
        name: ERungElements.HEADER_SEL, fill: '#08659c', stroke: null,
        strokeWidth: 0, desiredSize: new go.Size(MIN_WIDTH_HEADER, NaN),
      },
      new go.Binding('fill', 'isSelected', (isSelected: boolean): string => {
        return isSelected ? RungColors.HEADER_SELECTED : RungColors.TRANSPARENT;
      }).ofObject(),
    ),
    $(go.Shape, 'Rectangle',
      {
        name: 'headerSpacing',
        width: 1, stroke: null, strokeWidth: 0, alignment: go.Spot.Right,
        alignmentFocus: go.Spot.Right, fill: LibraryColors.PRIMARY_600_CONTRAST,
      },
      new go.Binding('height', 'height').ofObject(ERungElements.HEADER_SEL),
    ),
    $(go.Panel, 'Horizontal',
      {
        name: ERungElements.HEADER_CONTENT,
        height: 18,
        padding: new go.Margin(0, 10, 0, 8),
        alignment: go.Spot.TopLeft, alignmentFocus: new go.Spot(0, 0.5, 0, -40),
        // background: 'lightgreen',
      },
      $(go.TextBlock, // Rung number
        {
          name: ERungElements.HEADER_TEXT, font: '14px Lato, sans-serif', // background: 'lightblue',
          editable: false, margin: new go.Margin(0, 0, 0, 0),
          alignment: go.Spot.MiddleLeft, alignmentFocus: go.Spot.MiddleLeft,
        },
        new go.Binding('text', 'text'),
        new go.Binding('stroke', 'isSelected', (isSelected: boolean): string => {
          return isSelected ? RungColors.TEXT_SELECTED : RungColors.TEXT_NORMAL;
        }).ofObject(),
      ),
      errorIconTemplate(),
    ),
  );  // end Spot Panel
}

function rungBodyTemplate(): go.Panel {
  return $(go.Panel, 'Spot',
    $(go.Shape, 'Rectangle',  // Reference object for the spot panel
      {
        isPanelMain: true, name: ERungElements.RUNG_CONTENT, desiredSize: new go.Size(NaN, 84),
        stroke: null, strokeWidth: 0, alignment: go.Spot.TopLeft, // background: 'grey',
      },
      new go.Binding('fill', 'isHighlighted', function (h) {
        return h ? '#D6D6D6' : RungColors.TRANSPARENT;
      }).ofObject(),
    ),
    // Init rail
    railTemplate(ERungElements.INIT_RAIL, go.Spot.Left),
    // End rail
    railTemplate('endRail', go.Spot.Right),
    
    $(go.Shape, 'Rectangle',
      {
        name: ERungElements.INIT_RAIL_LINE,
        height: 0, width: 16,
        strokeWidth: 1,
        alignment: go.Spot.TopLeft,
        alignmentFocus: new go.Spot(0, 0, 0, -1 * ERungMeasures.RUNG_OFFSET),
      },
      new go.Binding('stroke', 'diagnostics', diagnosticsColorConversion),
    ),
    
    // This is where all the content is placed
    $(go.Shape, 'Rectangle',
      {
        name: ERungElements.END_RAIL_LINE,
        height: 0, width: 0,
        strokeWidth: 1,
        alignment: new go.Spot(1, 0, 0, ERungMeasures.RUNG_OFFSET),
        alignmentFocus: go.Spot.TopRight,
      },
      new go.Binding('stroke', 'stroke').ofObject(ERungElements.INIT_RAIL_LINE),
    ),
    $(go.Shape,
      {
        name: 'PlaceholderShape',
        fill: 'transparent',
        strokeWidth: 0,
        alignment: go.Spot.TopLeft,
        alignmentFocus: go.Spot.TopLeft,
      },
      new go.Binding('width', 'width').ofObject(ERungElements.RUNG_CONTENT),
      new go.Binding('height', 'height').ofObject(ERungElements.RUNG_CONTENT),
    ),
  );  // end Spot Panel
}

function railTemplate(name: string, alignment: go.Spot): go.Shape {
  return $(go.Shape, 'Rectangle',
    {
      name: name,
      width: 1, stroke: null, strokeWidth: 0, alignment,
      alignmentFocus: go.Spot.Left, fill: RungColors.RAIL_ERROR,
    },
    new go.Binding('height', 'height')
      .ofObject(ERungElements.RUNG_CONTENT),
    new go.Binding('fill', 'stroke').ofObject(ERungElements.INIT_RAIL_LINE),
  );
}

function errorIconTemplate(): go.Panel {
  return $(go.Panel, 'Spot', {},
    $(go.Shape, 'Circle',
      {
        fill: RungColors.RAIL_ERROR, desiredSize: new go.Size(16, 16),
        stroke: RungColors.ERROR_ICON_STROKE, strokeWidth: 1,
        alignment: go.Spot.Right, alignmentFocus: go.Spot.Right,
        margin: new go.Margin(0, 0, 0, 8),
      },
    ),
    $(go.Shape, 'XLine',
      { width: 6, height: 6, stroke: RungColors.ERROR_ICON_STROKE, strokeWidth: 2, alignment: go.Spot.Center },
    ),
    new go.Binding('visible', 'diagnostics', hasDiagnostics),
  );
}

function endRungValidation(key: string): boolean {
  return key !== END_RUNG_KEY;
}

function diagnosticsColorConversion(diagnostics: any[]): string {
  return hasDiagnostics(diagnostics)
    ? RungColors.RAIL_ERROR
    : RungColors.RAIL_NORMAL;
}

function hasDiagnostics(diagnostics?: any[]): boolean {
  if (!diagnostics) return false;
  
  return !!diagnostics.length;
}
