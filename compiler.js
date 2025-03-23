// LLM-CL Educational Demonstration - Compiler

document.addEventListener('DOMContentLoaded', function() {
    initCompiler();
});

function initCompiler() {
    // Initialize CodeMirror for compiler input with syntax highlighting
    const compilerEditor = CodeMirror.fromTextArea(document.getElementById('compiler-input'), {
        lineNumbers: true,
        mode: 'javascript', // Using JavaScript mode as a base for highlighting
        theme: 'default',
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        viewportMargin: Infinity
    });

    // Apply the same custom syntax highlighting as the encoder/decoder
    compilerEditor.on('renderLine', function(cm, line, elt) {
        const lineText = line.text;
        
        // Apply custom token classes based on pattern matching
        if (lineText.includes('#')) {
            elt.innerHTML = elt.innerHTML.replace(/#[a-zA-Z0-9_~]+/g, '<span class="token-concept">$&</span>');
        }
        if (lineText.includes('~')) {
            elt.innerHTML = elt.innerHTML.replace(/~[a-zA-Z0-9_]+/g, '<span class="token-relation">$&</span>');
        }
        if (lineText.includes('$')) {
            elt.innerHTML = elt.innerHTML.replace(/\$[a-zA-Z0-9_]+/g, '<span class="token-quantifier">$&</span>');
        }
        if (lineText.includes('^')) {
            elt.innerHTML = elt.innerHTML.replace(/\^[a-zA-Z0-9_.#]+/g, '<span class="token-reference">$&</span>');
        }
        if (lineText.includes('@')) {
            elt.innerHTML = elt.innerHTML.replace(/@v[0-9.]+/g, '<span class="token-version">$&</span>');
        }
        elt.innerHTML = elt.innerHTML.replace(/[{}]/g, '<span class="token-structural">$&</span>');
    });

    // Initialize event listeners for compile button
    document.getElementById('compile-button').addEventListener('click', () => {
        compileLLMCL(compilerEditor.getValue());
    });

    // Initialize compilation process visualization
    initCompilationVisualization();
    
    // Store the CodeMirror instance for later use
    window.compilerEditor = compilerEditor;
}

// Compile LLM-CL code
function compileLLMCL(llmclCode) {
    if (!llmclCode.trim()) {
        alert('Please enter some LLM-CL code to compile.');
        return;
    }
    
    // Set loading state
    document.getElementById('lexical-output').innerHTML = '<span class="text-gray-500">Analyzing...</span>';
    document.getElementById('syntax-output').innerHTML = '<span class="text-gray-500">Parsing...</span>';
    document.getElementById('ir-output').innerHTML = '<span class="text-gray-500">Generating IR...</span>';
    document.getElementById('generated-output').innerHTML = '<span class="text-gray-500">Generating code...</span>';
    
    // Simulate compilation process
    setTimeout(() => {
        // In a real implementation, this would be integrated with the Python compiler
        const compilationResult = simulateCompilation(llmclCode);
        
        // Update outputs with compilation results
        document.getElementById('lexical-output').innerHTML = formatTokens(compilationResult.tokens);
        document.getElementById('syntax-output').innerHTML = formatAST(compilationResult.ast);
        document.getElementById('ir-output').innerHTML = formatIR(compilationResult.ir);
        document.getElementById('generated-output').innerHTML = formatLLMCL(compilationResult.generated);
        
        // Update visualization
        updateCompilationVisualization(compilationResult);
    }, 1000);
}

// Simulate the compilation process (this would be replaced by actual Python compiler integration)
function simulateCompilation(code) {
    // Lexical analysis (tokenization)
    const tokens = simulateLexicalAnalysis(code);
    
    // Syntax analysis (parsing)
    const ast = simulateSyntaxAnalysis(tokens);
    
    // Generate intermediate representation
    const ir = simulateIRGeneration(ast);
    
    // Optimize IR
    const optimizedIR = simulateOptimization(ir);
    
    // Generate code
    const generated = simulateCodeGeneration(optimizedIR);
    
    return {
        tokens: tokens,
        ast: ast,
        ir: optimizedIR,
        generated: generated
    };
}

// Simulate lexical analysis (tokenization)
function simulateLexicalAnalysis(code) {
    // Simple token extraction
    const tokens = [];
    
    // Pattern-based token extraction
    const patterns = [
        { type: 'VERSION', regex: /@v[0-9.]+/g },
        { type: 'CONCEPT', regex: /#[a-zA-Z0-9_~]+/g },
        { type: 'RELATION', regex: /~[a-zA-Z0-9_]+/g },
        { type: 'QUANTIFIER', regex: /\$[a-zA-Z0-9_]+/g },
        { type: 'REFERENCE', regex: /\^[a-zA-Z0-9_.#]+/g },
        { type: 'OPEN_BRACE', regex: /\{/g },
        { type: 'CLOSE_BRACE', regex: /\}/g },
        { type: 'WHITESPACE', regex: /\s+/g }
    ];
    
    // Collect tokens using regex
    let lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let position = 0;
        
        while (position < line.length) {
            let nextToken = null;
            let nextTokenType = null;
            let nextTokenLength = 0;
            
            // Find the next token
            for (const pattern of patterns) {
                const regex = new RegExp(pattern.regex.source);
                regex.lastIndex = 0;
                
                const match = regex.exec(line.substring(position));
                if (match && match.index === 0) {
                    if (!nextToken || match[0].length > nextTokenLength) {
                        nextToken = match[0];
                        nextTokenType = pattern.type;
                        nextTokenLength = match[0].length;
                    }
                }
            }
            
            // Add token if found
            if (nextToken) {
                if (nextTokenType !== 'WHITESPACE') {  // Skip whitespace tokens
                    tokens.push({
                        type: nextTokenType,
                        value: nextToken,
                        line: i + 1,
                        column: position + 1
                    });
                }
                position += nextTokenLength;
            } else {
                // No token found, skip character
                position++;
            }
        }
    }
    
    return tokens;
}

// Simulate syntax analysis (parsing)
function simulateSyntaxAnalysis(tokens) {
    // Simple recursive descent parser simulation
    function createASTNode(type, value = null, children = []) {
        return { type, value, children };
    }
    
    // Build a simple AST
    const rootNode = createASTNode('MESSAGE');
    let currentNode = rootNode;
    const nodeStack = [rootNode];
    
    for (const token of tokens) {
        switch (token.type) {
            case 'VERSION':
                const versionNode = createASTNode('VERSION', token.value);
                currentNode.children.push(versionNode);
                break;
                
            case 'CONCEPT':
                const conceptNode = createASTNode('CONCEPT', token.value);
                currentNode.children.push(conceptNode);
                currentNode = conceptNode;
                nodeStack.push(conceptNode);
                break;
                
            case 'RELATION':
                const relationNode = createASTNode('RELATION', token.value);
                currentNode.children.push(relationNode);
                currentNode = relationNode;
                nodeStack.push(relationNode);
                break;
                
            case 'QUANTIFIER':
                const quantifierNode = createASTNode('QUANTIFIER', token.value);
                currentNode.children.push(quantifierNode);
                currentNode = quantifierNode;
                nodeStack.push(quantifierNode);
                break;
                
            case 'REFERENCE':
                const referenceNode = createASTNode('REFERENCE', token.value);
                currentNode.children.push(referenceNode);
                break;
                
            case 'OPEN_BRACE':
                // Already handled by pushing the parent to the stack
                break;
                
            case 'CLOSE_BRACE':
                // Pop from stack to go up a level
                nodeStack.pop();
                if (nodeStack.length > 0) {
                    currentNode = nodeStack[nodeStack.length - 1];
                }
                break;
        }
    }
    
    return rootNode;
}

// Simulate intermediate representation generation
function simulateIRGeneration(ast) {
    // Convert AST to a simpler IR
    function convertNodeToIR(node) {
        switch (node.type) {
            case 'MESSAGE':
                return {
                    type: 'Message',
                    version: getVersionFromChildren(node.children),
                    content: getContentFromChildren(node.children)
                };
                
            case 'CONCEPT':
                const conceptParts = node.value.substring(1).split('~');
                return {
                    type: 'Concept',
                    id: conceptParts[0],
                    qualifier: conceptParts.length > 1 ? conceptParts[1] : undefined,
                    children: node.children.map(convertNodeToIR)
                };
                
            case 'RELATION':
                return {
                    type: 'Relation',
                    name: node.value.substring(1),
                    children: node.children.map(convertNodeToIR)
                };
                
            case 'QUANTIFIER':
                return {
                    type: 'Quantifier',
                    name: node.value.substring(1),
                    children: node.children.map(convertNodeToIR)
                };
                
            case 'REFERENCE':
                const pathParts = node.value.substring(1).split('.');
                return {
                    type: 'Reference',
                    source: pathParts[0],
                    path: pathParts.slice(1)
                };
                
            default:
                return null;
        }
    }
    
    function getVersionFromChildren(children) {
        for (const child of children) {
            if (child.type === 'VERSION') {
                return child.value.substring(2); // Remove @v
            }
        }
        return '1.0'; // Default version
    }
    
    function getContentFromChildren(children) {
        return children
            .filter(child => child.type !== 'VERSION')
            .map(convertNodeToIR)
            .filter(ir => ir !== null);
    }
    
    return convertNodeToIR(ast);
}

// Simulate IR optimization
function simulateOptimization(ir) {
    // Simple optimization: ensure all concepts have IDs, sort children
    function optimizeNode(node) {
        if (!node || typeof node !== 'object') return node;
        
        const optimized = { ...node };
        
        // Process by node type
        if (optimized.type === 'Concept') {
            // Ensure ID exists
            if (!optimized.id || optimized.id.indexOf('c') !== 0) {
                optimized.id = `concept_${Math.floor(Math.random() * 10000)}`;
            }
        }
        
        // Recursively optimize children
        if (Array.isArray(optimized.children)) {
            optimized.children = optimized.children
                .map(optimizeNode)
                .filter(child => child !== null);
                
            // Sort children by type for more predictable output
            optimized.children.sort((a, b) => {
                const typeOrder = { 'Concept': 1, 'Relation': 2, 'Quantifier': 3, 'Reference': 4 };
                return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
            });
        }
        
        // Process content array
        if (Array.isArray(optimized.content)) {
            optimized.content = optimized.content
                .map(optimizeNode)
                .filter(item => item !== null);
                
            // Sort content by type
            optimized.content.sort((a, b) => {
                const typeOrder = { 'Concept': 1, 'Relation': 2, 'Quantifier': 3, 'Reference': 4 };
                return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
            });
        }
        
        return optimized;
    }
    
    return optimizeNode(ir);
}

// Simulate code generation
function simulateCodeGeneration(ir) {
    function generateCode(node, indent = 0) {
        const indentStr = '  '.repeat(indent);
        
        if (!node || typeof node !== 'object') return '';
        
        switch (node.type) {
            case 'Message':
                let code = `@v${node.version || '1.0'}{\n`;
                if (node.content && Array.isArray(node.content)) {
                    for (const content of node.content) {
                        code += generateCode(content, indent + 1);
                    }
                }
                code += '}\n';
                return code;
                
            case 'Concept':
                let conceptCode = `${indentStr}#${node.id}`;
                if (node.qualifier) {
                    conceptCode += `~${node.qualifier}`;
                }
                
                if (node.children && node.children.length > 0) {
                    conceptCode += '{\n';
                    for (const child of node.children) {
                        conceptCode += generateCode(child, indent + 1);
                    }
                    conceptCode += `${indentStr}}\n`;
                } else {
                    conceptCode += '\n';
                }
                return conceptCode;
                
            case 'Relation':
                let relationCode = `${indentStr}~${node.name}`;
                
                if (node.children && node.children.length > 0) {
                    relationCode += '{\n';
                    for (const child of node.children) {
                        relationCode += generateCode(child, indent + 1);
                    }
                    relationCode += `${indentStr}}\n`;
                } else {
                    relationCode += '\n';
                }
                return relationCode;
                
            case 'Quantifier':
                let quantifierCode = `${indentStr}$${node.name}`;
                
                if (node.children && node.children.length > 0) {
                    quantifierCode += '{\n';
                    for (const child of node.children) {
                        quantifierCode += generateCode(child, indent + 1);
                    }
                    quantifierCode += `${indentStr}}\n`;
                } else {
                    quantifierCode += '\n';
                }
                return quantifierCode;
                
            case 'Reference':
                let referenceCode = `${indentStr}^${node.source}`;
                if (node.path && node.path.length > 0) {
                    referenceCode += '.' + node.path.join('.');
                }
                return referenceCode + '\n';
                
            default:
                return '';
        }
    }
    
    return generateCode(ir);
}

// Format tokens for display
function formatTokens(tokens) {
    if (!tokens || tokens.length === 0) return '<span class="text-gray-500">No tokens</span>';
    
    let html = '<div class="text-sm">';
    for (const token of tokens) {
        html += `<div class="mb-1">`;
        html += `<span class="font-semibold">${token.type}</span>: `;
        
        // Apply syntax highlighting to the token value
        if (token.type === 'CONCEPT') {
            html += `<span class="token-concept">${escapeHtml(token.value)}</span>`;
        } else if (token.type === 'RELATION') {
            html += `<span class="token-relation">${escapeHtml(token.value)}</span>`;
        } else if (token.type === 'QUANTIFIER') {
            html += `<span class="token-quantifier">${escapeHtml(token.value)}</span>`;
        } else if (token.type === 'REFERENCE') {
            html += `<span class="token-reference">${escapeHtml(token.value)}</span>`;
        } else if (token.type === 'VERSION') {
            html += `<span class="token-version">${escapeHtml(token.value)}</span>`;
        } else if (token.type === 'OPEN_BRACE' || token.type === 'CLOSE_BRACE') {
            html += `<span class="token-structural">${escapeHtml(token.value)}</span>`;
        } else {
            html += escapeHtml(token.value);
        }
        
        html += ` <span class="text-gray-500 text-xs">(line: ${token.line}, col: ${token.column})</span>`;
        html += `</div>`;
    }
    html += '</div>';
    return html;
}

// Format AST for display
function formatAST(ast) {
    if (!ast) return '<span class="text-gray-500">No AST</span>';
    
    function formatNode(node, indent = 0) {
        if (!node) return '';
        
        const indentStr = '  '.repeat(indent);
        let html = `<div>${indentStr}<span class="font-semibold">${node.type}</span>`;
        
        if (node.value) {
            let valueHtml = escapeHtml(node.value);
            
            // Apply syntax highlighting
            if (node.type === 'CONCEPT') {
                valueHtml = `<span class="token-concept">${valueHtml}</span>`;
            } else if (node.type === 'RELATION') {
                valueHtml = `<span class="token-relation">${valueHtml}</span>`;
            } else if (node.type === 'QUANTIFIER') {
                valueHtml = `<span class="token-quantifier">${valueHtml}</span>`;
            } else if (node.type === 'REFERENCE') {
                valueHtml = `<span class="token-reference">${valueHtml}</span>`;
            } else if (node.type === 'VERSION') {
                valueHtml = `<span class="token-version">${valueHtml}</span>`;
            }
            
            html += `: ${valueHtml}`;
        }
        
        html += '</div>';
        
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                html += formatNode(child, indent + 1);
            }
        }
        
        return html;
    }
    
    return `<div class="text-sm">${formatNode(ast)}</div>`;
}

// Format IR for display
function formatIR(ir) {
    if (!ir) return '<span class="text-gray-500">No IR</span>';
    return `<pre class="text-xs">${escapeHtml(JSON.stringify(ir, null, 2))}</pre>`;
}

// Format LLM-CL with syntax highlighting
function formatLLMCL(code) {
    if (!code) return '<span class="text-gray-500">No generated code</span>';
    
    const lines = code.split('\n');
    let html = '<div class="text-sm">';
    
    for (const line of lines) {
        let highlightedLine = escapeHtml(line)
            .replace(/#[a-zA-Z0-9_~]+/g, '<span class="token-concept">$&</span>')
            .replace(/~[a-zA-Z0-9_]+/g, '<span class="token-relation">$&</span>')
            .replace(/\$[a-zA-Z0-9_]+/g, '<span class="token-quantifier">$&</span>')
            .replace(/\^[a-zA-Z0-9_.#]+/g, '<span class="token-reference">$&</span>')
            .replace(/@v[0-9.]+/g, '<span class="token-version">$&</span>')
            .replace(/[{}]/g, '<span class="token-structural">$&</span>');
            
        html += `<div>${highlightedLine}</div>`;
    }
    
    html += '</div>';
    return html;
}

// Initialize the compilation process visualization
function initCompilationVisualization() {
    window.compilerVisualization = {
        svg: d3.select('#compiler-visualization').append('svg')
            .attr('width', '100%')
            .attr('height', '100%'),
            
        resize: function() {
            const container = document.getElementById('compiler-visualization');
            if (container) {
                this.svg
                    .attr('width', container.clientWidth)
                    .attr('height', container.clientHeight);
                    
                // Redraw if we have existing data
                if (this.data) {
                    this.draw(this.data);
                } else {
                    // Draw initial state
                    this.drawInitialState();
                }
            }
        },
        
        drawInitialState: function() {
            this.svg.selectAll('*').remove();
            
            const width = this.svg.node().clientWidth;
            const height = this.svg.node().clientHeight;
            
            // Draw compilation pipeline steps
            const stepsData = [
                { name: 'Source Code', x: width * 0.1, y: height * 0.5 },
                { name: 'Lexical Analysis', x: width * 0.25, y: height * 0.5 },
                { name: 'Syntax Analysis', x: width * 0.4, y: height * 0.5 },
                { name: 'IR Generation', x: width * 0.55, y: height * 0.5 },
                { name: 'Optimization', x: width * 0.7, y: height * 0.5 },
                { name: 'Code Generation', x: width * 0.85, y: height * 0.5 }
            ];
            
            // Draw lines connecting steps
            this.svg.selectAll('line')
                .data(stepsData.slice(0, -1))
                .enter()
                .append('line')
                .attr('x1', d => d.x)
                .attr('y1', d => d.y)
                .attr('x2', (d, i) => stepsData[i + 1].x)
                .attr('y2', (d, i) => stepsData[i + 1].y)
                .attr('stroke', '#d1d5db')
                .attr('stroke-width', 2);
            
            // Draw circles for each step
            this.svg.selectAll('circle')
                .data(stepsData)
                .enter()
                .append('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', 10)
                .attr('fill', '#f3f4f6')
                .attr('stroke', '#d1d5db')
                .attr('stroke-width', 2);
            
            // Add labels
            this.svg.selectAll('text')
                .data(stepsData)
                .enter()
                .append('text')
                .attr('x', d => d.x)
                .attr('y', d => d.y + 25)
                .attr('text-anchor', 'middle')
                .text(d => d.name)
                .attr('font-size', '12px')
                .attr('fill', '#4b5563');
        },
        
        draw: function(data) {
            this.data = data;
            this.drawInitialState();
            
            // Simulate compilation process animation
            this.animateCompilationStep(0);
        },
        
        animateCompilationStep: function(stepIndex) {
            const stepsData = [
                { name: 'Source Code', x: this.svg.node().clientWidth * 0.1, y: this.svg.node().clientHeight * 0.5 },
                { name: 'Lexical Analysis', x: this.svg.node().clientWidth * 0.25, y: this.svg.node().clientHeight * 0.5 },
                { name: 'Syntax Analysis', x: this.svg.node().clientWidth * 0.4, y: this.svg.node().clientHeight * 0.5 },
                { name: 'IR Generation', x: this.svg.node().clientWidth * 0.55, y: this.svg.node().clientHeight * 0.5 },
                { name: 'Optimization', x: this.svg.node().clientWidth * 0.7, y: this.svg.node().clientHeight * 0.5 },
                { name: 'Code Generation', x: this.svg.node().clientWidth * 0.85, y: this.svg.node().clientHeight * 0.5 }
            ];
            
            if (stepIndex < stepsData.length) {
                // Highlight current step
                this.svg.selectAll('circle')
                    .filter((d, i) => i === stepIndex)
                    .transition()
                    .duration(300)
                    .attr('fill', '#4f46e5')
                    .attr('r', 12);
                
                // Highlight text
                this.svg.selectAll('text')
                    .filter((d, i) => i === stepIndex)
                    .transition()
                    .duration(300)
                    .attr('font-weight', 'bold')
                    .attr('fill', '#4f46e5');
                
                // If not the last step, highlight the line to the next step
                if (stepIndex < stepsData.length - 1) {
                    this.svg.selectAll('line')
                        .filter((d, i) => i === stepIndex)
                        .transition()
                        .duration(300)
                        .attr('stroke', '#4f46e5')
                        .attr('stroke-width', 3);
                }
                
                // Animate to next step
                setTimeout(() => {
                    this.animateCompilationStep(stepIndex + 1);
                }, 800);
            }
        }
    };
    
    // Initial draw
    window.compilerVisualization.resize();
}

// Update compilation visualization with new data
function updateCompilationVisualization(compilationResult) {
    window.compilerVisualization.draw(compilationResult);
}

// Utility function to escape HTML special characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
