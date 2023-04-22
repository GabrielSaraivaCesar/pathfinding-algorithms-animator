package server

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"time"
)

// Euristic function
func EulerDistance(v1 *Vertex, v2 *Vertex) float64 {
	var xDiff float64 = v1.coords.X - v2.coords.X
	var yDiff float64 = v1.coords.Y - v2.coords.Y
	return math.Sqrt(math.Pow(xDiff, 2) + math.Pow(yDiff, 2))
}

func AStar(graph *Graph, start *Vertex, finish *Vertex) ([]*Vertex, AnimationFrames) {
	startTime := time.Now()
	var queue Heap
	var currentVertex *Vertex
	var animationFrames AnimationFrames = AnimationFrames{CurrentVertex: []int{}, CheckingNeighbour: [][]int{}}

	start.summedWeight = 0
	queue.push(HeapItem{priority: 0, value: start})

	for queue.len() > 0 {
		currentVertex = queue.getByIndex(0).value.(*Vertex)
		currentVertex.visited = true
		queue.popRoot()
		animationFrames.CurrentVertex = append(animationFrames.CurrentVertex, currentVertex.id)
		animationFrames.CheckingNeighbour = append(animationFrames.CheckingNeighbour, []int{})

		if currentVertex == finish {
			break
		}

		for edgeI := 0; edgeI < len(currentVertex.edges); edgeI++ {
			var edge Edge = *currentVertex.edges[edgeI]
			var neighbour *Vertex = edge.getNeighbour(currentVertex)

			// Avoid loop edges
			if neighbour == currentVertex {
				continue
			}

			// Avoid going backwards
			if neighbour.visited {
				continue
			}

			newWeight := currentVertex.summedWeight + edge.weight
			if math.IsNaN(neighbour.summedWeight) || neighbour.summedWeight > newWeight {
				animationFrames.CheckingNeighbour[len(animationFrames.CheckingNeighbour)-1] = append(animationFrames.CheckingNeighbour[len(animationFrames.CheckingNeighbour)-1], neighbour.id)
				neighbour.summedWeight = newWeight
				var heuristicWeight float64 = EulerDistance(neighbour, finish)
				queue.push(HeapItem{priority: heuristicWeight, value: neighbour})
			}

		}

	}

	elapsed := time.Since(startTime)
	fmt.Printf("A* executed in: %v\n", elapsed)
	var path []*Vertex = graph.getPath(start, finish)
	return path, animationFrames
}

func AjaxAStar(writer http.ResponseWriter, request *http.Request) {
	fmt.Println("\nExecuting A* algorithm...")
	var err error
	var graph *Graph
	var startVertex *Vertex
	var finishVertex *Vertex

	err, graph, startVertex, finishVertex = getGraphFromJsonBody(request)

	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var path []*Vertex
	var animationFrames AnimationFrames

	path, animationFrames = AStar(graph, startVertex, finishVertex)
	var indexesPath []int = graphPathToIndexesPath(graph, path)

	var responsePackage AnimationResponse = AnimationResponse{AnimationFramesObj: animationFrames, Path: indexesPath}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(responsePackage)
}
