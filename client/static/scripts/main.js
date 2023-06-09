import InteractiveCanvas from "./shared/canvas.js";
import {setUpGrid, mountEdges, getGridCoordsByAbsoluteCoords, getVertexIndexByGridCoords, gridGraph, drawGrid, getAbsoluteCoordsByGridCoords, reorderInstructions} from './graph_setup.js'
import { Graph } from "./shared/graph.js";
import { DRAW_TAGS } from "./shared/constants.js";


const canvas = new InteractiveCanvas(document.querySelector('canvas'), 60, false);
let isClickingCanvas = false;
let canvasButtonClicked = null;


let gridCountInput = document.querySelector("input[name=gridcount]");
let gridCount = gridCountInput.value;
let gridCountDisplay = document.querySelector('#gridcount-display');
const setGridCountDisplay = (gridCount) => gridCountDisplay.textContent = `${gridCount}x${gridCount}`;
setGridCountDisplay(gridCount);

let brushTypeOptions = document.querySelectorAll('input[name=brush-type]');
let brushType = document.querySelector('input[name=brush-type]:checked').value;
let eraserButton = document.querySelector('input[name=brush-type][value=eraser]');

let algorithmTypeOptions = document.querySelectorAll('input[name=algorithm-choice]');
let algorithmType = document.querySelector('input[name=algorithm-choice]:checked').value;

let enableDiagonalOptions = document.querySelectorAll('input[name=diagonals-enabled]');
let enableDiagonal = document.querySelector('input[name=diagonals-enabled]:checked').value === "yes";

let submitButton = document.querySelector('button#submit-button');
let clearPathButton = document.querySelector('button#clear-path-button');
clearPathButton.setAttribute('disabled', true);
let clearAllButton = document.querySelector('button#clear-all-button');
clearAllButton.setAttribute('disabled', true);

let fpsInput = document.querySelector('input[name=fps]');

let getGridPixelSize = () => {
    let rect = canvas.canvas.getBoundingClientRect();
    return (rect.width < rect.height ? rect.width : rect.height) / gridCount - (40/gridCount);
}


let currentAnimationFrame = 0;
let framesPerSecond = fpsInput.value;
let animationInterval = null;
let lastFrameT = new Date().getTime()

function createAnimationInterval() {
    window.clearInterval(animationInterval);
    let intervalTime = 1000/framesPerSecond;
    if (intervalTime < 10) {
        intervalTime = 10;
    }
    animationInterval = window.setInterval(() => {
        let dt = new Date().getTime() - lastFrameT;
        currentAnimationFrame += Math.round(dt / (1000/framesPerSecond));
        lastFrameT = new Date().getTime();
    }, intervalTime)
}
createAnimationInterval();


/**
 * @param {Number[]} path 
 * @param {Number} startOnFrame 
 */
function drawPath(path, startOnFrame=0) {
    for (let frame = 1; frame < path.length; frame++) {
        let lastVertex = gridGraph.vertices[path[frame - 1]];
        let currentVertex = gridGraph.vertices[path[frame]];
        canvas.addDrawInstruction(() => {
            if (currentAnimationFrame < frame+startOnFrame) {
                return
            }

            let gridPixelSize = getGridPixelSize();
            canvas.context.beginPath();
            let c = getAbsoluteCoordsByGridCoords(canvas, lastVertex.x, lastVertex.y, gridPixelSize, gridCount)
            c.x += gridPixelSize/2;
            c.y += gridPixelSize/2;

            canvas.context.moveTo(c.x, c.y);
            let c2 = getAbsoluteCoordsByGridCoords(canvas, currentVertex.x, currentVertex.y, gridPixelSize, gridCount)
            c2.x += gridPixelSize/2;
            c2.y += gridPixelSize/2;

            canvas.context.lineTo(c2.x, c2.y)
            canvas.context.strokeStyle = "#fcba03";
            canvas.context.lineWidth = 3;
            canvas.context.stroke();
            canvas.context.strokeStyle = "#000000";
            canvas.context.lineWidth = 1;
            canvas.context.closePath();
        }, DRAW_TAGS.PATH_ANIMATION)
    }
    canvas.draw();
}


function drawAnimation(animationFramesObj) {
    for (let frame = 0; frame < animationFramesObj.CheckingNeighbour.length; frame++) {
        canvas.addDrawInstruction(() => {
            if (frame > currentAnimationFrame) {
                return;
            }
            let gridPixelSize = getGridPixelSize();

            animationFramesObj.CheckingNeighbour[frame].forEach(neighbourIndex => {
                let neighbourVertex = gridGraph.vertices[neighbourIndex]
                let xPos = canvas.getAbsX(gridPixelSize * neighbourVertex.x - (gridCount * gridPixelSize / 2))
                let yPos = canvas.getAbsY(gridPixelSize * neighbourVertex.y - (gridCount * gridPixelSize / 2));

                canvas.context.beginPath();
                if (frame === currentAnimationFrame) {
                    canvas.context.fillStyle = "#00000055";
                } else {
                    canvas.context.fillStyle = "#00000033";
                }

                canvas.context.rect(
                    xPos, 
                    yPos, 
                    gridPixelSize, 
                    gridPixelSize
                );
                canvas.context.fill();
                canvas.context.fillStyle = "#000000";
                canvas.context.closePath();
            })
        }, DRAW_TAGS.PATH_ANIMATION)
        
    }
    for (let frame = 0; frame < animationFramesObj.CurrentVertex.length; frame++) {
        let currentVertex = gridGraph.vertices[animationFramesObj.CurrentVertex[frame]];
        canvas.addDrawInstruction(() => {
            if (frame > currentAnimationFrame) {
                return;
            }

            let gridPixelSize = getGridPixelSize();

            let pos = getAbsoluteCoordsByGridCoords(canvas, currentVertex.x, currentVertex.y, gridPixelSize, gridCount)

            canvas.context.beginPath();
            if (frame === currentAnimationFrame) {
                canvas.context.fillStyle = "#ad42f5";
            } else {
                canvas.context.fillStyle = "#f8edff";
            }


            canvas.context.rect(
                pos.x, 
                pos.y, 
                gridPixelSize, 
                gridPixelSize
            );
            canvas.context.fill();
            canvas.context.fillStyle = "#000000";
            canvas.context.closePath();
        }, DRAW_TAGS.PATH_ANIMATION)

    }
}

/**
 * @param {Graph} graph 
 * @returns {{
 *  vertices: Number[],
 *  edges: {
 *      weight: Number,
 *      vertices: Number[]
 *  }[]
 * }}
 */
function graphToJsonGraph(graph) {
    let jsonGraph = {
        Vertices: [],
        Edges: [],
        Start: graph.vertices.findIndex((v) => v.isStartPoint),
        Finish: graph.vertices.findIndex((v) => v.isFinishPoint),
        Coords: []
    }
    graph.vertices.forEach((vertex, i) => {
        jsonGraph.Vertices.push(i);
        jsonGraph.Coords.push({
            x: vertex.x,
            y: vertex.y
        })
    });
    graph.edges.forEach((edge) => {
        let v1VertexIndex = graph.vertices.findIndex((v) => v === edge.v1);
        let v2VertexIndex = graph.vertices.findIndex((v) => v === edge.v2);
        let edgeObj = {
            Weight: edge.weight,
            Vertices: [v1VertexIndex, v2VertexIndex]
        }
        jsonGraph.Edges.push(edgeObj);
    })
    return jsonGraph;
}


setUpGrid(canvas, getGridPixelSize(), gridCount, enableDiagonal);

gridCountInput.addEventListener('input', (e) => {
    gridCount = e.target.value;
    setGridCountDisplay(gridCount);
    setUpGrid(canvas, getGridPixelSize(), gridCount, enableDiagonal);
})

brushTypeOptions.forEach(opt => {
    opt.addEventListener('change', (e) => {
        brushType = e.target.value;
    })
})

algorithmTypeOptions.forEach(opt => {
    opt.addEventListener('change', (e) => {
        algorithmType = e.target.value;
    })
})

enableDiagonalOptions.forEach(opt => {
    opt.addEventListener('change', (e) => {
        enableDiagonal = e.target.value === "yes";
    })
})

function clickVertexHandler(vertex) {
    let originalStatus = false;
    let currentStatus = false;
    if (brushType === 'eraser' || canvasButtonClicked === 2) {
        currentStatus = false;
        originalStatus = vertex.isFinishPoint || vertex.isStartPoint || vertex.isObstacle;
        vertex.isFinishPoint = false;
        vertex.isStartPoint = false;
        vertex.isObstacle = false;
    } else if (brushType === 'obstacle') {
        originalStatus = vertex.isObstacle;
        currentStatus = true;
        vertex.isObstacle = true;
        vertex.isStartPoint = false;
        vertex.isFinishPoint = false;
    } else if (brushType === 'start') {
        originalStatus = vertex.isStartPoint;
        currentStatus = true;
        gridGraph.vertices.forEach(v => {
            if (v != vertex && v.isStartPoint) {
                v.isStartPoint = false;
                v._statusLastChange = null;
            }
        })
        vertex.isStartPoint = true;
        vertex.isFinishPoint = false;
        vertex.isObstacle = false;
    } else if (brushType === 'finish') {
        originalStatus = vertex.isFinishPoint;
        currentStatus = true;
        gridGraph.vertices.forEach(v => {
            if (v != vertex && v.isFinishPoint) {
                v.isFinishPoint = false;
                v._statusLastChange = null;
            }
        })
        vertex.isFinishPoint = true;
        vertex.isStartPoint = false;
        vertex.isObstacle = false;
    }

    if (originalStatus != currentStatus) {
        vertex._statusLastChange = new Date().getTime();
    }
}

function disableDragging(e) {
    isClickingCanvas = false;
    eraserButton.classList.remove("partially-checked");
}
canvas.canvas.addEventListener('mouseup', e => {
    disableDragging(e)
});
canvas.canvas.addEventListener('mouseleave', e => {
    disableDragging(e)
});
canvas.canvas.addEventListener('mouseout', e => {
    disableDragging(e)
});
canvas.canvas.addEventListener('mousedown', e => {
    if (e.button === 0 || e.button === 2) {

        clearAllButton.removeAttribute("disabled")
        let rect = canvas.canvas.getBoundingClientRect();
        let clickCoords = getGridCoordsByAbsoluteCoords(canvas, e.clientX-rect.left, e.clientY-rect.top, getGridPixelSize(), gridCount);
        let vertexI = getVertexIndexByGridCoords(clickCoords.x, clickCoords.y, gridCount);
        if (vertexI === null) {
            return;
        }

        isClickingCanvas = true;
        canvasButtonClicked = e.button;

        if (e.button === 2) {
            eraserButton.classList.add("partially-checked");
        }

        let vertex = gridGraph.vertices[vertexI];
        clickVertexHandler(vertex);
    } 
})
canvas.canvas.addEventListener('mousemove', (e) => {
    if (isClickingCanvas === false) {
        return;
    }
    let rect = canvas.canvas.getBoundingClientRect();
    let clickCoords = getGridCoordsByAbsoluteCoords(canvas, e.clientX-rect.left, e.clientY-rect.top, getGridPixelSize(), gridCount);
    let vertexI = getVertexIndexByGridCoords(clickCoords.x, clickCoords.y, gridCount);

    if (vertexI !== null) {
        let vertex = gridGraph.vertices[vertexI];
        clickVertexHandler(vertex);
    }
});

clearPathButton.addEventListener('click', () => {
    clearPathButton.setAttribute("disabled", true)
    canvas.clearDrawInstructions(DRAW_TAGS.PATH_ANIMATION);
})
clearAllButton.addEventListener('click', () => {
    clearAllButton.setAttribute("disabled", true)
    canvas.clearDrawInstructions(DRAW_TAGS.PATH_ANIMATION);
    gridGraph.vertices.forEach(vertex => {
        vertex.isObstacle = false;
        vertex.isStartPoint = false;
        vertex.isFinishPoint = false;
    })
})

window.addEventListener('resize', () => {
    canvas.clearDrawInstructions(DRAW_TAGS.GRID)
    drawGrid(canvas, getGridPixelSize(), gridCount)
    reorderInstructions(canvas);
})

fpsInput.addEventListener("input", (e) => {
    framesPerSecond = e.target.value;
    createAnimationInterval();
})

submitButton.addEventListener('click', () => {
    mountEdges(gridCount, enableDiagonal);
    let jsonGraph = graphToJsonGraph(gridGraph);
    fetch("/"+algorithmType, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonGraph)
    })
    .then(response => {
        response.json()
        .then(jsonResponse => {
            clearPathButton.removeAttribute("disabled")
            canvas.clearDrawInstructions(DRAW_TAGS.PATH_ANIMATION);
            currentAnimationFrame = 0;
            jsonResponse.Path.reverse()
            drawAnimation(jsonResponse.AnimationFramesObj)
            drawPath(jsonResponse.Path, jsonResponse.AnimationFramesObj.CheckingNeighbour.length)
            reorderInstructions(canvas);
        })
    })
    .catch(err => {
        console.error(err);
    })
})