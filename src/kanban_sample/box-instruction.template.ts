import * as go from 'gojs';
import { $, LD_COMMON_COLORS, LibraryColors } from './rung.template';
import { bitLegShape, EFigures, fullBorderedRectangle } from './figures.template';

go.Shape.defineFigureGenerator(
  EFigures.BIT_LEG_SHAPE,
  (_shape: go.Shape, w: number, h: number) => bitLegShape(w, h),
);

go.Shape.defineFigureGenerator(
  EFigures.BIT_LEG_SHAPE_FLIPPED,
  (_shape: go.Shape, w: number, h: number) => {
    const geo = bitLegShape(w, h);
    
    // Required to have geometry properly flipped.
    geo.scale(-1, 1).normalize();
    return geo;
  },
);

go.Shape.defineFigureGenerator(EFigures.HEADER_SHAPE, (_shape: go.Shape, w: number, h: number) => {
  const radius = 8;
  const pXTopLeft = radius;
  const pYTopLeft = radius;
  const geo = new go.Geometry();
  const fig = new go.PathFigure(0, h, true);
  geo.add(fig);
  fig
    .add(new go.PathSegment(go.PathSegment.Line, 0, pYTopLeft))
    .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, pXTopLeft, pYTopLeft, radius, radius))
    .add(new go.PathSegment(go.PathSegment.Line, w, 0))
    .add(new go.PathSegment(go.PathSegment.Line, w, h));
  return geo;
});

go.Shape.defineFigureGenerator(EFigures.BODY_SHAPE, (_shape: go.Shape, w: number, h: number) => {
  const radius = 8;
  const pXBotRight = w - radius;
  const pYBotRight = h - radius;
  const geo = new go.Geometry();
  const fig = new go.PathFigure(w, 0, true);
  geo.add(fig);
  fig.add(new go.PathSegment(go.PathSegment.Line, w, pYBotRight))
    .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, pXBotRight, pYBotRight, radius, radius))
    .add(new go.PathSegment(go.PathSegment.Line, 0, h))
    .add(new go.PathSegment(go.PathSegment.Line, 0, 0));
  geo.offset(0, -1);
  // geo.defaultStretch = go.GraphObject.Uniform;
  return geo;
});

go.Shape.defineFigureGenerator(
  EFigures.FULL_CONTENT_SHAPE,
  (_shape: go.Shape, w: number, h: number): go.Geometry =>
    fullBorderedRectangle(8, w, h),
);

export const errorSelectionColor = (isSelected: boolean, thisObj: go.GraphObject): string => {
  // @ts-ignore
  const diagnostics = thisObj.part.data.diagnostics;
  // const hasErrors = hasDiagnostics(diagnostics);
  // if (hasErrors) return LD_COMMON_COLORS.ERROR;
  return isSelected ? LD_COMMON_COLORS.SELECTION_ACTIVE : '#ddd';
};

export const enum ERows {
  DESC,
  HEADER,
  BODY,
}

export const enum EColumns {
  TO_SPOT,
  PARAMS_LABELS,
  PARAMS_SPACING,
  PARAMS_INPUTS,
  PARAMS_ARROWS,
  BIT_LEGS,
  DROPPING_LOCATION
}

export const enum EInstMeasures {
  MIDDLE_SPACING = 32,
  HEADER_HEIGHT = 24,
  BORDER_WIDTH = 1,
  INPUT_HEIGHT = 16,
  INST_SPACING = 16,
}

export const enum EInstElements {
  HEADER_SEL = 'HeaderSel'
  
}

export const generateBoxInstructionTemplate = (): go.Node =>
  $(go.Node, go.Panel.Table,
    {
      selectionAdorned: false,
      defaultColumnSeparatorStrokeWidth: 0,
      defaultRowSeparatorStrokeWidth: 0,
      defaultSeparatorPadding: 0,
      background: LD_COMMON_COLORS.TRANSPARENT,
    },
    $(go.RowColumnDefinition, { column: EColumns.TO_SPOT, maximum: EInstMeasures.INST_SPACING }),
    $(go.RowColumnDefinition, { column: EColumns.PARAMS_ARROWS, width: 20, maximum: 28, separatorPadding: 4 }),
    $(go.RowColumnDefinition, { column: EColumns.DROPPING_LOCATION, maximum: EInstMeasures.INST_SPACING }),
    // SELECTION_ZONE
    // $(go.Panel, go.Panel.Auto,
    //   {
    //     row: ERows.HEADER, rowSpan: 2,
    //     column: EColumns.PARAMS_LABELS, columnSpan: 4,
    //     stretch: go.GraphObject.Fill,
    //   },
    //   $(go.Shape, EFigures.FULL_CONTENT_SHAPE,
    //     {
    //       stretch: go.GraphObject.Fill,
    //       fill: LD_COMMON_COLORS.TRANSPARENT,
    //       strokeWidth: 1,
    //     },
    //   ),
    // ),
    
    // HEADER
    $(go.Panel, go.Panel.TableRow, { row: ERows.HEADER },
      $(go.Panel, go.Panel.Auto,
        {
          column: EColumns.PARAMS_LABELS, columnSpan: 4,
          stretch: go.GraphObject.Horizontal,
          alignment: go.Spot.Left,
        },
        headerShape,
        $(go.TextBlock,
          {
            margin: new go.Margin(0, 0, 0, 8),
            alignment: go.Spot.Left,
            stroke: LD_COMMON_COLORS.HEADER_TEXT_NORMAL,
            font: '14px Verdana',
          },
          new go.Binding('text', 'name'),
        ),
      ),
    ),
    
    // BODY
    $(go.Panel, go.Panel.TableRow, { row: ERows.BODY },
      // Surrounding Panel
      $(go.Panel, go.Panel.Auto,
        {
          stretch: go.GraphObject.Fill,
          row: ERows.BODY, rowSpan: 2,
          column: EColumns.PARAMS_LABELS, columnSpan: 4,
        },
        $(go.Shape, EFigures.BODY_SHAPE,
          {
            strokeWidth: 1,
            stretch: go.GraphObject.Fill,
            fill: LD_COMMON_COLORS.TRANSPARENT,
          },
        ),
      ),
      
      // To Spot Line
      $(go.Panel, go.Panel.Horizontal,
        {
          alignment: go.Spot.TopLeft,
          margin: new go.Margin(16, 0, 0, 0),
        },
        $(go.Shape, 'Rectangle',
          new go.Binding('fill', 'isSelected',
            (isSelected: boolean): string => isSelected ? LD_COMMON_COLORS.SELECTION_ACTIVE : LibraryColors.PRIMARY_500).ofObject(),
          {
            portId: 'IN', toSpot: go.Spot.MiddleLeft,
            desiredSize: new go.Size(EInstMeasures.INST_SPACING, 1),
            strokeWidth: 0,
          },
        ),
      ),
      
      // Parameters Labels
      $(go.Panel, go.Panel.Vertical,
        {
          alignment: go.Spot.TopLeft,
          // background: 'rgba(246,229,81,0.2)',
          column: EColumns.PARAMS_LABELS,
          padding: new go.Margin(8, 0, 0, 8),
          itemTemplate: onFaceParametersLabels,
        },
        new go.Binding('itemArray', 'onFaceParameters'),
      ),
      
      // Middle Spacing
      $(go.Shape, 'Rectangle',
        {
          column: EColumns.PARAMS_SPACING,
          width: EInstMeasures.MIDDLE_SPACING, height: 2,
          strokeWidth: 0,
          fill: LD_COMMON_COLORS.TRANSPARENT,
        },
      ),
      // Parameters Inputs
      $(go.Panel, go.Panel.Vertical,
        {
          column: EColumns.PARAMS_INPUTS,
          alignment: go.Spot.TopRight,
          // background: 'rgba(255, 200, 0, 0.2)',
          padding: new go.Margin(8, 0, 0, 0),
          itemTemplate: onFaceParametersInputs,
        },
        new go.Binding('itemArray', 'onFaceParameters'),
      ),
      // Parameters arrows and inst config
      $(go.Panel, go.Panel.Vertical,
        {
          column: EColumns.PARAMS_ARROWS,
          alignment: go.Spot.TopLeft,
          // background: 'rgba(0, 0, 250, 0.2)',
          padding: new go.Margin(8, 4, 0, 0),
          itemTemplate: onFaceParamsArrows,
        },
        new go.Binding('itemArray', 'onFaceParameters'),
      ),
      
      // Bit legs
      $(go.Panel, go.Panel.Vertical,
        {
          column: EColumns.BIT_LEGS, columnSpan: 1,
          alignment: go.Spot.TopLeft,
          // background: 'rgba(250, 0, 0, 0.5)',
          padding: new go.Margin(0, 0, 0, 0),
          itemTemplate: bitLegsParamsTemplate,
        },
        new go.Binding('itemArray', 'bitLegParameters'),
        new go.Binding('padding', 'bitLegDictatingRungState', (isBitDictating: boolean): go.Margin =>
          isBitDictating ? new go.Margin(0, 0, 0, 0) : new go.Margin(24, 0, 0, 0),
        ),
      ),
      
      // Rung Line
      $(go.Panel, go.Panel.Horizontal,
        new go.Binding('visible', 'bitLegDictatingRungState',
          (isBitDictating: boolean): boolean => !isBitDictating,
        ),
        new go.Binding('portId', 'bitLegDictatingRungState',
          (isBitDictating: boolean): string | null => isBitDictating ? null : 'OUT',
        ),
        {
          alignment: go.Spot.TopLeft,
          column: EColumns.BIT_LEGS,
          margin: new go.Margin(16, 0, 0, 0),
          stretch: go.GraphObject.Horizontal,
          height: 1,
          background: LibraryColors.PRIMARY_500,
        },
      ),
      
      // Dropping location
      $(go.Panel, go.Panel.Vertical,
        {
          alignment: go.Spot.TopLeft,
          background: 'transparent',
          column: EColumns.DROPPING_LOCATION, height: EInstMeasures.INPUT_HEIGHT,
          stretch: go.GraphObject.Horizontal,
          margin: new go.Margin(8, 0, 0, 0),
          padding: new go.Margin(4, 0, 0, 4),
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
  );


const headerShape: go.Shape =
  $(go.Shape, EFigures.HEADER_SHAPE,
    {
      name: EInstElements.HEADER_SEL,
      height: EInstMeasures.HEADER_HEIGHT,
      strokeWidth: EInstMeasures.BORDER_WIDTH,
    },
    // new go.Binding('fill', 'focused', (focused: boolean, thisObj: go.Part): string => {
    //   return determineFocusColor(
    //     focused,
    //     thisObj.part.isSelected,
    //     thisObj,
    //     LdConst.fillInstSelectionColors,
    //   );
    // }).ofModel(),
    new go.Binding('fill', 'isSelected', errorSelectionColor).ofObject(),
    // new go.Binding('stroke', 'isSelected', (isSelected: boolean, thisObj: go.Part): string => {
    //   return determineFocusColor(
    //     thisObj.diagram.model.modelData.focused,
    //     isSelected,
    //     thisObj,
    //     LdConst.strokeSelectionColors,
    //   );
    // }).ofObject(),
    // new go.Binding('stroke', 'focused', (focused: boolean, thisObj: go.Part): string => {
    //   return determineFocusColor(
    //     focused,
    //     thisObj.part.isSelected,
    //     thisObj,
    //     LdConst.strokeSelectionColors,
    //   );
    // }).ofModel(),
  );
const onFaceParametersLabels: go.Panel =
  $(go.Panel, go.Panel.Horizontal,
    {
      alignment: go.Spot.TopLeft,
      height: EInstMeasures.INPUT_HEIGHT,
      stretch: go.GraphObject.Horizontal,
      // background: 'rgba(0, 0, 200, 0.2)',
      margin: new go.Margin(0, 0, 8, 0),
    },
    $(go.TextBlock,
      {
        name: 'ParamName',
        // height: 16,
        font: '10px Verdana',
        editable: false,
        alignment: go.Spot.MiddleLeft,
        textAlign: 'left',
        // verticalAlignment: go.Spot.Center,
      },
      new go.Binding('text', 'paramName'),
    ),
  );
const onFaceParametersInputs: go.Panel =
  $(go.Panel, go.Panel.Auto,
    {
      alignment: go.Spot.TopRight,
      // background: 'rgba(0, 0, 200, 0.2)',
      margin: new go.Margin(0, 0, 8, 0),
    },
    $(go.Shape, 'Rectangle',
      {
        fill: LD_COMMON_COLORS.TRANSPARENT,
        strokeWidth: 1,
      },
      new go.Binding('stroke', 'itemIndex', (index: number, thisObj: go.GraphObject): string => {
        const hasOperand = thisObj.part?.data.onFaceParameters[index].hasOperand;
        return hasOperand ? LibraryColors.PRIMARY_500 : LD_COMMON_COLORS.TRANSPARENT;
      }).ofObject(),
    ),
    $(go.Panel, go.Panel.Horizontal,
      {
        minSize: new go.Size(39, EInstMeasures.INPUT_HEIGHT - 1),
      },
      $(go.TextBlock,
        {
          minSize: new go.Size(39 - 8, NaN),
          // background: 'rgba(0, 255, 0, 0.4)',
          margin: new go.Margin(0, 4, 0, 4),
          font: '10px Verdana',
          alignment: go.Spot.MiddleRight,
          textAlign: 'right',
          text: '?',
          editable: true,
        },
      ),
    ),
  );

const onFaceParamsArrows: go.Panel =
  // Instruction config
  $(go.Panel, go.Panel.Horizontal,
    {
      // background: 'rgba(236,107,245,0.5)',
      margin: new go.Margin(0, 0, 8, 0),
      height: EInstMeasures.INPUT_HEIGHT,
    },
    $(go.Panel, go.Panel.Auto,
      new go.Binding('visible', 'itemIndex', (index: number, thisObj: go.GraphObject): boolean => {
        const displayType = thisObj.part?.data.displayType ?? '';
        
        return index === 0 && displayType === 'complex';
      }).ofObject(),
      {
        alignment: go.Spot.Top,
      },
      $(go.Shape, 'Rectangle',
        {
          fill: LD_COMMON_COLORS.TRANSPARENT,
          strokeWidth: 0,
        },
      ),
      $(go.TextBlock,
        {
          // background: 'rgba(132,239,73,0.8)',
          font: '10px Verdana',
          desiredSize: new go.Size(20, 8),
          text: '...',
          textAlign: 'center',
          verticalAlignment: new go.Spot(0, 0, 0, 0),
        },
      ),
    ),
  );

const bitLegsParamsTemplate =
  $(go.Panel, go.Panel.Horizontal,
    {
      alignment: go.Spot.Left,
      stretch: go.GraphObject.Horizontal,
      // background: 'rgba(243,144,45,0.2)',
      height: EInstMeasures.INPUT_HEIGHT,
      margin: new go.Margin(8, 0, 0, 0),
    },
    $(go.Shape, EFigures.BIT_LEG_SHAPE,
      {
        desiredSize: new go.Size(24, EInstMeasures.INPUT_HEIGHT - 1),
        stroke: LibraryColors.PRIMARY_500,
      },
    ),
    $(go.TextBlock,
      new go.Binding('text', 'paramName'),
      {
        height: EInstMeasures.INPUT_HEIGHT,
        verticalAlignment: go.Spot.Center,
        font: '10px Verdana',
        stroke: '#bbb',
      },
    ),
    $(go.Shape, EFigures.BIT_LEG_SHAPE_FLIPPED,
      new go.Binding('portId', 'itemIndex', (i: number, thisObj: go.GraphObject): string | null => {
        const isBitDictatingForLine = thisObj.part?.data.bitLegDictatingRungState ?? false;
        
        return isBitDictatingForLine && i === 0 ? 'OUT' : null;
      }).ofObject(),
      {
        fromSpot: go.Spot.MiddleRight,
        desiredSize: new go.Size(24, EInstMeasures.INPUT_HEIGHT - 1),
        stroke: LibraryColors.PRIMARY_500,
      },
    ),
  );

export interface IInstructionData extends go.ObjectData {
  name: string;
  instructionDirection: string;
  category: string;
  onFaceParameters: IOnFaceParams[];
  bitLegParameters: IOnFaceParams[];
  displayType: string;
  bitLegDictatingRungState: boolean;
}

export interface IOnFaceParams {
  paramName: string;
  hasOperand: boolean;
  operand?: any;
  dataSourceIndex?: number;
  isEditable: boolean;
}
