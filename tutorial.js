// LLM-CL Educational Demonstration - Interactive Tutorial

document.addEventListener('DOMContentLoaded', function() {
    initTutorial();
});

function initTutorial() {
    // Initialize tutorial variables
    window.tutorialState = {
        currentStep: 0,
        totalSteps: 0,
        tutorialSteps: []
    };
    
    // Load tutorial content
    loadTutorialContent();
    
    // Set up navigation buttons
    document.getElementById('tutorial-prev').addEventListener('click', () => {
        navigateTutorial(-1);
    });
    
    document.getElementById('tutorial-next').addEventListener('click', () => {
        navigateTutorial(1);
    });
}

// Load tutorial content
function loadTutorialContent() {
    // Define tutorial steps
    const tutorialSteps = [
        // Step 1: Introduction
        {
            title: "Introduction to LLM-CL",
            content: `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">What is LLM-CL?</h3>
                    <p class="mb-4">LLM-CL (Large Language Model Communication Language) is a specialized artificial language designed for efficient and precise communication between Large Language Models.</p>
                    <p>Unlike natural languages like English or Chinese, which evolved for human-to-human communication, LLM-CL is specifically optimized for the unique capabilities and constraints of LLMs.</p>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Key benefits of LLM-CL:</h3>
                    <ul class="list-disc pl-6 mb-4">
                        <li><span class="font-semibold">Token Efficiency</span>: 50-75% reduction in token usage compared to natural language</li>
                        <li><span class="font-semibold">Semantic Precision</span>: Near-elimination of ambiguity through explicit structure</li>
                        <li><span class="font-semibold">Computational Alignment</span>: Designed around transformer architecture processing patterns</li>
                        <li><span class="font-semibold">Self-Description</span>: Built-in mechanisms for version compatibility and error correction</li>
                    </ul>
                </div>
                
                <div class="example-container mb-4">
                    <h4 class="font-semibold">Example:</h4>
                    <p class="mb-2">The natural language question:</p>
                    <div class="bg-blue-50 p-2 rounded mb-2">"What are the three main approaches to artificial general intelligence research?"</div>
                    <p class="mb-2">Can be represented in LLM-CL as:</p>
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm">@v1.0{
  #request~information
  #topic{
    #c501~approaches 
    #c142~agi
    #c4492~research
  }
  $quantity{3}
}</pre>
                </div>
            `
        },
        
        // Step 2: Core Syntax
        {
            title: "Core Syntax Elements",
            content: `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">LLM-CL Basic Syntax</h3>
                    <p>LLM-CL uses special token classes to create structured, unambiguous communications.</p>
                </div>
                
                <div class="mb-6">
                    <table class="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-300 p-2">Token Class</th>
                                <th class="border border-gray-300 p-2">Symbol</th>
                                <th class="border border-gray-300 p-2">Function</th>
                                <th class="border border-gray-300 p-2">Example</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 p-2">Directive</td>
                                <td class="border border-gray-300 p-2 text-center"><span class="token-version">@</span></td>
                                <td class="border border-gray-300 p-2">Meta-instructions about message interpretation</td>
                                <td class="border border-gray-300 p-2"><span class="token-version">@v1.0</span></td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 p-2">Conceptual</td>
                                <td class="border border-gray-300 p-2 text-center"><span class="token-concept">#</span></td>
                                <td class="border border-gray-300 p-2">Core semantic concepts (from universal concept space)</td>
                                <td class="border border-gray-300 p-2"><span class="token-concept">#c142~agi</span></td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 p-2">Relational</td>
                                <td class="border border-gray-300 p-2 text-center"><span class="token-relation">~</span></td>
                                <td class="border border-gray-300 p-2">Relationships between concepts</td>
                                <td class="border border-gray-300 p-2"><span class="token-relation">~has</span></td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 p-2">Structural</td>
                                <td class="border border-gray-300 p-2 text-center"><span class="token-structural">{}</span></td>
                                <td class="border border-gray-300 p-2">Hierarchical organization</td>
                                <td class="border border-gray-300 p-2"><span class="token-structural">{...}</span></td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 p-2">Reference</td>
                                <td class="border border-gray-300 p-2 text-center"><span class="token-reference">^</span></td>
                                <td class="border border-gray-300 p-2">Pointers to previous content or shared knowledge</td>
                                <td class="border border-gray-300 p-2"><span class="token-reference">^prev1.#focus</span></td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 p-2">Quantifier</td>
                                <td class="border border-gray-300 p-2 text-center"><span class="token-quantifier">$</span></td>
                                <td class="border border-gray-300 p-2">Precision modifiers for concepts</td>
                                <td class="border border-gray-300 p-2"><span class="token-quantifier">$0.95</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="interactive-element">
                    <h4 class="font-semibold mb-2">Try it yourself!</h4>
                    <p class="mb-2">What would the LLM-CL notation be for the concept "deep learning" with a 90% confidence?</p>
                    <div class="mt-2">
                        <input type="text" id="syntax-exercise" class="w-full p-2 border border-gray-300 rounded" placeholder="Enter your answer here">
                        <div class="flex justify-between mt-2">
                            <button id="check-syntax" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Check Answer</button>
                            <button id="show-syntax-answer" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Show Answer</button>
                        </div>
                        <div id="syntax-feedback" class="mt-2 p-2 rounded hidden"></div>
                    </div>
                </div>
            `
        },
        
        // Step 3: Universal Concept Space
        {
            title: "Universal Concept Space",
            content: `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Universal Concept Space</h3>
                    <p class="mb-4">The Universal Concept Space (UCS) is a shared mapping of concept IDs to semantic meanings that all LLMs can recognize.</p>
                    <p>Instead of using full natural language terms, LLM-CL uses compact identifiers that map to specific concepts:</p>
                </div>
                
                <div class="mb-4">
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm">#c142    // Rather than "artificial_intelligence"
#c501    // Rather than "machine_learning"
#c722    // Rather than "quantum_entanglement"</pre>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Concept Definition Example</h3>
                    <div class="bg-gray-50 p-3 rounded font-mono text-sm overflow-auto">
{
  <span class="text-green-600">"c142"</span>: {
    <span class="text-green-600">"label"</span>: <span class="text-indigo-600">"artificial_intelligence"</span>,
    <span class="text-green-600">"definition"</span>: <span class="text-indigo-600">"The theory and development of computer systems able to perform tasks normally requiring human intelligence"</span>,
    <span class="text-green-600">"related"</span>: [<span class="text-indigo-600">"c143"</span>, <span class="text-indigo-600">"c501"</span>, <span class="text-indigo-600">"c8901"</span>],
    <span class="text-green-600">"hyponyms"</span>: [<span class="text-indigo-600">"c501"</span>, <span class="text-indigo-600">"c9872"</span>],
    <span class="text-green-600">"hypernyms"</span>: [<span class="text-indigo-600">"c140"</span>]
  }
}
                    </div>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Benefits of the Concept Space</h3>
                    <ul class="list-disc pl-6">
                        <li><span class="font-semibold">Compression</span>: Reduced token usage compared to spelling out concepts each time</li>
                        <li><span class="font-semibold">Disambiguation</span>: Each concept has a precise definition, eliminating ambiguity</li>
                        <li><span class="font-semibold">Relational Information</span>: Concepts include their relationships to other concepts</li>
                        <li><span class="font-semibold">Cross-Language Compatibility</span>: Concept IDs work regardless of natural language</li>
                    </ul>
                </div>
                
                <div class="interactive-element">
                    <h4 class="font-semibold mb-2">Concept Space Exploration</h4>
                    <p class="mb-2">Try exploring some common concept IDs:</p>
                    <select id="concept-explorer" class="w-full p-2 border border-gray-300 rounded">
                        <option value="">Select a concept ID</option>
                        <option value="c142">c142 - Artificial Intelligence</option>
                        <option value="c501">c501 - Machine Learning</option>
                        <option value="c502">c502 - Deep Learning</option>
                        <option value="c4230">c4230 - Neural Networks</option>
                        <option value="c117">c117 - Climate Change</option>
                        <option value="c2901">c2901 - Economics</option>
                    </select>
                    <div id="concept-details" class="mt-2 p-2 bg-gray-50 rounded hidden"></div>
                </div>
            `
        },
        
        // Step 4: Message Structure
        {
            title: "Message Structure",
            content: `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">LLM-CL Message Structure</h3>
                    <p class="mb-4">Each LLM-CL message follows a common structure that provides both clarity and flexibility.</p>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Basic Message Structure:</h4>
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm">@v1.0{
  #message_type
  #focus{concept1 + concept2}
  ~relation{
    #property1 $0.95
    #property2 $0.72
  }
}</pre>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Common Message Types:</h4>
                    <ul class="list-disc pl-6">
                        <li><span class="font-semibold">#request~information</span> - A question seeking information</li>
                        <li><span class="font-semibold">#request~action</span> - A request for the AI to perform an action</li>
                        <li><span class="font-semibold">#request~explanation</span> - A request for an explanation of a concept</li>
                        <li><span class="font-semibold">#statement</span> - A factual statement or assertion</li>
                        <li><span class="font-semibold">#response~information</span> - A response providing information</li>
                    </ul>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Example of a Response Message:</h4>
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm">@v1.0{
  #response~information
  #list{
    #item1{
      #c501~symbolic #c142
      ~has{#c2231~logic #c8701~rules}
    }
    #item2{
      #c501~connectionist #c142
      ~has{#c4230~neural_networks}
    }
    #item3{
      #c501~hybrid
      ~combines{^.#item1 ^.#item2}
    }
  }
}</pre>
                    <p class="mt-2">This represents a response listing three approaches to AI: symbolic, connectionist, and hybrid approaches.</p>
                </div>
                
                <div class="interactive-element">
                    <h4 class="font-semibold mb-2">Message Structure Exercise</h4>
                    <p class="mb-2">Which of the following is a properly structured LLM-CL message?</p>
                    <div class="mt-2">
                        <div class="mb-2">
                            <input type="radio" id="opt1" name="structure-question" value="1">
                            <label for="opt1" class="ml-2">@v1.0 #request~information #topic{#c142~agi}</label>
                        </div>
                        <div class="mb-2">
                            <input type="radio" id="opt2" name="structure-question" value="2">
                            <label for="opt2" class="ml-2">@v1.0{#request~information #topic{#c142~agi}}</label>
                        </div>
                        <div class="mb-2">
                            <input type="radio" id="opt3" name="structure-question" value="3">
                            <label for="opt3" class="ml-2">#request~information @v1.0{#topic{#c142~agi}}</label>
                        </div>
                        <button id="check-structure" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-2">Check Answer</button>
                        <div id="structure-feedback" class="mt-2 p-2 rounded hidden"></div>
                    </div>
                </div>
            `
        },
        
        // Step 5: Reference and Context
        {
            title: "References and Context",
            content: `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">References and Context</h3>
                    <p class="mb-4">LLM-CL uses an efficient reference system to point to previous content or shared knowledge, significantly reducing the need to repeat information.</p>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Reference Types:</h4>
                    <ul class="list-disc pl-6">
                        <li><span class="font-semibold token-reference">^prev1.#concept</span> - Reference to a concept from 1 message ago</li>
                        <li><span class="font-semibold token-reference">^self.#property</span> - Self-reference to a property in current message</li>
                        <li><span class="font-semibold token-reference">^shared.world_model</span> - Reference to shared knowledge repository</li>
                    </ul>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Example of Reference Usage:</h4>
                    <p class="mb-2">First message:</p>
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm mb-2">@v1.0{
  #statement
  #topic{#c501~machine_learning}
  ~has{
    #c5020~supervised_learning
    #c5021~unsupervised_learning
    #c5022~reinforcement_learning
  }
}</pre>
                    <p class="mb-2">Second message referencing the first:</p>
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm">@v1.0{
  #request~explanation
  #focus{^prev1.~has.#c5022}
  $detail_level{high}
}</pre>
                    <p class="mt-2">The second message references the concept "reinforcement_learning" from the previous message without having to repeat it.</p>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Benefits of References:</h4>
                    <ul class="list-disc pl-6">
                        <li><span class="font-semibold">Token Efficiency</span>: Avoid repeating information</li>
                        <li><span class="font-semibold">Contextual Awareness</span>: Explicit pointers to relevant context</li>
                        <li><span class="font-semibold">Disambiguation</span>: Clear indication of which specific concept is being referenced</li>
                    </ul>
                </div>
                
                <div class="interactive-element">
                    <h4 class="font-semibold mb-2">Reference Challenge</h4>
                    <p class="mb-2">Given these two messages, what would be the proper reference to "climate change" in a third message?</p>
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm mb-2">// First message
@v1.0{
  #statement
  #topic{#c117~climate_change}
  ~has{#c5501~causes #c5502~effects}
}</pre>
                    <pre class="bg-gray-50 p-2 rounded font-mono text-sm mb-2">// Second message
@v1.0{
  #request~information
  #focus{^prev1.~has.#c5501}
}</pre>
                    <input type="text" id="reference-exercise" class="w-full p-2 border border-gray-300 rounded" placeholder="Enter the reference expression">
                    <div class="flex justify-between mt-2">
                        <button id="check-reference" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Check Answer</button>
                        <button id="show-reference-answer" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Show Answer</button>
                    </div>
                    <div id="reference-feedback" class="mt-2 p-2 rounded hidden"></div>
                </div>
            `
        },
        
        // Step 6: Implementation Approaches
        {
            title: "Implementation Approaches",
            content: `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">LLM-CL Implementation Approaches</h3>
                    <p class="mb-4">There are several ways to implement LLM-CL communication between language models:</p>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">1. Prompt Engineering Approach</h4>
                    <p class="mb-4">The simplest implementation uses instruction-based prompts to guide models to encode/decode LLM-CL:</p>
                    <div class="mb-2">
                        <h5 class="font-semibold">Encoder Prompt:</h5>
                        <div class="bg-gray-50 p-2 rounded text-sm">
                            You are an LLM-CL encoder. Convert the following natural language message into LLM-CL format using the specification rules. Maximize token efficiency while preserving semantic content.
                            
                            Natural language: [Input text]
                            LLM-CL output:
                        </div>
                    </div>
                    <div>
                        <h5 class="font-semibold">Decoder Prompt:</h5>
                        <div class="bg-gray-50 p-2 rounded text-sm">
                            You are an LLM-CL decoder. Convert the following LLM-CL message into natural language, expanding all semantic compressions and resolving all references.
                            
                            LLM-CL: [Input LLM-CL]
                            Natural language output:
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">2. Fine-tuning Approach</h4>
                    <p>For production use, fine-tuning models specifically for LLM-CL provides better performance:</p>
                    <ul class="list-disc pl-6">
                        <li>Create a dataset of paired natural language ↔ LLM-CL examples</li>
                        <li>Fine-tune a model using supervised learning on this parallel corpus</li>
                        <li>Create specialized encoder and decoder models (or a single model with different prompt prefixes)</li>
                    </ul>
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">3. Native Implementation</h4>
                    <p>The most efficient approach integrates LLM-CL directly into the model architecture:</p>
                    <ul class="list-disc pl-6">
                        <li>Modify tokenizer to recognize LLM-CL tokens and syntax as atomic units</li>
                        <li>Create a specialized attention layer for reference resolution</li>
                        <li>Implement concept-space mappings in embedding space</li>
                        <li>Add an LLM-CL parsing layer before final output generation</li>
                    </ul>
                </div>
                
                <div class="mt-6">
                    <h4 class="font-semibold mb-2">Implementation Roadmap</h4>
                    <div class="bg-gray-50 p-3 rounded">
                        <ol class="list-decimal pl-6">
                            <li class="mb-1">Develop initial concept space (10,000-20,000 concepts)</li>
                            <li class="mb-1">Create prototype encoder/decoder using prompt engineering</li>
                            <li class="mb-1">Generate training data for fine-tuning</li>
                            <li class="mb-1">Fine-tune specialized encoder/decoder models</li>
                            <li class="mb-1">Implement advanced features (uncertainty quantifiers, dimensional expressions)</li>
                            <li class="mb-1">Benchmark performance across multiple models</li>
                            <li>Develop native implementation in model architecture</li>
                        </ol>
                    </div>
                </div>
            `
        },
        
        // Step 7: Applications and Future
        {
            title: "Applications and Future",
            content: `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Applications of LLM-CL</h3>
                    <p class="mb-4">LLM-CL has wide-ranging applications for AI-to-AI communication:</p>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-semibold mb-2">Key Application Areas:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-50 p-3 rounded">
                            <h5 class="font-semibold text-indigo-700">Multi-agent AI Systems</h5>
                            <p>Efficient communication in collaborative AI networks where multiple agents need to coordinate actions and share information with minimal overhead.</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <h5 class="font-semibold text-indigo-700">AI-to-AI APIs</h5>
                            <p>More efficient than JSON/REST for semantic content transfer between AI services, with significant bandwidth reduction.</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <h5 class="font-semibold text-indigo-700">Reasoning Systems</h5>
                            <p>Explicit representation of inference chains and reasoning steps between components of complex AI systems.</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <h5 class="font-semibold text-indigo-700">Knowledge Accumulation</h5>
                            <p>More efficient collective learning and knowledge sharing across different models and systems.</p>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-2">Performance Benchmarks</h3>
                    <p class="mb-2">Initial benchmarks show significant improvements across various metrics:</p>
                    <div class="w-full bg-gray-50 p-2 rounded overflow-x-auto">
                        <table class="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="border border-gray-300 p-2">Scenario</th>
                                    <th class="border border-gray-300 p-2">Token Reduction</th>
                                    <th class="border border-gray-300 p-2">Ambiguity Reduction</th>
                                    <th class="border border-gray-300 p-2">Processing Speedup</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="border border-gray-300 p-2">Basic Q&A</td>
                                    <td class="border border-gray-300 p-2 text-center">53%</td>
                                    <td class="border border-gray-300 p-2 text-center">70%</td>
                                    <td class="border border-gray-300 p-2 text-center">35%</td>
                                </tr>
                                <tr>
                                    <td class="border border-gray-300 p-2">Scientific Explanation</td>
                                    <td class="border border-gray-300 p-2 text-center">54%</td>
                                    <td class="border border-gray-300 p-2 text-center">90%</td>
                                    <td class="border border-gray-300 p-2 text-center">45%</td>
                                </tr>
                                <tr>
                                    <td class="border border-gray-300 p-2">Multi-agent Planning</td>
                                    <td class="border border-gray-300 p-2 text-center">55%</td>
                                    <td class="border border-gray-300 p-2 text-center">85%</td>
                                    <td class="border border-gray-300 p-2 text-center">50%</td>
                                </tr>
                                <tr>
                                    <td class="border border-gray-300 p-2">Logical Reasoning</td>
                                    <td class="border border-gray-300 p-2 text-center">54%</td>
                                    <td class="border border-gray-300 p-2 text-center">95%</td>
                                    <td class="border border-gray-300 p-2 text-center">60%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Future Development</h3>
                    <p class="mb-2">LLM-CL is designed to evolve along with advances in AI:</p>
                    <ul class="list-disc pl-6">
                        <li><span class="font-semibold">Short-term</span>: Expansion of concept space, domain-specific extensions</li>
                        <li><span class="font-semibold">Medium-term</span>: Integration with multimodal representations, dialect variations</li>
                        <li><span class="font-semibold">Long-term</span>: Potential emergence as a universal interlingua for all AI systems</li>
                    </ul>
                </div>
                
                <div class="mt-6">
                    <h4 class="font-semibold mb-2">Try it yourself!</h4>
                    <p>Now that you've completed this tutorial, explore the other tabs to experiment with LLM-CL:</p>
                    <ul class="list-disc pl-6">
                        <li>Use the <span class="font-semibold">Encoder/Decoder</span> tab to convert between natural language and LLM-CL</li>
                        <li>Try the <span class="font-semibold">Compiler</span> tab to see how LLM-CL is processed step-by-step</li>
                        <li>Experiment with the <span class="font-semibold">Chatbot</span> tab to compare LLM-CL with standard LLM communication</li>
                    </ul>
                </div>
            `
        }
    ];
    
    // Store the steps and initialize the tutorial
    window.tutorialState.tutorialSteps = tutorialSteps;
    window.tutorialState.totalSteps = tutorialSteps.length;
    
    // Display the first step
    displayTutorialStep(0);
    
    // Set up interactive elements for each step
    setupInteractiveElements();
}

// Display the tutorial step at the given index
function displayTutorialStep(index) {
    const tutorialContent = document.getElementById('tutorial-content');
    const tutorialProgress = document.getElementById('tutorial-progress');
    const prevButton = document.getElementById('tutorial-prev');
    const nextButton = document.getElementById('tutorial-next');
    
    // Get the step data
    const step = window.tutorialState.tutorialSteps[index];
    
    // Update content
    tutorialContent.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">${step.title}</h3>
        ${step.content}
    `;
    
    // Update progress bar
    const progressPercent = ((index + 1) / window.tutorialState.totalSteps) * 100;
    tutorialProgress.style.width = `${progressPercent}%`;
    
    // Update buttons
    prevButton.disabled = index === 0;
    nextButton.innerText = index === window.tutorialState.totalSteps - 1 ? 'Finish' : 'Next';
    
    // Update current step
    window.tutorialState.currentStep = index;
    
    // Set up interactive elements for this step
    setupInteractiveElements();
}

// Navigate to the next or previous tutorial step
function navigateTutorial(direction) {
    const newIndex = window.tutorialState.currentStep + direction;
    
    // Check if the new index is valid
    if (newIndex >= 0 && newIndex < window.tutorialState.totalSteps) {
        displayTutorialStep(newIndex);
    } else if (newIndex === window.tutorialState.totalSteps) {
        // Completed the tutorial
        alert('Congratulations! You have completed the LLM-CL tutorial. Now explore the other tabs to see LLM-CL in action!');
        
        // Switch to another tab
        document.querySelector('.tab-button[data-tab="encoder-decoder"]').click();
    }
}

// Set up interactive elements for the current step
function setupInteractiveElements() {
    // Core Syntax step interactions
    setupSyntaxExercise();
    
    // Universal Concept Space step interactions
    setupConceptExplorer();
    
    // Message Structure step interactions
    setupStructureExercise();
    
    // Reference step interactions
    setupReferenceExercise();
}

// Set up the syntax exercise in step 2
function setupSyntaxExercise() {
    const checkButton = document.getElementById('check-syntax');
    const showButton = document.getElementById('show-syntax-answer');
    const feedback = document.getElementById('syntax-feedback');
    
    if (!checkButton) return;
    
    checkButton.addEventListener('click', () => {
        const answer = document.getElementById('syntax-exercise').value.trim();
        const correctAnswer = '#c502~deep_learning $0.9';
        
        if (answer === correctAnswer) {
            feedback.innerHTML = '<span class="text-green-600">Correct! You\'ve used the right syntax for a concept with a confidence value.</span>';
        } else {
            feedback.innerHTML = '<span class="text-red-600">Not quite right. Try again, making sure to use the concept ID and quantifier properly.</span>';
        }
        
        feedback.classList.remove('hidden');
    });
    
    showButton.addEventListener('click', () => {
        document.getElementById('syntax-exercise').value = '#c502~deep_learning $0.9';
        feedback.innerHTML = '<span class="text-blue-600">The correct syntax is shown above. The # indicates a concept, c502 is the concept ID, ~ introduces a qualifier, and $ introduces a quantifier value.</span>';
        feedback.classList.remove('hidden');
    });
}

// Set up the concept explorer in step 3
function setupConceptExplorer() {
    const conceptSelector = document.getElementById('concept-explorer');
    const conceptDetails = document.getElementById('concept-details');
    
    if (!conceptSelector) return;
    
    // Sample concept data
    const conceptData = {
        'c142': {
            label: 'artificial_intelligence',
            definition: 'The theory and development of computer systems able to perform tasks normally requiring human intelligence.',
            related: ['c143', 'c501', 'c8901'],
            hyponyms: ['c501', 'c502'],
            hypernyms: ['c140']
        },
        'c501': {
            label: 'machine_learning',
            definition: 'A subset of AI that provides systems with the ability to automatically learn and improve from experience.',
            related: ['c142', 'c4230'],
            hyponyms: ['c502', 'c5020', 'c5021', 'c5022'],
            hypernyms: ['c142']
        },
        'c502': {
            label: 'deep_learning',
            definition: 'A machine learning method based on artificial neural networks with multiple layers.',
            related: ['c501', 'c4230'],
            hyponyms: ['c5023', 'c5024'],
            hypernyms: ['c501']
        },
        'c4230': {
            label: 'neural_networks',
            definition: 'Computing systems inspired by biological neural networks that form animal brains.',
            related: ['c501', 'c502'],
            hyponyms: ['c4231', 'c4232'],
            hypernyms: ['c501']
        },
        'c117': {
            label: 'climate_change',
            definition: 'Long-term shifts in temperatures and weather patterns, primarily caused by human activities.',
            related: ['c5501', 'c118'],
            hyponyms: ['c119', 'c120'],
            hypernyms: ['c115']
        },
        'c2901': {
            label: 'economics',
            definition: 'The social science that studies the production, distribution, and consumption of goods and services.',
            related: ['c2902', 'c2903'],
            hyponyms: ['c2904', 'c2905'],
            hypernyms: ['c2900']
        }
    };
    
    conceptSelector.addEventListener('change', () => {
        const conceptId = conceptSelector.value;
        
        if (conceptId && conceptData[conceptId]) {
            const concept = conceptData[conceptId];
            
            conceptDetails.innerHTML = `
                <div class="font-semibold">ID: ${conceptId}</div>
                <div class="mb-1"><span class="font-semibold">Label:</span> ${concept.label}</div>
                <div class="mb-2"><span class="font-semibold">Definition:</span> ${concept.definition}</div>
                <div class="mb-1"><span class="font-semibold">Related Concepts:</span> ${concept.related.join(', ')}</div>
                <div class="mb-1"><span class="font-semibold">More Specific Concepts:</span> ${concept.hyponyms.join(', ')}</div>
                <div><span class="font-semibold">Parent Concepts:</span> ${concept.hypernyms.join(', ')}</div>
            `;
            
            conceptDetails.classList.remove('hidden');
        } else {
            conceptDetails.classList.add('hidden');
        }
    });
}

// Set up the message structure exercise in step 4
function setupStructureExercise() {
    const checkButton = document.getElementById('check-structure');
    const feedback = document.getElementById('structure-feedback');
    
    if (!checkButton) return;
    
    checkButton.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="structure-question"]:checked');
        
        if (!selectedOption) {
            feedback.innerHTML = '<span class="text-red-600">Please select an answer.</span>';
            feedback.classList.remove('hidden');
            return;
        }
        
        const answer = selectedOption.value;
        
        if (answer === '2') {
            feedback.innerHTML = '<span class="text-green-600">Correct! The version marker must be followed by opening brace, and all elements must be inside the braces.</span>';
        } else {
            feedback.innerHTML = '<span class="text-red-600">Incorrect. The proper structure requires the version marker followed by braces containing all message elements.</span>';
        }
        
        feedback.classList.remove('hidden');
    });
}

// Set up the reference exercise in step 5
function setupReferenceExercise() {
    const checkButton = document.getElementById('check-reference');
    const showButton = document.getElementById('show-reference-answer');
    const feedback = document.getElementById('reference-feedback');
    
    if (!checkButton) return;
    
    checkButton.addEventListener('click', () => {
        const answer = document.getElementById('reference-exercise').value.trim();
        const correctAnswer = '^prev2.#topic';
        
        if (answer === correctAnswer) {
            feedback.innerHTML = '<span class="text-green-600">Correct! This references the topic (climate_change) from two messages ago.</span>';
        } else {
            feedback.innerHTML = '<span class="text-red-600">Not quite right. Remember to count back the correct number of messages.</span>';
        }
        
        feedback.classList.remove('hidden');
    });
    
    showButton.addEventListener('click', () => {
        document.getElementById('reference-exercise').value = '^prev2.#topic';
        feedback.innerHTML = '<span class="text-blue-600">The correct reference is ^prev2.#topic. This points to the topic in the message from 2 steps back.</span>';
        feedback.classList.remove('hidden');
    });
}
