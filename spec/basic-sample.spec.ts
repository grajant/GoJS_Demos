import * as go from 'gojs';
import { arrow } from '../src/basic_sample/basic-sample';

const verifyLineSeg = (lineSeg: go.PathSegment, endPoint: go.Point): void => {
  expect(lineSeg).toBeDefined();
  expect(lineSeg.type).toBe(go.PathSegment.Line);
  expect(lineSeg.endX).toBe(endPoint.x);
  expect(lineSeg.endY).toBe(endPoint.y);
};

describe('Figures', () => {
  describe('#arrow', () => {
    const w = 20;
    const h = 15;
    const defaultArrowHeadWidth = w / 3;
    const defaultArrowTailHeight = h / 2;
    
    const defaultArrowSpacing = (h - defaultArrowTailHeight) / 2;
    const tailEndPointY = defaultArrowSpacing + defaultArrowTailHeight;
    
    it('should have only one figure', () => {
      const expectedStartPoint = new go.Point(0, h / 2);
      const shape = new go.Shape();
      
      const geo = arrow(shape, w, h);
      const figure = geo.figures.first();
      
      expect(geo.figures.count).toBe(1);
      expect(figure).toBeDefined();
      expect(figure?.startX).toBe(expectedStartPoint.x);
      expect(figure?.startY).toBe(expectedStartPoint.y);
    });
    
    it('should create arrow with default params', () => {
      const expectedEndPointSeg1 = new go.Point(defaultArrowHeadWidth, 0);
      const expectedEndPointSeg2 = new go.Point(defaultArrowHeadWidth, defaultArrowSpacing);
      const shape = new go.Shape();
      
      const geo = arrow(shape, w, h);
      const segments = geo.figures.first()?.segments;
      const seg1 = segments?.first();
      const seg2 = segments?.elt(1);
      
      
      // @ts-ignore
      verifyLineSeg(seg1, expectedEndPointSeg1);
      // @ts-ignore
      verifyLineSeg(seg2, expectedEndPointSeg2);
    });
    
    it('should create arrow based on parameter1 and parameter2', () => {
      const arrowHeadWidth = 5;
      const arrowTailHeight = 10;
      const arrowSpacing = (h - arrowTailHeight) / 2;
      const expectedEndPointSeg1 = new go.Point(arrowHeadWidth, 0);
      const expectedEndPointSeg2 = new go.Point(arrowHeadWidth, arrowSpacing);
      
      const shape = new go.Shape();
      shape.parameter1 = arrowHeadWidth;
      shape.parameter2 = arrowTailHeight;
      
      const geo = arrow(shape, w, h);
      const segments = geo.figures.first()?.segments;
      const seg1 = segments?.first();
      const seg2 = segments?.elt(1);
      
      
      // @ts-ignore
      verifyLineSeg(seg1, expectedEndPointSeg1);
      // @ts-ignore
      verifyLineSeg(seg2, expectedEndPointSeg2);
    });
    
    it('should have 6 line segments', () => {
      const expectedSegmentsPoints: go.Point[] = [
        new go.Point(defaultArrowHeadWidth, 0),
        new go.Point(defaultArrowHeadWidth, defaultArrowSpacing),
        new go.Point(w, defaultArrowSpacing),
        new go.Point(w, tailEndPointY),
        new go.Point(defaultArrowHeadWidth, tailEndPointY),
        new go.Point(defaultArrowHeadWidth, h),
      ];
      
      const shape = new go.Shape();
      
      const geo = arrow(shape, w, h);
      const segments = geo.figures.first()?.segments;
      
      segments?.toArray()
        .forEach((segment: go.PathSegment, i: number) => verifyLineSeg(segment, expectedSegmentsPoints[i]))
    });
  });
});
