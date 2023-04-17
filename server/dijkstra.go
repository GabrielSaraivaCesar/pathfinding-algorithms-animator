package server

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"time"
)

type AnimationFrames struct {
	CurrentVertex     []int
	CheckingNeighbour [][]int
}
type AjaxDijkstraResponse struct {
	AnimationFramesObj AnimationFrames
	Path               []int
}

func Dijkstra(graph *Graph, start *Vertex, finish *Vertex) ([]*Vertex, AnimationFrames) {
	t := time.Now()
	var animationFrames AnimationFrames = AnimationFrames{CurrentVertex: []int{}, CheckingNeighbour: [][]int{}}

	start.dijkstraSummedWeight = 0
	var unvisitedVertices []*Vertex = []*Vertex{start}

	// Marking summed weights
	for len(unvisitedVertices) > 0 {
		var currentVertex *Vertex = unvisitedVertices[0]
		currentVertex.visited = true
		unvisitedVertices = unvisitedVertices[1:] // Removing current vertex from slice

		// Animation related
		animationFrames.CurrentVertex = append(animationFrames.CurrentVertex, currentVertex.id)
		animationFrames.CheckingNeighbour = append(animationFrames.CheckingNeighbour, []int{})

		if currentVertex == finish {
			break
		}

		for neighbourEdgeIndex := 0; neighbourEdgeIndex < len(currentVertex.edges); neighbourEdgeIndex++ {
			var neighbour *Vertex = nil
			var neighbourEdge *Edge = currentVertex.edges[neighbourEdgeIndex]

			// Get neighbour
			if neighbourEdge.vertices[0] != currentVertex {
				neighbour = neighbourEdge.vertices[0]
			} else if neighbourEdge.vertices[1] != currentVertex {
				neighbour = neighbourEdge.vertices[1]
			} else {
				continue // Prevent loops
			}

			// animation related
			animationFrames.CheckingNeighbour[len(animationFrames.CheckingNeighbour)-1] = append(animationFrames.CheckingNeighbour[len(animationFrames.CheckingNeighbour)-1], neighbour.id)

			// Validation
			if neighbour.visited {
				continue // Prevent going backwards
			}

			// If current vertex summed weight + edge weight is lower than neighbour summed weight
			if math.IsNaN(neighbour.dijkstraSummedWeight) || neighbour.dijkstraSummedWeight > currentVertex.dijkstraSummedWeight+neighbourEdge.weight {
				neighbour.dijkstraSummedWeight = currentVertex.dijkstraSummedWeight + neighbourEdge.weight
			}

			// Detect if is already in the list
			var isInUnvisitedSlice bool = false
			for uX := 0; uX < len(unvisitedVertices); uX++ {
				if unvisitedVertices[uX] == neighbour {
					isInUnvisitedSlice = true
					break
				}
			}

			if !isInUnvisitedSlice {
				unvisitedVertices = append(unvisitedVertices, neighbour)
			}
		}
	}

	// If the algorithm was able to get to the finish point
	if math.IsNaN(finish.dijkstraSummedWeight) == false {
		var path []*Vertex = []*Vertex{finish}

		for path[0] != start {
			var bestNeighbour *Vertex = nil

			for neighbourEdgeIndex := 0; neighbourEdgeIndex < len(path[0].edges); neighbourEdgeIndex++ {
				var neighbour *Vertex = nil
				var neighbourEdge *Edge = path[0].edges[neighbourEdgeIndex]

				// Get neighbour
				if neighbourEdge.vertices[0] != path[0] {
					neighbour = neighbourEdge.vertices[0]
				} else {
					neighbour = neighbourEdge.vertices[1]
				}

				if bestNeighbour == nil || neighbour.dijkstraSummedWeight < bestNeighbour.dijkstraSummedWeight {
					bestNeighbour = neighbour
				}
			}

			path = append([]*Vertex{bestNeighbour}, path...)
		}

		elapsed := time.Since(t)
		fmt.Printf("%vms\n", elapsed.Milliseconds())
		return path, animationFrames
	}

	return []*Vertex{}, animationFrames
}

func AjaxDijkstra(writer http.ResponseWriter, request *http.Request) {
	fmt.Println("Executing Dijkstra's algorithm...")
	var err error
	var jsonGraph JsonGraph
	err = json.NewDecoder(request.Body).Decode(&jsonGraph)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var graph Graph
	err = graph.LoadFromJsonGraph(jsonGraph)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var startVertex *Vertex
	err, startVertex = graph.findVertexById(jsonGraph.Start)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var finishVertex *Vertex
	err, finishVertex = graph.findVertexById(jsonGraph.Finish)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var path []*Vertex
	var animationFrames AnimationFrames
	path, animationFrames = Dijkstra(&graph, startVertex, finishVertex)

	var indexesPath []int = graphPathToIndexesPath(&graph, path)

	var responsePackage AjaxDijkstraResponse = AjaxDijkstraResponse{AnimationFramesObj: animationFrames, Path: indexesPath}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(responsePackage)
}
