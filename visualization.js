// LLM-CL Educational Demonstration - Visualizations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize visualizations if needed
    window.visualizationRegistry = {};
});

/**
 * Creates or updates a tree visualization for LLM-CL hierarchy
 * @param {string} elementId - ID of the container element
 * @param {Object} data - Hierarchical data structure
 * @param {Object} options - Visualization options
 */
function createTreeVisualization(elementId, data, options = {}) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Set defaults for options
    const opts = {
        width: container.clientWidth,
        height: container.clientHeight,
        margin: options.margin || { top: 30, right: 30, bottom: 30, left: 30 },
        horizontal: options.horizontal !== undefined ? options.horizontal : true,
        nodeRadius: options.nodeRadius || 6,
        nodeColors: options.nodeColors || {
            'concept': '#2563eb',   // Blue
            'relation': '#7c3aed',  // Purple
            'quantifier': '#059669', // Green
            'reference': '#d97706', // Amber
            'version': '#4f46e5',   // Indigo
            'default': '#6b7280'    // Gray
        },
        ...options
    };
    
    // Clear existing visualization
    container.innerHTML = '';
    
    // Create SVG element
    const svg = d3.select(container)
        .append('svg')
        .attr('width', opts.width)
        .attr('height', opts.height)
        .attr('class', 'tree-visualization');
    
    // Calculate usable dimensions
    const width = opts.width - opts.margin.left - opts.margin.right;
    const height = opts.height - opts.margin.top - opts.margin.bottom;
    
    // Create the tree layout
    const treeLayout = d3.tree()
        .size(opts.horizontal ? [height, width] : [width, height])
        .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));
    
    // Convert data to hierarchy
    const root = d3.hierarchy(data);
    treeLayout(root);
    
    // Create a group for the visualization
    const g = svg.append('g')
        .attr('transform', `translate(${opts.margin.left},${opts.margin.top})`);
    
    // Create links
    g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', opts.horizontal ? 
            d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x) :
            d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
        )
        .attr('fill', 'none')
        .attr('stroke', '#999')
        .attr('stroke-width', 1.5);
    
    // Create nodes
    const nodes = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => opts.horizontal ? 
            `translate(${d.y},${d.x})` : 
            `translate(${d.x},${d.y})`
        );
    
    // Add circles to the nodes
    nodes.append('circle')
        .attr('r', opts.nodeRadius)
        .attr('fill', d => {
            const type = d.data.type ? d.data.type.toLowerCase() : 'default';
            return opts.nodeColors[type] || opts.nodeColors.default;
        })
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5);
    
    // Add labels to the nodes
    nodes.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => {
            // Position text based on whether it's a leaf node and orientation
            if (opts.horizontal) {
                return d.children ? -8 : 8;
            } else {
                return 0;
            }
        })
        .attr('y', d => {
            // Position text based on whether it's a leaf node and orientation
            if (opts.horizontal) {
                return 0;
            } else {
                return d.children ? -8 : 8;
            }
        })
        .attr('text-anchor', d => {
            if (opts.horizontal) {
                return d.children ? 'end' : 'start';
            } else {
                return 'middle';
            }
        })
        .text(d => d.data.name || '')
        .attr('font-size', '12px')
        .attr('font-family', 'sans-serif');
    
    // Store the visualization for later reference
    window.visualizationRegistry[elementId] = {
        type: 'tree',
        instance: svg,
        data: data,
        options: opts,
        
        // Method to resize the visualization
        resize: function(newWidth, newHeight) {
            newWidth = newWidth || container.clientWidth;
            newHeight = newHeight || container.clientHeight;
            
            svg.attr('width', newWidth)
               .attr('height', newHeight);
            
            // Recalculate dimensions
            this.options.width = newWidth;
            this.options.height = newHeight;
            
            const width = newWidth - this.options.margin.left - this.options.margin.right;
            const height = newHeight - this.options.margin.top - this.options.margin.bottom;
            
            // Update tree layout
            const treeLayout = d3.tree()
                .size(this.options.horizontal ? [height, width] : [width, height]);
                
            const root = d3.hierarchy(this.data);
            treeLayout(root);
            
            // Update links
            svg.selectAll('.link')
               .attr('d', this.options.horizontal ? 
                   d3.linkHorizontal()
                     .x(d => d.y)
                     .y(d => d.x) :
                   d3.linkVertical()
                     .x(d => d.x)
                     .y(d => d.y)
               );
            
            // Update nodes
            svg.selectAll('.node')
               .attr('transform', d => this.options.horizontal ? 
                   `translate(${d.y},${d.x})` : 
                   `translate(${d.x},${d.y})`
               );
        },
        
        // Method to update the data
        update: function(newData) {
            this.data = newData;
            // Re-render with new data
            createTreeVisualization(elementId, newData, this.options);
        }
    };
    
    return window.visualizationRegistry[elementId];
}

/**
 * Creates or updates a bar chart visualization
 * @param {string} elementId - ID of the canvas element
 * @param {Object} data - Chart data
 * @param {Object} options - Chart options
 */
function createBarChart(elementId, data, options = {}) {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is required for bar charts');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.visualizationRegistry[elementId] && 
        window.visualizationRegistry[elementId].instance) {
        window.visualizationRegistry[elementId].instance.destroy();
    }
    
    // Set defaults for options
    const opts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: options.showLegend !== false,
                position: options.legendPosition || 'top'
            },
            title: {
                display: !!options.title,
                text: options.title || ''
            },
            tooltip: {
                enabled: true
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        },
        ...options
    };
    
    // Create the chart
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: options.type || 'bar',
        data: data,
        options: opts
    });
    
    // Store the visualization for later reference
    window.visualizationRegistry[elementId] = {
        type: 'barChart',
        instance: chart,
        data: data,
        options: opts,
        
        // Method to resize the chart
        resize: function() {
            if (this.instance) {
                this.instance.resize();
            }
        },
        
        // Method to update the data
        update: function(newData) {
            if (!this.instance) return;
            
            if (newData.labels) {
                this.instance.data.labels = newData.labels;
            }
            
            if (newData.datasets) {
                this.instance.data.datasets = newData.datasets;
            }
            
            this.instance.update();
        }
    };
    
    return window.visualizationRegistry[elementId];
}

/**
 * Creates or updates a token distribution visualization
 * @param {string} elementId - ID of the canvas element
 * @param {string} text - LLM-CL code to analyze
 */
function createTokenDistributionChart(elementId, text) {
    // Count tokens by type
    const tokenCounts = {
        'Concepts': (text.match(/#[a-zA-Z0-9_~]+/g) || []).length,
        'Relations': (text.match(/~[a-zA-Z0-9_]+(?!\})/g) || []).length,
        'Quantifiers': (text.match(/\$[a-zA-Z0-9_]+/g) || []).length,
        'References': (text.match(/\^[a-zA-Z0-9_.#]+/g) || []).length,
        'Structural': (text.match(/[{}]/g) || []).length
    };
    
    // Chart data
    const data = {
        labels: Object.keys(tokenCounts),
        datasets: [{
            label: 'Token Distribution',
            data: Object.values(tokenCounts),
            backgroundColor: [
                '#2563eb', // Concepts - Blue
                '#7c3aed', // Relations - Purple
                '#059669', // Quantifiers - Green
                '#d97706', // References - Amber
                '#6b7280'  // Structural - Gray
            ],
            borderColor: [
                '#1d4ed8',
                '#6d28d9',
                '#047857',
                '#b45309',
                '#4b5563'
            ],
            borderWidth: 1
        }]
    };
    
    // Create or update the chart
    return createBarChart(elementId, data, {
        title: 'Token Type Distribution',
        showLegend: false
    });
}

/**
 * Creates or updates a performance comparison visualization
 * @param {string} elementId - ID of the canvas element
 * @param {Object} data - Performance metrics
 */
function createPerformanceComparisonChart(elementId, data) {
    const chartData = {
        labels: data.labels || ['Response Time (s)', 'Tokens Used'],
        datasets: data.datasets || [
            {
                label: 'Regular LLM',
                data: data.regularData || [0, 0],
                backgroundColor: 'rgba(79, 70, 229, 0.7)', // Indigo
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            },
            {
                label: 'LLM-CL',
                data: data.llmclData || [0, 0],
                backgroundColor: 'rgba(5, 150, 105, 0.7)', // Green
                borderColor: 'rgba(5, 150, 105, 1)',
                borderWidth: 1
            }
        ]
    };
    
    // Create or update the chart
    return createBarChart(elementId, chartData, {
        title: 'Performance Comparison',
        showLegend: true,
        legendPosition: 'top'
    });
}

/**
 * Creates an animated compilation process visualization
 * @param {string} elementId - ID of the container element
 */
function createCompilationProcessVisualization(elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear existing visualization
    container.innerHTML = '';
    
    // Create SVG element
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'compilation-visualization');
    
    // Define the pipeline steps
    const steps = [
        { name: 'Source Code', x: width * 0.1, y: height * 0.5 },
        { name: 'Lexical Analysis', x: width * 0.25, y: height * 0.5 },
        { name: 'Syntax Analysis', x: width * 0.4, y: height * 0.5 },
        { name: 'IR Generation', x: width * 0.55, y: height * 0.5 },
        { name: 'Optimization', x: width * 0.7, y: height * 0.5 },
        { name: 'Code Generation', x: width * 0.85, y: height * 0.5 }
    ];
    
    // Draw lines connecting steps
    svg.selectAll('line')
        .data(steps.slice(0, -1))
        .enter()
        .append('line')
        .attr('x1', d => d.x)
        .attr('y1', d => d.y)
        .attr('x2', (d, i) => steps[i + 1].x)
        .attr('y2', (d, i) => steps[i + 1].y)
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 2);
    
    // Draw circles for steps
    svg.selectAll('circle')
        .data(steps)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 10)
        .attr('fill', '#f3f4f6')
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 2);
    
    // Add labels
    svg.selectAll('text')
        .data(steps)
        .enter()
        .append('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y + 25)
        .attr('text-anchor', 'middle')
        .text(d => d.name)
        .attr('font-size', '12px')
        .attr('fill', '#4b5563');
    
    // Store the visualization for later reference
    window.visualizationRegistry[elementId] = {
        type: 'compilationProcess',
        instance: svg,
        data: steps,
        
        // Method to resize the visualization
        resize: function() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            svg.attr('width', width)
               .attr('height', height);
            
            // Update step positions
            const steps = this.data.map((step, i) => {
                return {
                    ...step,
                    x: width * (0.1 + i * 0.15),
                    y: height * 0.5
                };
            });
            
            this.data = steps;
            
            // Update lines
            svg.selectAll('line')
               .data(steps.slice(0, -1))
               .attr('x1', d => d.x)
               .attr('y1', d => d.y)
               .attr('x2', (d, i) => steps[i + 1].x)
               .attr('y2', (d, i) => steps[i + 1].y);
            
            // Update circles
            svg.selectAll('circle')
               .data(steps)
               .attr('cx', d => d.x)
               .attr('cy', d => d.y);
            
            // Update labels
            svg.selectAll('text')
               .data(steps)
               .attr('x', d => d.x)
               .attr('y', d => d.y + 25);
        },
        
        // Method to animate the compilation process
        animate: function(currentStep) {
            if (currentStep >= this.data.length) return;
            
            // Highlight current step
            svg.selectAll('circle')
               .filter((d, i) => i === currentStep)
               .transition()
               .duration(300)
               .attr('fill', '#4f46e5')
               .attr('r', 12);
            
            // Highlight label
            svg.selectAll('text')
               .filter((d, i) => i === currentStep)
               .transition()
               .duration(300)
               .attr('font-weight', 'bold')
               .attr('fill', '#4f46e5');
            
            // Highlight line to next step
            if (currentStep < this.data.length - 1) {
                svg.selectAll('line')
                   .filter((d, i) => i === currentStep)
                   .transition()
                   .duration(300)
                   .attr('stroke', '#4f46e5')
                   .attr('stroke-width', 3);
            }
            
            // After a delay, proceed to next step
            const self = this;
            setTimeout(() => {
                self.animate(currentStep + 1);
            }, 800);
        },
        
        // Method to reset the animation
        reset: function() {
            svg.selectAll('circle')
               .attr('fill', '#f3f4f6')
               .attr('r', 10);
            
            svg.selectAll('text')
               .attr('font-weight', 'normal')
               .attr('fill', '#4b5563');
            
            svg.selectAll('line')
               .attr('stroke', '#d1d5db')
               .attr('stroke-width', 2);
        }
    };
    
    return window.visualizationRegistry[elementId];
}

// Handle window resize events for all visualizations
window.addEventListener('resize', () => {
    // Resize all registered visualizations
    for (const id in window.visualizationRegistry) {
        if (window.visualizationRegistry[id].resize) {
            window.visualizationRegistry[id].resize();
        }
    }
});

// Export necessary functions
window.createTreeVisualization = createTreeVisualization;
window.createBarChart = createBarChart;
window.createTokenDistributionChart = createTokenDistributionChart;
window.createPerformanceComparisonChart = createPerformanceComparisonChart;
window.createCompilationProcessVisualization = createCompilationProcessVisualization;
