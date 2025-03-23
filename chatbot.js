// LLM-CL Educational Demonstration - Chatbot Comparison

document.addEventListener('DOMContentLoaded', function() {
    initChatbot();
    setupApiKeyConfiguration();
});

// DeepSeek API configuration
let deepseekApiKey = '';

function initChatbot() {
    // Initialize both chat interfaces
    initRegularLLMChat();
    initLLMCLChat();
    
    // Initialize performance comparison chart
    initPerformanceComparisonChart();
}

// Setup API key configuration
function setupApiKeyConfiguration() {
    const apiKeyInput = document.getElementById('deepseek-api-key');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const apiKeyStatus = document.getElementById('api-key-status');
    
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem('deepseekApiKey');
    if (savedApiKey) {
        deepseekApiKey = savedApiKey;
        apiKeyInput.value = savedApiKey;
        apiKeyStatus.textContent = 'API Key: ✓ Configured';
        apiKeyStatus.className = 'text-green-600 text-sm';
    }
    
    // Save API key
    saveApiKeyButton.addEventListener('click', () => {
        const newApiKey = apiKeyInput.value.trim();
        if (newApiKey) {
            deepseekApiKey = newApiKey;
            localStorage.setItem('deepseekApiKey', newApiKey);
            apiKeyStatus.textContent = 'API Key: ✓ Configured';
            apiKeyStatus.className = 'text-green-600 text-sm';
        } else {
            apiKeyStatus.textContent = 'API Key: ✗ Missing';
            apiKeyStatus.className = 'text-red-600 text-sm';
        }
    });
}

// Initialize regular LLM chat interface
function initRegularLLMChat() {
    const chatInput = document.getElementById('llm-chat-input');
    const chatSendButton = document.getElementById('llm-chat-send');
    const chatMessages = document.getElementById('llm-chat-messages');
    
    // Add event listeners
    chatSendButton.addEventListener('click', () => {
        sendRegularChatMessage();
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendRegularChatMessage();
        }
    });
    
    // Add a welcome message
    addChatMessage(chatMessages, 'LLM Assistant', 'Hello! I am a standard LLM assistant powered by DeepSeek. How can I help you today?', false);
}

// Initialize LLM-CL chat interface
function initLLMCLChat() {
    const chatInput = document.getElementById('llmcl-chat-input');
    const chatSendButton = document.getElementById('llmcl-chat-send');
    const chatMessages = document.getElementById('llmcl-chat-messages');
    
    // Add event listeners
    chatSendButton.addEventListener('click', () => {
        sendLLMCLChatMessage();
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendLLMCLChatMessage();
        }
    });
    
    // Add a welcome message
    addChatMessage(chatMessages, 'LLM-CL Assistant', 'Hello! I am an LLM-CL enhanced assistant powered by DeepSeek. How can I help you today?', false);
    
    // Add the underlying LLM-CL message (for educational purposes)
    const llmclWelcome = `@v1.0{
  #response~greeting
  #intent{
    #service~assistance
    $availability{high}
  }
}`;
    addLLMCLMessage(chatMessages, llmclWelcome);
}

// Send a message in the regular LLM chat
function sendRegularChatMessage() {
    const chatInput = document.getElementById('llm-chat-input');
    const chatMessages = document.getElementById('llm-chat-messages');
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;
    
    // Check if API key is configured
    if (!deepseekApiKey) {
        addChatMessage(chatMessages, 'System', 'Please configure your DeepSeek API key in the settings panel.', false);
        return;
    }
    
    // Add user message
    addChatMessage(chatMessages, 'You', messageText, true);
    
    // Clear input
    chatInput.value = '';
    
    // Start the timer for response time measurement
    const startTime = performance.now();
    
    // Simulate thinking with a loading message
    const loadingMessageId = 'loading-' + Date.now();
    addChatMessage(chatMessages, 'LLM Assistant', '<span class="loading">Thinking...</span>', false, loadingMessageId);
    
    // Call DeepSeek API
    callDeepSeekApi(messageText, false)
        .then(response => {
            // Remove loading message
            document.getElementById(loadingMessageId)?.remove();
            
            // Add assistant response
            addChatMessage(chatMessages, 'LLM Assistant', response.text, false);
            
            // Calculate and display metrics
            const endTime = performance.now();
            const responseTime = ((endTime - startTime) / 1000).toFixed(2);
            const tokensUsed = response.usage.total_tokens;
            
            // Update metrics display
            document.getElementById('llm-response-time').textContent = responseTime + 's';
            document.getElementById('llm-tokens-used').textContent = tokensUsed;
            
            // Update comparison chart
            updatePerformanceComparisonChart({
                type: 'regular',
                responseTime: parseFloat(responseTime),
                tokensUsed: tokensUsed
            });
        })
        .catch(error => {
            // Remove loading message
            document.getElementById(loadingMessageId)?.remove();
            
            // Show error message
            addChatMessage(chatMessages, 'System', `Error: ${error.message}`, false);
        });
}

// Send a message in the LLM-CL chat
function sendLLMCLChatMessage() {
    const chatInput = document.getElementById('llmcl-chat-input');
    const chatMessages = document.getElementById('llmcl-chat-messages');
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;
    
    // Check if API key is configured
    if (!deepseekApiKey) {
        addChatMessage(chatMessages, 'System', 'Please configure your DeepSeek API key in the settings panel.', false);
        return;
    }
    
    // Add user message
    addChatMessage(chatMessages, 'You', messageText, true);
    
    // Clear input
    chatInput.value = '';
    
    // Start the timer for response time measurement
    const startTime = performance.now();
    
    // Simulate thinking with a loading message
    const loadingMessageId = 'llmcl-loading-' + Date.now();
    addChatMessage(chatMessages, 'LLM-CL Assistant', '<span class="loading">Thinking...</span>', false, loadingMessageId);
    
    // First encode the natural language to LLM-CL
    encodeToLLMCL(messageText)
        .then(encodedQuery => {
            // Add LLM-CL representation of the user's message
            addLLMCLMessage(chatMessages, encodedQuery);
            
            // Then generate a response using LLM-CL
            return callDeepSeekApiWithLLMCL(encodedQuery);
        })
        .then(llmclResponse => {
            // Then decode the LLM-CL response back to natural language
            return decodeFromLLMCL(llmclResponse.llmclText)
                .then(decodedResponse => ({
                    text: decodedResponse,
                    llmclText: llmclResponse.llmclText,
                    usage: llmclResponse.usage
                }));
        })
        .then(response => {
            // Remove loading message
            document.getElementById(loadingMessageId)?.remove();
            
            // Add assistant response
            addChatMessage(chatMessages, 'LLM-CL Assistant', response.text, false);
            
            // Add the underlying LLM-CL message
            addLLMCLMessage(chatMessages, response.llmclText);
            
            // Calculate and display metrics
            const endTime = performance.now();
            const responseTime = ((endTime - startTime) / 1000).toFixed(2);
            const llmclTokens = response.usage.total_tokens;
            
            // Estimate what the regular tokens would have been
            const regularTokens = estimateTokens(messageText) + estimateTokens(response.text);
            
            // Update metrics display
            document.getElementById('llmcl-response-time').textContent = responseTime + 's';
            document.getElementById('llmcl-tokens-used').textContent = llmclTokens + ' (' + Math.round((llmclTokens / regularTokens) * 100) + '% of regular)';
            
            // Update comparison chart
            updatePerformanceComparisonChart({
                type: 'llmcl',
                responseTime: parseFloat(responseTime),
                tokensUsed: llmclTokens,
                regularTokens: regularTokens
            });
        })
        .catch(error => {
            // Remove loading message
            document.getElementById(loadingMessageId)?.remove();
            
            // Show error message
            addChatMessage(chatMessages, 'System', `Error: ${error.message}`, false);
        });
}

// Call DeepSeek API with natural language
async function callDeepSeekApi(messageText, isSystem = false) {
    try {
        // Create the API request
        const apiUrl = "https://api.deepseek.com/v1/chat/completions";
        
        // Prepare the request body
        const requestBody = {
            model: "deepseek-chat",
            messages: [
                {
                    role: isSystem ? "system" : "user",
                    content: messageText
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        };
        
        // Send the request
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        return {
            text: data.choices[0].message.content,
            usage: data.usage
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        } else {
            throw error;
        }
    }
}

// Encode natural language to LLM-CL using DeepSeek
async function encodeToLLMCL(text) {
    try {
        // Create a prompt for the encoder
        const encoderPrompt = `You are an expert LLM-CL encoder. Your task is to convert natural language to LLM-CL format.
LLM-CL is a specialized language for efficient communication between language models.

Convert the following natural language text to LLM-CL format:
"${text}"

Rules:
1. Use the most concise representation possible
2. Include version marker (@v1.0)
3. Use concept IDs (#c123) for key concepts
4. Use relations (~has, ~is, etc.) to express relationships
5. Use hierarchical structure with proper nesting
6. Output only valid LLM-CL code with no explanation

LLM-CL:`;

        // Call DeepSeek API with the encoder prompt
        const response = await callDeepSeekApi(encoderPrompt, true);
        
        // Extract the LLM-CL code from the response
        let llmclCode = response.text.trim();
        
        // Fix common formatting issues
        if (!llmclCode.startsWith('@v')) {
            llmclCode = '@v1.0' + llmclCode;
        }
        
        if (!llmclCode.includes('{')) {
            llmclCode = '@v1.0{\n  ' + llmclCode.replace('@v1.0', '') + '\n}';
        }
        
        return llmclCode;
    } catch (error) {
        // Fallback to simulated encoder if API fails
        console.error('Encoder API error:', error);
        return simulateEncoder(text);
    }
}

// Encode natural language to LLM-CL with LLM-CL
async function callDeepSeekApiWithLLMCL(llmclQuery) {
    try {
        // Create a prompt for LLM-CL processing
        const llmclPrompt = `You are an LLM-CL processor. You think and respond in LLM-CL format.
Process the following LLM-CL query and provide an appropriate LLM-CL response:

${llmclQuery}

Your response must:
1. Use proper LLM-CL syntax (@v1.0{...})
2. Include appropriate response type (#response~...)
3. Use concept IDs and relations consistently with the query
4. Maintain hierarchical structure
5. Output only LLM-CL code with no explanation

LLM-CL response:`;

        // Call DeepSeek API with the LLM-CL prompt
        const response = await callDeepSeekApi(llmclPrompt, true);
        
        // Extract the LLM-CL code from the response
        let llmclCode = response.text.trim();
        
        // Fix common formatting issues
        if (!llmclCode.startsWith('@v')) {
            llmclCode = '@v1.0' + llmclCode;
        }
        
        if (!llmclCode.includes('{')) {
            llmclCode = '@v1.0{\n  ' + llmclCode.replace('@v1.0', '') + '\n}';
        }
        
        return {
            llmclText: llmclCode,
            usage: response.usage
        };
    } catch (error) {
        // Fallback to simulated response if API fails
        console.error('LLM-CL API error:', error);
        return {
            llmclText: simulateLLMCLResponse(llmclQuery),
            usage: { total_tokens: estimateTokens(llmclQuery) * 2 }
        };
    }
}

// Decode LLM-CL to natural language using DeepSeek
async function decodeFromLLMCL(llmclCode) {
    try {
        // Create a prompt for the decoder
        const decoderPrompt = `You are an expert LLM-CL decoder. Your task is to convert LLM-CL code to natural language.

Convert the following LLM-CL code to clear, natural language:
\`\`\`
${llmclCode}
\`\`\`

Rules:
1. Expand all concept IDs to their natural language equivalents
2. Convert hierarchical structure to flowing text
3. Expand relations and qualifiers into natural expressions
4. Make the output read naturally as if written by a human
5. Output only the decoded natural language with no explanation

Natural language:`;

        // Call DeepSeek API with the decoder prompt
        const response = await callDeepSeekApi(decoderPrompt, true);
        
        // Return the natural language text
        return response.text.trim();
    } catch (error) {
        // Fallback to simulated decoder if API fails
        console.error('Decoder API error:', error);
        return simulateDecoder(llmclCode);
    }
}

// Add a chat message to the UI
function addChatMessage(container, sender, message, isUser, messageId = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'message-user' : 'message-bot'}`;
    if (messageId) {
        messageDiv.id = messageId;
    }
    
    const senderSpan = document.createElement('div');
    senderSpan.className = 'font-semibold text-sm';
    senderSpan.textContent = sender;
    
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = message;
    
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(contentDiv);
    
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Add an LLM-CL code block for educational purposes
function addLLMCLMessage(container, llmclCode) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-llmcl text-xs mt-1 mb-3 p-2 border border-gray-300 bg-gray-50 rounded overflow-auto';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'text-gray-500 mb-1';
    titleDiv.textContent = 'LLM-CL Representation:';
    
    const codeDiv = document.createElement('pre');
    codeDiv.className = 'font-mono';
    codeDiv.innerHTML = formatLLMCL(llmclCode);
    
    const tokenDiv = document.createElement('div');
    tokenDiv.className = 'text-green-600 text-xs mt-1';
    const tokens = estimateTokens(llmclCode);
    tokenDiv.textContent = `Tokens: ${tokens}`;
    
    messageDiv.appendChild(titleDiv);
    messageDiv.appendChild(codeDiv);
    messageDiv.appendChild(tokenDiv);
    
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Initialize the performance comparison chart
function initPerformanceComparisonChart() {
    const canvas = document.getElementById('chatbot-comparison');
    const ctx = canvas.getContext('2d');
    
    // Initialize the chart with empty data
    window.performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Response Time (s)', 'Tokens Used'],
            datasets: [
                {
                    label: 'Regular LLM',
                    data: [0, 0],
                    backgroundColor: 'rgba(79, 70, 229, 0.7)', // Indigo
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1
                },
                {
                    label: 'LLM-CL',
                    data: [0, 0],
                    backgroundColor: 'rgba(5, 150, 105, 0.7)', // Green
                    borderColor: 'rgba(5, 150, 105, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Store metrics for averaging
    window.chatMetrics = {
        regular: {
            responseTimes: [],
            tokensUsed: []
        },
        llmcl: {
            responseTimes: [],
            tokensUsed: [],
            regularTokens: []
        }
    };
}

// Update the performance comparison chart with new data
function updatePerformanceComparisonChart(data) {
    if (!window.performanceChart || !window.chatMetrics) return;
    
    // Update metrics
    if (data.type === 'regular') {
        window.chatMetrics.regular.responseTimes.push(data.responseTime);
        window.chatMetrics.regular.tokensUsed.push(data.tokensUsed);
    } else if (data.type === 'llmcl') {
        window.chatMetrics.llmcl.responseTimes.push(data.responseTime);
        window.chatMetrics.llmcl.tokensUsed.push(data.tokensUsed);
        window.chatMetrics.llmcl.regularTokens.push(data.regularTokens);
    }
    
    // Calculate averages
    const regularResponseTime = average(window.chatMetrics.regular.responseTimes);
    const regularTokens = average(window.chatMetrics.regular.tokensUsed);
    const llmclResponseTime = average(window.chatMetrics.llmcl.responseTimes);
    const llmclTokens = average(window.chatMetrics.llmcl.tokensUsed);
    
    // Update chart data
    window.performanceChart.data.datasets[0].data = [regularResponseTime, regularTokens];
    window.performanceChart.data.datasets[1].data = [llmclResponseTime, llmclTokens];
    
    // Add token reduction percentage as a label on the second bar
    if (window.chatMetrics.llmcl.tokensUsed.length > 0) {
        const reductionPercent = Math.round((1 - (llmclTokens / regularTokens)) * 100);
        window.performanceChart.data.datasets[1].label = `LLM-CL (${reductionPercent}% less tokens)`;
    }
    
    window.performanceChart.update();
}

// Helper function to calculate the average of an array
function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Extract topic from text (very simplified)
function extractTopic(text) {
    // Remove common question phrases
    const simplifiedText = text
        .replace(/^(what|when|where|who|why|how) (is|are|was|were) (the|a|an) /i, '')
        .replace(/^(what|when|where|who|why|how) (is|are|was|were) /i, '')
        .replace(/\?/g, '')
        .replace(/please explain /i, '')
        .replace(/can you explain /i, '')
        .replace(/explain /i, '');
    
    // Just take the first few words as the topic
    const words = simplifiedText.split(/\s+/);
    if (words.length > 2) {
        return words.slice(0, 2).join(' ');
    } else {
        return simplifiedText.trim() || 'topic';
    }
}

// Extract entities being compared from text
function extractComparisonEntities(text) {
    const matches = text.match(/compare\s+([a-zA-Z\s]+)\s+and\s+([a-zA-Z\s]+)/i) || 
                    text.match(/difference\s+between\s+([a-zA-Z\s]+)\s+and\s+([a-zA-Z\s]+)/i);
    
    if (matches && matches.length >= 3) {
        return [matches[1].trim(), matches[2].trim()];
    }
    
    // Fallback
    return ['entity1', 'entity2'];
}

// Generate a random concept ID for demonstration
function generateRandomConceptId() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Estimate token count from text (simplified)
function estimateTokens(text) {
    if (!text) return 0;
    // Simplified token counting for demonstration
    return Math.ceil(text.split(/\s+/).length * 1.3);
}

// Format LLM-CL with syntax highlighting
function formatLLMCL(code) {
    return code
        .replace(/#[a-zA-Z0-9_~]+/g, '<span class="token-concept">$&</span>')
        .replace(/~[a-zA-Z0-9_]+/g, '<span class="token-relation">$&</span>')
        .replace(/\$[a-zA-Z0-9_.]+/g, '<span class="token-quantifier">$&</span>')
        .replace(/\^[a-zA-Z0-9_.#]+/g, '<span class="token-reference">$&</span>')
        .replace(/@v[0-9.]+/g, '<span class="token-version">$&</span>')
        .replace(/[{}]/g, '<span class="token-structural">$&</span>');
}

// Fallback functions in case the API fails

// Simulate an encoder
function simulateEncoder(text) {
    // Very simplified encoding for demonstration
    if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
        return `@v1.0{
  #request~greeting
}`;
    } else if (text.toLowerCase().includes('how are you')) {
        return `@v1.0{
  #request~status
  #target{#c142~assistant}
}`;
    } else if (text.toLowerCase().includes('weather')) {
        return `@v1.0{
  #request~information
  #topic{#c7501~weather}
}`;
    } else if (text.toLowerCase().includes('explain')) {
        const topic = extractTopic(text);
        return `@v1.0{
  #request~explanation
  #topic{#c${generateRandomConceptId()}~${topic.replace(/\s+/g, '_')}}
}`;
    } else if (text.toLowerCase().includes('compare')) {
        const entities = extractComparisonEntities(text);
        return `@v1.0{
  #request~comparison
  #entities{
    #c${generateRandomConceptId()}~${entities[0]?.replace(/\s+/g, '_') || 'entity1'}
    #c${generateRandomConceptId()}~${entities[1]?.replace(/\s+/g, '_') || 'entity2'}
  }
}`;
    } else if (text.toLowerCase().includes('llm-cl')) {
        return `@v1.0{
  #request~information
  #topic{#c142~llm_communication_language}
  ~aspects{
    #c6701~purpose
    #c6702~benefits
  }
}`;
    } else {
        return `@v1.0{
  #request~information
  #topic{#c${generateRandomConceptId()}~${extractTopic(text).replace(/\s+/g, '_')}}
}`;
    }
}

// Simulate a response in LLM-CL format
function simulateLLMCLResponse(llmclQuery) {
    // Parse the query to determine the response type
    if (llmclQuery.includes('#request~greeting')) {
        return `@v1.0{
  #response~greeting
  #intent{#c5501~assist}
}`;
    } else if (llmclQuery.includes('#request~status')) {
        return `@v1.0{
  #response~status
  #status{$operational}
  #intent{#c5501~assist}
}`;
    } else if (llmclQuery.includes('#c7501~weather')) {
        return `@v1.0{
  #response~limitation
  #capability{#c7501~weather $absent}
  #alternative{
    #c7502~information_lookup
    ~procedure{
      #step1{#c7503~search_engine}
      #step2{#c7504~weather_service}
    }
  }
}`;
    } else if (llmclQuery.includes('#request~explanation')) {
        // Extract the topic
        const topicMatch = llmclQuery.match(/#c\d+~([a-zA-Z_]+)/);
        const topic = topicMatch ? topicMatch[1].replace(/_/g, ' ') : 'topic';
        
        return `@v1.0{
  #response~explanation
  #topic{#c${generateRandomConceptId()}~${topic.replace(/\s+/g, '_')}}
  #definition{#c${generateRandomConceptId()}~basic_concept}
  #components{
    #c${generateRandomConceptId()}~component1
    #c${generateRandomConceptId()}~component2
    #c${generateRandomConceptId()}~component3
  }
  #applications{
    #c${generateRandomConceptId()}~application1
    #c${generateRandomConceptId()}~application2
  }
}`;
    } else if (llmclQuery.includes('#request~comparison')) {
        // Extract the entities being compared
        const entityMatches = llmclQuery.match(/#c\d+~([a-zA-Z_]+)/g) || [];
        const entities = entityMatches.map(m => m.split('~')[1].replace(/_/g, ' '));
        
        return `@v1.0{
  #response~comparison
  #entities{
    #c${generateRandomConceptId()}~${entities[0]?.replace(/\s+/g, '_') || 'entity1'}
    #c${generateRandomConceptId()}~${entities[1]?.replace(/\s+/g, '_') || 'entity2'}
  }
  ~similarities{
    #c${generateRandomConceptId()}~similarity1
    #c${generateRandomConceptId()}~similarity2
  }
  ~differences{
    #c${generateRandomConceptId()}~difference1
    #c${generateRandomConceptId()}~difference2
    #c${generateRandomConceptId()}~difference3
  }
}`;
    } else if (llmclQuery.includes('#c142~llm_communication_language')) {
        return `@v1.0{
  #response~information
  #topic{#c142~llm_communication_language}
  #definition{
    #c243~specialized_language
    ~purpose{
      #c244~communication
      #c245~efficiency
      #between{#c142~llms}
    }
  }
  #benefits{
    #c246~token_reduction $0.7
    #c247~semantic_precision $0.9
    #c248~computational_efficiency $0.8
  }
}`;
    } else {
        return `@v1.0{
  #response~information
  #information{
    #c${generateRandomConceptId()}~key_point1
    #c${generateRandomConceptId()}~key_point2
    #c${generateRandomConceptId()}~key_point3
  }
  #certainty{$0.85}
}`;
    }
}

// Simulate a decoder for LLM-CL
function simulateDecoder(llmclCode) {
    // Basic response patterns based on the LLM-CL code
    if (llmclCode.includes('#response~greeting')) {
        return 'Hello! I am ready to assist you.';
    } else if (llmclCode.includes('#response~status')) {
        return 'I am operating normally and ready to help you.';
    } else if (llmclCode.includes('#capability{#c7501~weather $absent}')) {
        return 'I don\'t have access to real-time weather data. You could check a weather service website for the most current information.';
    } else if (llmclCode.includes('#response~explanation')) {
        // Extract the topic
        const topicMatch = llmclCode.match(/#topic\{#c\d+~([a-zA-Z_]+)\}/);
        const topic = topicMatch ? topicMatch[1].replace(/_/g, ' ') : 'this topic';
        
        return `Here's an explanation of ${topic}: It refers to a concept with several key components. These include various elements that work together. ${topic} has practical applications in multiple areas.`;
    } else if (llmclCode.includes('#response~comparison')) {
        // Extract the entities
        const entityMatches = llmclCode.match(/#c\d+~([a-zA-Z_]+)/g) || [];
        const entities = entityMatches.slice(0, 2).map(m => m.split('~')[1].replace(/_/g, ' '));
        
        return `When comparing ${entities.join(' and ')}, they share some similarities but also have notable differences. Both have common aspects, but they differ in several important ways.`;
    } else if (llmclCode.includes('#topic{#c142~llm_communication_language}')) {
        return 'LLM-CL is a specialized language designed for efficient communication between large language models. Its benefits include significant token reduction (about 70%), improved semantic precision (90%), and enhanced computational efficiency (80%).';
    } else {
        return 'Here is some information on that topic with several key points to consider. This information is provided with approximately 85% certainty based on my knowledge.';
    }
}
