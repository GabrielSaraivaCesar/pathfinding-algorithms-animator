package server

import (
	"fmt"
	"net/http"
)

func AStar(graph *Graph, start *Vertex, finish *Vertex) ([]*Vertex, AnimationFrames) {

}

func AjaxAStar(writer http.ResponseWriter, request *http.Request) {
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

	// var path []*Vertex
	// var animationFrames AnimationFrames

	path, animationFrames = AStar(graph, startVertex, finishVertex)

}
