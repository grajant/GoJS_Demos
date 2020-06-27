import * as go from 'gojs';

export const enum EFigures {
  BODY_SHAPE = 'BodyShape',
  HEADER_SHAPE = 'HeaderShape',
  FULL_CONTENT_SHAPE = 'FullShape',
  BIT_LEG_SHAPE = 'BitLegShape',
  BIT_LEG_SHAPE_FLIPPED = 'BitLegShapeFlipped',
  HALF_CIRCLE_LEFT = 'HalfCircleLeft',
  HALF_CIRCLE_RIGHT = 'HalfCircleRight',
  CLOSING_BRACKET = 'ClosingBracket',
  OPENING_BRACKET = 'OpeningBracket',
}

export const arrow = (shape: go.Shape, w: number, h: number): go.Geometry => {
  /* shape.parameter1 will identify the arrow head width. When no
  * parameter is available, default value will be 1/3 of the arrow width.
  * */
  const arrowHeadWidth = shape?.parameter1 || w / 3;
  
  /* shape.parameter2 will identify the arrow tail height. When no
  * parameter is available, default value will be a half of the arrow height.
  * */
  const arrowTailHeight = shape?.parameter2 || h / 2;
  
  const arrowSpacing = (h - arrowTailHeight) / 2;
  const tailEndPointY = arrowSpacing + arrowTailHeight;
  
  return new go.Geometry().add(
    new go.PathFigure(0, h / 2, true)
      .add(new go.PathSegment(go.PathSegment.Line, arrowHeadWidth, 0))
      .add(new go.PathSegment(go.PathSegment.Line, arrowHeadWidth, arrowSpacing))
      .add(new go.PathSegment(go.PathSegment.Line, w, arrowSpacing))
      .add(new go.PathSegment(go.PathSegment.Line, w, tailEndPointY))
      .add(new go.PathSegment(go.PathSegment.Line, arrowHeadWidth, tailEndPointY))
      .add(new go.PathSegment(go.PathSegment.Line, arrowHeadWidth, h).close())
  )
};

export const bracketGeometry = (_shape: go.Shape, w: number, h: number): go.Geometry => {
  return new go.Geometry().add(
    new go.PathFigure(0, 0)
      .add(new go.PathSegment(go.PathSegment.Line, w, 0))
      .add(new go.PathSegment(go.PathSegment.Line, w, h))
      .add(new go.PathSegment(go.PathSegment.Line, 0, h))
  )
}

export const halfCircle = (w: number, h: number) => {
  const line = 1;
  const radius = 7.5;
  const firstArcCenterX = w - line;
  const firstArcCenterY = h / 2;
  
  
  return new go.Geometry().add(
    new go.PathFigure(w, h - 0.5, true)
      .add(new go.PathSegment(go.PathSegment.Line, w - line, h - 0.5))
      .add(new go.PathSegment(go.PathSegment.Arc, 90, 180, firstArcCenterX, firstArcCenterY, radius, radius))
      .add(new go.PathSegment(go.PathSegment.Line, w, 0.5))
  ).offset(1, 0);
};

export const bitLegShape = (w: number, h: number) => {
  const radius = 8;
  const lineEndX = w - radius;
  const lineEndY = h / 2;
  const arcStartX = w;
  const arcStartY = h / 2;
  
  
  return new go.Geometry().add(
    new go.PathFigure(0, h / 2, false)
      .add(new go.PathSegment(go.PathSegment.Line, lineEndX, lineEndY))
      .add(new go.PathSegment(go.PathSegment.Move, w, h))
      .add(new go.PathSegment(go.PathSegment.Arc, 90, 180, arcStartX, arcStartY, radius, radius)),
  );
};

export const fullBorderedRectangle = (radius: number, w: number, h: number): go.Geometry => {
  const pXBotRight = w - radius;
  const pXTopLeft = radius;
  const pYBotRight = h - radius;
  const pYTopLeft = radius;
  const geo = new go.Geometry();
  const fig = new go.PathFigure(w, 0, true);
  geo.add(fig);
  fig.add(new go.PathSegment(go.PathSegment.Line, w, pYBotRight))
    .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, pXBotRight, pYBotRight, radius, radius))
    .add(new go.PathSegment(go.PathSegment.Line, 0, h))
    .add(new go.PathSegment(go.PathSegment.Line, 0, pYTopLeft))
    .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, pXTopLeft, pYTopLeft, radius, radius).close());
  return geo;
};
/**
 * Defines header shape which has rounded border in top-left corner.
 * The corner has a border radius of 8px as latest VD specs
 */
export const topLeftRoundedRectangle = (_shape: go.Shape, w: number, h: number) => {
  const radius = 8;
  const pXTopLeft = radius;
  const pYTopLeft = radius;
  return new go.Geometry().add(
    new go.PathFigure(0, h, true)
      .add(new go.PathSegment(go.PathSegment.Line, 0, pYTopLeft))
      .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, pXTopLeft, pYTopLeft, radius, radius))
      .add(new go.PathSegment(go.PathSegment.Line, w, 0))
      .add(new go.PathSegment(go.PathSegment.Line, w, h)),
  );
};

export const bottomRightRoundedRectangle = (w: number, h: number) => {
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
  // geo.offset(0, -1);
  return geo;
}

/**
 * Defines body shape which has rounded borders in the bottom-right corner.
 * The corner has a border radius of 8px as latest VD specs
 */


export const defineAllFigures = (): void => {
  go.Shape.defineFigureGenerator('Arrow', arrow);
  
  go.Shape.defineFigureGenerator(EFigures.HALF_CIRCLE_LEFT, (_shape: go.Shape, w: number, h: number) => halfCircle(w, h));
  
  go.Shape.defineFigureGenerator(EFigures.HALF_CIRCLE_RIGHT, (_shape: go.Shape, w: number, h: number) => {
    const geo = halfCircle(w, h).scale(-1, 1);
    geo.normalize();
    
    return geo.offset(-1, 0.5);
  });
  
  go.Shape.defineFigureGenerator(EFigures.CLOSING_BRACKET, (_shape: go.Shape, w: number, h: number): go.Geometry => {
    const instrName = _shape?.part?.data?.name;
    const offset = instrName === 'XIC' || instrName === 'XIO'
      ? 0
      : -1;
    return bracketGeometry(_shape, w, h).offset(offset, 0)
  });
  go.Shape.defineFigureGenerator(EFigures.OPENING_BRACKET, (_shape: go.Shape, w: number, h: number): go.Geometry => {
    console.debug('instr name from fig', _shape?.part?.data?.name);
    const instrName = _shape?.part?.data?.name;
    const offset = instrName === 'XIC' || instrName === 'XIO'
      ? 0
      : 0.5;
    const geo = bracketGeometry(_shape, w, h).scale(-1, 1);
  
    geo.normalize();
  
    return geo.offset(offset, 0);
  });
  
  go.Shape.defineFigureGenerator(
    EFigures.FULL_CONTENT_SHAPE,
    (_shape: go.Shape, w: number, h: number): go.Geometry =>
      fullBorderedRectangle(8, w, h),
  );
  
  go.Shape.defineFigureGenerator(EFigures.HEADER_SHAPE, topLeftRoundedRectangle);
  go.Shape.defineFigureGenerator(EFigures.BODY_SHAPE, (_shape: go.Shape, w: number, h: number) =>
    bottomRightRoundedRectangle(w, h).offset(0, 0),
  );
}
