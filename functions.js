document.addEventListener("DOMContentLoaded", function() {
let canv = document.getElementById("canvas");
let ctx = canv.getContext("2d");

let currentDirection = "none";
let isLost = false;
let newRects = [];

let rectX = 400;
let rectY = 200;
let startTime;
let survivalTime = 0;

let playerHasStartedMoving = false;

let audio = document.getElementById("gameAudio");

const colors = ["red", "blue", "green", "orange", "purple", "cyan", "pink"];
let currentIndex = 0;

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioSource;

function changeBackgroundColor() {
  document.body.style.backgroundColor = colors[currentIndex];
  currentIndex = (currentIndex + 1) % colors.length;
}

changeBackgroundColor();
setInterval(changeBackgroundColor, 500);

fetch('audio/songaudio.mp3')
  .then(response => response.arrayBuffer())
  .then(buffer => {
    audioContext.decodeAudioData(buffer, (decodedData) => {
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = decodedData;
      audioSource.connect(audioContext.destination);
    });
  });

function playAudio() {
  if (audioSource) {
    audioSource.start();
  }
}

function generateRandomNumberUpTo400() {
  const min = 0;
  const max = 600;
  const step = 40;
  return Math.floor(Math.random() * ((max - min) / step + 1)) * step;
}

function generateRandomNumberUpTo800() {
  const min = 0;
  const max = 1200;
  const step = 40;
  return Math.floor(Math.random() * ((max - min) / step + 1)) * step;
}

function getRandomColor() {
  const colors = ["red", "blue", "green", "orange", "purple", "cyan", "pink"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomDirection() {
  return Math.floor(Math.random() * 4);
}

function drawRect(x, y, color) {
  ctx.beginPath();
  ctx.rect(x, y, 20, 20);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color === "blue" ? "darkblue" : "black";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
}


function drawRects() {
  ctx.clearRect(0, 0, canv.width, canv.height);
  drawRect(rectX, rectY, "black");
  for (const newRect of newRects) {
    drawRect(newRect.x, newRect.y, newRect.color);
  }
}

// Movement logic for main rectangle

function movement(event) {
  const key = event.key.toLowerCase();

  if (isLost) {
    return;
  }

  if (!startTime) {
    startTime = Date.now();
  }

  if (key === "a" && currentDirection !== "right") {
    currentDirection = "left";
  } else if (key === "d" && currentDirection !== "left") {
    currentDirection = "right";
  } else if (key === "s" && currentDirection !== "up") {
    currentDirection = "down";
  } else if (key === "w" && currentDirection !== "down") {
    currentDirection = "up";
  }

  if (!playerHasStartedMoving) {
    playerHasStartedMoving = true;
  }
}

// Movement for main rectangle

function moveRect() {
  if (isLost) {
    return;
  }

  if (playerHasStartedMoving) {
    if (currentDirection === "left") {
      rectX -= 20;
    } else if (currentDirection === "right") {
      rectX += 20;
    } else if (currentDirection === "down") {
      rectY += 20;
    } else if (currentDirection === "up") {
      rectY -= 20;
    }

    if (rectX < 0 || rectX + 20 > canv.width || rectY < 0 || rectY + 20 > canv.height) {
      isLost = true;
      const endTime = Date.now();
      survivalTime = Math.floor((endTime - startTime) / 1000);
      alert(`You lost the game! You survived for ${survivalTime} seconds.`);
    }

    for (let i = newRects.length - 1; i >= 0; i--) {
      const newRect = newRects[i];
      if (
        rectX < newRect.x + 20 &&
        rectX + 20 > newRect.x &&
        rectY < newRect.y + 20 &&
        rectY + 20 > newRect.y
      ) {
        isLost = true;
        const endTime = Date.now();
        survivalTime = Math.floor((endTime - startTime) / 1000);
        alert(`You lost the game! You survived for ${survivalTime} seconds.`);
        return;
      }
    }

    drawRects();
  }
}

// Movement for randomly spawned rectangles(move in any direction)

function moveNewRects() {
  if (isLost) {
    return;
  }

  for (let i = newRects.length - 1; i >= 0; i--) {
    const newRect = newRects[i];
    if (newRect.direction === 0) {
      newRect.y -= newRect.speed;
    } else if (newRect.direction === 1) {
      newRect.y += newRect.speed;
    } else if (newRect.direction === 2) {
      newRect.x -= newRect.speed;
    } else if (newRect.direction === 3) {
      newRect.x += newRect.speed;
    }

    if (newRect.x < 0) {
      newRect.x = canv.width - 20;
    } else if (newRect.x + 20 > canv.width) {
      newRect.x = 0;
    }

    if (newRect.y < 0) {
      newRect.y = canv.height - 20;
    } else if (newRect.y + 20 > canv.height) {
      newRect.y = 0;
    }

     // Color changer for rectangles
    if (newRect.colorChangeTime === undefined) {
      newRect.colorChangeTime = Date.now();
    }
    const currentTime = Date.now();
    if (currentTime - newRect.colorChangeTime > 10) {
      newRect.color = getRandomColor();
      newRect.colorChangeTime = currentTime;
    }
  }

  drawRects();
}

// Random speed for spawned rectangles

function getRandomSpeed() {
  const minSpeed = 20;
  const maxSpeed = 80;
  const step = 20;
  const randomSpeed = Math.floor(Math.random() * ((maxSpeed - minSpeed) / step + 1)) * step + minSpeed;
  return randomSpeed;
}

 // Random spawnpoint for rectangles 
function spawnRandomRect() {
  if (isLost || !playerHasStartedMoving) {
    return;
  }

  newRects.push({
    x: generateRandomNumberUpTo800(),
    y: generateRandomNumberUpTo400(),
    color: getRandomColor(),
    direction: getRandomDirection(),
    speed: getRandomSpeed()
  });
}
// update canvas
function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  playAudio();
  setTimeout(updateCanvas, 500);
}

// Function to start the timer
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

// Function to update and display the timer
function updateTimer() {
  const currentTime = Date.now();
  survivalTime = Math.floor((currentTime - startTime) / 1000);
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Function to draw the survival time on the canvas
function drawSurvivalTime() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Survival Time: ${survivalTime} seconds`, 10, 30);
}

// Reset the timer when the game starts
function resetGame() {
  currentDirection = "none";
  isLost = false;
  newRects = [];
  rectX = 400;
  rectY = 200;
  startTime = undefined;
  survivalTime = 0;
  playerHasStartedMoving = false;
  stopTimer(); 
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
}

// Handle game reset
function handleReset() {
  resetGame();
  playAudio();
}
requestAnimationFrame(updateCanvas);

setInterval(moveRect, 20);
setInterval(spawnRandomRect, 1000);
setInterval(moveNewRects, 200);

document.addEventListener("keydown", movement);

// reset button event click
document.getElementById("resetButton").addEventListener("click", handleReset);
});