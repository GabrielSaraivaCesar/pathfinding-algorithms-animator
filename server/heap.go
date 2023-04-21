package server

import (
	"fmt"
	"math"
)

type HeapItem struct {
	priority int
	value    any
}
type Heap struct {
	_data []HeapItem
}

func (heap *Heap) push(item HeapItem) error {
	heap._data = append(heap._data, item)
	heap.siftUp(&heap._data[len(heap._data)-1])
	return nil
}

func (heap *Heap) siftUp(item *HeapItem) error {
	var itemCopy HeapItem = *item
	index, err := heap.findIndex(item)
	if err != nil {
		return err
	}

	for i := index; i > 0; i-- {
		parent, err := heap.getParent(i)
		if err != nil {
			return err
		}
		parentIndex, err := heap.findIndex(parent)
		if err != nil {
			return err
		}

		if parent.priority > itemCopy.priority {
			heap._data[i] = *parent
			heap._data[parentIndex] = itemCopy
		} else {
			break
		}
	}

	return nil
}
func (heap *Heap) siftDown(item *HeapItem) error {
	var itemCopy HeapItem = *item
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
		var substitute HeapItem = heap._data[substituteByIndex]
		heap._data[substituteByIndex] = itemCopy
		heap._data[index] = substitute
		return heap.siftDown(&heap._data[substituteByIndex])
	}

	return nil
}

func (heap *Heap) popRoot() error {
	heap._data[0] = heap._data[len(heap._data)-1]
	heap._data = heap._data[:len(heap._data)-1]
	return heap.siftDown(&heap._data[0])
}

func (heap *Heap) getByPriority(priority int) (*HeapItem, error) {
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

func (heap *Heap) getParent(index int) (*HeapItem, error) {
	var parentId float64 = (float64(index) - 1.0) / 2.0
	parentId = math.Floor(parentId)

	if parentId < 0 {
		return nil, fmt.Errorf("Parent not found")
	}

	return &heap._data[int(parentId)], nil
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
