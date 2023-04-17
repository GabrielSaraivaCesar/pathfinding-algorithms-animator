

class InteractiveCanvas {

    /** @type {HTMLCanvasElement} */
    canvas = null;
    /** @type {CanvasRenderingContext2D} */
    context = null;
    /** @type {Number} */
    offsetX = 0;
    /** @type {Number} */
    offsetY = 0;
    /** @type {Function[]} */
    drawInstructions = [];

    // Dragging
    /** @type {Boolean} */
    enableDragging = true;
    /** @type {Boolean} */
    isMouseDown = false;

    /** @type {Number} */
    fps = 60;

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Boolean} enableDragging
     */
    constructor(canvasElement, fps=60, enableDragging=true) {
        this.enableDragging = true;
        this.canvas = canvasElement;
        this.fps=fps;
        this.context = this.canvas.getContext('2d');
        this.calculateCanvasSize();
        this.setUpListeners();
    }

    setUpListeners() {
        window.addEventListener("resize", () => this.calculateCanvasSize());
        if (this.enableDragging) {
            this.canvas.style.cursor = "grab";
            window.addEventListener("mousedown", () => {this.setIsMouseDown(true)});
            window.addEventListener("mouseup", () => {this.setIsMouseDown(false)});
            window.addEventListener("mouseleave", () => {this.setIsMouseDown(false)});
            window.addEventListener("mouseout", () => {this.setIsMouseDown(false)});
            window.addEventListener("mousemove", (event) => {
                if (this.isMouseDown) {
                    this.onDrag(event);
                }
            });
        }
        setInterval(() => {
            this.draw();
        }, 1000/this.fps)
    }

    calculateCanvasSize() {
        let winX = window.innerWidth;
        let winY = window.innerHeight;
        this.canvas.width = winX;
        this.canvas.height = winY;
        this.draw();
    }
    clear() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    draw() {
        this.clear();
        this.drawInstructions.forEach(cb => cb(this));
    }

    /** 
     * @param {Boolean} state
     */
    setIsMouseDown(state) {
        if (state !== this.isMouseDown) { // Detect change
            if (state === true) {
                this.canvas.style.cursor = "grabbing";
            } else {
                this.canvas.style.cursor = "grab";
            }
        }
        this.isMouseDown = state;
    }
    /**
     * @param {MouseEvent} event 
     */
    onDrag(event) {
        this.offsetX += event.movementX;
        this.offsetY += event.movementY;
        this.draw();
    }

    getAbsX(x) {
        let centerOffset = this.canvas.width / 2;
        return x + this.offsetX + centerOffset;
    }
    getAbsY(y) {
        let centerOffset = this.canvas.height / 2;
        return y + this.offsetY + centerOffset;
    }

    getRelX(x) {
        let centerOffset = this.canvas.width / 2;
        return x - this.offsetX - centerOffset;
    }
    getRelY(y) {
        let centerOffset = this.canvas.height / 2;
        return y - this.offsetY - centerOffset;
    }

}

export default InteractiveCanvas;