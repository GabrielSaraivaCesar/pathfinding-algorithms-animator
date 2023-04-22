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

func (heap *Heap) len() int {
	return len(heap._data)
}

func (heap *Heap) push(item HeapItem) error {
	heap._data = append(heap._data, item)
	heap.siftUp()
	// heap.hackSiftUp()
	return nil
}

func (heap *Heap) hackSiftUp() error {
	if heap.len() <= 1 {
		return nil
	}

	var rootCopy HeapItem = HeapItem{
		priority: heap._data[0].priority,
		value:    heap._data[0].value,
	}

	var lowerIndex int = 0

	for i := 1; i < heap.len(); i++ {
		if heap._data[i].priority < heap._data[lowerIndex].priority {
			lowerIndex = i
		}
	}

	var lowerCopy HeapItem = HeapItem{
		priority: heap._data[lowerIndex].priority,
		value:    heap._data[lowerIndex].value,
	}

	heap._data[0] = lowerCopy
	heap._data[lowerIndex] = rootCopy

	return nil
}

func (heap *Heap) siftUp() {

	for index := heap.len() - 1; index > 0; index = heap.getParentIndex(index) {

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
func (heap *Heap) siftDown(item *HeapItem) error {
	if len(heap._data) <= 1 {
		return nil
	}

	var itemCopy HeapItem = HeapItem{
		priority: item.priority,
		value:    item.value,
	}
	index, err := heap.findIndex(item)
	if err != nil {
		return err
	}

	var substituteByIndex int = -1
	leftChild, _ := heap.getLeftChild(index)
	rightChild, _ := heap.getRightChild(index)

	if leftChild != nil {
		if leftChild.priority < itemCopy.priority {
			if rightChild == nil || (rightChild.priority > leftChild.priority) {
				substituteByIndex, _ = heap.findIndex(leftChild)
			}
		}
	}
	if rightChild != nil {
		if rightChild.priority < itemCopy.priority {
			if leftChild == nil || (leftChild.priority > rightChild.priority) {
				substituteByIndex, _ = heap.findIndex(rightChild)
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
		return heap.siftDown(&heap._data[substituteByIndex])
	}

	return nil
}

func (heap *Heap) popRoot() error {
	heap._data[0] = HeapItem{
		priority: heap._data[len(heap._data)-1].priority,
		value:    heap._data[len(heap._data)-1].value,
	}
	heap._data = heap._data[:len(heap._data)-1]

	if len(heap._data) > 0 {
		err := heap.siftDown(&heap._data[0])
		// fmt.Println(heap)
		return err
	}
	return nil
}

func (heap *Heap) getByPriority(priority float64) (*HeapItem, error) {
	var item *HeapItem = nil

	for i := 0; i < len(heap._data); i++ {
		if heap._data[i].priority == priority {
			item = &heap._data[i]
			break
		}
	}
	if item == nil {
		return nil, fmt.Errorf("Item with id %v not found", priority)
	}

	return item, nil
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

func (heap *Heap) getLeftChild(index int) (*HeapItem, error) {
	var childId int = index*2 + 1

	if childId > len(heap._data)-1 {
		return nil, fmt.Errorf("Item with id %v not found", childId)
	}
	return &heap._data[childId], nil
}

func (heap *Heap) getRightChild(index int) (*HeapItem, error) {
	var childId int = index*2 + 2
	if childId > len(heap._data)-1 {
		return nil, fmt.Errorf("Item with id %v not found", childId)
	}
	return &heap._data[childId], nil
}

func (heap *Heap) findIndex(item *HeapItem) (int, error) {
	var index int = -1
	for i := 0; i < len(heap._data); i++ {
		if &heap._data[i] == item {
			index = i
			break
		}
	}
	if index == -1 {
		return index, fmt.Errorf("Item not found")
	}

	return index, nil
}

func (heap *Heap) getByIndex(index int) HeapItem {
	return heap._data[index]
}
