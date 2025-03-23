#!/usr/bin/env python3
"""
LLM-CL Encoder/Decoder Implementation

This module provides a complete implementation of the LLM-CL encoding and decoding
system, including the Universal Concept Space, reference resolution, and utility functions.
"""

import json
import re
import os
from typing import Dict, List, Any, Optional, Tuple, Set, Union
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Ensure NLTK resources are available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    print("Downloading required NLTK resources...")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

class UniversalConceptSpace:
    """
    Implementation of the Universal Concept Space (UCS) for LLM-CL.
    Maps concept IDs to semantic meanings and manages concept relationships.
    """
    
    def __init__(self, concept_file: Optional[str] = None):
        """
        Initialize the Universal Concept Space.
        
        Args:
            concept_file: Optional path to a JSON file containing concept definitions.
                          If None, a minimal default concept space will be used.
        """
        self.concepts = {}
        
        # Load from file if provided
        if concept_file and os.path.exists(concept_file):
            with open(concept_file, 'r') as f:
                self.concepts = json.load(f)
        else:
            # Initialize with minimal default concept space
            self._initialize_default_concepts()
    
    def _initialize_default_concepts(self):
        """Initialize a minimal set of concepts for demonstration purposes."""
        # This would be expanded in a real implementation
        self.concepts = {
            "c142": {
                "label": "artificial_intelligence",
                "definition": "The theory and development of computer systems able to perform tasks normally requiring human intelligence",
                "related": ["c143", "c501", "c8901"],
                "hyponyms": ["c501", "c9872"],
                "hypernyms": ["c140"]
            },
            "c143": {
                "label": "natural_intelligence",
                "definition": "Intelligence demonstrated by humans and animals",
                "related": ["c142"],
                "hyponyms": ["c144", "c145"],
                "hypernyms": ["c140"]
            },
            "c501": {
                "label": "machine_learning",
                "definition": "Computer algorithms that improve automatically through experience",
                "related": ["c142", "c4230"],
                "hyponyms": ["c4230", "c4492"],
                "hypernyms": ["c142"]
            },
            "c502": {
                "label": "deep_learning",
                "definition": "Machine learning based on artificial neural networks with multiple layers",
                "related": ["c501", "c4230"],
                "hyponyms": [],
                "hypernyms": ["c501"]
            },
            "c1425": {
                "label": "democracy",
                "definition": "A system of government where power resides with the citizens through elected representatives",
                "related": ["c1426", "c1427"],
                "hyponyms": ["c1428", "c1429"],
                "hypernyms": ["c1420"]
            },
            "c2901": {
                "label": "economics",
                "definition": "The social science that studies the production, distribution, and consumption of goods and services",
                "related": ["c2902", "c2903"],
                "hyponyms": ["c2904", "c2905"],
                "hypernyms": ["c2900"]
            },
            "c4230": {
                "label": "neural_networks",
                "definition": "Computing systems designed to recognize patterns, inspired by the human brain",
                "related": ["c501", "c4231"],
                "hyponyms": ["c4232", "c4233"],
                "hypernyms": ["c501"]
            },
            "c4231": {
                "label": "deep_learning",
                "definition": "Machine learning based on artificial neural networks with representation learning",
                "related": ["c4230", "c4232"],
                "hyponyms": [],
                "hypernyms": ["c4230"]
            },
            "c4492": {
                "label": "research",
                "definition": "Systematic investigation to establish facts and reach new conclusions",
                "related": ["c4493", "c4494"],
                "hyponyms": ["c4495", "c4496"],
                "hypernyms": ["c4490"]
            },
            "c5501": {
                "label": "environment",
                "definition": "The surroundings or conditions in which a person, animal, or plant lives or operates",
                "related": ["c5502", "c5503"],
                "hyponyms": ["c5504", "c5505"],
                "hypernyms": ["c5500"]
            },
            "c6701": {
                "label": "knowledge_representation",
                "definition": "The field of AI dedicated to representing information about the world in a form that a computer system can utilize",
                "related": ["c6702", "c6703"],
                "hyponyms": ["c6704", "c6705"],
                "hypernyms": ["c6700"]
            },
            "c8701": {
                "label": "rules",
                "definition": "Prescribed guides for conduct or action",
                "related": ["c2231", "c8702"],
                "hyponyms": ["c8703", "c8704"],
                "hypernyms": ["c8700"]
            },
            "c2231": {
                "label": "logic",
                "definition": "The study of principles of valid reasoning and inference",
                "related": ["c8701", "c2232"],
                "hyponyms": ["c2233", "c2234"],
                "hypernyms": ["c2230"]
            },
            "c117": {
                "label": "climate_change",
                "definition": "Long-term changes in temperature and weather patterns",
                "related": ["c5501", "c118"],
                "hyponyms": ["c119", "c120"],
                "hypernyms": ["c115"]
            }
        }
    
    def get_concept(self, concept_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a concept by its ID.
        
        Args:
            concept_id: The concept ID (e.g., "c142")
            
        Returns:
            The concept definition or None if not found
        """
        return self.concepts.get(concept_id)
    
    def get_concept_by_label(self, label: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a concept by its label.
        
        Args:
            label: The concept label (e.g., "artificial_intelligence")
            
        Returns:
            The concept definition or None if not found
        """
        for cid, concept in self.concepts.items():
            if concept.get("label") == label:
                concept_copy = concept.copy()
                concept_copy["id"] = cid
                return concept_copy
        return None
    
    def map_term_to_concept(self, term: str) -> List[Tuple[str, float]]:
        """
        Map a natural language term to potential UCS concepts with confidence scores.
        
        Args:
            term: Natural language term or phrase
            
        Returns:
            List of (concept_id, confidence) tuples, sorted by confidence
        """
        # Process term (lowercase, remove stopwords, lemmatize)
        term = term.lower()
        lemmatizer = WordNetLemmatizer()
        
        # Map to concepts
        matches = []
        for cid, concept in self.concepts.items():
            label = concept.get("label", "")
            definition = concept.get("definition", "")
            
            # Simple string matching for demonstration
            # Real implementation would use embeddings or more sophisticated matching
            confidence = 0.0
            if term == label:
                confidence = 1.0
            elif term in label or label in term:
                confidence = 0.8
            elif term in definition:
                confidence = 0.6
                
            if confidence > 0:
                matches.append((cid, confidence))
        
        return sorted(matches, key=lambda x: x[1], reverse=True)
    
    def add_concept(self, label: str, definition: str, 
                   related: List[str] = None, 
                   hyponyms: List[str] = None,
                   hypernyms: List[str] = None) -> str:
        """
        Add a new concept to the UCS.
        
        Args:
            label: Concept label
            definition: Concept definition
            related: List of related concept IDs
            hyponyms: List of hyponym concept IDs (more specific concepts)
            hypernyms: List of hypernym concept IDs (more general concepts)
            
        Returns:
            The ID of the new concept
        """
        # Generate a new concept ID
        next_id = max(int(cid[1:]) for cid in self.concepts.keys() if cid[1:].isdigit()) + 1
        new_id = f"c{next_id}"
        
        # Create new concept
        self.concepts[new_id] = {
            "label": label,
            "definition": definition,
            "related": related or [],
            "hyponyms": hyponyms or [],
            "hypernyms": hypernyms or []
        }
        
        # Update relationships in related concepts
        if related:
            for rel_id in related:
                if rel_id in self.concepts and new_id not in self.concepts[rel_id]["related"]:
                    self.concepts[rel_id]["related"].append(new_id)
        
        if hyponyms:
            for hyp_id in hyponyms:
                if hyp_id in self.concepts and new_id not in self.concepts[hyp_id]["hypernyms"]:
                    self.concepts[hyp_id]["hypernyms"].append(new_id)
        
        if hypernyms:
            for hyp_id in hypernyms:
                if hyp_id in self.concepts and new_id not in self.concepts[hyp_id]["hyponyms"]:
                    self.concepts[hyp_id]["hyponyms"].append(new_id)
        
        return new_id
    
    def save(self, filepath: str):
        """
        Save the current concept space to a file.
        
        Args:
            filepath: Path to output JSON file
        """
        with open(filepath, 'w') as f:
            json.dump(self.concepts, f, indent=2)
    
    def concept_id_to_label(self, concept_id: str) -> str:
        """
        Convert a concept ID to its label.
        
        Args:
            concept_id: Concept ID (e.g., "c142")
            
        Returns:
            The label or the concept_id if not found
        """
        concept = self.get_concept(concept_id)
        return concept["label"] if concept else concept_id


class ReferenceResolver:
    """
    System for resolving references in LLM-CL messages.
    """
    
    def __init__(self, max_context_size: int = 10):
        """
        Initialize the reference resolver.
        
        Args:
            max_context_size: Maximum number of messages to keep in context
        """
        self.context_buffer = []
        self.max_context_size = max_context_size
        
    def add_to_context(self, message: Dict[str, Any]):
        """
        Add a message to the context buffer.
        
        Args:
            message: Parsed LLM-CL message
        """
        self.context_buffer.append(message)
        if len(self.context_buffer) > self.max_context_size:
            self.context_buffer.pop(0)
    
    def resolve_reference(self, ref_token: str) -> Optional[Any]:
        """
        Resolve a reference token to its actual content.
        
        Args:
            ref_token: Reference token (e.g., "^prev1.#focus")
            
        Returns:
            Resolved content or None if resolution fails
        """
        if not ref_token.startswith('^'):
            return None
            
        parts = ref_token[1:].split('.')
        
        # Handle different reference types
        if parts[0].startswith('prev'):
            try:
                index = int(parts[0][4:])
                if index <= 0 or index > len(self.context_buffer):
                    return None
                
                message = self.context_buffer[-index]
                return self._resolve_path(message, parts[1:])
            except (ValueError, IndexError):
                return None
                
        elif parts[0] == 'self':
            if not self.context_buffer:
                return None
            
            current_message = self.context_buffer[-1]
            return self._resolve_path(current_message, parts[1:])
            
        elif parts[0] == 'shared':
            # In a real implementation, this would access a shared knowledge base
            # For demonstration, we'll just return a placeholder
            return {"type": "shared_knowledge", "path": '.'.join(parts[1:])}
            
        return None
    
    def _resolve_path(self, obj: Any, path: List[str]) -> Optional[Any]:
        """
        Resolve a path within an object.
        
        Args:
            obj: The object to navigate
            path: List of path segments
            
        Returns:
            The object at the specified path or None if not found
        """
        current = obj
        
        for segment in path:
            if isinstance(current, dict):
                # Handle tag references like #focus
                if segment.startswith('#'):
                    found = False
                    for k, v in current.items():
                        if k.startswith(segment):
                            current = v
                            found = True
                            break
                    if not found:
                        return None
                else:
                    current = current.get(segment)
                    if current is None:
                        return None
            elif isinstance(current, list):
                try:
                    index = int(segment)
                    if 0 <= index < len(current):
                        current = current[index]
                    else:
                        return None
                except ValueError:
                    # Try to find an item with the given tag
                    if segment.startswith('#'):
                        for item in current:
                            if isinstance(item, dict) and any(k.startswith(segment) for k in item.keys()):
                                current = item
                                break
                        else:
                            return None
                    else:
                        return None
            else:
                return None
                
        return current


class LLMCLParser:
    """
    Parser for LLM-CL messages.
    """
    
    def __init__(self, concept_space: UniversalConceptSpace, reference_resolver: ReferenceResolver):
        """
        Initialize the LLM-CL parser.
        
        Args:
            concept_space: Universal Concept Space instance
            reference_resolver: Reference resolver instance
        """
        self.concept_space = concept_space
        self.ref_resolver = reference_resolver
        
    def parse_llmcl(self, llmcl_string: str) -> Dict[str, Any]:
        """
        Parse an LLM-CL string into a structured representation.
        
        Args:
            llmcl_string: The LLM-CL string to parse
            
        Returns:
            Parsed representation as a dict
        """
        # Extract version
        version_match = re.match(r'@v(\d+\.\d+)\{', llmcl_string)
        if not version_match:
            raise ValueError("Invalid LLM-CL format: missing version marker")
            
        version = version_match.group(1)
        content = llmcl_string[version_match.end()-1:]  # Include the opening '{'
        
        # Parse hierarchical structure
        try:
            parsed = self._parse_structure(content)
            parsed['_version'] = version
            
            # Resolve references
            self._resolve_references(parsed)
            
            return parsed
        except Exception as e:
            raise ValueError(f"Error parsing LLM-CL: {str(e)}")
    
    def _parse_structure(self, content: str) -> Dict[str, Any]:
        """
        Parse the hierarchical structure of an LLM-CL message.
        
        Args:
            content: The content string (starting with '{')
            
        Returns:
            Parsed structure as a dict
        """
        result = {}
        
        # Ensure content starts with { and ends with }
        if not (content.startswith('{') and content.endswith('}')):
            raise ValueError("Invalid structure format")
            
        # Remove outer braces
        content = content[1:-1].strip()
        
        # Tokenize by lines
        lines = content.split('\n')
        
        # Process lines
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
                
            # Parse directive/concept/relation tokens
            if line.startswith('#'):
                # Parse concept token
                key_match = re.match(r'(#[a-zA-Z0-9_~]+)(?:{|\s|$)', line)
                if key_match:
                    key = key_match.group(1)
                    remainder = line[len(key):].strip()
                    
                    if remainder.startswith('{'):
                        # This starts a nested structure
                        nested_content = self._extract_nested_content(lines, i)
                        result[key] = self._parse_structure(nested_content)
                        i += self._count_nested_lines(nested_content)
                    else:
                        # This is a simple key-value pair or a solo concept
                        if remainder:
                            result[key] = remainder
                        else:
                            result[key] = True
                        i += 1
                else:
                    raise ValueError(f"Invalid concept format: {line}")
                    
            elif line.startswith('~'):
                # Parse relation token
                rel_match = re.match(r'(~[a-zA-Z0-9_]+)(?:{|\s|$)', line)
                if rel_match:
                    key = rel_match.group(1)
                    remainder = line[len(key):].strip()
                    
                    if remainder.startswith('{'):
                        # This starts a nested structure
                        nested_content = self._extract_nested_content(lines, i)
                        result[key] = self._parse_structure(nested_content)
                        i += self._count_nested_lines(nested_content)
                    else:
                        # This is a simple key-value pair
                        if remainder:
                            result[key] = remainder
                        else:
                            result[key] = True
                        i += 1
                else:
                    raise ValueError(f"Invalid relation format: {line}")
                    
            elif line.startswith('$'):
                # Parse quantifier token
                quant_match = re.match(r'(\$[a-zA-Z0-9_]+)(?:{|\s|$)', line)
                if quant_match:
                    key = quant_match.group(1)
                    remainder = line[len(key):].strip()
                    
                    if remainder.startswith('{'):
                        # This starts a nested structure
                        nested_content = self._extract_nested_content(lines, i)
                        result[key] = self._parse_structure(nested_content)
                        i += self._count_nested_lines(nested_content)
                    else:
                        # This is a simple key-value pair
                        if remainder:
                            result[key] = remainder
                        else:
                            result[key] = True
                        i += 1
                else:
                    raise ValueError(f"Invalid quantifier format: {line}")
                    
            elif line.startswith('^'):
                # Parse reference token
                ref_match = re.match(r'(\^[a-zA-Z0-9_.#]+)(?:{|\s|$)', line)
                if ref_match:
                    key = ref_match.group(1)
                    remainder = line[len(key):].strip()
                    
                    if remainder.startswith('{'):
                        # This starts a nested structure
                        nested_content = self._extract_nested_content(lines, i)
                        result[key] = self._parse_structure(nested_content)
                        i += self._count_nested_lines(nested_content)
                    else:
                        # This is a reference pointer
                        result[key] = {"_reference": key}
                        i += 1
                else:
                    raise ValueError(f"Invalid reference format: {line}")
                    
            else:
                # Unrecognized token type
                i += 1
        
        return result
    
    def _extract_nested_content(self, lines: List[str], start_idx: int) -> str:
        """
        Extract a nested content block.
        
        Args:
            lines: List of content lines
            start_idx: Starting line index
            
        Returns:
            The nested content as a string
        """
        line = lines[start_idx].strip()
        open_brace_idx = line.find('{')
        
        if open_brace_idx == -1:
            raise ValueError(f"Expected opening brace in line: {line}")
            
        nested_content = [line[open_brace_idx:]]
        brace_count = 1
        
        for i in range(start_idx + 1, len(lines)):
            curr_line = lines[i]
            
            # Count braces
            for char in curr_line:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    
            # Add line to nested content
            nested_content.append(curr_line)
            
            # Check if we've closed all braces
            if brace_count == 0:
                break
                
        if brace_count != 0:
            raise ValueError("Unbalanced braces in nested content")
            
        return '\n'.join(nested_content)
    
    def _count_nested_lines(self, nested_content: str) -> int:
        """
        Count the number of lines in nested content.
        
        Args:
            nested_content: Nested content string
            
        Returns:
            Number of lines
        """
        return nested_content.count('\n') + 1
    
    def _resolve_references(self, parsed: Dict[str, Any]):
        """
        Resolve all references in the parsed structure.
        
        Args:
            parsed: Parsed structure to resolve references in
        """
        self._resolve_references_recursive(parsed)
    
    def _resolve_references_recursive(self, obj: Any):
        """
        Recursively resolve references in an object.
        
        Args:
            obj: Object to resolve references in
        """
        if isinstance(obj, dict):
            for k, v in list(obj.items()):
                if isinstance(v, dict) and "_reference" in v:
                    # Resolve reference
                    ref_token = v["_reference"]
                    resolved = self.ref_resolver.resolve_reference(ref_token)
                    if resolved is not None:
                        obj[k] = resolved
                    # Keep unresolved references as is
                elif isinstance(v, (dict, list)):
                    self._resolve_references_recursive(v)
        elif isinstance(obj, list):
            for item in obj:
                if isinstance(item, (dict, list)):
                    self._resolve_references_recursive(item)


class LLMCLEncoder:
    """
    Encoder for converting natural language to LLM-CL.
    """
    
    def __init__(self, concept_space: UniversalConceptSpace):
        """
        Initialize the LLM-CL encoder.
        
        Args:
            concept_space: Universal Concept Space instance
        """
        self.concept_space = concept_space
        # Initialize NLTK resources
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
    def encode(self, text: str, version: str = "1.0") -> str:
        """
        Encode natural language text to LLM-CL.
        
        Args:
            text: Natural language text
            version: LLM-CL version to use
            
        Returns:
            LLM-CL encoded string
        """
        # This is a simplified implementation
        # A production-grade encoder would use more sophisticated NLP and ML techniques
        
        # Analyze text to determine message type
        msg_type = self._determine_message_type(text)
        
        # Extract key concepts
        concepts = self._extract_key_concepts(text)
        
        # Identify relationships
        relationships = self._identify_relationships(text, concepts)
        
        # Build LLM-CL structure
        llmcl = f"@v{version}{{\n"
        llmcl += f"  #{msg_type}\n"
        
        # Add concepts and relationships
        for concept, score in concepts[:3]:  # Limit to top 3 concepts for simplicity
            concept_matches = self.concept_space.map_term_to_concept(concept)
            if concept_matches:
                # Use the best matching concept
                cid, confidence = concept_matches[0]
                if confidence > 0.7:
                    llmcl += f"  #{cid}~{concept.replace(' ', '_')}\n"
                else:
                    # Use descriptive label if confidence is low
                    llmcl += f"  #{concept.replace(' ', '_')}\n"
            else:
                llmcl += f"  #{concept.replace(' ', '_')}\n"
        
        # Add relationships
        for rel_type, source, target in relationships[:3]:  # Limit to top 3 relationships
            # Map source and target to concept IDs if possible
            source_matches = self.concept_space.map_term_to_concept(source)
            target_matches = self.concept_space.map_term_to_concept(target)
            
            source_id = f"#{source_matches[0][0]}" if source_matches and source_matches[0][1] > 0.7 else f"#{source.replace(' ', '_')}"
            target_id = f"#{target_matches[0][0]}" if target_matches and target_matches[0][1] > 0.7 else f"#{target.replace(' ', '_')}"
            
            llmcl += f"  ~{rel_type}{{\n    {source_id}\n    {target_id}\n  }}\n"
        
        llmcl += "}"
        return llmcl
    
    def _determine_message_type(self, text: str) -> str:
        """
        Determine the message type from text.
        
        Args:
            text: Natural language text
            
        Returns:
            Message type identifier
        """
        text_lower = text.lower()
        
        # Simple heuristics for message type
        if text_lower.endswith('?') or text_lower.startswith(('what', 'who', 'when', 'where', 'why', 'how')):
            return "request~information"
        elif any(cmd in text_lower for cmd in ['please', 'could you', 'would you', 'can you']):
            return "request~action"
        else:
            return "statement"
    
    def _extract_key_concepts(self, text: str) -> List[Tuple[str, float]]:
        """
        Extract key concepts from text with importance scores.
        
        Args:
            text: Natural language text
            
        Returns:
            List of (concept, score) tuples
        """
        # Tokenize and preprocess
        tokens = word_tokenize(text.lower())
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token.isalpha() and token not in self.stop_words]
        
        # Count token frequencies (basic TF)
        freq = {}
        for token in tokens:
            if token in freq:
                freq[token] += 1
            else:
                freq[token] = 1
        
        # Simple scoring based on frequency
        scored_tokens = [(token, count / len(tokens)) for token, count in freq.items()]
        
        # Sort by score
        return sorted(scored_tokens, key=lambda x: x[1], reverse=True)
    
    def _identify_relationships(self, text: str, concepts: List[Tuple[str, float]]) -> List[Tuple[str, str, str]]:
        """
        Identify relationships between concepts.
        
        Args:
            text: Natural language text
            concepts: List of (concept, score) tuples
            
        Returns:
            List of (relation_type, source, target) tuples
        """
        # This is a simplified implementation
        # A production-grade system would use dependency parsing and relation extraction
        
        relationships = []
        concept_terms = [c[0] for c in concepts]
        
        # Simple heuristics for relationship detection
        if len(concept_terms) >= 2:
            # Assume first two concepts have a relationship
            if "impact" in text.lower() or "effect" in text.lower() or "affect" in text.lower():
                relationships.append(("impact", concept_terms[0], concept_terms[1]))
            elif "cause" in text.lower():
                relationships.append(("cause", concept_terms[0], concept_terms[1]))
            elif "relate" in text.lower() or "associated" in text.lower():
                relationships.append(("related", concept_terms[0], concept_terms[1]))
            elif "compare" in text.lower() or "versus" in text.lower() or " vs " in text.lower():
                relationships.append(("compare", concept_terms[0], concept_terms[1]))
            elif "define" in text.lower() or "meaning" in text.lower() or "definition" in text.lower():
                relationships.append(("definition", concept_terms[0], concept_terms[1]))
            else:
                # Default relationship
                relationships.append(("has", concept_terms[0], concept_terms[1]))
        
        return relationships


class LLMCLDecoder:
    """
    Decoder for converting LLM-CL to natural language.
    """
    
    def __init__(self, concept_space: UniversalConceptSpace, parser: LLMCLParser):
        """
        Initialize the LLM-CL decoder.
        
        Args:
            concept_space: Universal Concept Space instance
            parser: LLM-CL parser instance
        """
        self.concept_space = concept_space
        self.parser = parser
        
    def decode(self, llmcl: str) -> str:
        """
        Decode LLM-CL to natural language.
        
        Args:
            llmcl: LLM-CL string to decode
            
        Returns:
            Natural language text
        """
        try:
            # Parse the LLM-CL
            parsed = self.parser.parse_llmcl(llmcl)
            
            # Generate natural language from parsed structure
            return self._generate_natural_language(parsed)
        except ValueError as e:
            return f"Error decoding LLM-CL: {str(e)}"
    
    def _generate_natural_language(self, parsed: Dict[str, Any]) -> str:
        """
        Generate natural language from parsed LLM-CL structure.
        
        Args:
            parsed: Parsed LLM-CL structure
            
        Returns:
            Natural language text
        """
        # Extract message type
        msg_type = None
        for key in parsed.keys():
            if key.startswith('#') and key != '_version':
                msg_type = key
                break
                
        if not msg_type:
            return "Unable to determine message type"
            
        # Handle different message types
        if msg_type.startswith('#request'):
            return self._generate_request(parsed, msg_type)
        elif msg_type.startswith('#statement'):
            return self._generate_statement(parsed, msg_type)
        elif msg_type.startswith('#response'):
            return self._generate_response(parsed, msg_type)
        else:
            # Default approach for other message types
            return self._generate_generic(parsed, msg_type)
    
    def _generate_request(self, parsed: Dict[str, Any], msg_type: str) -> str:
        """Generate natural language for request type messages."""
        if '~information' in msg_type:
            # Information request
            result = "I would like to know about "
            
            # Check for topic or focus
            for key in parsed.keys():
                if key.startswith('#topic') or key.startswith('#focus'):
                    topic = parsed[key]
                    if isinstance(topic, dict):
                        # Extract concepts from the topic
                        concepts = []
                        for topic_key, topic_val in topic.items():
                            if topic_key.startswith('#c'):
                                concept_id = topic_key.split('~')[0]
                                label = self.concept_space.concept_id_to_label(concept_id[1:])  # Remove # prefix
                                qualifier = topic_key.split('~')[1] if '~' in topic_key else None
                                if qualifier:
                                    concepts.append(f"{qualifier} {label}")
                                else:
                                    concepts.append(label)
                        
                        if concepts:
                            result += ', '.join(concepts)
                    elif isinstance(topic, str) and topic.startswith('#c'):
                        # Direct concept reference
                        concept_id = topic[1:]  # Remove # prefix
                        result += self.concept_space.concept_id_to_label(concept_id)
                    else:
                        result += str(topic)
                    break
            
            # Check for quantity
            for key in parsed.keys():
                if key.startswith('$quantity'):
                    quantity = parsed[key]
                    if isinstance(quantity, dict):
                        quantity_val = list(quantity.values())[0] if quantity else "some"
                        result = result.replace("about", f"about {quantity_val}")
                    else:
                        result = result.replace("about", f"about {quantity}")
                    break
            
            return result + "."
        elif '~action' in msg_type:
            # Action request
            result = "Please "
            
            # Look for action or requested concepts
            action_found = False
            for key, value in parsed.items():
                if key.startswith('#action') or key.startswith('#request'):
                    action_found = True
                    if isinstance(value, dict):
                        # Extract the action
                        action_str = []
                        for act_key, act_val in value.items():
                            if act_key.startswith('#c'):
                                concept_id = act_key.split('~')[0][1:]  # Remove # prefix
                                label = self.concept_space.concept_id_to_label(concept_id)
                                qualifier = act_key.split('~')[1] if '~' in act_key else None
                                if qualifier:
                                    action_str.append(f"{qualifier} {label}")
                                else:
                                    action_str.append(label)
                            elif act_key.startswith('~'):
                                # Handle relations
                                relation = act_key[1:]  # Remove ~ prefix
                                if isinstance(act_val, dict):
                                    obj_concepts = []
                                    for obj_key, obj_val in act_val.items():
                                        if obj_key.startswith('#c'):
                                            obj_concept_id = obj_key.split('~')[0][1:]
                                            obj_label = self.concept_space.concept_id_to_label(obj_concept_id)
                                            obj_qualifier = obj_key.split('~')[1] if '~' in obj_key else None
                                            if obj_qualifier:
                                                obj_concepts.append(f"{obj_qualifier} {obj_label}")
                                            else:
                                                obj_concepts.append(obj_label)
                                    
                                    if obj_concepts:
                                        action_str.append(f"{relation} {', '.join(obj_concepts)}")
                        
                        result += ' '.join(action_str)
                    else:
                        result += str(value)
                    break
            
            if not action_found:
                # Fallback to using the first few concepts
                concepts = []
                for key in parsed.keys():
                    if key.startswith('#c'):
                        concept_id = key.split('~')[0][1:]  # Remove # prefix
                        label = self.concept_space.concept_id_to_label(concept_id)
                        qualifier = key.split('~')[1] if '~' in key else None
                        if qualifier:
                            concepts.append(f"{qualifier} {label}")
                        else:
                            concepts.append(label)
                
                if concepts:
                    result += ' '.join(concepts)
                else:
                    result += "perform the requested action"
            
            return result + "."
        else:
            # Generic request
            return "I have a request regarding " + self._generate_generic(parsed, msg_type) + "."
    
    def _generate_statement(self, parsed: Dict[str, Any], msg_type: str) -> str:
        """Generate natural language for statement type messages."""
        result = ""
        
        # Extract main concepts
        concepts = []
        for key in parsed.keys():
            if key.startswith('#c'):
                concept_id = key.split('~')[0][1:]  # Remove # prefix
                label = self.concept_space.concept_id_to_label(concept_id)
                qualifier = key.split('~')[1] if '~' in key else None
                if qualifier:
                    concepts.append(f"{qualifier} {label}")
                else:
                    concepts.append(label)
        
        if concepts:
            result += "The " + concepts[0]
            if len(concepts) > 1:
                result += " and " + ", ".join(concepts[1:])
        
        # Extract relationships
        relations = []
        for key, value in parsed.items():
            if key.startswith('~'):
                relation = key[1:]  # Remove ~ prefix
                if isinstance(value, dict):
                    rel_concepts = []
                    for rel_key, rel_val in value.items():
                        if rel_key.startswith('#c'):
                            rel_concept_id = rel_key.split('~')[0][1:]
                            rel_label = self.concept_space.concept_id_to_label(rel_concept_id)
                            rel_qualifier = rel_key.split('~')[1] if '~' in rel_key else None
                            if rel_qualifier:
                                rel_concepts.append(f"{rel_qualifier} {rel_label}")
                            else:
                                rel_concepts.append(rel_label)
                    
                    if rel_concepts:
                        relations.append(f"{relation}s {', '.join(rel_concepts)}")
                else:
                    relations.append(f"{relation}s {value}")
        
        if relations:
            if result:
                result += " " + " and ".join(relations)
            else:
                result = "It " + " and ".join(relations)
        
        if not result:
            result = self._generate_generic(parsed, msg_type)
        
        return result + "."
    
    def _generate_response(self, parsed: Dict[str, Any], msg_type: str) -> str:
        """Generate natural language for response type messages."""
        if '~information' in msg_type:
            result = "In response to your question, "
            
            # Look for list items
            list_items = []
            if '#list' in parsed:
                list_dict = parsed['#list']
                for key, value in list_dict.items():
                    if key.startswith('#item'):
                        item_str = ""
                        if isinstance(value, dict):
                            # Extract concepts from the item
                            item_concepts = []
                            for item_key, item_val in value.items():
                                if item_key.startswith('#c'):
                                    item_concept_id = item_key.split('~')[0][1:]
                                    item_label = self.concept_space.concept_id_to_label(item_concept_id)
                                    item_qualifier = item_key.split('~')[1] if '~' in item_key else None
                                    if item_qualifier:
                                        item_concepts.append(f"{item_qualifier} {item_label}")
                                    else:
                                        item_concepts.append(item_label)
                            
                            if item_concepts:
                                item_str += ', '.join(item_concepts)
                                
                            # Handle relations within the item
                            for item_key, item_val in value.items():
                                if item_key.startswith('~'):
                                    relation = item_key[1:]  # Remove ~ prefix
                                    if isinstance(item_val, dict):
                                        rel_concepts = []
                                        for rel_key, rel_val in item_val.items():
                                            if rel_key.startswith('#c'):
                                                rel_concept_id = rel_key.split('~')[0][1:]
                                                rel_label = self.concept_space.concept_id_to_label(rel_concept_id)
                                                rel_qualifier = rel_key.split('~')[1] if '~' in rel_key else None
                                                if rel_qualifier:
                                                    rel_concepts.append(f"{rel_qualifier} {rel_label}")
                                                else:
                                                    rel_concepts.append(rel_label)
                                        
                                        if rel_concepts:
                                            item_str += f" which {relation}s {', '.join(rel_concepts)}"
                                    elif isinstance(item_val, str) and item_val.startswith('^'):
                                        # Handle references
                                        item_str += f" which {relation}s the previously mentioned concept"
                                    else:
                                        item_str += f" which {relation}s {item_val}"
                        else:
                            item_str = str(value)
                        
                        list_items.append(item_str)
            
            if list_items:
                # Format as a enumerated list
                result += "here are the key points: "
                for i, item in enumerate(list_items):
                    result += f"\n{i+1}. {item}"
            else:
                # Fallback to generic approach if no list items
                result += self._generate_generic(parsed, msg_type)
            
            return result + "."
        else:
            # Generic response
            return "In response, " + self._generate_generic(parsed, msg_type) + "."
    
    def _generate_generic(self, parsed: Dict[str, Any], msg_type: str) -> str:
        """Generic natural language generation for any message type."""
        elements = []
        
        # Extract concepts
        for key, value in parsed.items():
            if key.startswith('#') and key != '_version' and key != msg_type:
                if isinstance(value, dict):
                    # Nested structure
                    sub_elements = []
                    for sub_key, sub_value in value.items():
                        if sub_key.startswith('#c'):
                            concept_id = sub_key.split('~')[0][1:]
                            label = self.concept_space.concept_id_to_label(concept_id)
                            qualifier = sub_key.split('~')[1] if '~' in sub_key else None
                            if qualifier:
                                sub_elements.append(f"{qualifier} {label}")
                            else:
                                sub_elements.append(label)
                        elif sub_key.startswith('~'):
                            # Relation
                            relation = sub_key[1:]
                            if isinstance(sub_value, dict):
                                rel_parts = []
                                for rel_key, rel_val in sub_value.items():
                                    if rel_key.startswith('#c'):
                                        rel_concept_id = rel_key.split('~')[0][1:]
                                        rel_label = self.concept_space.concept_id_to_label(rel_concept_id)
                                        rel_qualifier = rel_key.split('~')[1] if '~' in rel_key else None
                                        if rel_qualifier:
                                            rel_parts.append(f"{rel_qualifier} {rel_label}")
                                        else:
                                            rel_parts.append(rel_label)
                                
                                if rel_parts:
                                    sub_elements.append(f"{relation}s {', '.join(rel_parts)}")
                            else:
                                sub_elements.append(f"{relation}s {sub_value}")
                    
                    if sub_elements:
                        elements.append(' that '.join(sub_elements))
                elif isinstance(value, str) and value.startswith('#c'):
                    # Direct concept reference
                    concept_id = value[1:]
                    elements.append(self.concept_space.concept_id_to_label(concept_id))
                else:
                    # Simple value
                    elements.append(str(value))
        
        # Extract relations
        for key, value in parsed.items():
            if key.startswith('~'):
                relation = key[1:]
                if isinstance(value, dict):
                    rel_elements = []
                    for rel_key, rel_value in value.items():
                        if rel_key.startswith('#c'):
                            rel_concept_id = rel_key.split('~')[0][1:]
                            rel_label = self.concept_space.concept_id_to_label(rel_concept_id)
                            rel_qualifier = rel_key.split('~')[1] if '~' in rel_key else None
                            if rel_qualifier:
                                rel_elements.append(f"{rel_qualifier} {rel_label}")
                            else:
                                rel_elements.append(rel_label)
                    
                    if rel_elements:
                        elements.append(f"{relation}s {', '.join(rel_elements)}")
                else:
                    elements.append(f"{relation}s {value}")
        
        # Combine elements into a sentence
        if elements:
            result = ' that '.join(elements)
            # Capitalize first letter
            result = result[0].upper() + result[1:]
            return result
        else:
            return "No decodable content found"


def main():
    """Simple demonstration of LLM-CL encoder/decoder usage."""
    # Initialize components
    concept_space = UniversalConceptSpace()
    ref_resolver = ReferenceResolver()
    parser = LLMCLParser(concept_space, ref_resolver)
    encoder = LLMCLEncoder(concept_space)
    decoder = LLMCLDecoder(concept_space, parser)
    
    # Example natural language text
    nl_text = "What are the three main approaches to artificial intelligence research?"
    
    print("Original text:")
    print(nl_text)
    print()
    
    # Encode to LLM-CL
    llmcl = encoder.encode(nl_text)
    print("Encoded LLM-CL:")
    print(llmcl)
    print()
    
    # Parse the LLM-CL
    parsed = parser.parse_llmcl(llmcl)
    print("Parsed structure:")
    print(json.dumps(parsed, indent=2))
    print()
    
    # Decode back to natural language
    decoded = decoder.decode(llmcl)
    print("Decoded text:")
    print(decoded)
    print()
    
    # Add to context
    ref_resolver.add_to_context(parsed)
    
    # Example with references
    ref_llmcl = """@v1.0{#response~information
  #list{
    #item1{#c501~symbolic #c142
      ~has{#c2231~logic #c8701~rules}
    }
    #item2{#c501~connectionist #c142
      ~has{#c4230~neural_networks #c4231~deep_learning}
    }
    #item3{#c501~hybrid
      ~combines{^prev1.#list.#item1 ^prev1.#list.#item2}
    }
  }
}"""
    
    print("Reference-containing LLM-CL:")
    print(ref_llmcl)
    print()
    
    # Parse and decode
    ref_parsed = parser.parse_llmcl(ref_llmcl)
    ref_decoded = decoder.decode(ref_llmcl)
    
    print("Decoded reference text:")
    print(ref_decoded)


if __name__ == "__main__":
    main()
