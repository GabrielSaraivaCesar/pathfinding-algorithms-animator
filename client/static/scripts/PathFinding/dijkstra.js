
import { Graph, GraphEdge, GraphVertex } from "../shared/graph.js";


/**
 * @param {Graph} graph
 * @param {GraphVertex} startNode 
 * @param {GraphVertex} finishNode 
 */
function dijkstra(graph, startNode, finishNode) {

    // Animation purposes
    /** @type {GraphVertex[][]} */
    let visited_frames = [];
    /** @type {GraphVertex[][]} */
    let visited_nodes = [];

    /** @type {GraphVertex[]} */
    let looking_at_vertex_frame = [];
    

    let unvisitedNodes = [startNode];
    startNode._summedWeight = 0;

    while (unvisitedNodes.length > 0) {
        let currentNode = unvisitedNodes.shift();
        visited_nodes.push(currentNode); // Animation related

        if (currentNode == finishNode) break;

        currentNode.edges.forEach(neighbourEdge => {
            if (neighbourEdge.v1 == neighbourEdge.v2) return; // Ignore loop
            // Get neighbour node
            let neighbour = neighbourEdge.v1 == currentNode ? neighbourEdge.v2 : neighbourEdge.v1;

            // Animation related
            // visited_frames.push([...visited_nodes])
            // looking_at_vertex_frame.push(neighbour);

            if (neighbour._visited || neighbour.isObstacle) return; // Avoid going backwards or through obstacles

            // If summed weight is lower, set the lower
            if (neighbour._summedWeight === undefined || currentNode._summedWeight + neighbourEdge.weight < neighbour._summedWeight) {
                neighbour._summedWeight = currentNode._summedWeight + neighbourEdge.weight;
            }
            unvisitedNodes.push(neighbour);
        });
        currentNode._visited = true;
    }

    let path = [];
    if (finishNode._summedWeight) { // If finished node was actually reached
        path.unshift(finishNode);
        while (path[0] != startNode) {
            let neighbours = path[0].getNeighbours().filter(n => !n.isObstacle && n._visited);
            let previousPathItem = neighbours[0];
            for (let i = 1; i < neighbours.length; i++) {
                if (neighbours[i]._summedWeight !== undefined && neighbours[i]._summedWeight < previousPathItem._summedWeight) {
                    previousPathItem = neighbours[i];
                }
            }

            path.unshift(previousPathItem);
        }
    }

    
    resetDijkstraAlgorithmData(graph); // This will reset the added data into graph (To execute the algorithm multiple times)
    return {path, visited_frames, looking_at_vertex_frame};
}

/**
 * @param {Graph} graph 
 */
function resetDijkstraAlgorithmData(graph) {
    graph.vertices.forEach(vertex => {
        delete vertex._summedWeight;
        delete vertex._visited;
         
    })
}

export default dijkstra;