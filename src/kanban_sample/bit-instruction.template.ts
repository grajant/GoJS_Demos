import { $, ENodeElements, LD_COMMON_COLORS, LibraryColors } from './rung.template';
import * as go from 'gojs';
import { EFigures } from './figures.template';

export interface IBitShapeProperties {
  desiredSize: go.Size;
  figure: string;
  fill: string;
}

const enum BitShapeProperties {
  SIZE = 'defaultSize',
  FIGURE = 'figure',
  FILL = 'fill',
}

const enum BitShapeLoc {
  LEFT,
  RIGHT,
}

const enum BitType {
  CONTACT = 'contact',
  COIL = 'coil',
}

export const generateBitInstructionTemplate = (): go.Node =>
  $(go.Node, go.Panel.Table,
    {
      selectionAdorned: false,
      defaultColumnSeparatorStrokeWidth: 0,
      defaultRowSeparatorStrokeWidth: 0,
      defaultSeparatorPadding: 0,
      background: 'transparent',
      zOrder: 2,
    },
    $(go.RowColumnDefinition, { row: 2, height: 32, maximum: 32 }),
    $(go.RowColumnDefinition, { column: 0, maximum: 20 }),
    $(go.RowColumnDefinition, { column: 1, background: 'rgba(106,245,47,0.5)' }),
    $(go.RowColumnDefinition, { column: 2, maximum: 20 }),
    $(go.RowColumnDefinition, { column: 3, maximum: 16 }),
    
    // Desc Row
    $(go.Panel, go.Panel.TableRow, { row: 0 },
      $(go.Panel, go.Panel.Vertical, { column: 0, columnSpan: 3, background: '#f3dea8' },
        $(go.Shape, 'Rectangle',
          {
            fill: 'lightblue',
            name: ENodeElements.DESC_SPACING,
            width: 0, height: 0,
            strokeWidth: 0,
          },
        ),
        $(go.Panel, 'Auto',
          { name: ENodeElements.DESC_CONTENT, background: '#cea8f3' },
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
    
    headerTemplate(),
    bodyTemplate(),
    nodeBorder(),
    
  
    headerSelection(),
    bodySelection(),
  );

const nodeBorder = (): go.Panel => {
  return $(go.Panel, 'Auto', {
      row: 1,
      rowSpan: 2,
      column: 0,
      columnSpan: 3,
      stretch: go.GraphObject.Fill,
      minSize: new go.Size(60, NaN),
    },
    $(go.Shape, EFigures.FULL_CONTENT_SHAPE,
      {
        stretch: go.GraphObject.Fill,
        strokeWidth: 1, fill: LD_COMMON_COLORS.TRANSPARENT,
      },
      new go.Binding('stroke', 'isSelected',
        (isSelected: boolean) => isSelected ? LD_COMMON_COLORS.SELECTION_ACTIVE : LD_COMMON_COLORS.TRANSPARENT)
        .ofObject(),
    ),
  );
};

export const headerTemplate = (): go.Panel => {
  return $(go.Panel, go.Panel.TableRow, { row: 1 },
    $(go.Panel, 'Auto',
      {
        column: 0, columnSpan: 3,
        stretch: go.GraphObject.Fill,
      },
      $(go.Shape, EFigures.HEADER_SHAPE,
        {
          stretch: go.GraphObject.Fill,
          height: 24, strokeWidth: 0,
          fill: LD_COMMON_COLORS.TRANSPARENT,
        },
        new go.Binding('fill', 'isHeaderSelected',
          (isHeaderSelected: boolean, thisObj: go.GraphObject) => {
            const isSelected = !!thisObj.part?.isSelected;
            return (isHeaderSelected && isSelected) ? LD_COMMON_COLORS.SELECTION_ACTIVE : LD_COMMON_COLORS.TRANSPARENT;
          }),
        new go.Binding('stroke', 'isSelected',
          (isSelected: boolean) => isSelected ? LD_COMMON_COLORS.SELECTION_ACTIVE : LD_COMMON_COLORS.TRANSPARENT)
          .ofObject(),
      ),
    ),
    $(go.TextBlock,
      {
        name: 'OperandShape',
        column: 1,
        editable: true,
        alignment: go.Spot.Center,
        text: '?',
        font: '14px Verdana',
        textAlign: 'center',
        minSize: new go.Size(48, NaN),
      },
      new go.Binding('stroke', 'isBodySelected', (_: boolean, thisObj: go.GraphObject) => {
        const isSelected = !!thisObj.part?.isSelected;
        const isHeaderSelected = !!thisObj.part?.data?.isHeaderSelected;
        
        if (!isHeaderSelected && isSelected) return LD_COMMON_COLORS.SELECTION_ACTIVE;
        return (isHeaderSelected && isSelected) ? LD_COMMON_COLORS.HEADER_TEXT_SELECTED : LibraryColors.BG_6_CONTRAST;
      }),
      new go.Binding('stroke', 'isHeaderSelected', (isHeaderSelected: boolean, thisObj: go.GraphObject) => {
        const isSelected = !!thisObj.part?.isSelected;
        
        if (!isHeaderSelected && isSelected) return LD_COMMON_COLORS.SELECTION_ACTIVE;
        return (isHeaderSelected && isSelected) ? LD_COMMON_COLORS.HEADER_TEXT_SELECTED : LibraryColors.BG_6_CONTRAST;
      }),
      new go.Binding('text', 'operand'),
    ),
  );
};

function headerSelection(): go.Panel {
  return $(go.Panel, 'Auto',
    {
      row: 1,
      column: 0, columnSpan: 3,
      stretch: go.GraphObject.Fill,
      click: (e: go.InputEvent, thisObj: go.GraphObject) => {
        console.debug('Clicked header panel', thisObj);
        // @ts-ignore
        thisObj.diagram?.model.setDataProperty(thisObj.part.data, 'isBodySelected', false);
        // @ts-ignore
        thisObj.diagram?.model.setDataProperty(thisObj.part.data, 'isHeaderSelected', true);
      },
    },
    $(go.Shape, EFigures.HEADER_SHAPE,
      {
        stretch: go.GraphObject.Fill,
        fill: LD_COMMON_COLORS.TRANSPARENT,
        stroke: LD_COMMON_COLORS.TRANSPARENT,
        // height: 24, strokeWidth: 1,
      },
    ),
  );
}

export const bodyTemplate = (): go.Panel => {
  return $(go.Panel, go.Panel.TableRow,
    { row: 2 },
    // Body selection
    $(go.Panel, 'Auto',
      {
        column: 0, columnSpan: 3,
        stretch: go.GraphObject.Fill,
      },
      $(go.Shape, EFigures.BODY_SHAPE,
        {
          name: 'BodySel',
          stretch: go.GraphObject.Fill,
          fill: LibraryColors.PRIMARY_600_CONTRAST,
          strokeWidth: 0,
        },
        new go.Binding('fill', 'isBodySelected', (isBodySelected: boolean, thisObj: go.GraphObject) => {
          const isSelected = !!thisObj.part?.isSelected;
          return (isBodySelected && isSelected) ? LD_COMMON_COLORS.SELECTION_ACTIVE : LibraryColors.PRIMARY_600_CONTRAST;
        }),
        new go.Binding('stroke', 'fill').ofObject('BodySel'),
      ),
    ),
    // Instr From Port Line
    $(go.Shape, 'Rectangle',
      new go.Binding('fill', 'isBodySelected', (isBodySelected: boolean, thisObj: go.GraphObject) => {
        const isSelected = !!thisObj.part?.isSelected;
        if (!isBodySelected && isSelected) return LD_COMMON_COLORS.SELECTION_ACTIVE;
        return (isBodySelected && isSelected) ? LD_COMMON_COLORS.HEADER_TEXT_SELECTED : LibraryColors.PRIMARY_500;
      }),
      new go.Binding('fill', 'isHeaderSelected', (_: boolean, thisObj: go.GraphObject) => {
        const isSelected = !!thisObj.part?.isSelected;
        const isBodySelected = !!thisObj.part?.data?.isBodySelected;
        if (!isBodySelected && isSelected) return LD_COMMON_COLORS.SELECTION_ACTIVE;
        return (isBodySelected && isSelected) ? LD_COMMON_COLORS.HEADER_TEXT_SELECTED : LibraryColors.PRIMARY_500;
      }),
      {
        name: 'InstrLine',
        alignment: go.Spot.Center,
        column: 0,
        height: 1, width: 20,
        strokeWidth: 0,
        toSpot: go.Spot.MiddleLeft,
        portId: 'IN',
        fill: LibraryColors.PRIMARY_500,
      },
    ),
    
    // Instr line
    $(go.Panel, go.Panel.Auto,
      // new go.Binding('background', 'fill').ofObject('InstrLine'),
      {
        column: 1,
        stretch: go.GraphObject.Horizontal,
        alignment: go.Spot.LeftCenter,
        height: 3,
        padding: new go.Margin(1, 0, 0, 0),
      },
      $(go.Shape,
        new go.Binding('fill', 'fill').ofObject('InstrLine'),
        {
          stretch: go.GraphObject.Horizontal,
          height: 1,
          strokeWidth: 0,
        }),
    ),
    bitInstrShape(),
    
    // Instr Line from spot
    $(go.Shape, 'Rectangle',
      new go.Binding('fill', 'fill').ofObject('InstrLine'),
      {
        column: 2,
        height: 1, width: 20,
        strokeWidth: 0,
        fromSpot: go.Spot.MiddleRight,
        portId: 'OUT',
      },
    ),
    // Dropping location
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
    ),
  );
};

function bodySelection(): go.Panel {
  return $(go.Panel, 'Auto',
    {
      row: 2,
      column: 0, columnSpan: 3,
      stretch: go.GraphObject.Fill,
      click: (e: go.InputEvent, thisObj: go.GraphObject) => {
        console.debug('Clicked body panel', thisObj?.part?.data);
        // @ts-ignore
        thisObj.diagram?.model.setDataProperty(thisObj.part.data, 'isBodySelected', true);
        // @ts-ignore
        thisObj.diagram?.model.setDataProperty(thisObj.part.data, 'isHeaderSelected', false);
      },
    },
    $(go.Shape, EFigures.BODY_SHAPE,
      {
        stretch: go.GraphObject.Fill,
        fill: LD_COMMON_COLORS.TRANSPARENT,
        stroke: LD_COMMON_COLORS.TRANSPARENT,
        strokeWidth: 0,
      },
    ),
  );
}

const bitInstrShape = () => {
  // @ts-ignore
  return $(go.Panel, go.Panel.Horizontal,
    {
      column: 1,
      alignment: go.Spot.Center,
    },
    $(go.Shape,
      new go.Binding('stroke', 'fill').ofObject('InstrLine'),
      new go.Binding('figure', 'displayType', (type: string, thisObj: go.GraphObject) =>
        getShapeProperties<string>(type, thisObj, BitShapeLoc.LEFT, BitShapeProperties.FIGURE),
      ),
      new go.Binding('desiredSize', 'displayType', (type: string, thisObj: go.GraphObject) =>
        getShapeProperties<go.Size>(type, thisObj, BitShapeLoc.LEFT, BitShapeProperties.SIZE),
      ),
      new go.Binding('fill', 'fill', (_fill: string, thisObj: go.GraphObject) => {
        const type = thisObj.part?.data.displayType;
        return getShapeProperties<go.Size>(type, thisObj, BitShapeLoc.LEFT, BitShapeProperties.FILL);
      }).ofObject('BodySel'),
      {
        name: 'InstrLeftShape',
      }
    ),
    $(go.Panel, go.Panel.Horizontal,
      new go.Binding('background', 'isBodySelected', (isBodySelected: boolean, thisObj: go.GraphObject) => {
        const isSelected = !!thisObj.part?.isSelected;
        return (isBodySelected && isSelected) ? LD_COMMON_COLORS.SELECTION_ACTIVE : LibraryColors.PRIMARY_600_CONTRAST;
      }),
      {
        name: 'InstrLabel',
        background: 'white',
        padding: new go.Margin(0, 4, 0, 4),
      },
      $(go.TextBlock,
        new go.Binding('stroke', 'isBodySelected', (isBodySelected: boolean, thisObj: go.GraphObject) => {
          const isSelected = !!thisObj.part?.isSelected;
          if (!isBodySelected && isSelected) return LD_COMMON_COLORS.SELECTION_ACTIVE;
          return (isBodySelected && isSelected) ? LD_COMMON_COLORS.HEADER_TEXT_SELECTED : LibraryColors.PRIMARY_800;
        }),
        new go.Binding('stroke', 'isHeaderSelected', (_: boolean, thisObj: go.GraphObject) => {
          const isSelected = !!thisObj.part?.isSelected;
          const isBodySelected = !!thisObj.part?.data?.isBodySelected;
          if (!isBodySelected && isSelected) return LD_COMMON_COLORS.SELECTION_ACTIVE;
          return (isBodySelected && isSelected) ? LD_COMMON_COLORS.HEADER_TEXT_SELECTED : LibraryColors.PRIMARY_800;
        }),
        new go.Binding('background', 'background').ofObject('InstrLabel'),
        {
          minSize: new go.Size(8, 16),
          background: 'white',
          font: '14px Verdana',
          textAlign: 'center',
          verticalAlignment: go.Spot.Bottom,
          stroke: LibraryColors.PRIMARY_800,
        },
        new go.Binding('text', 'name', (name: string, thisObj: go.GraphObject): string => {
          return thisObj.part?.data.shortName ?? name;
        }),
      ),
    ),
    $(go.Shape,
      new go.Binding('stroke', 'fill').ofObject('InstrLine'),
      new go.Binding('figure', 'displayType', (type: string, thisObj: go.GraphObject) =>
        getShapeProperties<string>(type, thisObj, BitShapeLoc.RIGHT, BitShapeProperties.FIGURE),
      ),
      new go.Binding('desiredSize', 'displayType', (type: string, thisObj: go.GraphObject) =>
        getShapeProperties<go.Size>(type, thisObj, BitShapeLoc.RIGHT, BitShapeProperties.SIZE),
      ),
      new go.Binding('fill', 'fill').ofObject('InstrLeftShape'),
    ),
  );
};

const getShapeProperties = <T>(type: string, obj: go.GraphObject, shapeLoc: BitShapeLoc, propertyName: BitShapeProperties): T => {
  let properties: IBitShapeProperties;
  
  switch (type) {
    case BitType.COIL:
      properties = getCoilProperties(shapeLoc, obj);
      break;
    case BitType.CONTACT:
      properties = getContactProperties(shapeLoc, obj);
      break;
    default:
      // Set default to null. However, switch should never
      // reach this case
      return null as unknown as T;
  }
  
  switch (propertyName) {
    case BitShapeProperties.FIGURE:
      return properties.figure as unknown as T;
    case BitShapeProperties.SIZE:
      return properties.desiredSize as unknown as T;
    case BitShapeProperties.FILL:
      return properties.fill as unknown as T;
  }
};

const getContactProperties = (shapeLoc: BitShapeLoc, obj: go.GraphObject): IBitShapeProperties => {
  const isSelected = !!obj.part?.isSelected;
  const instrName = obj.part?.data.name;
  
  let figure: string;
  let fill: string;
  let desiredSize: go.Size;
  
  if (instrName === 'XIC' || instrName === 'XIO') {
    figure = shapeLoc === BitShapeLoc.RIGHT ? EFigures.OPENING_BRACKET : EFigures.CLOSING_BRACKET;
    desiredSize = new go.Size(4, 16);
    fill = LD_COMMON_COLORS.TRANSPARENT;
  } else {
    figure = shapeLoc === BitShapeLoc.RIGHT ? EFigures.CLOSING_BRACKET : EFigures.OPENING_BRACKET;
    desiredSize = new go.Size(4, 16);
    fill = (obj.part?.findObject('BodySel') as go.Shape)?.fill?.toString() ?? '';
  }
  
  return { desiredSize, figure, fill };
};

const getCoilProperties = (shapeLoc: BitShapeLoc, obj: go.GraphObject): IBitShapeProperties => {
  const isSelected = !!obj.part?.isSelected;
  
  const figure = shapeLoc === BitShapeLoc.RIGHT ? EFigures.HALF_CIRCLE_RIGHT : EFigures.HALF_CIRCLE_LEFT;
  const desiredSize = new go.Size(8, 16);
  const fill = (obj.part?.findObject('BodySel') as go.Shape)?.fill?.toString() ?? '';
  
  return { desiredSize, figure, fill };
};
