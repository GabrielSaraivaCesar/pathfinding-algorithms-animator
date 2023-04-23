package server

import (
	"fmt"
	"math"
)

type HeapItem struct {
	priority float64
	value    any
}
type Heap struct {
	_data []HeapItem
}

func (heap *Heap) Len() int {
	return len(heap._data)
}

func (heap *Heap) Push(item HeapItem) error {
	heap._data = append(heap._data, item)
	heap.siftUp()
	return nil
}

func (heap *Heap) siftUp() {

	for index := heap.Len() - 1; index > 0; index = heap.getParentIndex(index) {

		parentIndex := heap.getParentIndex(index)

		if heap._data[parentIndex].priority > heap._data[index].priority {
			var parentCopy HeapItem = HeapItem{
				priority: heap._data[parentIndex].priority,
				value:    heap._data[parentIndex].value,
			}
			var lowerCopy HeapItem = HeapItem{
				priority: heap._data[index].priority,
				value:    heap._data[index].value,
			}

			heap._data[parentIndex] = lowerCopy
			heap._data[index] = parentCopy
		}
	}
}
func (heap *Heap) siftDown(index int) error {
	if len(heap._data) <= 1 {
		return nil
	}

	var item HeapItem = heap._data[index]
	var itemCopy HeapItem = HeapItem{
		priority: item.priority,
		value:    item.value,
	}

	var substituteByIndex int = -1
	leftChild, leftChildIndex, _ := heap.getLeftChild(index)
	rightChild, rightChildIndex, _ := heap.getRightChild(index)

	if leftChild != nil {
		if leftChild.priority < itemCopy.priority {
			if rightChild == nil || (rightChild.priority > leftChild.priority) {
				substituteByIndex = leftChildIndex
			}
		}
	}
	if rightChild != nil {
		if rightChild.priority < itemCopy.priority {
			if leftChild == nil || (leftChild.priority > rightChild.priority) {
				substituteByIndex = rightChildIndex
			}
		}
	}

	if substituteByIndex != -1 {
		var substitute HeapItem = HeapItem{
			priority: heap._data[substituteByIndex].priority,
			value:    heap._data[substituteByIndex].value,
		}
		heap._data[substituteByIndex] = itemCopy
		heap._data[index] = substitute
		return heap.siftDown(substituteByIndex)
	}

	return nil
}

func (heap *Heap) PopRoot() error {
	heap._data[0] = HeapItem{
		priority: heap._data[len(heap._data)-1].priority,
		value:    heap._data[len(heap._data)-1].value,
	}
	heap._data = heap._data[:len(heap._data)-1]

	if len(heap._data) > 0 {
		err := heap.siftDown(0)
		return err
	}
	return nil
}

func (heap *Heap) getParentIndex(index int) int {
	var parentIndex float64 = (float64(index) - 1.0) / 2.0
	parentIndex = math.Floor(parentIndex)

	return int(parentIndex)
}

func (heap *Heap) getParent(index int) (*HeapItem, error) {
	var parentIndex int = heap.getParentIndex(index)

	if parentIndex < 0 {
		return nil, fmt.Errorf("Parent not found")
	}

	return &heap._data[parentIndex], nil
}

func (heap *Heap) getLeftChild(index int) (*HeapItem, int, error) {
	var childId int = index*2 + 1

	if childId > len(heap._data)-1 {
		return nil, -1, fmt.Errorf("Item with id %v not found", childId)
	}
	return &heap._data[childId], childId, nil
}

func (heap *Heap) getRightChild(index int) (*HeapItem, int, error) {
	var childId int = index*2 + 2
	if childId > len(heap._data)-1 {
		return nil, -1, fmt.Errorf("Item with id %v not found", childId)
	}
	return &heap._data[childId], childId, nil
}

func (heap *Heap) getByIndex(index int) *HeapItem {
	return &heap._data[index]
}
