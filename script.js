async function cauta() {
    const fisierList = ["ion.txt", "alexandru.txt", "oxentie.txt", "lilian.txt"];
    const caut = document.getElementById("cautare").value.toLowerCase();
    const rezultatDiv = document.getElementById("rezultat");
    rezultatDiv.innerHTML = "";

    if (!caut) {
        rezultatDiv.innerHTML = "";
        return;
    }

    let gasit = false;

    for (let fis of fisierList) {
        try {
            let text = await fetch(fis).then(r => r.text());
            let linii = text.split("\n");

            let rezultateFisier = "";
            linii.forEach((linie, nr) => {
                if (linie.toLowerCase().includes(caut)) {
                    gasit = true;
                    // Highlight the search term in bold
                    let linieSursa = linie;
                    let liniaHighlight = linie.replace(
                        new RegExp(`(${caut})`, 'gi'),
                        '<strong>$1</strong>'
                    );
                    rezultateFisier += `Linia ${nr + 1}: ${liniaHighlight}\n`;
                }
            });

            if (rezultateFisier) {
                rezultatDiv.innerHTML += 
                    `<strong>---- Găsit în: ${fis} ----</strong>\n${rezultateFisier}\n`;
            }

        } catch (err) {
            rezultatDiv.innerHTML += `Nu pot încărca ${fis}\n`;
        }
    }

    if (!gasit && caut) {
        rezultatDiv.innerHTML = "Nu s-a găsit nimic în niciun fișier.";
    }
}

// Configurează căutarea în timp real când utilizatorul scrie
document.addEventListener("DOMContentLoaded", function() {
    const inputCautare = document.getElementById("cautare");
    inputCautare.addEventListener("input", cauta);
});

// Calculator functionality
let expression = '0';
let lastWasOperator = false;
let lastWasEquals = false;

function updateDisplay() {
    const display = document.getElementById('display');
    display.textContent = expression;
    
    // Adjust font size based on text length
    const length = expression.length;
    if (length > 12) {
        display.style.fontSize = '32px';
    } else if (length > 8) {
        display.style.fontSize = '40px';
    } else {
        display.style.fontSize = '48px';
    }
    
    // Auto-scroll to the end
    display.scrollLeft = display.scrollWidth;
}

function clearDisplay() {
    expression = '0';
    lastWasOperator = false;
    lastWasEquals = false;
    updateDisplay();
}

function appendNumber(num) {
    if (lastWasEquals) {
        expression = '0';
        lastWasEquals = false;
    }
    
    if (expression === '0' && num !== '.') {
        expression = num;
    } else {
        // Prevent multiple dots in the same number
        if (num === '.') {
            const parts = expression.split(/[\+\-\×÷]/);
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('.')) return;
        }
        expression += num;
    }
    lastWasOperator = false;
    updateDisplay();
}

function setOperator(op) {
    if (lastWasEquals) {
        lastWasEquals = false;
    }
    
    // Replace operator symbols for display
    let displayOp = op;
    if (op === '*') displayOp = '×';
    if (op === '/') displayOp = '÷';
    
    // If last character was an operator, replace it
    if (lastWasOperator) {
        expression = expression.slice(0, -1) + displayOp;
    } else {
        expression += displayOp;
    }
    
    lastWasOperator = true;
    updateDisplay();
}

function calculate() {
    try {
        // Replace display operators with actual operators
        let calcExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Remove trailing operator if exists
        if (lastWasOperator) {
            calcExpression = calcExpression.slice(0, -1);
        }
        
        let result = eval(calcExpression);
        
        // Format result
        if (result.toString().includes('.')) {
            result = parseFloat(result.toFixed(10));
        }
        
        expression = result.toString();
        lastWasOperator = false;
        lastWasEquals = true;
        updateDisplay();
    } catch (error) {
        expression = 'Error';
        updateDisplay();
        setTimeout(() => {
            expression = '0';
            updateDisplay();
        }, 1500);
    }
}

function toggleSign() {
    if (lastWasEquals) {
        expression = (parseFloat(expression) * -1).toString();
        updateDisplay();
        return;
    }
    
    // Find the last number in the expression
    const parts = expression.match(/[+\-×÷]|\d+\.?\d*/g);
    if (!parts || parts.length === 0) return;
    
    let lastNum = parts[parts.length - 1];
    
    // If last is an operator, do nothing
    if (['+', '-', '×', '÷'].includes(lastNum)) return;
    
    // Toggle the sign of the last number
    let newNum;
    if (lastNum.startsWith('-')) {
        newNum = lastNum.substring(1);
    } else {
        newNum = '-' + lastNum;
    }
    
    // Replace the last number in expression
    const lastNumIndex = expression.lastIndexOf(lastNum);
    expression = expression.substring(0, lastNumIndex) + newNum;
    
    updateDisplay();
}

function percentage() {
    if (lastWasEquals) {
        expression = (parseFloat(expression) / 100).toString();
        updateDisplay();
        return;
    }
    
    // Find the last number and convert to percentage
    const parts = expression.match(/[+\-×÷]|\d+\.?\d*/g);
    if (!parts || parts.length === 0) return;
    
    let lastNum = parts[parts.length - 1];
    if (['+', '-', '×', '÷'].includes(lastNum)) return;
    
    let percentValue = (parseFloat(lastNum) / 100).toString();
    
    const lastNumIndex = expression.lastIndexOf(lastNum);
    expression = expression.substring(0, lastNumIndex) + percentValue;
    
    updateDisplay();
}
