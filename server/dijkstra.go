package server

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"time"
)

func storeOrdered(targetSlice []*Vertex, vertex *Vertex) []*Vertex {
	if len(targetSlice) == 0 {
		targetSlice = append(targetSlice, vertex)
		return targetSlice
	}

	var newSlice = make([]*Vertex, len(targetSlice)+1)
	var wasStored bool = false
	var newSliceIndex = 0
	for i := 0; i < len(targetSlice); i++ {
		if wasStored == false && vertex.summedWeight < targetSlice[i].summedWeight {
			newSlice[newSliceIndex] = vertex
			newSlice[newSliceIndex+1] = targetSlice[i]
			newSliceIndex++
			wasStored = true
		} else {

			newSlice[newSliceIndex] = targetSlice[i]
		}
		newSliceIndex++
	}
	if !wasStored {
		newSlice[len(newSlice)-1] = vertex
	}

	return newSlice
}

func Dijkstra(graph *Graph, start *Vertex, finish *Vertex) ([]*Vertex, AnimationFrames) {
	startTime := time.Now()
	var animationFrames AnimationFrames = AnimationFrames{CurrentVertex: []int{}, CheckingNeighbour: [][]int{}}

	start.summedWeight = 0
	// var unvisitedVertices []*Vertex = []*Vertex{start}
	var unvisitedVertices Heap
	unvisitedVertices.Push(HeapItem{priority: 0, value: start})

	// Marking summed weights
	for unvisitedVertices.Len() > 0 {
		var currentVertex *Vertex = unvisitedVertices.getByIndex(0).value.(*Vertex)
		// var currentVertex *Vertex = unvisitedVertices[0]
		currentVertex.visited = true
		// unvisitedVertices = unvisitedVertices[1:] // Removing current vertex from slice
		unvisitedVertices.PopRoot()

		// Animation related
		animationFrames.CurrentVertex = append(animationFrames.CurrentVertex, currentVertex.id)
		animationFrames.CheckingNeighbour = append(animationFrames.CheckingNeighbour, []int{})

		if currentVertex == finish {
			break
		}

		for neighbourEdgeIndex := 0; neighbourEdgeIndex < len(currentVertex.edges); neighbourEdgeIndex++ {
			var neighbourEdge *Edge = currentVertex.edges[neighbourEdgeIndex]
			var neighbour *Vertex = neighbourEdge.getNeighbour(currentVertex)

			// Avoid loop edges
			if neighbour == currentVertex {
				continue
			}

			// animation related
			animationFrames.CheckingNeighbour[len(animationFrames.CheckingNeighbour)-1] = append(animationFrames.CheckingNeighbour[len(animationFrames.CheckingNeighbour)-1], neighbour.id)

			// Validation
			if neighbour.visited {
				continue // Prevent going backwards
			}

			// If current vertex summed weight + edge weight is lower than neighbour summed weight
			if math.IsNaN(neighbour.summedWeight) || neighbour.summedWeight > currentVertex.summedWeight+neighbourEdge.weight {
				neighbour.summedWeight = currentVertex.summedWeight + neighbourEdge.weight
			}

			// Detect if is already in the list
			if neighbour.isInUnvisitedSlice == false {
				// unvisitedVertices = storeOrdered(unvisitedVertices, neighbour)
				unvisitedVertices.Push(HeapItem{priority: neighbour.summedWeight, value: neighbour})
				neighbour.isInUnvisitedSlice = true
			}
		}
	}

	elapsed := time.Since(startTime)
	fmt.Printf("Dijkstra executed in: %v\n", elapsed)

	var path []*Vertex = graph.getPath(start, finish)

	return path, animationFrames
}

func AjaxDijkstra(writer http.ResponseWriter, request *http.Request) {
	fmt.Println("\nExecuting Dijkstra's algorithm...")
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
	path, animationFrames = Dijkstra(graph, startVertex, finishVertex)

	var indexesPath []int = graphPathToIndexesPath(graph, path)

	var responsePackage AnimationResponse = AnimationResponse{AnimationFramesObj: animationFrames, Path: indexesPath}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(responsePackage)
}
