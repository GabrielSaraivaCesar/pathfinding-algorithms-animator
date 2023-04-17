package server

import (
	"fmt"
	"math"
)

type JsonGraphEdge struct {
	Weight   float64
	Vertices []int
}
type JsonGraph struct {
	Vertices []int
	Edges    []JsonGraphEdge
	Start    int
	Finish   int
}

type Edge struct {
	vertices []*Vertex
	weight   float64
}

// besides "id" and "edges", the rest of the fields are responsible to store data to prevent having to iterate through some slices multiple times
type Vertex struct {
	id    int
	edges []*Edge

	dijkstraSummedWeight float64
	isInUnvisitedSlice   bool
	visited              bool
}
type Graph struct {
	vertices []*Vertex
	edges    []*Edge
}

func (graph *Graph) AddVertex(vertexId int) error {
	for i := 0; i < len(graph.vertices); i++ {
		if graph.vertices[i].id == vertexId {
			return fmt.Errorf("Vertex %d already exists", vertexId)
		}
	}
	newVertex := &Vertex{id: vertexId, edges: []*Edge{}, dijkstraSummedWeight: float64(math.NaN()), visited: false}
	graph.vertices = append(graph.vertices, newVertex)
	return nil
}

func (graph *Graph) findVertexById(vertexId int) (error, *Vertex) {
	var vertex *Vertex = nil

	for i := 0; i < len(graph.vertices); i++ {
		if graph.vertices[i].id == vertexId {
			vertex = graph.vertices[i]
		}
	}

	if vertex == nil {
		return fmt.Errorf("Vertex %d doesn't exist", vertexId), nil
	}

	return nil, vertex
}

func (graph *Graph) AddEdge(vertexA *Vertex, vertexB *Vertex, weight float64) error {
	newEdge := Edge{vertices: []*Vertex{
		vertexA,
		vertexB,
	}, weight: weight}
	graph.edges = append(graph.edges, &newEdge)
	vertexA.edges = append(vertexA.edges, &newEdge)
	vertexB.edges = append(vertexB.edges, &newEdge)
	return nil
}

func (graph *Graph) AddEdgeByVertexIds(vertexAId int, vertexBId int, weight float64) error {

	errA, vertexA := graph.findVertexById(vertexAId)
	if errA != nil {
		return errA
	}
	errB, vertexB := graph.findVertexById(vertexBId)
	if errB != nil {
		return errB
	}

	addEdgeErr := graph.AddEdge(vertexA, vertexB, weight)
	if addEdgeErr != nil {
		return addEdgeErr
	}

	return nil
}

func (graph *Graph) LoadFromJsonGraph(jsonGraph JsonGraph) error {
	for vIndex := 0; vIndex < len(jsonGraph.Vertices); vIndex++ {
		err := graph.AddVertex(jsonGraph.Vertices[vIndex])
		if err != nil {
			return err
		}
	}
	for eIndex := 0; eIndex < len(jsonGraph.Edges); eIndex++ {
		edge := jsonGraph.Edges[eIndex]
		if len(edge.Vertices) != 2 {
			return fmt.Errorf("Invalid edge with %d items", len(edge.Vertices))
		}
		err := graph.AddEdgeByVertexIds(edge.Vertices[0], edge.Vertices[1], edge.Weight)
		if err != nil {
			return err
		}
	}

	return nil
}

func graphPathToIndexesPath(graph *Graph, path []*Vertex) []int {
	var indexPath []int = []int{}
	for pathItem := 0; pathItem < len(path); pathItem++ {
		var vertexIndex int
		// Finding index
		for vertexItem := 0; vertexItem < len(graph.vertices); vertexItem++ {
			if graph.vertices[vertexItem] == path[pathItem] {
				vertexIndex = vertexItem
				break
			}
		}
		indexPath = append(indexPath, vertexIndex)
	}

	return indexPath
}
