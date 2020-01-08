const INFINITY_STRING = "To infinity, and beyond!";
const buttons = Array.from(document.querySelectorAll("button"));
const display = document.querySelector("#display");

let currentOperandDigits = [];
let operatorQueue = [];
let operandsQueue = [];

function setDisplay(str) {
  display.textContent = str;
}

function appendToDisplay(str) {
  setDisplay(`${display.textContent}${str}`.replace(INFINITY_STRING, 0));
}

function formatDecimal(num) {
  let [whole, frac] = num.toString().split(".");
  let fracArr = frac.split("");
  frac = "";
  for (let i = 0; i < fracArr.length; i++) {
    if (fracArr[i] === "0") {
      break;
    }
    frac += fracArr;
  }
  return `${whole}.${frac}`;
}

function add(x, y) {
  return x + y;
}

function subtract(x, y) {
  return x - y;
}

function multiply(x, y) {
  return x * y;
}

function divide(x, y) {
  return x / y;
}

function operate(op, x, y) {
  const opMap = {
    "+": add,
    "-": subtract,
    "*": multiply,
    "/": divide
  };
  return opMap[op](x, y);
}

function nextOperatorHasHigherPriority(currentOp, nextOp) {
  return ["*", "/"].includes(nextOp) && ["+", "-"].includes(currentOp);
}

function performCalculation() {
  if (currentOperandDigits.length === 0) {
    return;
  }

  addOperandToQueue();

  let x = operandsQueue.shift();
  while (operatorQueue.length > 0) {
    let op = operatorQueue.shift();

    if (
      operandsQueue.length === 0 ||
      !nextOperatorHasHigherPriority(op, operatorQueue[0])
    ) {
      y = operandsQueue.shift();
    } else {
      y = operate(
        operatorQueue.shift(),
        operandsQueue.shift(),
        operandsQueue.shift()
      );
    }
    x = operate(op, x, y);
  }

  // User tried to divide by zero at some point.
  if (x === Infinity) {
    currentOperandDigits = ["0"];
    setDisplay(INFINITY_STRING);
    return;
  }

  let displayStr = Number.isInteger(x) ? `${x}` : `${formatDecimal(x)}`;
  setDisplay(displayStr);

  // Reset digits so the answer can be used in followup calculations.
  currentOperandDigits = x.toString().split("");
}

function addOperandToQueue() {
  // Add a trailing zero if the user forgot one.
  if (currentOperandDigits[currentOperandDigits.length - 1] === ".") {
    appendToDisplay("0");
  }
  operandsQueue.push(Number(currentOperandDigits.join("")));
  currentOperandDigits = [];
}

function prepareOperation(operator) {
  // We're missing a required operand, do nothing.
  if (currentOperandDigits.length === 0) {
    return;
  }
  addOperandToQueue();
  appendToDisplay(` ${operator} `);
  operatorQueue.push(operator);
}

function buildCurrentOperand(digit) {
  // Any given number can only contain one decimal point.
  if (digit === "." && currentOperandDigits.includes(".")) {
    return;
  }
  appendToDisplay(`${digit}`);
  currentOperandDigits.push(digit);
}

function undoLastInput() {
  if (currentOperandDigits.length > 0) {
    currentOperandDigits.pop();
    setDisplay(
      display.textContent.substring(0, display.textContent.length - 1)
    );
    return;
  }

  if (operatorQueue.length > 0) {
    operatorQueue.pop();
    setDisplay(
      display.textContent.substring(0, display.textContent.length - 3)
    );
    digits = operandsQueue
      .pop()
      .toString()
      .split("");
    return;
  }
}

buttons.forEach(button => {
  if (button.value === "=") {
    button.addEventListener("click", performCalculation);
    return;
  }

  if (button.value === "back") {
    button.addEventListener("click", undoLastInput);
  }

  if (button.classList.contains("op")) {
    button.addEventListener("click", e => prepareOperation(e.target.value));
    return;
  }

  if (button.classList.contains("digit")) {
    button.addEventListener("click", e => buildCurrentOperand(e.target.value));
  }

  if (button.value === "clear") {
    button.addEventListener("click", e => {
      currentOperandDigits = [];
      operatorQueue = [];
      operandsQueue = [];
      setDisplay("");
    });
  }
});

document.querySelector("body").addEventListener("keydown", e => {
  switch (e.key) {
    case "=":
      performCalculation();
      break;
    case "Backspace":
      undoLastInput();
      break;
    case "+":
    case "-":
    case "/":
    case "*":
      prepareOperation(e.key);
      break;
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "0":
    case ".":
      buildCurrentOperand(e.key);
      break;
  }
});