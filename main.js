// LLM-CL Educational Demonstration - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initTabs();
    initLanguageSelector();
    initAIAssistModal();
    
    // Load the example data
    loadExampleData();
});

// Tab switching functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Show the corresponding tab content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Initialize any visualizations that might need to be resized
            if (tabId === 'encoder-decoder') {
                if (window.treeVisualization) window.treeVisualization.resize();
                if (window.tokenVisualization) window.tokenVisualization.resize();
            } else if (tabId === 'compiler') {
                if (window.compilerVisualization) window.compilerVisualization.resize();
            } else if (tabId === 'chatbot') {
                if (window.chatbotComparison) window.chatbotComparison.resize();
            }
        });
    });
}

// Language selector functionality
function initLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    
    languageSelector.addEventListener('change', function() {
        const language = this.value;
        changeLanguage(language);
    });
}

// Change UI language
function changeLanguage(language) {
    // Load translation data
    fetch(`translations/${language}.json`)
        .then(response => response.json())
        .then(translations => {
            // Apply translations to all elements with a data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (translations[key]) {
                    element.textContent = translations[key];
                }
            });
            
            // Update placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                if (translations[key]) {
                    element.setAttribute('placeholder', translations[key]);
                }
            });
        })
        .catch(error => {
            console.error('Error loading translations:', error);
        });
}

// AI Assist modal functionality
function initAIAssistModal() {
    const aiAssistButton = document.getElementById('ai-assist-button');
    const aiAssistModal = document.getElementById('ai-assist-modal');
    const aiAssistCancel = document.getElementById('ai-assist-cancel');
    const aiAssistSubmit = document.getElementById('ai-assist-submit');
    const aiAssistOptions = document.querySelectorAll('.ai-assist-option');
    const aiAssistPrompt = document.getElementById('ai-assist-prompt');
    
    // Show modal
    aiAssistButton.addEventListener('click', () => {
        aiAssistModal.classList.remove('hidden');
    });
    
    // Hide modal
    aiAssistCancel.addEventListener('click', () => {
        aiAssistModal.classList.add('hidden');
    });
    
    // Option selection
    aiAssistOptions.forEach(option => {
        option.addEventListener('click', () => {
            aiAssistPrompt.value = option.textContent;
        });
    });
    
    // Submit AI assist request
    aiAssistSubmit.addEventListener('click', () => {
        const prompt = aiAssistPrompt.value;
        const llmclInput = document.getElementById('llmcl-input').value;
        
        // Call the DeepSeek API
        requestAIAssistance(prompt, llmclInput);
        
        // Hide modal
        aiAssistModal.classList.add('hidden');
    });
}

// Request AI assistance from DeepSeek
function requestAIAssistance(prompt, llmclCode) {
    // Show loading state
    const outputElement = document.getElementById('llmcl-input');
    outputElement.value = "Processing request...";
    
    // Create API request for DeepSeek
    const apiUrl = "https://api.deepseek.com/v1/chat/completions";
    const apiKey = "YOUR_DEEPSEEK_API_KEY"; // This would be configured by the user
    
    // Create the prompt for the API
    let fullPrompt = `You are an expert in LLM Communication Language (LLM-CL). 
I have the following LLM-CL code:

\`\`\`
${llmclCode}
\`\`\`

I need help with: ${prompt}

Please provide an improved version of the code with explanations of the changes.`;

    // For demo purposes, we'll simulate the API call
    setTimeout(() => {
        // This would be replaced with actual API call in production
        const improvedCode = simulateAIAssistance(prompt, llmclCode);
        outputElement.value = improvedCode;
        
        // Highlight the changes
        highlightChanges(llmclCode, improvedCode);
    }, 1500);
}

// Simulate AI assistance (in a real implementation, this would be an actual API call)
function simulateAIAssistance(prompt, llmclCode) {
    // Simple simulation based on the prompt
    if (prompt.includes("syntax")) {
        return fixSyntaxErrors(llmclCode);
    } else if (prompt.includes("optimize") || prompt.includes("efficiency")) {
        return optimizeTokenEfficiency(llmclCode);
    } else if (prompt.includes("convert")) {
        return convertExampleNaturalLanguage(llmclCode);
    } else if (prompt.includes("semantic") || prompt.includes("precision")) {
        return addSemanticPrecision(llmclCode);
    } else if (prompt.includes("explain")) {
        // Just return the original code in this case, explanation would be provided separately
        return llmclCode;
    } else {
        // Generic improvement
        return improveGeneric(llmclCode);
    }
}

// Example improvement functions (these would be more sophisticated in a real implementation)
function fixSyntaxErrors(code) {
    // Example syntax fixes
    let fixed = code;
    
    // Fix missing closing braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    
    if (openBraces > closeBraces) {
        for (let i = 0; i < openBraces - closeBraces; i++) {
            fixed += "\n}";
        }
    }
    
    // Fix missing version marker
    if (!fixed.includes('@v')) {
        fixed = '@v1.0' + fixed;
    }
    
    return fixed;
}

function optimizeTokenEfficiency(code) {
    // Example optimizations
    let optimized = code;
    
    // Replace verbose concept names with concept IDs
    optimized = optimized.replace(/#artificial_intelligence/g, '#c142');
    optimized = optimized.replace(/#machine_learning/g, '#c501');
    optimized = optimized.replace(/#neural_networks/g, '#c4230');
    
    return optimized;
}

function convertExampleNaturalLanguage(code) {
    // Example conversion (would normally use the encoder)
    if (code.toLowerCase().includes("what are the three main approaches")) {
        return `@v1.0{
  #request~information
  #topic{
    #c501~approaches 
    #c142~agi
    #c4492~research
  }
  $quantity{3}
}`;
    }
    return code;
}

function addSemanticPrecision(code) {
    // Add qualifiers and specificity
    let precise = code;
    
    // Add qualifiers to concepts
    precise = precise.replace(/#c142(?!~)/g, '#c142~general');
    precise = precise.replace(/#c501(?!~)/g, '#c501~modern');
    
    // Add confidence markers where missing
    if (!precise.includes('$')) {
        precise = precise.replace(/}/g, ' $1.0}');
    }
    
    return precise;
}

function improveGeneric(code) {
    // Generic improvements
    let improved = code;
    
    // Add structure if it's just a flat list
    if ((improved.match(/{/g) || []).length < 2) {
        improved = improved.replace(/\n\s+#([^\n{]+)/g, '\n  #$1{$0.9}');
    }
    
    return improved;
}

// Highlight changes between original and improved code
function highlightChanges(original, improved) {
    // This would be a more sophisticated diff implementation in a real app
    console.log("Original:", original);
    console.log("Improved:", improved);
}

// Load example data for demonstration
function loadExampleData() {
    // Add some example data to the inputs
    document.getElementById('nl-input').value = "What are the three main approaches to artificial general intelligence research?";
    
    document.getElementById('llmcl-input').value = `@v1.0{
  #request~information
  #topic{
    #c501~approaches 
    #c142~agi
    #c4492~research
  }
  $quantity{3}
}`;

    document.getElementById('compiler-input').value = `@v1.0{
  #request~information
  #topic{
    #c501~approaches 
    #c142~agi
    #c4492~research
  }
  $quantity{3}
}`;
}

// Token counting utility
function countTokens(text) {
    // Simple approximation for demonstration purposes
    // In a real implementation, this would use a proper tokenizer
    if (!text) return 0;
    return Math.ceil(text.split(/\s+/).length * 1.3);
}

// Export utility functions for use in other modules
window.appUtils = {
    countTokens: countTokens,
    simulateAIAssistance: simulateAIAssistance
};
