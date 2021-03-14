/*
*  Copyright (C) 2020 by Rockwell Automation. All Rights Reserved.
*/
import * as go from 'gojs';
import { ERungMeasures } from '../kanban_sample/pool-layout';
import { ENodeElements, ERungElements } from '../kanban_sample/rung.template';

export interface ILayoutBounds {
  x: number;
  y: number;
  hasWrapping: boolean;
  rowHeight?: number;
}

/**
 * A custom { go.Layout } that lays out a chain of nodes in a snake-like fashion.
 *
 * This layout assumes the graph is a chain of Nodes,
 * positioning nodes in horizontal rows back and forth, alternating between left-to-right
 * and right-to-left within the {@link #wrap} limit.
 * {@link #spacing} controls the distance between nodes.
 *
 * When this layout is the Diagram.layout, it is automatically invalidated when the viewport changes size.
 *
 * If you want to experiment with this extension, try the <a href="../../extensionsTS/Serpentine.html">Serpentine Layout</a> sample.
 * @category Layout Extension
 */
export class WrappingLayout {
  private _spacing: go.Size = new go.Size(16, 40);
  private _wrap: number = NaN;
  private _previousNodes: go.Part[] = [];
  private _layout: go.Layout;
  private _rungHeight: number;
  private _originX: number;
  private _currentRung: go.Group;
  private _linksColor: go.BrushLike;
  private _maxDescHeight: number;
  
  /**
   * Constructs a SerpentineLayout and sets the {@link #isViewportSized} property to true.
   */
  constructor(layout: go.Layout, currentRung: go.Group, wrap: number) {
    this._layout = layout;
    this._wrap = wrap;
    this._currentRung = currentRung;
    this._rungHeight = ERungMeasures.MIN_HEIGHT;
    this._originX = 0;
    
    this._linksColor = (this._currentRung.findObject(ERungElements.INIT_RAIL) as go.Shape).fill;
    this._maxDescHeight = 0;
  }
  
  get rungHeight(): number {
    return this._rungHeight;
  }
  
  /**
   * Gets or sets the {go.Size} whose width specifies the horizontal space between nodes
   * and whose height specifies the minimum vertical space between nodes.
   *
   * The default value is 16x40.
   */
  get spacing(): go.Size {
    return this._spacing;
  }
  
  set spacing(val: go.Size) {
    if (!this._spacing.equals(val)) {
      this._spacing = val;
    }
  }
  
  /**
   * Gets or sets the total width of the rung's placeholder.
   */
  get wrap(): number {
    return this._wrap;
  }
  
  set wrap(val: number) {
    if (this._wrap !== val) {
      this._wrap = val;
    }
  }
  
  /**
   * This method actually positions all of the Nodes, assuming that the ordering of the nodes
   * is given by a single link from one node to the next.
   * This respects the {@link #spacing} and {@link #wrap} properties to affect the layout.
   *
   * @param nodes Iterator that contains nodes that will be arranged in layout.
   * @param originX Starting x coordinate to arranges nodes.
   * @param originY Starting y coordinate to arrange nodes.
   */
  public doLayoutForNodes(nodes: go.Iterator<go.Part>, originX: number, originY: number): void {
    this._originX = originX + this.spacing.width;
    const nodesArray = new go.Set(nodes).toArray().filter((part: go.Part) => part instanceof go.Node);
    const inNodesResult = this
      .layoutInNodes(nodesArray, this._originX, originY);
    let finalBounds: ILayoutBounds;
    
    if (inNodesResult) {
      const { bounds, lastInNodeIndex } = inNodesResult;
      finalBounds = this.layoutOutNodes(nodesArray, bounds, lastInNodeIndex);
    } else {
      const bounds: ILayoutBounds = {
        x: this.wrap,
        y: originY,
        hasWrapping: false,
      };
      finalBounds = this.layoutOutNodes(nodesArray, bounds);
    }
    
    this.createRailsConnections(nodesArray);
    
    let yHeight = finalBounds.y - originY;
    yHeight += finalBounds.rowHeight ?? 0;
    yHeight += ERungMeasures.RUNG_SEPARATION;
    this._rungHeight = Math.max(this._rungHeight, yHeight);
  }
  
  private layoutInNodes(nodes: go.Part[], x: number, y: number):
    { bounds: ILayoutBounds, lastInNodeIndex: number } | null {
    const lastInNode = [...nodes]
      .reverse()
      .find((node: go.Part) => node.data.instructionDirection === 'IN');
    const lastInNodeIndex = nodes.findIndex((node: go.Part) => node == lastInNode);
    
    const inNodes = nodes.slice(0, lastInNodeIndex + 1);
    
    if (inNodes.length) {
      const bounds: ILayoutBounds = {
        x,
        y,
        hasWrapping: false,
      };
      return {
        bounds: this.arrangeInNodes(bounds, inNodes),
        lastInNodeIndex,
      };
    }
    
    return null;
  }
  
  private layoutOutNodes(nodes: go.Part[], bounds?: ILayoutBounds, lastInNodeIndex?: number): ILayoutBounds {
    let outNodes = nodes;
    let lastInNodeX = this._originX;
    
    // When taking this path, it means that in nodes exist
    if (lastInNodeIndex !== undefined && bounds) {
      const firstOutNodeIndex = lastInNodeIndex + 1;
      outNodes = nodes.slice(firstOutNodeIndex);
      
      if (outNodes.length) {
        const lastInNode = nodes[lastInNodeIndex] as go.Node;
        const lastInNodeBounds = this._layout.getLayoutBounds(lastInNode);
        lastInNodeX = lastInNodeBounds.x + lastInNodeBounds.width;
        
        this.addLinkToNode(lastInNode, outNodes[0]);
      }
    }
    
    // All out nodes are the existing ones
    const lastIndex = outNodes.length - 1;
    let hasWrapping = bounds?.hasWrapping;
    let rowHeight = bounds?.rowHeight ?? 0;
    let leftX = bounds?.x ?? this.wrap;
    let y = bounds?.y ?? 0;
    let wrappingEdge = hasWrapping ? this._originX : lastInNodeX;
    
    outNodes.forEach((part: go.Part, i: number) => {
      const currentNode = part as go.Node;
      const currentNodeBounds = this._layout.getLayoutBounds(currentNode);
      const nextNode = i < lastIndex ? outNodes[i + 1] : null;
      this.addLinkToNode(currentNode, nextNode);
      
      rowHeight = Math.max(rowHeight, currentNodeBounds.height);
      wrappingEdge = hasWrapping ? this._originX : wrappingEdge;
      
      const newBounds = this.moveNodesToLeft(new go.Point(leftX, y), rowHeight, currentNode, wrappingEdge);
      leftX = newBounds.x;
      y = newBounds.y;
      rowHeight = newBounds.rowHeight ?? rowHeight;
      hasWrapping = newBounds.hasWrapping;
    });
  
    // Updates desc spacing for last node
    if (outNodes.length) {
      this.modifyDescSpacing(outNodes[lastIndex]);
    }
    
    return {
      x: leftX,
      y,
      hasWrapping: hasWrapping ?? false,
      rowHeight,
    };
  }
  
  private arrangeInNodes(bounds: ILayoutBounds, nodes: go.Part[]): ILayoutBounds {
    const spacing = this.spacing;
    const lastIndex = nodes.length - 1;
    
    let x = bounds.x;
    let leftX = this.wrap;
    let rowHeight = 0;
    let y = bounds.y;
    let hasWrapping = bounds.hasWrapping;
    let wrappingHeight = 0;
    
    this._previousNodes = [];
    
    nodes.forEach((part: go.Part, i: number) => {
      const node = part as go.Node;
      const currentNodeBounds = this._layout.getLayoutBounds(node);
      
      // get the next node, if any
      const nextNode = i < lastIndex ? nodes[i + 1] : null;
      const nextNodeBounds = (nextNode !== null ? this._layout.getLayoutBounds(nextNode) : new go.Rect());
      this.addLinkToNode(node, nextNode);
      
      // Updates desc spacing height
      const descHeight = node.findObject(ENodeElements.DESC_CONTENT)?.actualBounds?.height ?? 0;
      this._maxDescHeight = Math.max(descHeight, this._maxDescHeight);
      
      if (!hasWrapping) {
        node.move(new go.Point(x, y));
        x += currentNodeBounds.width;
        rowHeight = Math.max(rowHeight, currentNodeBounds.height);
        const wrappingCondition = x + 32 + spacing.width + nextNodeBounds.width;
        
        if (wrappingCondition > this.wrap) {
          if (nextNode) {
            y += rowHeight + spacing.height;
          }
          
          this._previousNodes = nodes.slice(0, i + 1);
          this.modifyPreviousNodesBounds(0);
          
          hasWrapping = true;
          
          // Resets everything
          this._maxDescHeight = 0;
          this._previousNodes = [];
          rowHeight = 0;
        }
      } else {
        const newBounds = this.moveNodesToLeft(new go.Point(leftX, y), rowHeight, node);
        leftX = newBounds.x;
        y = newBounds.y;
        rowHeight = newBounds.rowHeight ?? rowHeight;
        wrappingHeight = rowHeight;
      }
      
    });
    
    if (!hasWrapping) {
      this._previousNodes = nodes;
      this.modifyPreviousNodesBounds(0);
      this._previousNodes = [];
    }
    
    return { x: leftX, y, hasWrapping, rowHeight: rowHeight };
  }
  
  private moveNodesToLeft(
    currentPoint: go.Point,
    rowHeight: number,
    currentNode: go.Node,
    wrappingEdge: number = this._originX,
  ): ILayoutBounds {
    let leftX = currentPoint.x;
    let x = this.wrap;
    let y = currentPoint.y;
    let hasWrapping = false;
    
    const currentNodeBounds = this._layout.getLayoutBounds(currentNode);
    const currentNodeWidth = currentNodeBounds.width;
    const descSpacingHeight = currentNode.findObject(ENodeElements.DESC_CONTENT)?.actualBounds?.height ?? 0;
    
    x -= currentNodeWidth;
    rowHeight = Math.max(rowHeight, currentNodeBounds.height);
    
    const nextX = leftX - this.spacing.width * 2 - currentNodeWidth - 32;
    
    // Prevent overlapping with rail or nodes
    if (nextX < wrappingEdge) {
      this.modifyPreviousNodesBounds(this.wrap - 32, y);
  
      this._maxDescHeight = Math.max(descSpacingHeight, this._maxDescHeight);
      y += rowHeight + this.spacing.height;
      leftX = this.wrap;
      currentNode.move(new go.Point(x, y));
      rowHeight = currentNodeBounds.height;
      hasWrapping = true;
      
      this._maxDescHeight = 0;
      this._previousNodes = [];
      this._previousNodes.unshift(currentNode);
    } else {
      this._maxDescHeight = Math.max(descSpacingHeight, this._maxDescHeight);
      currentNode.move(new go.Point(x, y));
      leftX = this.modifyPreviousNodesBounds(x, y);
      
      this._previousNodes.unshift(currentNode);
    }
    
    return {
      x: leftX,
      y,
      hasWrapping,
      rowHeight,
    };
  }
  
  private modifyPreviousNodesBounds(currentX: number, currentY?: number): number {
    let x = currentX;
    
    this._previousNodes.forEach((node: go.Part) => {
      if (currentY !== undefined) {
        const nodeBounds = this._layout.getLayoutBounds(node);
        x -= nodeBounds.width;
        node.move(new go.Point(x, currentY));
      }
      
      this.modifyDescSpacing(node);
    });
    
    return x;
  }
  
  /**
   * Removes existing links that go out of node and
   * adds a new one, always {@link #fromNode} to {@link #toNode}.
   *
   * @param {Node} fromNode Node that will hold the origin of this link.
   * @param {Node | null} toNode Node that will receive the link.
   */
  private addLinkToNode(fromNode: go.Node, toNode: go.Part | null): void {
    const model = this._layout.diagram?.model as go.GraphLinksModel;
    const linkOutOfNode = fromNode.findLinksOutOf().first();
    
    if (linkOutOfNode) {
      this._layout.diagram?.removeParts([linkOutOfNode], true);
    }
    
    if (toNode) {
      const newLink = {
        from: fromNode.data.key,
        fromPort: 'OUT',
        toPort: 'IN',
        to: toNode.data.key,
        color: this._linksColor,
      };
      model.addLinkData(newLink);
    }
  }
  
  /**
   * Sets appropriate height for desc spacing for nodes
   * that have small description or none at all.
   *
   * @param node Node that will have its desc spacing modified.
   */
  private modifyDescSpacing(node: go.Part): void {
    const descContent = node.findObject(ENodeElements.DESC_CONTENT);
    const descSpacing = node.findObject(ENodeElements.DESC_SPACING);
  
    if (descSpacing) {
      const descContentHeight = descContent?.actualBounds?.height ?? 0;
    
      descSpacing.height = this._maxDescHeight - descContentHeight < 0
        ? 0
        : this._maxDescHeight - descContentHeight;
    }
  }
  
  /**
   * Modifies end rail line offset and connect it to last node when there
   * is one and to init rail otherwise. Also, modifies init rail width in order to connect it
   * first node available, if any.
   *
   * @param nodes Array of nodes present in rung. This array might be empty.
   */
  private createRailsConnections(nodes: go.Part[]): void {
    const rungParts = this._currentRung.memberParts.filter((part) => part instanceof go.Node);
    const firstNode = nodes.length ? nodes[0] as go.Node : null;
    const lastNode = nodes.length ? nodes[nodes.length - 1] as go.Node : null;
    console.debug('rung parts', new go.Set(rungParts)?.toArray()?.reverse()[0]?.actualBounds);
    const initRailLine = this._currentRung.findObject(ERungElements.INIT_RAIL_LINE);
    
    const endRailLine = this._currentRung.findObject(ERungElements.END_RAIL_LINE);
    const endRailLinePoint = endRailLine?.getDocumentPoint(go.Spot.Right);
    const currentRungPoint = this._currentRung.getDocumentPoint(go.Spot.TopLeft);
    let distanceToElm: number = 0;
    
    // Connects end rail to last node out port
    if (lastNode) {
      console.debug('last node position', lastNode.position);
      const lastNodeFromPort = lastNode?.findPort('OUT') as go.Shape;
      console.debug('last node port loc point', lastNodeFromPort.getDocumentBounds());
      const lastNodeFromPortPoint = lastNodeFromPort?.getDocumentPoint(go.Spot.TopRight);
      // @ts-ignore
      const normalizedOffsetY = lastNodeFromPortPoint.y - currentRungPoint.y;
      
      console.debug(`last node p ${ this._currentRung.data.key }`, lastNodeFromPortPoint);
      
      // @ts-ignore
      distanceToElm = endRailLinePoint?.x - lastNodeFromPortPoint?.x;
      if (endRailLine) endRailLine.alignment = new go.Spot(1, 0, 0, normalizedOffsetY);
    } else {
      if (endRailLine) endRailLine.width = 0;
    }
    
    // Modifies init rail width in order to connect it to first node, if any
    if (firstNode) {
      const initRailLinePoint = initRailLine?.getDocumentPoint(go.Spot.Left);
      const firstNodeFromPort = firstNode?.findPort('IN');
      const firstNodeFromPortPoint = firstNodeFromPort?.getDocumentPoint(go.Spot.TopLeft);
      
      // @ts-ignore
      const nodeToRailDistance = firstNodeFromPortPoint.x - initRailLinePoint.x;
      // @ts-ignore
      const normalizedOffsetY = firstNodeFromPortPoint.y - currentRungPoint.y;
      
      if (initRailLine) {
        initRailLine.alignment = new go.Spot(0, 0, 0, normalizedOffsetY);
        initRailLine.width = nodeToRailDistance < 0 ? initRailLine.width : nodeToRailDistance;
      }
    } else {
      const initRailLinePoint = initRailLine?.getDocumentPoint(go.Spot.Left);
      // @ts-ignore
      const distanceToEndRail = endRailLinePoint.x - initRailLinePoint.x;
      if (initRailLine) initRailLine.width = distanceToEndRail < 0 ? initRailLine.width : distanceToEndRail;
    }
    
    if (endRailLine) endRailLine.width = distanceToElm <= 0 ? endRailLine.width : distanceToElm + this.spacing.width;
  }
}


