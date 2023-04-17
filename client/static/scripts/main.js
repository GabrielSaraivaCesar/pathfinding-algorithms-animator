import InteractiveCanvas from "./shared/canvas.js";
import {setUpGrid, mountEdges, getGridCoordsByAbsoluteCoords, getVertexIndexByGridCoords, gridGraph, drawGrid, getRelCoordsByGridCoords} from './PathFinding/pathFinding.js'
import { Graph } from "./shared/graph.js";
import dijkstra from './PathFinding/dijkstra.js'

const canvas = new InteractiveCanvas(document.querySelector('canvas'), 60, false);

let gridCount = 10;

let gridCountInput = document.querySelector("input[name=gridcount]");
let gridCountDisplay = document.querySelector('#gridcount-display');

let brushTypeOptions = document.querySelectorAll('input[name=brush-type]');
let brushType = document.querySelector('input[name=brush-type]:checked').value;

let enableDiagonalOptions = document.querySelectorAll('input[name=diagonals-enabled]');
let enableDiagonal = document.querySelector('input[name=diagonals-enabled]:checked').value === "yes";

let submitButton = document.querySelector('#submit-button button');

let getGridPixelSize = () => {
    let rect = canvas.canvas.getBoundingClientRect();
    return (rect.width < rect.height ? rect.width : rect.height) / gridCount - (40/gridCount);
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
        
        mountEdges(gridCount, enableDiagonal);
    })
})

canvas.canvas.addEventListener('click', (e) => {
    let rect = canvas.canvas.getBoundingClientRect();
    
    let clickCoords = getGridCoordsByAbsoluteCoords(canvas, e.clientX-rect.left, e.clientY-rect.top, getGridPixelSize(), gridCount);
    let vertexI = getVertexIndexByGridCoords(clickCoords.x, clickCoords.y, gridCount);
    if (vertexI !== null) {
        if (brushType === 'obstacle') {
            gridGraph.vertices[vertexI].isObstacle = !gridGraph.vertices[vertexI].isObstacle;
            gridGraph.vertices[vertexI].isStartPoint = false;
            gridGraph.vertices[vertexI].isFinishPoint = false;
            mountEdges(gridCount, enableDiagonal);
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
});

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
    }
    graph.vertices.forEach((_, i) => {
        jsonGraph.Vertices.push(i);
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

submitButton.addEventListener('click', () => {
    let jsonGraph = graphToJsonGraph(gridGraph);
    fetch("/dijkstra", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonGraph)
    })
    canvas.drawInstructions = [];
    drawGrid(canvas, getGridPixelSize(), gridCount)

    let startNode = gridGraph.vertices.find(v => v.isStartPoint);
    let finishNode = gridGraph.vertices.find(v => v.isFinishPoint);

    let {path, visited_frames, looking_at_vertex_frame} = dijkstra(gridGraph, startNode, finishNode);
    drawPath(canvas, path)
})