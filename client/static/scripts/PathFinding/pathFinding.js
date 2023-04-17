import InteractiveCanvas from "../shared/canvas.js";
import { Graph, GraphVertex } from "../shared/graph.js";

class GridVertex extends GraphVertex{
    isObstacle = false;
    isStartPoint = false;
    isFinishPoint = false;
    x=0;
    y=0
    _statusLastChange = null;

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }
}

const gridGraph = new Graph();

/**
 * @param {Number} x
 * @param {Number} y
 * @param {Number} gridCount
 */
function getVertexIndexByGridCoords(x, y, gridCount) {
    let idx = x * gridCount + y;
    if (x < 0 || y < 0 || x > gridCount - 1 || y > gridCount - 1) {
        return null;
    }
    return idx;
}

/**
 * @param {InteractiveCanvas} canvas
 * @param {Number} x
 * @param {Number} y
 */
function getGridCoordsByAbsoluteCoords(canvas, x, y, gridPixelSize, gridCount) {
    let relX = canvas.getRelX(x);
    let relY = canvas.getRelY(y);
    let result = {
        x: Math.floor(relX / gridPixelSize + (gridCount / 2)),
        y: Math.floor(relY / gridPixelSize + (gridCount / 2))
    }
    return result
}

function getRelCoordsByGridCoords(x, y, gridPixelSize, gridCount) {
    let relX = x * gridPixelSize - (gridCount * gridPixelSize / 2) + (gridPixelSize/2);
    let relY = y * gridPixelSize - (gridCount * gridPixelSize / 2) + (gridPixelSize/2);

    return {x: relX, y: relY}
}


/**
 * @param {GraphVertex} v1
 * @param {GraphVertex} v2
 */
function addEdgeIfNone(v1, v2, weight) {
    if (v1.isObstacle || v2.isObstacle) return;
    if (gridGraph.getEdgeByVertices(v1,v2) === null) {
        gridGraph.addEdge(v1, v2, weight);
    }
}


/**
 * @param {Number} gridCount 
 * @param {Boolean} allowDiagonals
 */
function mountEdges(gridCount, allowDiagonals=true) {
    gridGraph.edges.forEach(e => {
        gridGraph.removeEdge(e);
    });
    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            let vertexI = getVertexIndexByGridCoords(x, y, gridCount);
            if (gridGraph.vertices[vertexI].isObstacle) continue;

            // Neighbours
            let weight = 1;
            let nL = getVertexIndexByGridCoords(x-1, y, gridCount);
            if (nL) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nL], weight);
            let nT = getVertexIndexByGridCoords(x, y-1, gridCount);
            if (nT) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nT], weight);
            let nR = getVertexIndexByGridCoords(x+1, y, gridCount);
            if (nR) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nR], weight);
            let nB = getVertexIndexByGridCoords(x, y+1, gridCount);
            if (nB) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nB], weight);


            // Diagonals
            if (allowDiagonals) {
                let diagonalWeight = Math.sqrt(2*(weight**2));
                let nLT = getVertexIndexByGridCoords(x-1, y-1, gridCount);
                if (nLT) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nLT], diagonalWeight);
                let nTR = getVertexIndexByGridCoords(x+1, y-1, gridCount);
                if (nTR) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nTR], diagonalWeight);
                let nRB = getVertexIndexByGridCoords(x+1, y+1, gridCount);
                if (nRB) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nRB], diagonalWeight);
                let nLB = getVertexIndexByGridCoords(x-1, y+1, gridCount);
                if (nLB) addEdgeIfNone(gridGraph.vertices[vertexI], gridGraph.vertices[nLB], diagonalWeight);
            }
        }
    }
}


/**
 * 
 * @param {InteractiveCanvas} canvas 
 * @param {Number} gridPixelSize 
 * @param {Number} gridCount 
 */
function drawGrid(canvas, gridPixelSize, gridCount) {
    const obstacleAnimationTime = 100;
    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {

            canvas.drawInstructions.push(() => {
                canvas.context.beginPath();
                let vertexI = getVertexIndexByGridCoords(x, y, gridCount);

                let xPos = canvas.getAbsX(gridPixelSize * x - (gridCount * gridPixelSize / 2))
                let yPos = canvas.getAbsY(gridPixelSize * y - (gridCount * gridPixelSize / 2));
                canvas.context.rect(xPos, yPos, gridPixelSize, gridPixelSize);

                if (gridGraph.vertices[vertexI].isObstacle) {
                    canvas.context.strokeStyle = "#ffffff";
                } else {
                    canvas.context.strokeStyle = "#000000";
                }
                
                canvas.context.stroke();
                canvas.context.closePath();

                if (gridGraph.vertices[vertexI]._statusLastChange) {
                    let filled = gridGraph.vertices[vertexI].isObstacle || gridGraph.vertices[vertexI].isFinishPoint || gridGraph.vertices[vertexI].isStartPoint;
                    canvas.context.beginPath();
                    let animationDt = new Date().getTime() - gridGraph.vertices[vertexI]._statusLastChange;

                    let animationProgress = animationDt / obstacleAnimationTime;
                    if (animationProgress > 1) {
                        animationProgress = 1;
                    }
                    if (filled === false) {
                        animationProgress = Math.abs(animationProgress - 1);
                    }

                    let xPos = canvas.getAbsX(gridPixelSize * x - (gridCount * gridPixelSize / 2))
                    let yPos = canvas.getAbsY(gridPixelSize * y - (gridCount * gridPixelSize / 2));

                    canvas.context.roundRect(
                        xPos + ((1-animationProgress) * (gridPixelSize)/2), 
                        yPos + ((1-animationProgress) * (gridPixelSize)/2), 
                        gridPixelSize - 2 * ((1-animationProgress) * (gridPixelSize)/2), 
                        gridPixelSize - 2*  ((1-animationProgress) * (gridPixelSize)/2),
                        (1-animationProgress) * 60
                    );
                    
                    if (gridGraph.vertices[vertexI].isStartPoint) {
                        canvas.context.fillStyle = "#57b33b";
                    } else if (gridGraph.vertices[vertexI].isFinishPoint) {
                        canvas.context.fillStyle = "#f52a2a";
                    }
                    canvas.context.fill();
                    canvas.context.closePath();
                    canvas.context.fillStyle = "#000000";
                    canvas.context.strokeStyle = "#000000";
                    
                } 
            })
        }
    }
    canvas.draw();
}

/**
 * @param {InteractiveCanvas} canvas
 * @param {GridVertex[]} path 
 */
function drawPath(canvas, path) {
    for (let i = 1; i < path.length; i++) {
        canvas.drawInstructions.push(() => {
            canvas.context.beginPath();
            let c = getRelCoordsByGridCoords(path[i-1].x, path[i-1].y, getGridPixelSize(), gridCount)
            canvas.context.moveTo(canvas.getAbsX(c.x), canvas.getAbsY(c.y));
            let c2 = getRelCoordsByGridCoords(path[i].x, path[i].y, getGridPixelSize(), gridCount)
            canvas.context.lineTo(canvas.getAbsX(c2.x), canvas.getAbsY(c2.y))
            canvas.context.strokeStyle = "#fcba03";
            canvas.context.lineWidth = 3;
            canvas.context.stroke();
            canvas.context.strokeStyle = "#000000";
            canvas.context.lineWidth = 1;
            canvas.context.closePath();
        })
    }
    canvas.draw();
}


/**
 * @param {InteractiveCanvas} canvas
 * @param {Number} gridPixelSize
 * @param {Number} gridCount
 */
function setUpGrid(canvas, gridPixelSize, gridCount, enableDiagonal=true) {
    // Reseting previous
    gridGraph.vertices = [];
    gridGraph.edges = [];
    canvas.drawInstructions = [];
    

    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            gridGraph.vertices.push(new GridVertex(x,y)); // Setting up graph vertices
        }
    }
    mountEdges(gridCount, enableDiagonal)
    drawGrid(canvas, gridPixelSize, gridCount);
}


export {setUpGrid, drawPath, drawGrid, mountEdges, addEdgeIfNone, getRelCoordsByGridCoords, getGridCoordsByAbsoluteCoords, getVertexIndexByGridCoords, gridGraph}