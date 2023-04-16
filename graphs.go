package main

type Edge struct {
	vertices []int
	weight   int
}
type Vertex struct {
	edges []int
}
type Graph struct {
	vertices []Vertex
	edges    []Edge
}
