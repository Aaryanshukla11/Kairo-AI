/**
 * Kairo Glassmorphism Calculator
 * Clean Modular Architecture
 */

class CalculatorEngine {
  constructor() {
    this.currentValue = '0';
    this.previousValue = null;
    this.operator = null;
    this.memory = 0;
    this.shouldResetScreen = false;
    this.historyExpression = '';
  }

  appendDigit(digit) {
    if (this.currentValue === '0' && digit !== '.') {
      this.currentValue = digit;
    } else if (this.shouldResetScreen) {
      this.currentValue = digit === '.' ? '0.' : digit;
      this.shouldResetScreen = false;
    } else {
      if (digit === '.' && this.currentValue.includes('.')) return;
      if (this.currentValue.length >= 14) return; // Prevent display overflow
      this.currentValue += digit;
    }
  }

  setOperator(op) {
    if (this.operator && !this.shouldResetScreen) {
      this.calculate();
    }
    this.previousValue = this.currentValue;
    this.operator = op;
    this.shouldResetScreen = true;
    this.historyExpression = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(op)}`;
  }

  calculate() {
    if (!this.operator || this.previousValue === null) return;

    const prev = parseFloat(this.previousValue);
    const curr = parseFloat(this.currentValue);
    let result = 0;

    switch (this.operator) {
      case 'add':
        result = prev + curr;
        break;
      case 'subtract':
        result = prev - curr;
        break;
      case 'multiply':
        result = prev * curr;
        break;
      case 'divide':
        if (curr === 0) {
          this.currentValue = 'Cannot divide by 0';
          this.operator = null;
          this.previousValue = null;
          this.shouldResetScreen = true;
          return;
        }
        result = prev / curr;
        break;
      default:
        return;
    }

    // Fix JavaScript floating point imprecision
    result = Math.round(result * 1e10) / 1e10;
    this.historyExpression = `${this.formatNumber(this.previousValue)} ${this.getOperatorSymbol(this.operator)} ${this.formatNumber(this.currentValue)} =`;
    this.currentValue = result.toString();
    this.operator = null;
    this.previousValue = null;
    this.shouldResetScreen = true;
  }

  clear() {
    this.currentValue = '0';
    this.previousValue = null;
    this.operator = null;
    this.shouldResetScreen = false;
    this.historyExpression = '';
  }

  backspace() {
    if (this.shouldResetScreen || this.currentValue.length === 1 || this.currentValue === 'Cannot divide by 0') {
      this.currentValue = '0';
    } else {
      this.currentValue = this.currentValue.slice(0, -1);
    }
  }

  percent() {
    const val = parseFloat(this.currentValue);
    this.currentValue = (val / 100).toString();
  }

  squareRoot() {
    const val = parseFloat(this.currentValue);
    if (val < 0) {
      this.currentValue = 'Invalid Input';
      this.shouldResetScreen = true;
      return;
    }
    this.historyExpression = `√(${this.formatNumber(this.currentValue)})`;
    this.currentValue = (Math.sqrt(val)).toString();
    this.shouldResetScreen = true;
  }

  square() {
    const val = parseFloat(this.currentValue);
    this.historyExpression = `sqr(${this.formatNumber(this.currentValue)})`;
    this.currentValue = (val * val).toString();
    this.shouldResetScreen = true;
  }

  negate() {
    if (this.currentValue === '0') return;
    this.currentValue = (parseFloat(this.currentValue) * -1).toString();
  }

  // Memory Register Operations
  memoryClear() { this.memory = 0; }
  memoryRecall() {
    this.currentValue = this.memory.toString();
    this.shouldResetScreen = true;
  }
  memoryAdd() { this.memory += parseFloat(this.currentValue) || 0; }
  memorySubtract() { this.memory -= parseFloat(this.currentValue) || 0; }

  getOperatorSymbol(op) {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '';
    }
  }

  formatNumber(numStr) {
    if (!numStr || isNaN(numStr)) return numStr;
    const parts = numStr.split('.');
    parts[0] = parseFloat(parts[0]).toLocaleString('en-US');
    return parts.join('.');
  }
}

class CalculatorUI {
  constructor() {
    this.engine = new CalculatorEngine();
    this.primaryDisplay = document.getElementById('primary-display');
    this.historyDisplay = document.getElementById('history-display');
    this.themeToggleBtn = document.getElementById('theme-toggle');

    this.initEvents();
    this.initTheme();
    this.updateDisplay();
  }

  initEvents() {
    // Click Event Delegation for Keypad
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', (e) => this.handleButtonClick(e.currentTarget));
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Theme Toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
  }

  handleButtonClick(button) {
    const digit = button.dataset.value;
    const action = button.dataset.action;

    // Visual button press animation trigger
    button.classList.add('btn-active');
    setTimeout(() => button.classList.remove('btn-active'), 150);

    if (digit !== undefined) {
      this.engine.appendDigit(digit);
    } else if (action) {
      switch (action) {
        case 'clear': this.engine.clear(); break;
        case 'backspace': this.engine.backspace(); break;
        case 'percent': this.engine.percent(); break;
        case 'square-root': this.engine.squareRoot(); break;
        case 'square': this.engine.square(); break;
        case 'negate': this.engine.negate(); break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
          this.engine.setOperator(action);
          break;
        case 'calculate': this.engine.calculate(); break;
        case 'mc': this.engine.memoryClear(); break;
        case 'mr': this.engine.memoryRecall(); break;
        case 'm-plus': this.engine.memoryAdd(); break;
        case 'm-minus': this.engine.memorySubtract(); break;
      }
    }

    this.updateDisplay();
  }

  handleKeyDown(e) {
    if (e.key >= '0' && e.key <= '9') {
      this.engine.appendDigit(e.key);
      this.highlightButton(`[data-value="${e.key}"]`);
    } else if (e.key === '.') {
      this.engine.appendDigit('.');
      this.highlightButton('[data-value="."]');
    } else if (e.key === '+') {
      this.engine.setOperator('add');
      this.highlightButton('[data-action="add"]');
    } else if (e.key === '-') {
      this.engine.setOperator('subtract');
      this.highlightButton('[data-action="subtract"]');
    } else if (e.key === '*') {
      this.engine.setOperator('multiply');
      this.highlightButton('[data-action="multiply"]');
    } else if (e.key === '/') {
      e.preventDefault();
      this.engine.setOperator('divide');
      this.highlightButton('[data-action="divide"]');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      this.engine.calculate();
      this.highlightButton('#btn-equals');
    } else if (e.key === 'Backspace') {
      this.engine.backspace();
      this.highlightButton('[data-action="backspace"]');
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      this.engine.clear();
      this.highlightButton('#btn-clear');
    } else if (e.key === '%') {
      this.engine.percent();
      this.highlightButton('[data-action="percent"]');
    }

    this.updateDisplay();
  }

  highlightButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('btn-active');
      setTimeout(() => btn.classList.remove('btn-active'), 150);
    }
  }

  updateDisplay() {
    this.primaryDisplay.textContent = this.engine.currentValue;
    this.historyDisplay.textContent = this.engine.historyExpression;

    // Dynamic Font Scaling for Long Numbers
    const len = this.engine.currentValue.length;
    if (len > 10) {
      this.primaryDisplay.style.fontSize = '24px';
    } else if (len > 7) {
      this.primaryDisplay.style.fontSize = '28px';
    } else {
      this.primaryDisplay.style.fontSize = '36px';
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('kairo-calc-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kairo-calc-theme', newTheme);
  }
}

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new CalculatorUI();
});
