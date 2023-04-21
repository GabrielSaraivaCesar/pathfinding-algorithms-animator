package server

import (
	"encoding/json"
	"net/http"
)

func getGraphFromJsonBody(request *http.Request) (error, *Graph, *Vertex, *Vertex) {
	var jsonGraph JsonGraph
	var err error

	err = json.NewDecoder(request.Body).Decode(&jsonGraph)
	if err != nil {
		return err, nil, nil, nil
	}

	var graph Graph
	err = graph.LoadFromJsonGraph(jsonGraph)
	if err != nil {
		return err, nil, nil, nil
	}

	var startVertex *Vertex
	startVertex, err = graph.findVertexById(jsonGraph.Start)
	if err != nil {
		return err, nil, nil, nil
	}

	var finishVertex *Vertex
	finishVertex, err = graph.findVertexById(jsonGraph.Finish)
	if err != nil {
		return err, nil, nil, nil
	}

	return nil, &graph, startVertex, finishVertex
}
