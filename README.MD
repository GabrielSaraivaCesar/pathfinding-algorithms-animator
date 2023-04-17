# Pathfinding Algorithms Animator
This project aims to create an animator that shows the behaviour of many pathfinding algorithms.

The project is written with HTML, CSS, JavaScript and Golang.
<div float="left">
    <img src="readme_files/html.svg" width=40>&nbsp;&nbsp;&nbsp;&nbsp;
    <img src="readme_files/css.svg" width=50>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <img src="readme_files/javascript.svg" width=50>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <img src="readme_files/go.svg" width=100>
</div>
<br>
Golang is being used to execute the algorithms in the server side, so javascript will not be responsible for the expensive work. This is important because, not only golang performance is several times better than javascript, but also it's not good to rely on client's machine to execute algorithms


## The Grid
The grid you see in the software is a visual representation of a graph, where every square is a vertex. The vertices are connected with their adjacent vertices, including the diagonals if "Diagonals" switch is on.

The edge weight is, by default, set to 1, but diagonals will get the euclidian distance as the weight, therefore:
$ w=\sqrt{1^2+1^2}=\sqrt{2}\approx1.41 $

### Grid colors
<img src="readme_files/green.png" width=10> Green: Start point<br>
<img src="readme_files/red.png" width=10> Red: Finish point<br>
<img src="readme_files/black.png" width=10> Black: Obstacle<br>

<img src="readme_files/gridcolors.png" width=200>

<img src="readme_files/purple.png" width=10> Purple: Current vertex being visited<br>
<img src="readme_files/light-purple.png" width=10> Light Purple: Already visited vertices<br>
<img src="readme_files/orange.png" width=10> Orange: The path<br>

<img src="readme_files/pathfinding-demo.gif" width=200>
<br>Dijkstra pathfinding algorithm demo

