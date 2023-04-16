package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func ajaxDijkstra(writer http.ResponseWriter, request *http.Request) {
	fmt.Println("Executing Dijkstra's algorithm...")
	var graph Graph
	err := json.NewDecoder(request.Body).Decode(&graph)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Fprintf(writer, "Graph: %+v", graph)
}
