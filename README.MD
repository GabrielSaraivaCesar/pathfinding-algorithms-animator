# Pathfinding Algorithms Animator
The aim of this project is to create an animator that demonstrates the behavior of various pathfinding algorithms.

The project is developed using HTML, CSS, JavaScript, and Golang.
<div float="left">
    <img src="readme_files/html.svg" width=40>&nbsp;&nbsp;&nbsp;&nbsp;
    <img src="readme_files/css.svg" width=50>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <img src="readme_files/javascript.svg" width=50>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <img src="readme_files/go.svg" width=100>
</div>
<br>
Golang is used to execute the algorithms on the server side, so JavaScript is not responsible for the expensive work. This is crucial because Golang's performance is several times better than JavaScript, and relying on the client's machine to execute algorithms can lead to severe performance issues.


## The Grid
The grid shown in the software is a visual representation of a graph, where each square is a vertex. The vertices are connected with their adjacent vertices, including the diagonals if the "Diagonals" switch is on.

By default, the edge weight is set to 1, but diagonals will get the Euclidean distance as their weight, which is approximately 1.41

$w=\sqrt{{1^2}+{1^2}}=\sqrt{2}\approx1.41$

Note: Obstacles do not create any edges to other vertices.

### Grid colors
<img src="readme_files/green.png" width=10> Green: Start point<br>
<img src="readme_files/red.png" width=10> Red: Finish point<br>
<img src="readme_files/black.png" width=10> Black: Obstacle<br>

<img src="readme_files/gridcolors.png" width=200>

<img src="readme_files/purple.png" width=10> Purple: Current vertex being visited<br>
<img src="readme_files/light-purple.png" width=10> Light Purple: Already visited vertices<br>
<img src="readme_files/orange.png" width=10> Orange: The path<br>

<img src="readme_files/pathfinding-demo.gif" width=200>

## Demos
Dijkstra:

<img src="readme_files/pathfinding-demo-dijkstra.gif">
<br>
<br>
A*:

<img src="readme_files/pathfinding-demo-a-star.gif">

