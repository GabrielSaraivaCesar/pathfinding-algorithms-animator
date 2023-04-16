import InteractiveCanvas from "../shared/canvas.js";
import { Graph, GraphVertex } from "../shared/graph.js";
import dijkstra from "./dijkstra.js";

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
    return {
        x: Math.floor(relX / gridPixelSize + (gridCount / 2)),
        y: Math.floor(relY / gridPixelSize + (gridCount / 2))
    }
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
    if (gridGraph.getEdgeByVertices(v1,v2) === null) {
        gridGraph.addEdge(v1, v2, weight);
    }
}


/**
 * @param {Number} gridCount 
 * @param {Boolean} allowDiagonals
 */
function mountEdges(gridCount, allowDiagonals=true) {
    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            let vertexI = getVertexIndexByGridCoords(x, y, gridCount);
            
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

const canvas = new InteractiveCanvas(document.querySelector('canvas'), 60, false);
let gridCount = 10;

let gridCountInput = document.querySelector("input[name=gridcount]");
let gridCountDisplay = document.querySelector('#gridcount-display');

let brushTypeOptions = document.querySelectorAll('input[name=brush-type]');
let brushType = document.querySelector('input[name=brush-type]:checked').value;

let enableDiagonalOptions = document.querySelectorAll('input[name=diagonals-enabled]');
let enableDiagonal = document.querySelector('input[name=diagonals-enabled]:checked').value === "yes";

let submitButton = document.querySelector('#submit-button button');

let getGridPixelSize = () => (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) / gridCount;

setUpGrid(canvas, getGridPixelSize(), gridCount, enableDiagonal);

gridCountInput.addEventListener('input', (e) => {
    gridCount = e.target.value;
    gridCountDisplay.textContent = gridCount;
    setUpGrid(canvas, getGridPixelSize(), gridCount, enableDiagonal);
})

brushTypeOptions.forEach(opt => {
    opt.addEventListener('change', (e) => {
        brushType = e.target.value;
    })
})

enableDiagonalOptions.forEach(opt => {
    opt.addEventListener('change', (e) => {
        enableDiagonal = e.target.value === "yes";
        
        gridGraph.edges.forEach(e => {
            gridGraph.removeEdge(e);
        });
        mountEdges(gridCount, enableDiagonal);
    })
})

canvas.canvas.addEventListener('click', (e) => {
    let clickCoords = getGridCoordsByAbsoluteCoords(canvas, e.clientX, e.clientY, getGridPixelSize(), gridCount);
    let vertexI = getVertexIndexByGridCoords(clickCoords.x, clickCoords.y, gridCount);
    if (vertexI !== null) {
        if (brushType === 'obstacle') {
            gridGraph.vertices[vertexI].isObstacle = !gridGraph.vertices[vertexI].isObstacle;
            gridGraph.vertices[vertexI].isStartPoint = false;
            gridGraph.vertices[vertexI].isFinishPoint = false;
        } else if (brushType === 'start') {
            gridGraph.vertices.forEach(v => {
                v.isStartPoint = false;
            })
            gridGraph.vertices[vertexI].isStartPoint = !gridGraph.vertices[vertexI].isStartPoint;
            gridGraph.vertices[vertexI].isFinishPoint = false;
            gridGraph.vertices[vertexI].isObstacle = false;
        } else if (brushType === 'finish') {
            gridGraph.vertices.forEach(v => {
                v.isFinishPoint = false;
            })
            gridGraph.vertices[vertexI].isFinishPoint = !gridGraph.vertices[vertexI].isFinishPoint;
            gridGraph.vertices[vertexI].isStartPoint = false;
            gridGraph.vertices[vertexI].isObstacle = false;
        } 
        gridGraph.vertices[vertexI]._statusLastChange = new Date().getTime();
    }
})

submitButton.addEventListener('click', () => {
    canvas.drawInstructions = [];
    drawGrid(canvas, getGridPixelSize(), gridCount)

    let startNode = gridGraph.vertices.find(v => v.isStartPoint);
    let finishNode = gridGraph.vertices.find(v => v.isFinishPoint);

    let {path, visited_frames, looking_at_vertex_frame} = dijkstra(gridGraph, startNode, finishNode);
    drawPath(canvas, path)
})