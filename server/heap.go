package server

import "fmt"

type Heap struct {
	_data []int
}

func (heap *Heap) push(value int) error {
	heap._data = append(heap._data, value)
	return nil
}
func (heap *Heap) popRoot(value int) (error, int) {
	var rootValue int = heap._data[0]
	heap._data[0] = heap._data[len(heap._data)-1]
	heap._data = heap._data[:len(heap._data)-1]

	return nil, rootValue
}
func (heap *Heap) get(index int) (error, int) {
	var value int = nil
	var err error = nil

	if index > len(heap._data)-1 {
		err = fmt.Errorf("I")
	}

	return nil, heap._data[index]
}
