document.addEventListener("DOMContentLoaded", function () {
  // Calculator state
  const state = {
    currentValue: "0",
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    memory: 0,
    history: [],
    currentMode: "basic",
    angleMode: "DEG", // DEG or RAD
    numberBase: "DEC", // HEX, DEC, OCT, BIN
    isGraphPlotted: false,
    graph: null,
  };

  // DOM Elements
  const mainDisplay = document.getElementById("mainDisplay");
  const historyDisplay = document.getElementById("historyDisplay");
  const historyPanel = document.getElementById("historyPanel");
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistory");
  const themeToggle = document.getElementById("themeToggle");
  const helpBtn = document.getElementById("helpBtn");
  const helpModal = document.getElementById("helpModal");
  const closeHelpModal = document.getElementById("closeHelpModal");

  // Calculator mode elements
  const modeButtons = document.querySelectorAll(".mode-btn");
  const modeControls = document.getElementById("modeControls");
  const basicKeypad = document.getElementById("basicKeypad");
  const scientificKeypad = document.getElementById("scientificKeypad");
  const programmerKeypad = document.getElementById("programmerKeypad");
  const financialCalculator = document.getElementById("financialCalculator");
  const unitConverter = document.getElementById("unitConverter");
  const dateCalculator = document.getElementById("dateCalculator");
  const graphingCalculator = document.getElementById("graphingCalculator");

  // Financial calculator elements
  const calculateLoanBtn = document.getElementById("calculateLoan");
  const convertCurrencyBtn = document.getElementById("convertCurrency");
  const calculateInvestmentBtn = document.getElementById("calculateInvestment");
  const calculateTaxBtn = document.getElementById("calculateTax");

  // Unit converter elements
  const unitCategorySelect = document.getElementById("unitCategory");
  const convertUnitBtn = document.getElementById("convertUnit");
  const swapUnitsBtn = document.getElementById("swapUnits");

  // Date calculator elements
  const calculateDateDiffBtn = document.getElementById("calculateDateDiff");
  const calculateDateOperationBtn = document.getElementById(
    "calculateDateOperation"
  );

  // Graphing calculator elements
  const graphCanvas = document.getElementById("graphCanvas");
  const plotGraphBtn = document.getElementById("plotGraph");
  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");
  const panLeftBtn = document.getElementById("panLeft");
  const panRightBtn = document.getElementById("panRight");
  const resetGraphBtn = document.getElementById("resetGraph");

  // Initialize
  initEventListeners();
  updateDisplay();
  setCurrentDate();
  populateUnitOptions();

  // Event Listeners
  function initEventListeners() {
    // Mode switching
    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;
        switchMode(mode);
      });
    });

    // Basic calculator buttons
    document.querySelectorAll("#basicKeypad button").forEach((button) => {
      button.addEventListener("click", () =>
        handleButtonClick(button.dataset.value)
      );
    });

    // Scientific calculator buttons
    document.querySelectorAll("#scientificKeypad button").forEach((button) => {
      button.addEventListener("click", () =>
        handleButtonClick(button.dataset.value)
      );
    });

    // Programmer calculator buttons
    document.querySelectorAll("#programmerKeypad button").forEach((button) => {
      button.addEventListener("click", () =>
        handleButtonClick(button.dataset.value)
      );
    });

    // Base selection in programmer mode
    document.querySelectorAll(".btn-base").forEach((button) => {
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".btn-base")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        state.numberBase = button.dataset.base;
        updateDisplay();
      });
    });

    // Theme toggle
    themeToggle.addEventListener("click", toggleTheme);

    // History panel
    clearHistoryBtn.addEventListener("click", clearHistory);

    // Help modal
    helpBtn.addEventListener("click", () =>
      helpModal.classList.remove("hidden")
    );
    closeHelpModal.addEventListener("click", () =>
      helpModal.classList.add("hidden")
    );

    // Financial calculator functions
    calculateLoanBtn.addEventListener("click", calculateLoan);
    calculateInvestmentBtn.addEventListener("click", calculateInvestment);

    // Unit converter functions
    unitCategorySelect.addEventListener("change", populateUnitOptions);
    convertUnitBtn.addEventListener("click", convertUnit);
    swapUnitsBtn.addEventListener("click", swapUnits);

    // Date calculator functions
    calculateDateDiffBtn.addEventListener("click", calculateDateDifference);
    calculateDateOperationBtn.addEventListener("click", calculateDateOperation);

    // Graphing calculator functions
    plotGraphBtn.addEventListener("click", plotGraph);
    zoomInBtn.addEventListener("click", () => zoomGraph(0.8));
    zoomOutBtn.addEventListener("click", () => zoomGraph(1.2));
    panLeftBtn.addEventListener("click", () => panGraph(-1, 0));
    panRightBtn.addEventListener("click", () => panGraph(1, 0));
    resetGraphBtn.addEventListener("click", resetGraph);

    // Keyboard support
    document.addEventListener("keydown", handleKeyboardInput);
  }

  // Calculator Core Functions
  function handleButtonClick(value) {
    // Add button press animation
    event.target.classList.add("button-press");
    setTimeout(() => {
      event.target.classList.remove("button-press");
    }, 200);

    // Handle the button value
    if (!isNaN(value) || value === ".") {
      inputDigit(value);
    } else if (value === "±") {
      toggleSign();
    } else if (value === "%") {
      inputPercent();
    } else if (value === "C") {
      clearAll();
    } else if (value === "=") {
      performCalculation();
    } else if (["+", "-", "*", "/"].includes(value)) {
      handleOperator(value);
    } else if (value === "MC") {
      clearMemory();
    } else if (value === "MR") {
      recallMemory();
    } else if (value === "M+") {
      addToMemory();
    } else if (value === "M-") {
      subtractFromMemory();
    } else if (value === "MS") {
      storeMemory();
    } else if (
      [
        "sin",
        "cos",
        "tan",
        "sin⁻¹",
        "cos⁻¹",
        "tan⁻¹",
        "log",
        "ln",
        "10^x",
        "e^x",
        "x^y",
        "√",
        "∛",
        "x!",
        "mod",
        "π",
        "e",
        "Rand",
      ].includes(value)
    ) {
      handleScientificFunction(value);
    } else if (
      ["AND", "OR", "XOR", "NOT", "NAND", "NOR", "<<", ">>", "~", "^"].includes(
        value
      )
    ) {
      handleBitwiseOperation(value);
    } else if (value === "(" || value === ")") {
      handleParenthesis(value);
    }

    updateDisplay();
  }

  function inputDigit(digit) {
    if (state.waitingForOperand) {
      state.currentValue = digit;
      state.waitingForOperand = false;
    } else {
      state.currentValue =
        state.currentValue === "0" ? digit : state.currentValue + digit;
    }
  }

  function inputDecimal() {
    if (state.waitingForOperand) {
      state.currentValue = "0.";
      state.waitingForOperand = false;
      return;
    }

    if (!state.currentValue.includes(".")) {
      state.currentValue += ".";
    }
  }

  function toggleSign() {
    state.currentValue = (parseFloat(state.currentValue) * -1).toString();
  }

  function inputPercent() {
    const value = parseFloat(state.currentValue);
    state.currentValue = (value / 100).toString();
  }

  function clearAll() {
    state.currentValue = "0";
    state.previousValue = null;
    state.operation = null;
    state.waitingForOperand = false;
  }

  function handleOperator(nextOperator) {
    const inputValue = parseFloat(state.currentValue);

    if (state.previousValue === null) {
      state.previousValue = inputValue;
    } else if (state.operation) {
      const currentValue = state.previousValue || 0;
      const result = performOperation(
        currentValue,
        inputValue,
        state.operation
      );

      state.previousValue = result;
      state.currentValue = String(result);
      addToHistory(
        `${currentValue} ${state.operation} ${inputValue} = ${result}`
      );
    }

    state.waitingForOperand = true;
    state.operation = nextOperator;
  }

  function performCalculation() {
    if (state.operation === null || state.previousValue === null) return;

    const inputValue = parseFloat(state.currentValue);
    const result = performOperation(
      state.previousValue,
      inputValue,
      state.operation
    );

    state.currentValue = String(result);
    state.previousValue = null;
    state.operation = null;
    state.waitingForOperand = true;

    addToHistory(
      `${state.previousValue} ${state.operation} ${inputValue} = ${result}`
    );
  }

  function performOperation(firstOperand, secondOperand, operation) {
    switch (operation) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  }

  // Memory Functions
  function clearMemory() {
    state.memory = 0;
  }

  function recallMemory() {
    state.currentValue = state.memory.toString();
    state.waitingForOperand = true;
  }

  function addToMemory() {
    state.memory += parseFloat(state.currentValue);
  }

  function subtractFromMemory() {
    state.memory -= parseFloat(state.currentValue);
  }

  function storeMemory() {
    state.memory = parseFloat(state.currentValue);
  }

  // Scientific Functions
  function handleScientificFunction(func) {
    let value = parseFloat(state.currentValue);
    let result;

    // Convert to radians if needed (for trigonometric functions)
    if (
      ["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹"].includes(func) &&
      state.angleMode === "DEG"
    ) {
      value = value * (Math.PI / 180);
    }

    switch (func) {
      case "sin":
        result = Math.sin(value);
        break;
      case "cos":
        result = Math.cos(value);
        break;
      case "tan":
        result = Math.tan(value);
        break;
      case "sin⁻¹":
        result = Math.asin(value);
        break;
      case "cos⁻¹":
        result = Math.acos(value);
        break;
      case "tan⁻¹":
        result = Math.atan(value);
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "10^x":
        result = Math.pow(10, value);
        break;
      case "e^x":
        result = Math.exp(value);
        break;
      case "x^y":
        state.previousValue = value;
        state.operation = "^";
        state.waitingForOperand = true;
        return;
      case "√":
        result = Math.sqrt(value);
        break;
      case "∛":
        result = Math.cbrt(value);
        break;
      case "x!":
        result = 1;
        for (let i = 2; i <= value; i++) {
          result *= i;
        }
        break;
      case "mod":
        state.previousValue = value;
        state.operation = "mod";
        state.waitingForOperand = true;
        return;
      case "π":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      case "Rand":
        result = Math.random();
        break;
    }

    // Convert back to degrees if needed (for inverse trigonometric functions)
    if (
      ["sin⁻¹", "cos⁻¹", "tan⁻¹"].includes(func) &&
      state.angleMode === "DEG"
    ) {
      result = result * (180 / Math.PI);
    }

    state.currentValue = result.toString();
    addToHistory(`${func}(${value}) = ${result}`);
    state.waitingForOperand = true;
  }

  // Programmer Functions
  function handleBitwiseOperation(operation) {
    const inputValue = parseInt(state.currentValue);
    let result;

    if (state.previousValue === null) {
      state.previousValue = inputValue;
      state.operation = operation;
      state.waitingForOperand = true;
      return;
    }

    const currentValue = state.previousValue;

    switch (operation) {
      case "AND":
        result = currentValue & inputValue;
        break;
      case "OR":
        result = currentValue | inputValue;
        break;
      case "XOR":
        result = currentValue ^ inputValue;
        break;
      case "NOT":
        result = ~inputValue;
        break;
      case "NAND":
        result = ~(currentValue & inputValue);
        break;
      case "NOR":
        result = ~(currentValue | inputValue);
        break;
      case "<<":
        result = currentValue << inputValue;
        break;
      case ">>":
        result = currentValue >> inputValue;
        break;
      case "~":
        result = ~inputValue;
        break;
      case "^":
        result = currentValue ^ inputValue;
        break;
    }

    state.currentValue = result.toString();
    addToHistory(`${currentValue} ${operation} ${inputValue} = ${result}`);
    state.previousValue = null;
    state.operation = null;
    state.waitingForOperand = true;
  }

  function handleParenthesis(paren) {
    // This is a simplified implementation. A full implementation would need a parser.
    state.currentValue += paren;
    state.waitingForOperand = false;
  }

  // Display Functions
  function updateDisplay() {
    let displayValue = state.currentValue;

    // Format based on current mode
    if (state.currentMode === "programmer") {
      const value = parseInt(displayValue) || 0;
      switch (state.numberBase) {
        case "HEX":
          displayValue = value.toString(16).toUpperCase();
          break;
        case "OCT":
          displayValue = value.toString(8);
          break;
        case "BIN":
          displayValue = value.toString(2);
          break;
        // DEC is handled by default
      }
    } else {
      // Format with commas for decimal numbers
      const num = parseFloat(displayValue);
      if (!isNaN(num)) {
        displayValue = num.toLocaleString(undefined, {
          maximumFractionDigits: 10,
        });
      }
    }

    mainDisplay.textContent = displayValue;

    // Update history display
    if (state.operation && state.previousValue !== null) {
      historyDisplay.textContent = `${state.previousValue} ${state.operation}`;
    } else {
      historyDisplay.textContent = "";
    }

    // Flash the display when it updates
    mainDisplay.classList.add("display-flash");
    setTimeout(() => {
      mainDisplay.classList.remove("display-flash");
    }, 500);
  }

  // History Functions
  function addToHistory(entry) {
    state.history.unshift(entry);
    if (state.history.length > 10) {
      state.history.pop();
    }
    updateHistoryDisplay();
  }

  function updateHistoryDisplay() {
    historyList.innerHTML = "";
    state.history.forEach((entry, index) => {
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded";
      li.innerHTML = `
                        <span class="text-gray-700 dark:text-gray-300">${entry}</span>
                        <button data-index="${index}" class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm">
                            <i class="fas fa-redo"></i>
                        </button>
                    `;
      historyList.appendChild(li);
    });

    // Add event listeners to history items
    document.querySelectorAll("#historyList button").forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.dataset.index;
        const entry = state.history[index];
        // Extract the result from the history entry
        const result = entry.split("=")[1].trim();
        state.currentValue = result;
        updateDisplay();
      });
    });
  }

  function clearHistory() {
    state.history = [];
    updateHistoryDisplay();
  }

  // Mode Switching
  function switchMode(mode) {
    state.currentMode = mode;

    // Update active mode button
    modeButtons.forEach((button) => {
      if (button.dataset.mode === mode) {
        button.classList.add(
          "bg-blue-100",
          "dark:bg-blue-900",
          "text-blue-800",
          "dark:text-blue-200"
        );
        button.classList.remove(
          "hover:bg-gray-100",
          "dark:hover:bg-gray-700",
          "text-gray-700",
          "dark:text-gray-300"
        );
      } else {
        button.classList.remove(
          "bg-blue-100",
          "dark:bg-blue-900",
          "text-blue-800",
          "dark:text-blue-200"
        );
        button.classList.add(
          "hover:bg-gray-100",
          "dark:hover:bg-gray-700",
          "text-gray-700",
          "dark:text-gray-300"
        );
      }
    });

    // Hide all keypads and calculators
    basicKeypad.classList.add("hidden");
    scientificKeypad.classList.add("hidden");
    programmerKeypad.classList.add("hidden");
    financialCalculator.classList.add("hidden");
    unitConverter.classList.add("hidden");
    dateCalculator.classList.add("hidden");
    graphingCalculator.classList.add("hidden");

    // Clear mode controls
    modeControls.innerHTML = "";

    // Show appropriate keypad and controls
    switch (mode) {
      case "basic":
        basicKeypad.classList.remove("hidden");
        break;
      case "scientific":
        scientificKeypad.classList.remove("hidden");
        addScientificControls();
        break;
      case "programmer":
        programmerKeypad.classList.remove("hidden");
        addProgrammerControls();
        break;
      case "financial":
        financialCalculator.classList.remove("hidden");
        break;
      case "unit":
        unitConverter.classList.remove("hidden");
        break;
      case "date":
        dateCalculator.classList.remove("hidden");
        break;
      case "graph":
        graphingCalculator.classList.remove("hidden");
        if (!state.isGraphPlotted) {
          plotGraph();
          state.isGraphPlotted = true;
        }
        break;
    }

    // Reset calculator state when switching modes
    clearAll();
    updateDisplay();
  }

  function addScientificControls() {
    const controls = document.createElement("div");
    controls.className = "flex justify-between items-center p-2";
    controls.innerHTML = `
                    <div class="flex space-x-2">
                        <button id="angleMode" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm">
                            ${state.angleMode}
                        </button>
                        <button id="toggleHistory" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm">
                            <i class="fas fa-history mr-1"></i> History
                        </button>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        M: ${state.memory}
                    </div>
                `;
    modeControls.appendChild(controls);

    document
      .getElementById("angleMode")
      .addEventListener("click", toggleAngleMode);
    document.getElementById("toggleHistory").addEventListener("click", () => {
      historyPanel.classList.toggle("hidden");
    });
  }

  function addProgrammerControls() {
    const controls = document.createElement("div");
    controls.className = "flex justify-between items-center p-2";
    controls.innerHTML = `
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        ${state.numberBase}
                    </div>
                    <div class="flex space-x-2">
                        <button id="toggleHistory" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm">
                            <i class="fas fa-history mr-1"></i> History
                        </button>
                    </div>
                `;
    modeControls.appendChild(controls);

    document.getElementById("toggleHistory").addEventListener("click", () => {
      historyPanel.classList.toggle("hidden");
    });
  }

  function toggleAngleMode() {
    state.angleMode = state.angleMode === "DEG" ? "RAD" : "DEG";
    document.getElementById("angleMode").textContent = state.angleMode;
  }

  // Theme Functions
  function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }

  // Check for saved theme preference
  if (
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }

  // Financial Calculator Functions
  function calculateLoan() {
    const amount = parseFloat(document.getElementById("loanAmount").value);
    const rate =
      parseFloat(document.getElementById("interestRate").value) / 100 / 12;
    const term = parseFloat(document.getElementById("loanTerm").value) * 12;

    if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
      alert("Please enter valid values");
      return;
    }

    const monthlyPayment =
      (amount * rate * Math.pow(1 + rate, term)) /
      (Math.pow(1 + rate, term) - 1);
    const totalInterest = monthlyPayment * term - amount;

    document.getElementById("monthlyPayment").textContent =
      "₹" + monthlyPayment.toFixed(2);
    document.getElementById("totalInterest").textContent =
      "₹" + totalInterest.toFixed(2);
    document.getElementById("loanResult").classList.remove("hidden");

    addToHistory(
      `Loan: ₹${amount} @ ${(rate * 12 * 100).toFixed(2)}% for ${
        term / 12
      } yrs → ₹${monthlyPayment.toFixed(2)}/mo`
    );
  }

  function calculateInvestment() {
    const initial = parseFloat(
      document.getElementById("initialInvestment").value
    );
    const monthly = parseFloat(
      document.getElementById("monthlyContribution").value
    );
    const rate =
      parseFloat(document.getElementById("annualReturn").value) / 100 / 12;
    const years = parseFloat(document.getElementById("investmentYears").value);
    const months = years * 12;

    if (isNaN(initial) || isNaN(monthly) || isNaN(rate) || isNaN(months)) {
      alert("Please enter valid values");
      return;
    }

    let futureValue = initial * Math.pow(1 + rate, months);
    futureValue += (monthly * (Math.pow(1 + rate, months) - 1)) / rate;

    const totalContributions = initial + monthly * months;
    const interestEarned = futureValue - totalContributions;

    document.getElementById("futureValue").textContent =
      "₹" + futureValue.toFixed(2);
    document.getElementById("totalContributions").textContent =
      "₹" + totalContributions.toFixed(2);
    document.getElementById("interestEarned").textContent =
      "₹" + interestEarned.toFixed(2);
    document.getElementById("investmentResult").classList.remove("hidden");

    addToHistory(
      `Investment: ₹${initial} + ₹${monthly}/mo @ ${(rate * 12 * 100).toFixed(
        2
      )}% for ${years} yrs → ₹${futureValue.toFixed(2)}`
    );
  }

  // Unit Converter Functions
  function populateUnitOptions() {
    const category = document.getElementById("unitCategory").value;
    const unitFrom = document.getElementById("unitFrom");
    const unitTo = document.getElementById("unitTo");

    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";

    let units = [];
    switch (category) {
      case "length":
        units = [
          "Meter",
          "Kilometer",
          "Centimeter",
          "Millimeter",
          "Mile",
          "Yard",
          "Foot",
          "Inch",
        ];
        break;
      case "weight":
        units = ["Kilogram", "Gram", "Milligram", "Pound", "Ounce", "Ton"];
        break;
      case "volume":
        units = [
          "Liter",
          "Milliliter",
          "Gallon",
          "Quart",
          "Pint",
          "Cup",
          "Fluid Ounce",
        ];
        break;
      case "temperature":
        units = ["Celsius", "Fahrenheit", "Kelvin"];
        break;
      case "speed":
        units = ["Km/h", "m/s", "mph", "knot"];
        break;
      case "time":
        units = ["Second", "Minute", "Hour", "Day", "Week", "Month", "Year"];
        break;
      case "data":
        units = ["Bit", "Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte"];
        break;
    }

    units.forEach((unit) => {
      const option1 = document.createElement("option");
      option1.value = unit;
      option1.textContent = unit;
      unitFrom.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = unit;
      option2.textContent = unit;
      unitTo.appendChild(option2);
    });

    // Set sensible defaults
    if (category === "temperature") {
      unitFrom.value = "Celsius";
      unitTo.value = "Fahrenheit";
    } else {
      unitFrom.value = units[0];
      unitTo.value = units[1] || units[0];
    }
  }

  function convertUnit() {
    const category = document.getElementById("unitCategory").value;
    const fromUnit = document.getElementById("unitFrom").value;
    const toUnit = document.getElementById("unitTo").value;
    const value = parseFloat(document.getElementById("unitValue").value);

    if (isNaN(value)) {
      alert("Please enter a valid value");
      return;
    }

    let result;
    if (category === "temperature") {
      result = convertTemperature(value, fromUnit, toUnit);
    } else {
      // Convert to base unit first, then to target unit
      const baseValue = toBaseUnit(value, fromUnit, category);
      result = fromBaseUnit(baseValue, toUnit, category);
    }

    document.getElementById("convertedValue").textContent = result.toFixed(6);
    document.getElementById("convertedUnit").textContent = toUnit;
    document.getElementById("unitResult").classList.remove("hidden");

    addToHistory(`Unit: ${value} ${fromUnit} → ${result.toFixed(6)} ${toUnit}`);
  }

  function toBaseUnit(value, unit, category) {
    switch (category) {
      case "length":
        switch (unit) {
          case "Meter":
            return value;
          case "Kilometer":
            return value * 1000;
          case "Centimeter":
            return value / 100;
          case "Millimeter":
            return value / 1000;
          case "Mile":
            return value * 1609.344;
          case "Yard":
            return value * 0.9144;
          case "Foot":
            return value * 0.3048;
          case "Inch":
            return value * 0.0254;
        }
        break;
      case "weight":
        switch (unit) {
          case "Kilogram":
            return value;
          case "Gram":
            return value / 1000;
          case "Milligram":
            return value / 1000000;
          case "Pound":
            return value * 0.453592;
          case "Ounce":
            return value * 0.0283495;
          case "Ton":
            return value * 907.185;
        }
        break;
      case "volume":
        switch (unit) {
          case "Liter":
            return value;
          case "Milliliter":
            return value / 1000;
          case "Gallon":
            return value * 3.78541;
          case "Quart":
            return value * 0.946353;
          case "Pint":
            return value * 0.473176;
          case "Cup":
            return value * 0.24;
          case "Fluid Ounce":
            return value * 0.0295735;
        }
        break;
      case "speed":
        switch (unit) {
          case "m/s":
            return value;
          case "Km/h":
            return value / 3.6;
          case "mph":
            return value / 2.237;
          case "knot":
            return value / 1.944;
        }
        break;
      case "time":
        switch (unit) {
          case "Second":
            return value;
          case "Minute":
            return value * 60;
          case "Hour":
            return value * 3600;
          case "Day":
            return value * 86400;
          case "Week":
            return value * 604800;
          case "Month":
            return value * 2629746; // Average month
          case "Year":
            return value * 31556952; // Average year
        }
        break;
      case "data":
        switch (unit) {
          case "Byte":
            return value;
          case "Bit":
            return value / 8;
          case "Kilobyte":
            return value * 1024;
          case "Megabyte":
            return value * 1048576;
          case "Gigabyte":
            return value * 1073741824;
          case "Terabyte":
            return value * 1099511627776;
        }
        break;
    }
    return value;
  }

  function fromBaseUnit(value, unit, category) {
    switch (category) {
      case "length":
        switch (unit) {
          case "Meter":
            return value;
          case "Kilometer":
            return value / 1000;
          case "Centimeter":
            return value * 100;
          case "Millimeter":
            return value * 1000;
          case "Mile":
            return value / 1609.344;
          case "Yard":
            return value / 0.9144;
          case "Foot":
            return value / 0.3048;
          case "Inch":
            return value / 0.0254;
        }
        break;
      case "weight":
        switch (unit) {
          case "Kilogram":
            return value;
          case "Gram":
            return value * 1000;
          case "Milligram":
            return value * 1000000;
          case "Pound":
            return value / 0.453592;
          case "Ounce":
            return value / 0.0283495;
          case "Ton":
            return value / 907.185;
        }
        break;
      case "volume":
        switch (unit) {
          case "Liter":
            return value;
          case "Milliliter":
            return value * 1000;
          case "Gallon":
            return value / 3.78541;
          case "Quart":
            return value / 0.946353;
          case "Pint":
            return value / 0.473176;
          case "Cup":
            return value / 0.24;
          case "Fluid Ounce":
            return value / 0.0295735;
        }
        break;
      case "speed":
        switch (unit) {
          case "m/s":
            return value;
          case "Km/h":
            return value * 3.6;
          case "mph":
            return value * 2.237;
          case "knot":
            return value * 1.944;
        }
        break;
      case "time":
        switch (unit) {
          case "Second":
            return value;
          case "Minute":
            return value / 60;
          case "Hour":
            return value / 3600;
          case "Day":
            return value / 86400;
          case "Week":
            return value / 604800;
          case "Month":
            return value / 2629746;
          case "Year":
            return value / 31556952;
        }
        break;
      case "data":
        switch (unit) {
          case "Byte":
            return value;
          case "Bit":
            return value * 8;
          case "Kilobyte":
            return value / 1024;
          case "Megabyte":
            return value / 1048576;
          case "Gigabyte":
            return value / 1073741824;
          case "Terabyte":
            return value / 1099511627776;
        }
        break;
    }
    return value;
  }

  function convertTemperature(value, fromUnit, toUnit) {
    // Convert to Celsius first
    let celsius;
    switch (fromUnit) {
      case "Celsius":
        celsius = value;
        break;
      case "Fahrenheit":
        celsius = ((value - 32) * 5) / 9;
        break;
      case "Kelvin":
        celsius = value - 273.15;
        break;
    }

    // Convert from Celsius to target unit
    switch (toUnit) {
      case "Celsius":
        return celsius;
      case "Fahrenheit":
        return (celsius * 9) / 5 + 32;
      case "Kelvin":
        return celsius + 273.15;
    }
    return value;
  }

  function swapUnits() {
    const fromUnit = document.getElementById("unitFrom");
    const toUnit = document.getElementById("unitTo");
    const temp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = temp;
  }

  // Date Calculator Functions
  function calculateDateDifference() {
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert("Please select valid dates");
      return;
    }

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = (diffDays / 7).toFixed(2);

    // Calculate months and years difference
    let months;
    let years;
    if (endDate >= startDate) {
      years = endDate.getFullYear() - startDate.getFullYear();
      months = endDate.getMonth() - startDate.getMonth();
      if (endDate.getDate() < startDate.getDate()) months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    } else {
      years = startDate.getFullYear() - endDate.getFullYear();
      months = startDate.getMonth() - endDate.getMonth();
      if (startDate.getDate() < endDate.getDate()) months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    document.getElementById("daysBetween").textContent = diffDays;
    document.getElementById("weeksBetween").textContent = diffWeeks;
    document.getElementById("monthsBetween").textContent = months;
    document.getElementById("yearsBetween").textContent = years;
    document.getElementById("dateDiffResult").classList.remove("hidden");

    addToHistory(
      `Date Diff: ${startDate.toDateString()} to ${endDate.toDateString()} → ${diffDays} days`
    );
  }

  function calculateDateOperation() {
    const baseDate = new Date(document.getElementById("baseDate").value);
    const operation = document.getElementById("dateOperation").value;
    const value = parseInt(document.getElementById("dateValue").value);
    const unit = document.getElementById("dateUnit").value;

    if (isNaN(baseDate.getTime()) || isNaN(value)) {
      alert("Please enter valid values");
      return;
    }

    const resultDate = new Date(baseDate);

    switch (unit) {
      case "days":
        operation === "add"
          ? resultDate.setDate(resultDate.getDate() + value)
          : resultDate.setDate(resultDate.getDate() - value);
        break;
      case "weeks":
        operation === "add"
          ? resultDate.setDate(resultDate.getDate() + value * 7)
          : resultDate.setDate(resultDate.getDate() - value * 7);
        break;
      case "months":
        operation === "add"
          ? resultDate.setMonth(resultDate.getMonth() + value)
          : resultDate.setMonth(resultDate.getMonth() - value);
        break;
      case "years":
        operation === "add"
          ? resultDate.setFullYear(resultDate.getFullYear() + value)
          : resultDate.setFullYear(resultDate.getFullYear() - value);
        break;
    }

    document.getElementById("resultDate").textContent =
      resultDate.toDateString();
    document.getElementById("dateOpResult").classList.remove("hidden");

    addToHistory(
      `Date Op: ${baseDate.toDateString()} ${operation} ${value} ${unit} → ${resultDate.toDateString()}`
    );
  }

  function setCurrentDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("startDate").value = today;
    document.getElementById("endDate").value = today;
    document.getElementById("baseDate").value = today;
  }

  // Graphing Calculator Functions
  function plotGraph() {
    const ctx = graphCanvas.getContext("2d");

    // Destroy previous chart if it exists
    if (state.graph) {
      state.graph.destroy();
    }

    // Get functions to plot
    const func1 = document.getElementById("function1").value;
    const func2 = document.getElementById("function2").value;
    const func3 = document.getElementById("function3").value;

    // Generate data points
    const labels = [];
    const data1 = [];
    const data2 = [];
    const data3 = [];

    const step = 0.1;
    const minX = -10;
    const maxX = 10;

    for (let x = minX; x <= maxX; x += step) {
      labels.push(x.toFixed(1));

      if (func1) {
        try {
          const y = math.evaluate(func1, { x });
          data1.push(y);
        } catch (e) {
          data1.push(null);
        }
      }

      if (func2) {
        try {
          const y = math.evaluate(func2, { x });
          data2.push(y);
        } catch (e) {
          data2.push(null);
        }
      }

      if (func3) {
        try {
          const y = math.evaluate(func3, { x });
          data3.push(y);
        } catch (e) {
          data3.push(null);
        }
      }
    }

    // Create datasets
    const datasets = [];
    if (func1) {
      datasets.push({
        label: func1,
        data: data1,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      });
    }

    if (func2) {
      datasets.push({
        label: func2,
        data: data2,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      });
    }

    if (func3) {
      datasets.push({
        label: func3,
        data: data3,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      });
    }

    // Create chart
    state.graph = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "x",
            },
          },
          y: {
            title: {
              display: true,
              text: "f(x)",
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Function Plot",
          },
        },
      },
    });

    addToHistory(
      `Graph: Plotted ${func1}${func2 ? ", " + func2 : ""}${
        func3 ? ", " + func3 : ""
      }`
    );
  }

  function zoomGraph(factor) {
    if (!state.graph) return;

    const scales = state.graph.options.scales;
    const xRange = scales.x.max - scales.x.min;
    const yRange = scales.y.max - scales.y.min;

    const newXRange = xRange * factor;
    const newYRange = yRange * factor;

    const xCenter = (scales.x.max + scales.x.min) / 2;
    const yCenter = (scales.y.max + scales.y.min) / 2;

    scales.x.min = xCenter - newXRange / 2;
    scales.x.max = xCenter + newXRange / 2;
    scales.y.min = yCenter - newYRange / 2;
    scales.y.max = yCenter + newYRange / 2;

    state.graph.update();
  }

  function panGraph(xDelta, yDelta) {
    if (!state.graph) return;

    const scales = state.graph.options.scales;
    const xRange = scales.x.max - scales.x.min;
    const yRange = scales.y.max - scales.y.min;

    scales.x.min += xDelta * xRange * 0.1;
    scales.x.max += xDelta * xRange * 0.1;
    scales.y.min += yDelta * yRange * 0.1;
    scales.y.max += yDelta * yRange * 0.1;

    state.graph.update();
  }

  function resetGraph() {
    if (!state.graph) return;

    state.graph.options.scales.x.min = -10;
    state.graph.options.scales.x.max = 10;
    state.graph.options.scales.y.min = -10;
    state.graph.options.scales.y.max = 10;

    state.graph.update();
  }

  // Keyboard Support
  function handleKeyboardInput(e) {
    // Check if the active element is an input or select field in date, unit, or financial sections
    const activeElement = document.activeElement;
    const isInSpecialSection = activeElement.closest(
      "#dateCalculator, #unitConverter, #financialCalculator"
    );

    // If the user is typing in an input or select field in date, unit, or financial sections, ignore the event
    if (
      isInSpecialSection &&
      (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT")
    ) {
      return; // Do not process the keyboard input
    }

    const key = e.key;

    // Prevent default for keys we handle
    if (
      [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        ".",
        "+",
        "-",
        "*",
        "/",
        "Enter",
        "Escape",
        "Delete",
      ].includes(key)
    ) {
      e.preventDefault();
    }

    // Map keyboard keys to calculator functions
    if (key >= "0" && key <= "9") {
      inputDigit(key);
    } else if (key === ".") {
      inputDecimal();
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      handleOperator(key);
    } else if (key === "Enter") {
      performCalculation();
    } else if (key === "Escape") {
      clearAll();
    } else if (key === "Delete") {
      clearAll();
    } else if (key === "%") {
      inputPercent();
    } else if (key === "(" || key === ")") {
      handleParenthesis(key);
    } else if (key === "h") {
      historyPanel.classList.toggle("hidden");
    } else if (key === "m") {
      // Toggle memory panel if implemented
    }

    updateDisplay();
  }
});
