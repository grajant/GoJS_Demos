import * as go from 'gojs';
import { KeyValuePair } from 'gojs';

/**
 * The NonRealtimeDraggingTool class lets the user drag an image instead of actually moving any selected nodes,
 * until the mouse-up event.
 *
 * If you want to experiment with this extension, try the <a href="../../extensionsTS/NonRealtimeDragging.html">Non Realtime Dragging</a> sample.
 * @category Tool Extension
 */
export class NonRealtimeDraggingTool extends go.DraggingTool {
  private _imagePart: go.Part | null = null;  // a Part holding a translucent image of what would be dragged
  private _ghostDraggedParts: go.Map<go.Part, go.DraggingInfo> | null = null;  // a Map of the _imagePart and its dragging information
  private _originalDraggedParts: go.Map<go.Part, go.DraggingInfo> | null = null;  // the saved normal value of DraggingTool.draggedParts
  private _currentPartOrigin: go.Point = new go.Point();
  private _branchLinkData: go.ObjectData| null = null;
  
  /**
   * Call the base method, and then make an image of the returned collection,
   * show it using a Picture, and hold the Picture in a temporary Part, as _imagePart.
   * @param {Iterable.<Part>} parts A {@link Set} or {@link List} of {@link Part}s.
   * @return {Map.<Part,DraggingInfo>}
   */
  public computeEffectiveCollection(coll: go.Iterable<go.Part>): go.Map<go.Part, go.DraggingInfo> {
    const map = super.computeEffectiveCollection(coll, this.dragOptions);
    if (this.isActive && this._imagePart === null) {
      console.warn('current part', this.currentPart);
      const bounds = this.diagram.computePartsBounds(map.toKeySet());
      const offset = this.diagram.lastInput.documentPoint.copy().subtract(bounds.position);
      const $ = go.GraphObject.make;
      if (this.currentPart?.data.category === 'BIT') {
        this._imagePart = $(go.Part,
          { layerName: 'Tool' },
            $(go.Panel, go.Panel.Horizontal,
              { background: 'transparent', width: 10, height: 10 }
              )
          )
      } else {
        this._imagePart =
          $(go.Part,
            { layerName: 'Tool', opacity: 0.5, locationSpot: new go.Spot(0, 0, offset.x, offset.y) },
            $(go.Picture,
              { element: this.diagram.makeImage({ parts: map.toKeySet() }) })
          );
      }
      
    }
    return map;
  }
  
  /**
   * When activated, replace the {@link #draggedParts} with the ghost dragged parts, which
   * consists of just one Part, the image, added to the Diagram at the current mouse point.
   */
  public doActivate(): void {
    super.doActivate();
    if (this._imagePart !== null) {
      this._imagePart.location = this.diagram.lastInput.documentPoint;
      this.diagram.add(this._imagePart);
      this._originalDraggedParts = this.draggedParts;
      this._ghostDraggedParts = super.computeEffectiveCollection(new go.List<go.Part>().add(this._imagePart), this.dragOptions);
      this.draggedParts = this._ghostDraggedParts;
      
      if (this.currentPart?.data.category === 'BIT') {
        console.warn('current part point', this.currentPart.getDocumentPoint(go.Spot.BottomRight));
        const model = this.diagram.model as go.GraphLinksModel;
        const currentPartPoint = this.currentPart.getDocumentPoint(go.Spot.BottomRight);
        this._currentPartOrigin = currentPartPoint;
        this._branchLinkData = {
          linkKey: 'branchLink',
          points: new go.List([new go.Point(currentPartPoint.x, currentPartPoint.y), new go.Point(currentPartPoint.x + 5, currentPartPoint.y)]),
        };
        model.addLinkData(this._branchLinkData);
        // this._branchLinkData = model.findLinkDataForKey('branchLink');
      }
    }
  }
  
  /**
   * When deactivated, make sure any image is removed from the Diagram and all references are cleared out.
   */
  public doDeactivate(): void {
    if (this._imagePart !== null) {
      this.diagram.remove(this._imagePart);
    }
    this._imagePart = null;
    this._ghostDraggedParts = null;
    this._originalDraggedParts = null;
    super.doDeactivate();
    this.diagram.layoutDiagram(true);
  }
  
  /**
   * Do the normal mouse-up behavior, but only after restoring {@link #draggedParts}.
   */
  public doMouseUp(): void {
    if (this._originalDraggedParts !== null) {
      this.draggedParts = this._originalDraggedParts;
      this.draggedParts.each((draggedElm: KeyValuePair<go.Part, go.DraggingInfo>) => {
        const part = draggedElm.key;
        if (part instanceof go.Node) {
          console.debug('dragged part', draggedElm.key);
          const linkInto = part.findLinksInto().first();
          const linkOutOf = part.findLinksOutOf().first();
          
          if (linkInto !== null) this.diagram.removeParts([linkInto], true);
          if (linkOutOf !== null) this.diagram.removeParts([linkOutOf], true);
        }
        
      })
    }
    super.doMouseUp();
  }
  
  /**
   * If the user changes to "copying" mode by holding down the Control key,
   * return to the regular behavior and remove the image.
   */
  public doKeyDown(): void {
    if (this._imagePart !== null && this._originalDraggedParts !== null &&
      (this.diagram.lastInput.control || this.diagram.lastInput.meta) && this.mayCopy()) {
      this.draggedParts = this._originalDraggedParts;
      this.diagram.remove(this._imagePart);
    }
    super.doKeyDown();
  }
  
  /**
   * If the user changes back to "moving" mode,
   * show the image again and go back to dragging the ghost dragged parts.
   */
  public doKeyUp(): void {
    if (this._imagePart !== null && this._ghostDraggedParts !== null && this.mayMove()) {
      this._imagePart.location = this.diagram.lastInput.documentPoint;
      this.diagram.add(this._imagePart);
      this.draggedParts = this._ghostDraggedParts;
    }
    super.doKeyUp();
  }
  
  public doDragOver(pt: go.Point, obj: go.GraphObject | null): void {
    if (this.currentPart?.data.category === 'BIT') {
      const offsetSign = Math.sign(pt.y - this._currentPartOrigin.y);
      const offsetY = offsetSign * 8;
      const point1 = new go.Point(pt.x, this._currentPartOrigin.y);
      const point2 = new go.Point(pt.x, pt.y + offsetY);
      const linkOriginalPoints = [this._currentPartOrigin, point1, point2];
      if (this._branchLinkData) this.diagram.model.set(this._branchLinkData, 'points', new go.List(linkOriginalPoints))
    }
    
    super.doDragOver(pt, obj);
  }
}
