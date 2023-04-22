package server

import (
	"errors"
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
	Coords   []Coords
}

type Edge struct {
	vertices []*Vertex
	weight   float64
}

// besides "id" and "edges", the rest of the fields are responsible to store data to prevent having to iterate through some slices multiple times
type Vertex struct {
	id    int
	edges []*Edge

	summedWeight       float64
	isInUnvisitedSlice bool
	visited            bool
	coords             Coords
}
type Graph struct {
	vertices []*Vertex
	edges    []*Edge
}

func (graph *Graph) AddVertex(vertexId int, coords Coords) error {
	for i := 0; i < len(graph.vertices); i++ {
		if graph.vertices[i].id == vertexId {
			return errors.New("Vertex already exists")
		}
	}
	newVertex := &Vertex{
		id:           vertexId,
		edges:        []*Edge{},
		summedWeight: float64(math.NaN()),
		visited:      false,
		coords:       Coords{X: coords.X, Y: coords.Y},
	}
	graph.vertices = append(graph.vertices, newVertex)
	return nil
}

func (graph *Graph) findVertexById(vertexId int) (*Vertex, error) {
	var vertex *Vertex = nil

	for i := 0; i < len(graph.vertices); i++ {
		if graph.vertices[i].id == vertexId {
			vertex = graph.vertices[i]
		}
	}

	if vertex == nil {
		return nil, errors.New("Vertex doesn't exist")
	}

	return vertex, nil
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

	vertexA, errA := graph.findVertexById(vertexAId)
	if errA != nil {
		return errA
	}
	vertexB, errB := graph.findVertexById(vertexBId)
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
		err := graph.AddVertex(jsonGraph.Vertices[vIndex], jsonGraph.Coords[vIndex])
		if err != nil {
			return err
		}
	}
	for eIndex := 0; eIndex < len(jsonGraph.Edges); eIndex++ {
		edge := jsonGraph.Edges[eIndex]
		if len(edge.Vertices) != 2 {
			return errors.New("Invalid edge with length  with more than 2 items")
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

func (edge Edge) getNeighbour(vertex *Vertex) *Vertex {
	if edge.vertices[0] != vertex {
		return edge.vertices[0]
	} else {
		return edge.vertices[1]
	}
}

func (graph Graph) getPath(start *Vertex, finish *Vertex) []*Vertex {
	var path []*Vertex = []*Vertex{finish}

	if math.IsNaN(finish.summedWeight) {
		return []*Vertex{}
	}
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

			if math.IsNaN(neighbour.summedWeight) || !neighbour.visited { // Only analysed neighbours can join
				continue
			}

			if bestNeighbour == nil || neighbour.summedWeight < bestNeighbour.summedWeight {
				bestNeighbour = neighbour
			}
		}

		path = append([]*Vertex{bestNeighbour}, path...)
	}
	return path
}
