const canvas = document.getElementById("drawingCanvas");
const context = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");
const submitButton = document.getElementById("submitButton");
const resultDiv = document.getElementById("result");
const wordsListElement = document.getElementById("wordsList");

const offscreenCanvas = document.createElement("canvas");
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenContext = offscreenCanvas.getContext("2d");

let drawing = false;

// Set up canvas drawing functions
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchmove", draw);

function startDrawing(e) {
  console.log("start drawing");

  drawing = true;
  context.beginPath();
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);

  offscreenContext.beginPath();
  offscreenContext.moveTo(
    e.clientX - canvas.offsetLeft,
    e.clientY - canvas.offsetTop,
  );
}

function stopDrawing() {
  console.log("stop drawing");

  drawing = false;
  context.closePath();
  offscreenContext.closePath(); // Close the path in the offscreen canvas
}

function draw(e) {
  if (!drawing) return;
  // Draw on the visible canvas (this is just for user feedback)
  context.lineWidth = 5;
  context.lineCap = "round";
  context.strokeStyle = "black";
  context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  context.stroke();

  // Also draw on the offscreen canvas to keep track of user strokes
  offscreenContext.lineWidth = 5;
  offscreenContext.lineCap = "round";
  offscreenContext.strokeStyle = "black";
  offscreenContext.lineTo(
    e.clientX - canvas.offsetLeft,
    e.clientY - canvas.offsetTop,
  );
  offscreenContext.stroke();
}

// Clear the canvas
clearButton.addEventListener("click", clearCanvas);

submitButton.addEventListener("click", function () {
  // Clear the visible canvas (remove gray lines and word)
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw only the user drawing from the offscreen canvas
  context.drawImage(offscreenCanvas, 0, 0);

  // Convert the user drawing to an image (PNG format)
  const imageData = canvas.toDataURL("image/png");

  // Prepare form data
  const formData = new FormData();
  formData.append("image", dataURLtoBlob(imageData), "canvas_image.png");

  // Send the image data to the Flask server
  fetch("/process_canvas", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      const recognizedText = data.message.trim();
      if (recognizedText === selectedWord) {
        displayMessage("Success! You drew the word correctly!", "success");
      } else {
        displayMessage(
          "Try again! The drawing did not match the word.",
          "error",
        );
      }
      // Display the result
      resultDiv.innerHTML =
        `Server Response: ${data.message}, Saved as: ${data.filename}`;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

function displayMessage(message, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  if (type === "success") {
    messageDiv.style.color = "green";
  } else {
    messageDiv.style.color = "red";
  }
}

// Helper function to convert Data URL to Blob
function dataURLtoBlob(dataURL) {
  const binary = atob(dataURL.split(",")[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/png" });
}

// Fetch and display the words list from the server
fetch("/get_words")
  .then((response) => response.json())
  .then((words) => {
    words.forEach((word) => {
      const li = document.createElement("li");
      li.innerHTML =
        `<span class="farsi">${word.word}</span> (${word.transliteration} - ${word.translation})`;
      li.addEventListener("click", () => drawGuideWord(word.word));
      wordsListElement.appendChild(li);
    });
  });

let selectedWord = ""; // Store the clicked word

// Draw the clicked word in light gray on the canvas as a guide
function drawGuideWord(word) {
  selectedWord = word;
  // Clear the canvas before drawing the guide
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw guidelines before drawing the word
  drawGuidelines();

  // Set up font and styles for the word
  context.font = "100px Arial";
  context.fillStyle = "lightgray";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Draw the word on the second guideline (e.g., y = 200)
  const lineY = 200; // Adjust this value to place it on a different line if needed
  context.fillText(word, canvas.width / 2, lineY - 16);

  context.fillStyle = "black";
  context.font = "10px sans-serif";
}
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGuidelines(); // Redraw the guidelines if needed
}
function drawGuidelines() {
  drawGuideLine(100);
  drawGuideLine(200);
  drawGuideLine(300);
  drawGuideLine(400);
  drawGuideLine(500);
}
function drawGuideLine(y) {
  const canvasHeight = canvas.height;
  const middle = canvasHeight / 2;

  context.beginPath();
  context.moveTo(0, y);
  context.lineTo(canvas.width, y);
  context.strokeStyle = "#888";
  context.lineWidth = 1;
  context.stroke();
}
