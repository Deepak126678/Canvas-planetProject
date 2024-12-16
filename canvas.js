const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("createCircle");
const fileInput = document.getElementById("fileInput");
/**
 * @cursorX Defining a initial position of cursor in x axix
 * @cursorY Defining a initial position  of cursor in Y axix
 */
let cursorX = 0, cursorY = 0; // Cursor position
let backgroundImage = null; // To store the uploaded image

/**
 * @param change When their is change in Inputfile
 * detected eventlistner callback and loads the image in the canvas
 */
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    backgroundImage = img; // Save the loaded image to redraw in the animation loop
  };
});

/**
 * @Circle Circle class with all properties and method of circle object
 */
class Circle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.isSelected = false;

    /**
     * @moonRadius Defines the moon size
     * @orbitRadius Defines the orbital size in which moon will revolve
     */
    this.moonRadius = 5;
    this.orbitRadius = this.radius + 10;
    this.angle = Math.random() * Math.PI * 2;
    this.orbitSpeed = 0.02;
  }
  /**
   * @draw Function for creating Circle  with color Gradient 
   */
  draw() {
    const gradient = ctx.createRadialGradient(
      this.x - this.radius / 3, this.y - this.radius / 3, 0,
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, "black");

    // Draw the circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    // Draw the moon
    this.updateMoonPosition();
  }

  updateMoonPosition() {
    this.angle += this.orbitSpeed;
    const moonX = this.x + Math.cos(this.angle) * this.orbitRadius;
    const moonY = this.y + Math.sin(this.angle) * this.orbitRadius;

    ctx.beginPath();
    ctx.arc(moonX, moonY, this.moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }
  /**
   * 
   * @param {*} targetX The position of curser in x axix
   * @param {*} targetY The position of cursor in y axis
   * @param {*} speed   The speed by which object is following cursor
   */
  moveTowards(targetX, targetY, speed = 2) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance > 1) {
      this.x += (dx / distance) * speed;
      this.y += (dy / distance) * speed;
    }
  }
  /**
   * 
   * @param {*} x The target(Cursor) position in x direction
   * @param {*} y The target(Cursor) position in y direction
   * @returns  Return the Distence between the cursor and the circleobject
   */
  distanceTo(x, y) {
    return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
  }
}

/**
 * @circleFunction To manage circle  Diffrent fun
 */
class CircleFunction {
  constructor() {
    this.circle_set = new Set();
    this.selectedCircle = null;
  }
  /**
   * 
   * @param {*} circle  pushiing the circle object in the circle_set
   */
  addCircle(circle) {
    this.circle_set.add(circle);
  }
  /**
   * 
   * @param {*} cursorX Position of cursor in X direction
   * @param {*} cursorY Position of cursor in Y direction
   * @isClosest Cheaking which circle_set object is closed to the cursor
   */
  isClosest(cursorX, cursorY) {
    let closestCircle = null;
    let minDistance = Infinity;

    this.circle_set.forEach(circle => {
      const distance = circle.distanceTo(cursorX, cursorY);
      if (distance < minDistance) {
        minDistance = distance;
        closestCircle = circle;
      }
    });

    this.circle_set.forEach(circle => circle.isSelected = false);

    if (closestCircle) {
      closestCircle.isSelected = true;
      this.selectedCircle = closestCircle;
    }
  }

  updateSelectedCircle(targetX, targetY) {
    if (this.selectedCircle) {
      this.selectedCircle.moveTowards(targetX, targetY);
    }
  }
  /**
   * @drawCircles Draw each circle stored in the circle_set
   */
  drawCircles() {
    this.circle_set.forEach(circle => circle.draw());
  }
}

/**
 * @circleFunObj Initializing the class
 */
const circleFunObj = new CircleFunction ();

// Event Listener: Mouse Move
canvas.addEventListener("mousemove", (e) => {
  cursorX = e.offsetX;
  cursorY = e.offsetY;

  circleFunObj.isClosest(cursorX, cursorY);
});

// Event Listener: Button Click - Create Random Circle
button.addEventListener("click", () => {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const radius = Math.random() * 20 + 10;
  const color = `hsl(${Math.random() * 360}, 70%, 50%)`;

  const newCircle = new Circle(x, y, radius, color);
  circleFunObj.addCircle(newCircle);
});

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background image if loaded
  if (backgroundImage) {
    const aspectRatio = backgroundImage.width / backgroundImage.height;
    let newWidth = canvas.width;
    let newHeight = canvas.width / aspectRatio;

    if (newHeight > canvas.height) {
      newHeight = canvas.height;
      newWidth = canvas.height * aspectRatio;
    }

    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    ctx.drawImage(backgroundImage, offsetX, offsetY, newWidth, newHeight);
  }

  /**
   * Creating all the circles of the set after updation
   */
  circleFunObj.updateSelectedCircle(cursorX, cursorY);
  circleFunObj.drawCircles();

  requestAnimationFrame(animate);
}

// Start the animation
animate();

