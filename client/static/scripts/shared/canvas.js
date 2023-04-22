

class InteractiveCanvas {

    /** @type {HTMLCanvasElement} */
    canvas = null;
    /** @type {CanvasRenderingContext2D} */
    context = null;
    /** @type {Number} */
    offsetX = 0;
    /** @type {Number} */
    offsetY = 0;
    /** @type {{callback:Function, tag:string}[]} */
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
        this.enableDragging = enableDragging;
        this.canvas = canvasElement;
        this.fps=fps;
        this.context = this.canvas.getContext('2d');
        this.calculateCanvasSize();
        this.setUpListeners();
    }

    setUpListeners() {
        window.addEventListener("resize", () => this.calculateCanvasSize());
        if (this.enableDragging) {
            this.canvas.addEventListener("mousedown", (e) => {this.setIsMouseDown(true, e)});
            this.canvas.addEventListener("mouseup", (e) => {this.setIsMouseDown(false, e)});
            this.canvas.addEventListener("mouseleave", (e) => {this.setIsMouseDown(false, e)});
            this.canvas.addEventListener("mouseout", (e) => {this.setIsMouseDown(false, e)});
            this.canvas.addEventListener("mousemove", (event) => {
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
        let rect = this.canvas.getBoundingClientRect();
        let winX = rect.width;
        let winY = rect.height;
        this.canvas.width = winX;
        this.canvas.height = winY;
        this.draw();
    }
    clear() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    draw() {
        this.clear();
        this.drawInstructions.forEach(instruction => {
            instruction.callback();
        });
    }

    /** 
     * @param {Boolean} state
     * @param {MouseEvent} event
     */
    setIsMouseDown(state, event) {
        if (event.button !== 1 && event.button !== 2){
            return
        }
        if (state !== this.isMouseDown) { // Detect change
            if (state === true) {
                this.canvas.style.cursor = "grabbing";
            } else {
                this.canvas.style.cursor = "";
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

    addDrawInstruction(cb, tag) {
        this.drawInstructions.push({
            callback: cb,
            tag: tag
        })
    }

    clearDrawInstructions(tagFilter) {
        if (!tagFilter) {
            this.drawInstructions = [];
        } else {
            this.drawInstructions = this.drawInstructions.filter(instruction => {
                return instruction.tag !== tagFilter;
            })
        }
    }

    reorderInstructions(tagOrder) {
        this.drawInstructions.sort((a, b) => {
            let aIndex = tagOrder.findIndex((tag) => {
                return tag === a.tag;
            });
            let bIndex = tagOrder.findIndex((tag) => {
                return tag === b.tag;
            })
            if (aIndex < bIndex) {
                return -1;
            } else if (aIndex > bIndex) {
                return 1;
            } else {
                return 0;
            }
        })
    }


}

export default InteractiveCanvas;