import * as go from 'gojs';

/**
 * Produces a Geometry that includes an arrowhead every {@link arrowSpacing} on each segment.
 * This only works with orthogonal non-Bezier routing.
 **/
export class MultiArrowLink extends go.Link {
    /**
     * Length for each arrowhead
     * */
    private arrowLen = 8;

    /**
     * Actually half-width of each arrowhead
     */
    private arrowWidth = 8;

    /**
     * Separation that must exist between arrow shapes.
     * When there is no space to separate arrows, nothing
     * is rendered in that link's segment.
     */
    private arrowSpacing = 32;

    private startX: number = 0;
    private startY: number = 0;
    private endX: number = 0;
    private endY: number = 0;

    constructor() {
        super();
        go.Link.call(this);
        this.routing = go.Link.Orthogonal;
        this.zOrder = 1;
        this.selectable = false;
    }

    /**
     * Produces a Geometry from the Link's route
     */
    public makeGeometry(): go.Geometry {
        const points = this.points;
        const toNodeBounds = this.toNode?.getDocumentBounds();
        // get the Geometry created y1 the standard behavior
        let geo = go.Link.prototype.makeGeometry.call(this);
        if (geo.type !== go.Geometry.Path || geo.figures.length === 0) return geo;
        const mainFig = geo.figures.elt(0);  // assume there's just one PathFigure
        const mainSegs = mainFig.segments;
        
        let isLastArrow = false;

        this.startX = mainFig.startX;
        this.startY = mainFig.startY;
        

        // Only creates arrowheads when link contains several segments, meaning
        // that this the link for wrapping
        if (mainSegs.length > 1) {
            for (let i = 0; i < mainSegs.length; i++) {
                const segment = mainSegs.elt(i);

                if (i === 1 && toNodeBounds) {
                    const segLen = segment.endY - this.startY;
                    const yStart = points.elt(i).y;
                    const distance = toNodeBounds.y - yStart - 20;
                    const neededAddition = distance - segLen;
                    const nextSeg = mainSegs.elt(i + 1);

                    segment.endY += neededAddition;
                    nextSeg.endY = segment.endY;
                } else if (i === 4) {
                    isLastArrow = true;
                }
                
                this.endX = segment.endX;
                this.endY = segment.endY;

                geo = this.createMultipleArrows(geo, isLastArrow);
            }
        }

        return geo;
    }

    private createMultipleArrows(geo: go.Geometry, lastArrow: boolean = false): go.Geometry {
        let x1: number = 0;
        let y1: number = 0;
        let x2: number = 0;
        let y2: number = 0;

        while (true) {
            if (this.startX - this.endX >= this.arrowSpacing) { // Leftwards
                this.startX -= this.arrowSpacing;
                x1 = x2 = this.startX + this.arrowLen;
                y1 = this.startY + this.arrowWidth;
                y2 = this.startY - this.arrowWidth;
            } else if (this.endX - this.startX >= this.arrowSpacing) { // Rightwards
                this.startX += this.arrowSpacing;
                x1 = x2 = this.startX - this.arrowLen;
                y1 = this.startY + this.arrowWidth;
                y2 = this.startY - this.arrowWidth;
            } else if (this.endY - this.startY >= this.arrowSpacing) { // Downwards
                this.startY += 32;
                y1 = y2 = this.startY - this.arrowLen;
                x1 = this.startX + this.arrowWidth;
                x2 = this.startX - this.arrowWidth;
            } else if (this.startY - this.endY >= this.arrowSpacing) { // Upwards
                this.startY -= 32;
                y1 = y2 = this.startY + this.arrowLen;
                x1 = this.startX + this.arrowWidth;
                x2 = this.startX - this.arrowWidth;
            } else if (lastArrow) {
                this.startX += this.arrowSpacing / 2;
                x1 = x2 = this.startX - this.arrowLen;
                y1 = this.startY + this.arrowWidth;
                y2 = this.startY - this.arrowWidth;
            } else {
                this.startX = this.endX;
                this.startY = this.endY;
                break;
            }

            geo.add(
                new go.PathFigure(this.startX, this.startY, true)
                    .add(new go.PathSegment(go.PathSegment.Line, x1, y1))
                    .add(new go.PathSegment(go.PathSegment.Line, this.startX, this.startY))
                    .add(new go.PathSegment(go.PathSegment.Line, x2, y2))
            );
            
            if (lastArrow) break;
        }

        return geo;
    }
}
