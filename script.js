let selectedLetters = new Set();
let draggingLetters = new Set();
let isDragging = false;
let selectionBox = null;
let startX, startY;
let lastPosition = new Map();
let groupOffsets = new Map();

document.getElementById("applyBtn").addEventListener("click", function () {
  const input = document.getElementById("textInput").value;
  const output = document.getElementById("output");
  output.innerHTML = "";
  selectedLetters.clear();
  input.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("letter");
    span.addEventListener("click", selectLetter);
    span.addEventListener("mousedown", startDrag);
    output.appendChild(span);
    lastPosition.set(span, { left: span.offsetLeft, top: span.offsetTop });
  });
});

function selectLetter(event) {
  if (!event.ctrlKey) {
    selectedLetters.clear();
    document
      .querySelectorAll(".letter")
      .forEach((letter) => letter.classList.remove("selected"));
  }
  event.target.classList.toggle("selected");
  if (event.target.classList.contains("selected")) {
    selectedLetters.add(event.target);
  } else {
    selectedLetters.delete(event.target);
  }
}

function startDrag(event) {
  isDragging = true;
  if (selectedLetters.has(event.target)) {
    draggingLetters = new Set(selectedLetters);
  } else {
    draggingLetters.clear();
    draggingLetters.add(event.target);
  }

  let baseX = event.clientX;
  let baseY = event.clientY;

  groupOffsets.clear();
  draggingLetters.forEach((letter) => {
    groupOffsets.set(letter, {
      offsetX: letter.offsetLeft - baseX,
      offsetY: letter.offsetTop - baseY,
    });
  });

  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", stopDrag);
}

function moveDrag(event) {
  if (!isDragging) return;
  draggingLetters.forEach((letter) => {
    let offsets = groupOffsets.get(letter);
    letter.style.position = "absolute";
    letter.style.left = `${event.clientX + offsets.offsetX}px`;
    letter.style.top = `${event.clientY + offsets.offsetY}px`;
  });
}

function stopDrag(event) {
  isDragging = false;
  let swaps = new Map();

  draggingLetters.forEach((draggedLetter) => {
    let draggedRect = draggedLetter.getBoundingClientRect();
    let swapped = false;

    document.querySelectorAll(".letter").forEach((otherLetter) => {
      if (draggingLetters.has(otherLetter)) return;

      let otherRect = otherLetter.getBoundingClientRect();

      if (
        draggedRect.left < otherRect.right &&
        draggedRect.right > otherRect.left &&
        draggedRect.top < otherRect.bottom &&
        draggedRect.bottom > otherRect.top
      ) {
        let draggedStart = lastPosition.get(draggedLetter) || {
          left: draggedLetter.offsetLeft,
          top: draggedLetter.offsetTop,
        };

        let otherStart = lastPosition.get(otherLetter) || {
          left: otherLetter.offsetLeft,
          top: otherLetter.offsetTop,
        };

        swaps.set(draggedLetter, otherStart);
        swaps.set(otherLetter, draggedStart);
        swapped = true;
      }
    });

    if (!swapped) {
      lastPosition.set(draggedLetter, {
        left: draggedLetter.offsetLeft,
        top: draggedLetter.offsetTop,
      });
    }
  });

  swaps.forEach((newPos, letter) => {
    letter.style.position = "absolute";
    letter.style.left = `${newPos.left}px`;
    letter.style.top = `${newPos.top}px`;
    lastPosition.set(letter, newPos);
  });

  document.removeEventListener("mousemove", moveDrag);
  document.removeEventListener("mouseup", stopDrag);
}

document.addEventListener("mousedown", function (event) {
  if (event.target.id === "applyBtn") return;
  if (isDragging) return;
  if (!event.ctrlKey) {
    selectedLetters.clear();
    document
      .querySelectorAll(".letter")
      .forEach((letter) => letter.classList.remove("selected"));
  }

  startX = event.clientX;
  startY = event.clientY;
  selectionBox = document.createElement("div");
  selectionBox.classList.add("selection-box");
  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  document.body.appendChild(selectionBox);
  document.addEventListener("mousemove", drawSelectionBox);
  document.addEventListener("mouseup", endSelectionBox);
});

function drawSelectionBox(event) {
  const width = event.clientX - startX;
  const height = event.clientY - startY;
  selectionBox.style.width = `${Math.abs(width)}px`;
  selectionBox.style.height = `${Math.abs(height)}px`;
  selectionBox.style.left = `${Math.min(event.clientX, startX)}px`;
  selectionBox.style.top = `${Math.min(event.clientY, startY)}px`;
}

function endSelectionBox() {
  document.removeEventListener("mousemove", drawSelectionBox);
  document.removeEventListener("mouseup", endSelectionBox);

  document.querySelectorAll(".letter").forEach((letter) => {
    const rect = letter.getBoundingClientRect();
    const boxRect = selectionBox.getBoundingClientRect();
    if (
      rect.left < boxRect.right &&
      rect.right > boxRect.left &&
      rect.top < boxRect.bottom &&
      rect.bottom > boxRect.top
    ) {
      letter.classList.add("selected");
      selectedLetters.add(letter);
    }
  });

  document.body.removeChild(selectionBox);
}
