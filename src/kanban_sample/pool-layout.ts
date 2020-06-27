import * as go from 'gojs';
import { ENodeElements, ERungElements } from './rung.template';
import { SerpentineLayout } from '../serpentine_sample/serpentine-layout';

// For the layout
export const PLACEHOLDER_OFFSET = 0;
export const MIN_WIDTH_HEADER = 50;

export const enum ERungMeasures {
  MIN_HEIGHT = 80,  // this controls the minimum length of any rung
  MIN_WIDTH = 1000,  // this controls the minimum breadth of any non-collapsed swimlane
  RUNG_OFFSET = 40,
  RUNG_SEPARATION = 40,
}


export class PoolLayout extends go.GridLayout {
  constructor() {
    super();
    go.GridLayout.call(this);
    this.cellSize = new go.Size(1, 1);
    this.wrappingColumn = 1;
    this.wrappingWidth = Infinity;
    this.spacing = new go.Size(0, 0);
    this.alignment = go.GridLayout.Position;
    this.comparer = (a: go.Part, b: go.Part): number => {
      return PoolLayout.comparer(a, b);
    };
  }
  
  /**
   * Can reorder elements in a grid. #orderVertically determines
   * whether the ordering should happen in 'x' or 'y' coordinate.
   *
   * @param a go.Part one to compare
   * @param b go.Part two to compare
   * @param orderVertically Defaults to true, when this is set to false, the elements
   * in grid will be ordered in horizontal position
   */
  public static comparer(a: go.Part, b: go.Part, orderVertically = true): number {
    const { x: ax, y: ay } = a.location;
    const { x: bx, y: by } = b.location;
    let aLocation = ay;
    let bLocation = by;
    
    if (!orderVertically) {
      aLocation = ax;
      bLocation = bx;
    }
    
    if (isNaN(aLocation) || isNaN(bLocation)) return 0;
    if (aLocation < bLocation) return -1;
    if (aLocation > bLocation) return 1;
    return 0;
  }
  
  public doLayout(coll: go.Diagram | go.Group | go.Iterable<go.Part>): void {
    console.log('Doing layout');
    console.warn('layout collection', coll);
    const diagram = this.diagram;
    if (diagram === null) return;
    diagram.startTransaction('PoolLayout');
    
    // make sure all of the Group Shapes are big enough
    // const minPoolSize = PoolLayout.computeMinPoolSize();
    const { headerShapeWidth, textWidth: maxTextWidth } = this.computeHeaderMinWidth();
    
    diagram.findTopLevelGroups().each((rung: go.Group) => {
      let maxNodeHeight = 0;
      
      const headerShape = rung.findObject(ERungElements.HEADER_SEL);
      const headerTextBlock = rung.findObject(ERungElements.HEADER_TEXT) as go.TextBlock;
      
      const poolSize = this.computeMinPoolSize(rung, headerShapeWidth);
      const rungContentShape = rung.findObject(ERungElements.RUNG_CONTENT);
      
      if (rungContentShape !== null) {
        rungContentShape.width = poolSize.width;
        rungContentShape.height = maxNodeHeight;
  
  
        // Rung number text blocks need to be the same width
        // in order to have the error icons aligned.
        if (headerTextBlock && rung.data.key !== 'EndRung') {
          headerTextBlock.width = maxTextWidth;
        }
  
        // Header should always have same height as the
        // rung content. Also, all headers should have the
        // same width, which is determined by the widest one.
        if (headerShape) {
          headerShape.width = headerShapeWidth;
        }
  
        const rungContentBounds = rungContentShape.getDocumentBounds();
        const wrap = rungContentBounds.x + poolSize.width;
        const serpentineLayout = new SerpentineLayout(this, rung, wrap);
        serpentineLayout.doLayoutForNodes(rung.memberParts, rungContentBounds.x, rungContentBounds.y);
  
        const rungHeight = serpentineLayout.rungHeight;
        rungContentShape.height = rungHeight;
  
        // Header should always have same height as the
        // rung content. Also, all headers should have the
        // same width, which is determined by the widest one.
        if (headerShape) {
          headerShape.height = rungHeight;
        }
      }
      
    });
    // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
    go.GridLayout.prototype.doLayout.call(this, coll);
    diagram.commitTransaction('PoolLayout');
  }
  
  // determine the minimum size of a Lane Group, even if collapsed
  private computePoolMinWidth(rung: go.Group, headerWidth: number): number {
    // If rung gets collapsed some time in the future
    if (!rung.isSubGraphExpanded) return 1;
    
    let minWidth = ERungMeasures.MIN_WIDTH;
    const viewportBounds = this.diagram?.div as HTMLDivElement;
    
    if (viewportBounds) {
      const vpWidth = viewportBounds.clientWidth;
      minWidth = (!isNaN(vpWidth) && !isNaN(headerWidth))
        ? vpWidth - headerWidth - 18
        : ERungMeasures.MIN_WIDTH;
    }
    
    return minWidth;
  }
  
  private static computePoolMinHeight(rung: go.Group): number {
    let minHeight = ERungMeasures.MIN_HEIGHT;
    const holder = rung.placeholder;
    if (holder !== null) {
      const placeholderSize = holder.measuredBounds;
      const placeholderHeight = placeholderSize.height + PLACEHOLDER_OFFSET + ERungMeasures.RUNG_SEPARATION;
      console.debug('placeholder height', placeholderSize.height);
      minHeight = Math.max(minHeight, placeholderHeight);
    }
    
    return minHeight;
  }
  
  // compute the minimum size of the whole diagram needed to hold all of the Lane Groups
  private computeMinPoolSize(rung: go.Group, headerWidth: number): go.Size {
    const minWidth = this.computePoolMinWidth(rung, headerWidth);
    const minHeight = PoolLayout.computePoolMinHeight(rung);
    
    return new go.Size(minWidth, minHeight);
  }
  
  private computeHeaderMinWidth(): { headerShapeWidth: number, textWidth: number } {
    let shapeWidth = MIN_WIDTH_HEADER;
    let textWidth = 0;
    this.diagram?.findTopLevelGroups().each((rung) => {
      if (rung.data.key !== 'EndRung') {
        const headerShape = rung.findObject(ERungElements.HEADER_CONTENT);
        const headerText = rung.findObject(ERungElements.HEADER_TEXT) as go.TextBlock;
        const headerSize = headerShape?.measuredBounds;
        const textSize = headerText.actualBounds;
        
        console.debug('min header width', headerSize?.width);
        
        shapeWidth = Math.max(shapeWidth, headerSize?.width ?? 0);
        textWidth = Math.max(textWidth, textSize?.width ?? 0);
      }
      
      
    });
    
    return { headerShapeWidth: shapeWidth, textWidth };
  }
}
