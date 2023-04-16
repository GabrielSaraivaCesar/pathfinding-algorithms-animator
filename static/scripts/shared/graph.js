
class GraphVertex {
    /** @type {GraphEdge[]} */
    edges = []

    getNeighbours() {
        return this.edges.map(neighbourEdge => {
            return neighbourEdge.v1 == this ? neighbourEdge.v2 : neighbourEdge.v1;
        });
    }
}

class GraphEdge {
    /** @type {GraphVertex} */
    v1 = null;
    /** @type {GraphVertex} */
    v2 = null;
    /** @type {Number} */
    weight=1;

    /**
     * @param {GraphVertex} v1
     * @param {GraphVertex} v2
     * @param {Number} weight
     */
    constructor(v1, v2, weight=1) {
        this.v1 = v1;
        this.v2 = v2;
        this.weight = weight;
    }

    /** 
     * @param {GraphVertex} vertex
     * */
    has(vertex) {
        return this.v1 == vertex || this.v2 == vertex;
    }
}

class Graph {
    /** @type {GraphVertex[]} */
    vertices = [];
    /** @type {GraphEdge[]} */
    edges = [];

    /**
     * @param {GraphVertex} v1
     * @param {GraphVertex} v2
     */
    addEdge(v1, v2, weight) {
        let edge = new GraphEdge(v1, v2, weight);
        this.edges.push(edge);
        v1.edges.push(edge);
        v2.edges.push(edge);
    }

    /**
     * @param {GraphEdge} edge
     */
    removeEdge(edge) {
        edge.v1.edges = edge.v1.edges.filter(e => e != edge);
        edge.v2.edges = edge.v2.edges.filter(e => e != edge);
        this.edges = this.edges.filter(e => e != edge);
    }

    /**
     * @param {GraphVertex} v1
     * @param {GraphVertex} v2
     */
    getEdgeByVertices(v1, v2) {
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i].has(v1) && this.edges[i].has(v2)) {
                return this.edges[i];
            }
        }
        return null;
    }
}

export {Graph, GraphEdge, GraphVertex}