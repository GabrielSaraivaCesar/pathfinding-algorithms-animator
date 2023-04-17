import InteractiveCanvas from "./shared/canvas.js";
import {setUpGrid, mountEdges, getGridCoordsByAbsoluteCoords, getVertexIndexByGridCoords, gridGraph} from './PathFinding/pathFinding.js'
import { Graph } from "./shared/graph.js";

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
    // canvas.drawInstructions = [];
    // drawGrid(canvas, getGridPixelSize(), gridCount)

    // let startNode = gridGraph.vertices.find(v => v.isStartPoint);
    // let finishNode = gridGraph.vertices.find(v => v.isFinishPoint);

    // let {path, visited_frames, looking_at_vertex_frame} = dijkstra(gridGraph, startNode, finishNode);
    // drawPath(canvas, path)
})