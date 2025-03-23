// LLM-CL Educational Demonstration - Encoder/Decoder

document.addEventListener('DOMContentLoaded', function() {
    initEncoderDecoder();
});

function initEncoderDecoder() {
    // Initialize CodeMirror for LLM-CL input with syntax highlighting
    const llmclEditor = CodeMirror.fromTextArea(document.getElementById('llmcl-input'), {
        lineNumbers: true,
        mode: 'javascript', // Using JavaScript mode as a base for highlighting
        theme: 'default',
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        viewportMargin: Infinity
    });

    // Add custom syntax highlighting for LLM-CL tokens
    llmclEditor.on('renderLine', function(cm, line, elt) {
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

    // Initialize event listeners for encoder/decoder buttons
    document.getElementById('encode-button').addEventListener('click', () => {
        encodeNaturalLanguage();
    });

    document.getElementById('decode-button').addEventListener('click', () => {
        decodeLLMCL(llmclEditor.getValue());
    });

    // Initialize visualizations
    initVisualizations();
    
    // Store the CodeMirror instance for later use
    window.llmclEditor = llmclEditor;
}

// Encode natural language to LLM-CL
function encodeNaturalLanguage() {
    const inputText = document.getElementById('nl-input').value;
    const outputElement = document.getElementById('llmcl-output');
    
    if (!inputText.trim()) {
        outputElement.innerHTML = '<span class="text-red-500">Please enter some text to encode.</span>';
        return;
    }
    
    // Set loading state
    outputElement.innerHTML = '<span class="text-gray-500">Encoding...</span>';
    
    // Simulate API call delay
    setTimeout(() => {
        // In a real implementation, this would call our Python encoder or DeepSeek API
        const encoded = simulateEncoder(inputText);
        
        // Display the encoded output with syntax highlighting
        outputElement.innerHTML = formatLLMCL(encoded);
        
        // Update token counts
        updateTokenCounts(inputText, encoded);
        
        // Update visualizations
        updateVisualizations(encoded);
    }, 700);
}

// Decode LLM-CL to natural language
function decodeLLMCL(llmclCode) {
    const outputElement = document.getElementById('nl-output');
    
    if (!llmclCode.trim()) {
        outputElement.innerHTML = '<span class="text-red-500">Please enter some LLM-CL code to decode.</span>';
        return;
    }
    
    // Set loading state
    outputElement.innerHTML = '<span class="text-gray-500">Decoding...</span>';
    
    // Simulate API call delay
    setTimeout(() => {
        // In a real implementation, this would call our Python decoder or DeepSeek API
        const decoded = simulateDecoder(llmclCode);
        
        // Display the decoded output
        outputElement.innerHTML = decoded;
    }, 700);
}

// Simulate encoder (simplified version for demonstration)
function simulateEncoder(text) {
    // Basic encoding patterns for demonstration
    if (text.toLowerCase().includes('what are the three main approaches')) {
        return `@v1.0{
  #request~information
  #topic{
    #c501~approaches 
    #c142~agi
    #c4492~research
  }
  $quantity{3}
}`;
    } else if (text.toLowerCase().includes('explain') && text.toLowerCase().includes('climate change')) {
        return `@v1.0{
  #request~explanation
  #topic{
    #c117~climate_change
    ~impact{
      #c5501~environment
      #c2901~economy
      #c9856~society
    }
  }
}`;
    } else if (text.toLowerCase().includes('compare') || text.toLowerCase().includes('difference')) {
        const entities = extractEntities(text);
        return `@v1.0{
  #request~comparison
  #entities{
    ${entities[0] ? '#c' + Math.floor(1000 + Math.random() * 9000) + '~' + entities[0].toLowerCase().replace(/\s+/g, '_') : '#entity1'}
    ${entities[1] ? '#c' + Math.floor(1000 + Math.random() * 9000) + '~' + entities[1].toLowerCase().replace(/\s+/g, '_') : '#entity2'}
  }
  ~dimensions{
    #c6701~similarities
    #c6702~differences
  }
}`;
    } else {
        // Generic encoding for anything else
        return `@v1.0{
  #${text.includes('?') ? 'request~information' : 'statement'}
  #topic{
    #c${Math.floor(1000 + Math.random() * 9000)}~${extractMainTopic(text).toLowerCase().replace(/\s+/g, '_')}
  }
}`;
    }
}

// Extract main entities being compared from text
function extractEntities(text) {
    // Very simplified entity extraction
    const matches = text.match(/compare\s+([a-zA-Z\s]+)\s+and\s+([a-zA-Z\s]+)/i) || 
                    text.match(/difference\s+between\s+([a-zA-Z\s]+)\s+and\s+([a-zA-Z\s]+)/i);
    
    if (matches && matches.length >= 3) {
        return [matches[1].trim(), matches[2].trim()];
    }
    
    // Fallback: just return empty array
    return [];
}

// Extract main topic from text (very simplified)
function extractMainTopic(text) {
    // Remove common question words and get the first few words
    const simplifiedText = text
        .replace(/^(what|when|where|who|why|how) (is|are|was|were) (the|a|an) /i, '')
        .replace(/^(what|when|where|who|why|how) (is|are|was|were) /i, '')
        .replace(/\?/g, '');
    
    const words = simplifiedText.split(/\s+/);
    
    // Find a noun or noun phrase (very basic approach)
    // In a real implementation, this would use NLP libraries
    if (words.length > 3) {
        return words.slice(0, 3).join(' ');
    } else if (words.length > 0) {
        return words[0];
    } else {
        return 'unknown_topic';
    }
}

// Simulate decoder (simplified version for demonstration)
function simulateDecoder(llmclCode) {
    try {
        // Parse the LLM-CL code to extract key components
        // This is a simplified parser for demonstration
        
        // Extract message type
        let messageType = 'statement';
        if (llmclCode.includes('#request')) {
            messageType = 'request';
            if (llmclCode.includes('~information')) {
                messageType = 'question';
            } else if (llmclCode.includes('~explanation')) {
                messageType = 'explanation request';
            } else if (llmclCode.includes('~comparison')) {
                messageType = 'comparison request';
            }
        }
        
        // Extract topics
        const topics = [];
        const topicMatches = llmclCode.match(/#c\d+~([a-zA-Z_]+)/g) || [];
        topicMatches.forEach(match => {
            const namePart = match.split('~')[1];
            if (namePart) {
                topics.push(namePart.replace(/_/g, ' '));
            }
        });
        
        // Extract quantifiers
        let quantity = '';
        const quantityMatch = llmclCode.match(/\$quantity\{([^}]+)\}/);
        if (quantityMatch && quantityMatch[1]) {
            quantity = quantityMatch[1].trim();
        }
        
        // Generate natural language based on parsed components
        switch (messageType) {
            case 'question':
                return `What ${quantity ? `are the ${quantity}` : 'is'} ${topics.join(', ')}?`;
                
            case 'explanation request':
                return `Please explain ${topics.join(', ')} ${extractRelationships(llmclCode)}.`;
                
            case 'comparison request':
                return `Compare ${topics.slice(0, 2).join(' and ')} in terms of their similarities and differences.`;
                
            default:
                return `The ${topics.join(', ')} ${topics.length > 1 ? 'are' : 'is'} important to understand.`;
        }
    } catch (error) {
        console.error('Error decoding LLM-CL:', error);
        return 'Error decoding LLM-CL. Please check the syntax.';
    }
}

// Extract relationships from LLM-CL code
function extractRelationships(llmclCode) {
    const relationships = [];
    
    // Extract impact relationships
    if (llmclCode.includes('~impact')) {
        const impactMatches = llmclCode.match(/~impact\{([^}]+)\}/);
        if (impactMatches && impactMatches[1]) {
            const impactAreas = [];
            const areaMatches = impactMatches[1].match(/#c\d+~([a-zA-Z_]+)/g) || [];
            areaMatches.forEach(match => {
                const namePart = match.split('~')[1];
                if (namePart) {
                    impactAreas.push(namePart.replace(/_/g, ' '));
                }
            });
            
            if (impactAreas.length > 0) {
                relationships.push(`and its impact on ${impactAreas.join(', ')}`);
            }
        }
    }
    
    return relationships.join(' ');
}

// Update token counts and show comparison
function updateTokenCounts(nlText, llmclCode) {
    const nlTokenCount = window.appUtils.countTokens(nlText);
    const llmclTokenCount = window.appUtils.countTokens(llmclCode);
    
    // Calculate reduction percentage
    const reductionPercent = nlTokenCount > 0 ? 
        Math.round((nlTokenCount - llmclTokenCount) / nlTokenCount * 100) : 0;
    
    // Update the UI
    document.getElementById('nl-token-count').textContent = `${nlTokenCount} tokens`;
    document.getElementById('llmcl-token-count').textContent = `${llmclTokenCount} tokens`;
    document.getElementById('token-reduction').textContent = `${reductionPercent}% reduction`;
}

// Format LLM-CL with syntax highlighting for display
function formatLLMCL(code) {
    return code
        .replace(/#[a-zA-Z0-9_~]+/g, '<span class="token-concept">$&</span>')
        .replace(/~[a-zA-Z0-9_]+/g, '<span class="token-relation">$&</span>')
        .replace(/\$[a-zA-Z0-9_]+/g, '<span class="token-quantifier">$&</span>')
        .replace(/\^[a-zA-Z0-9_.#]+/g, '<span class="token-reference">$&</span>')
        .replace(/@v[0-9.]+/g, '<span class="token-version">$&</span>')
        .replace(/[{}]/g, '<span class="token-structural">$&</span>');
}

// Initialize visualizations
function initVisualizations() {
    // Tree visualization for hierarchical structure
    window.treeVisualization = {
        svg: d3.select('#tree-visualization').append('svg')
            .attr('width', '100%')
            .attr('height', '100%'),
            
        resize: function() {
            const container = document.getElementById('tree-visualization');
            if (container) {
                this.svg
                    .attr('width', container.clientWidth)
                    .attr('height', container.clientHeight);
                // Redraw if data exists
                if (this.data) {
                    this.draw(this.data);
                }
            }
        },
        
        draw: function(data) {
            this.data = data;
            this.svg.selectAll('*').remove();
            
            const width = this.svg.node().clientWidth;
            const height = this.svg.node().clientHeight;
            
            // Create tree layout
            const treeLayout = d3.tree().size([width - 60, height - 60]);
            
            // Convert data to hierarchy
            const root = d3.hierarchy(data);
            treeLayout(root);
            
            // Append links
            this.svg.append('g')
                .attr('transform', 'translate(30, 30)')
                .selectAll('path')
                .data(root.links())
                .enter()
                .append('path')
                .attr('class', 'link')
                .attr('d', d3.linkHorizontal()
                    .x(d => d.y * 0.6)
                    .y(d => d.x));
            
            // Append nodes
            const nodes = this.svg.append('g')
                .attr('transform', 'translate(30, 30)')
                .selectAll('g')
                .data(root.descendants())
                .enter()
                .append('g')
                .attr('transform', d => `translate(${d.y * 0.6}, ${d.x})`);
            
            // Add circles to nodes
            nodes.append('circle')
                .attr('r', 6)
                .attr('class', d => {
                    if (d.data.type === 'concept') return 'token-concept';
                    if (d.data.type === 'relation') return 'token-relation';
                    if (d.data.type === 'quantifier') return 'token-quantifier';
                    if (d.data.type === 'reference') return 'token-reference';
                    return '';
                });
            
            // Add text labels
            nodes.append('text')
                .attr('dy', 3)
                .attr('x', d => d.children ? -8 : 8)
                .style('text-anchor', d => d.children ? 'end' : 'start')
                .text(d => d.data.name);
        }
    };
    
    // Token visualization (show token types distribution)
    window.tokenVisualization = {
        chart: null,
        
        resize: function() {
            if (this.chart) {
                this.chart.resize();
            }
        },
        
        draw: function(data) {
            const canvas = document.getElementById('token-visualization');
            const ctx = canvas.getContext('2d');
            
            // Get token type counts
            const tokenTypes = {
                'Concepts': (data.match(/#[a-zA-Z0-9_~]+/g) || []).length,
                'Relations': (data.match(/~[a-zA-Z0-9_]+(?!\})/g) || []).length,
                'Quantifiers': (data.match(/\$[a-zA-Z0-9_]+/g) || []).length,
                'References': (data.match(/\^[a-zA-Z0-9_.#]+/g) || []).length,
                'Structural': (data.match(/[{}]/g) || []).length
            };
            
            if (this.chart) {
                this.chart.destroy();
            }
            
            // Create chart
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(tokenTypes),
                    datasets: [{
                        label: 'Token Distribution',
                        data: Object.values(tokenTypes),
                        backgroundColor: [
                            '#2563eb', // Concepts - Blue
                            '#7c3aed', // Relations - Purple
                            '#059669', // Quantifiers - Green
                            '#d97706', // References - Amber
                            '#6b7280'  // Structural - Gray
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Token Type Distribution'
                    }
                }
            });
        }
    };
    
    // Perform initial resize
    window.treeVisualization.resize();
}

// Update visualizations with new data
function updateVisualizations(llmclCode) {
    // Parse the LLM-CL code to create a hierarchical structure
    const hierarchy = parseLLMCL(llmclCode);
    
    // Update tree visualization
    window.treeVisualization.draw(hierarchy);
    
    // Update token visualization
    window.tokenVisualization.draw(llmclCode);
}

// Parse LLM-CL code into a hierarchical structure for visualization
// This is a simplified parser for demonstration
function parseLLMCL(code) {
    try {
        // Basic parsing to create a hierarchical structure
        // In a real implementation, this would use the actual parser
        
        // Extract version
        const versionMatch = code.match(/@v([0-9.]+)/);
        const version = versionMatch ? versionMatch[1] : '1.0';
        
        // Create root node
        const root = {
            name: `v${version}`,
            type: 'version',
            children: []
        };
        
        // Extract top-level concepts
        const lines = code.split('\n');
        let currentParent = null;
        let indentLevel = 0;
        let nodeStack = [root];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Calculate the indent level
            const spaces = lines[i].search(/\S|$/);
            const currentIndent = Math.floor(spaces / 2);
            
            // Handle nesting based on indentation
            if (currentIndent > indentLevel) {
                // Going deeper in nesting
                nodeStack.push(currentParent);
            } else if (currentIndent < indentLevel) {
                // Going back up in nesting
                for (let j = 0; j < indentLevel - currentIndent; j++) {
                    nodeStack.pop();
                }
            }
            
            // Update indent level
            indentLevel = currentIndent;
            
            // Create node for current line
            if (line.startsWith('#')) {
                // Concept
                const conceptMatch = line.match(/#([a-zA-Z0-9_~]+)(?:{|$)/);
                if (conceptMatch) {
                    currentParent = {
                        name: conceptMatch[1],
                        type: 'concept',
                        children: []
                    };
                    nodeStack[nodeStack.length - 1].children.push(currentParent);
                }
            } else if (line.startsWith('~')) {
                // Relation
                const relationMatch = line.match(/~([a-zA-Z0-9_]+)(?:{|$)/);
                if (relationMatch) {
                    currentParent = {
                        name: relationMatch[1],
                        type: 'relation',
                        children: []
                    };
                    nodeStack[nodeStack.length - 1].children.push(currentParent);
                }
            } else if (line.startsWith('$')) {
                // Quantifier
                const quantifierMatch = line.match(/\$([a-zA-Z0-9_]+)(?:{|$)/);
                if (quantifierMatch) {
                    currentParent = {
                        name: quantifierMatch[1],
                        type: 'quantifier',
                        children: []
                    };
                    nodeStack[nodeStack.length - 1].children.push(currentParent);
                }
            } else if (line.startsWith('^')) {
                // Reference
                const referenceMatch = line.match(/\^([a-zA-Z0-9_.#]+)(?:{|$)/);
                if (referenceMatch) {
                    currentParent = {
                        name: referenceMatch[1],
                        type: 'reference',
                        children: []
                    };
                    nodeStack[nodeStack.length - 1].children.push(currentParent);
                }
            }
        }
        
        return root;
    } catch (error) {
        console.error('Error parsing LLM-CL:', error);
        return { name: 'error', type: 'error', children: [] };
    }
}
