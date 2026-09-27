const grid = document.getElementById("grid");

for (let r = 0; r < 6; r++) {
  let row = document.createElement("tr");

  let label = document.createElement("td");
  label.textContent = rows[r];
  row.appendChild(label);

  // CHANGED: Changed c < 5 to c < 6 to generate the 6th column input box
  for (let c = 0; c < 6; c++) {
    let cell = document.createElement("td");

    let input = document.createElement("input");
    input.dataset.row = r;
    input.dataset.col = c;

    input.addEventListener("keydown", handleNavigation);

    let feedback = document.createElement("div");
    feedback.className = "feedback";

    cell.appendChild(input);
    cell.appendChild(feedback);

    row.appendChild(cell);
  }

  grid.appendChild(row);
}

function handleNavigation(e) {
  let r = parseInt(this.dataset.row);
  let c = parseInt(this.dataset.col);

  if (e.key === "Tab") {
    e.preventDefault();
    moveTo(r, c + 1);
  }

  if (e.key === "Enter") {
    e.preventDefault();
    moveTo(r + 1, c);
  }
}

function moveTo(r, c) {
  // CHANGED: Changed c > 4 to c > 5 so Tab only wraps to the next line 
  // after passing the new 6th column (index 5).
  if (c > 5) { 
    c = 0; 
    r++; 
  }
  if (r > 5) return;

  let next = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
  if (next) next.focus();
}

function checkAnswers() {
  document.querySelectorAll("input").forEach(input => {
    let r = input.dataset.row;
    let c = input.dataset.col;

    let correct = answers[r][c];
    let val = input.value.trim().toLowerCase();

    let feedback = input.parentElement.querySelector(".feedback");

    if (val === correct) {
      feedback.textContent = "Correct";
      feedback.className = "feedback correct";
    } else {
      feedback.textContent = "Incorrect → " + correct;
      feedback.className = "feedback wrong";
    }
  });
}

function resetAll() {
  document.querySelectorAll("input").forEach(input => input.value = "");
  document.querySelectorAll(".feedback").forEach(f => f.textContent = "");
  document.querySelector("input").focus();
}