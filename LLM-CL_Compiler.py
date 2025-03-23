#!/usr/bin/env python3
"""
LLM-CL Compiler Implementation

This module implements a compiler for the LLM-CL language, providing a complete
pipeline from lexical analysis to code generation using compiler theory principles.
"""

import re
import json
from enum import Enum, auto
from typing import List, Dict, Any, Optional, Tuple, Union
from dataclasses import dataclass

#########################################
# Lexical Analysis (Tokenization) Phase #
#########################################

class TokenType(Enum):
    """Token types in the LLM-CL language."""
    VERSION = auto()         # @v1.0
    CONCEPT = auto()         # #concept
    RELATION = auto()        # ~relation
    QUANTIFIER = auto()      # $quantity
    REFERENCE = auto()       # ^prev1
    OPERATOR = auto()        # +, *, /, <, >
    OPEN_BRACE = auto()      # {
    CLOSE_BRACE = auto()     # }
    IDENTIFIER = auto()      # Any alphanumeric sequence
    WHITESPACE = auto()      # Spaces, tabs, newlines
    EOF = auto()             # End of file
    ERROR = auto()           # Invalid token


@dataclass
class Token:
    """Represents a token in the LLM-CL language."""
    type: TokenType
    value: str
    line: int
    column: int
    
    def __repr__(self) -> str:
        return f"Token({self.type}, '{self.value}', line={self.line}, col={self.column})"


class Lexer:
    """
    Lexer for LLM-CL language.
    Converts raw LLM-CL text into a stream of tokens.
    """
    
    def __init__(self, source: str):
        """
        Initialize the lexer with source code.
        
        Args:
            source: LLM-CL source code to tokenize
        """
        self.source = source
        self.position = 0
        self.line = 1
        self.column = 1
        self.tokens = []
        
    def tokenize(self) -> List[Token]:
        """
        Tokenize the source code into a list of tokens.
        
        Returns:
            List of tokens
        """
        while self.position < len(self.source):
            char = self.source[self.position]
            
            # Handle whitespace
            if char.isspace():
                self._tokenize_whitespace()
                continue
                
            # Handle version marker
            if char == '@':
                self._tokenize_version()
                continue
                
            # Handle concept marker
            if char == '#':
                self._tokenize_concept()
                continue
                
            # Handle relation marker
            if char == '~':
                self._tokenize_relation()
                continue
                
            # Handle quantifier marker
            if char == '$':
                self._tokenize_quantifier()
                continue
                
            # Handle reference marker
            if char == '^':
                self._tokenize_reference()
                continue
                
            # Handle structural braces
            if char == '{':
                self._add_token(TokenType.OPEN_BRACE, '{')
                self._advance()
                continue
                
            if char == '}':
                self._add_token(TokenType.CLOSE_BRACE, '}')
                self._advance()
                continue
                
            # Handle operators
            if char in '+-*/<>':
                self._add_token(TokenType.OPERATOR, char)
                self._advance()
                continue
                
            # Handle identifiers
            if char.isalnum() or char == '_':
                self._tokenize_identifier()
                continue
                
            # Handle unknown characters
            self._add_token(TokenType.ERROR, char)
            self._advance()
            
        # Add EOF token
        self._add_token(TokenType.EOF, "")
        return self.tokens
    
    def _tokenize_whitespace(self):
        """Tokenize whitespace characters."""
        start_pos = self.position
        start_col = self.column
        
        while self.position < len(self.source) and self.source[self.position].isspace():
            if self.source[self.position] == '\n':
                self.line += 1
                self.column = 1
            else:
                self.column += 1
            self.position += 1
        
        whitespace = self.source[start_pos:self.position]
        self._add_token_with_position(TokenType.WHITESPACE, whitespace, self.line, start_col)
    
    def _tokenize_version(self):
        """Tokenize version markers (@v1.0)."""
        start_pos = self.position
        start_col = self.column
        
        self._advance()  # Skip @
        
        # Match vX.Y format
        version_pattern = r'v\d+\.\d+'
        match = re.match(version_pattern, self.source[self.position:])
        
        if match:
            version = match.group(0)
            self._add_token_with_position(TokenType.VERSION, f"@{version}", self.line, start_col)
            self.position += len(version)
            self.column += len(version)
        else:
            self._add_token_with_position(TokenType.ERROR, "@", self.line, start_col)
    
    def _tokenize_concept(self):
        """Tokenize concept markers (#concept)."""
        start_pos = self.position
        start_col = self.column
        
        self._advance()  # Skip #
        
        # Match concept identifiers (can include ~qualifier)
        identifier = ""
        while (self.position < len(self.source) and 
               (self.source[self.position].isalnum() or 
                self.source[self.position] in ['_', '~'])):
            identifier += self.source[self.position]
            self._advance()
        
        self._add_token_with_position(TokenType.CONCEPT, f"#{identifier}", self.line, start_col)
    
    def _tokenize_relation(self):
        """Tokenize relation markers (~relation)."""
        start_pos = self.position
        start_col = self.column
        
        self._advance()  # Skip ~
        
        # Match relation identifiers
        identifier = ""
        while (self.position < len(self.source) and 
               (self.source[self.position].isalnum() or 
                self.source[self.position] == '_')):
            identifier += self.source[self.position]
            self._advance()
        
        self._add_token_with_position(TokenType.RELATION, f"~{identifier}", self.line, start_col)
    
    def _tokenize_quantifier(self):
        """Tokenize quantifier markers ($quantity)."""
        start_pos = self.position
        start_col = self.column
        
        self._advance()  # Skip $
        
        # Match quantifier identifiers
        identifier = ""
        while (self.position < len(self.source) and 
               (self.source[self.position].isalnum() or 
                self.source[self.position] == '_')):
            identifier += self.source[self.position]
            self._advance()
        
        self._add_token_with_position(TokenType.QUANTIFIER, f"${identifier}", self.line, start_col)
    
    def _tokenize_reference(self):
        """Tokenize reference markers (^prev1)."""
        start_pos = self.position
        start_col = self.column
        
        self._advance()  # Skip ^
        
        # Match reference paths (can include ., #, digit)
        reference = ""
        while (self.position < len(self.source) and 
               (self.source[self.position].isalnum() or 
                self.source[self.position] in ['_', '.', '#'])):
            reference += self.source[self.position]
            self._advance()
        
        self._add_token_with_position(TokenType.REFERENCE, f"^{reference}", self.line, start_col)
    
    def _tokenize_identifier(self):
        """Tokenize regular identifiers."""
        start_pos = self.position
        start_col = self.column
        
        identifier = ""
        while (self.position < len(self.source) and 
               (self.source[self.position].isalnum() or 
                self.source[self.position] == '_')):
            identifier += self.source[self.position]
            self._advance()
        
        self._add_token_with_position(TokenType.IDENTIFIER, identifier, self.line, start_col)
    
    def _advance(self):
        """Advance the lexer position by one character."""
        self.position += 1
        self.column += 1
    
    def _add_token(self, token_type: TokenType, value: str):
        """Add a token to the token list."""
        self.tokens.append(Token(token_type, value, self.line, self.column))
    
    def _add_token_with_position(self, token_type: TokenType, value: str, line: int, column: int):
        """Add a token with specific position information."""
        self.tokens.append(Token(token_type, value, line, column))


#################################
# Syntax Analysis (Parser) Phase #
#################################

class ASTNodeType(Enum):
    """Types of nodes in the Abstract Syntax Tree."""
    MESSAGE = auto()         # Top-level message
    VERSION = auto()         # Version declaration
    CONCEPT = auto()         # Concept definition
    RELATION = auto()        # Relation definition
    QUANTIFIER = auto()      # Quantifier definition
    REFERENCE = auto()       # Reference
    LIST = auto()            # List structure
    ITEM = auto()            # List item
    PROPERTY = auto()        # Property assignment
    
    
@dataclass
class ASTNode:
    """Node in the Abstract Syntax Tree."""
    type: ASTNodeType
    value: Optional[str] = None
    children: List['ASTNode'] = None
    attributes: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.children is None:
            self.children = []
        if self.attributes is None:
            self.attributes = {}
    
    def add_child(self, node: 'ASTNode'):
        """Add a child node to this node."""
        self.children.append(node)
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert the AST node to a dictionary representation."""
        result = {'type': self.type.name}
        if self.value is not None:
            result['value'] = self.value
            
        if self.attributes:
            result['attributes'] = self.attributes
            
        if self.children:
            result['children'] = [child.to_dict() for child in self.children]
            
        return result


class Parser:
    """
    Parser for LLM-CL language.
    Converts a token stream into an Abstract Syntax Tree (AST).
    """
    
    def __init__(self, tokens: List[Token]):
        """
        Initialize the parser with tokens.
        
        Args:
            tokens: List of tokens from the lexer
        """
        self.tokens = [t for t in tokens if t.type != TokenType.WHITESPACE]
        self.current = 0
        self.errors = []
        
    def parse(self) -> ASTNode:
        """
        Parse the tokens into an AST.
        
        Returns:
            The root AST node
        """
        try:
            return self._parse_message()
        except Exception as e:
            self.errors.append(str(e))
            return ASTNode(ASTNodeType.MESSAGE, "Error", [], {"error": str(e)})
    
    def _parse_message(self) -> ASTNode:
        """Parse a complete LLM-CL message."""
        message_node = ASTNode(ASTNodeType.MESSAGE)
        
        # Expect version marker
        if self._match(TokenType.VERSION):
            version_token = self._previous()
            version_node = ASTNode(ASTNodeType.VERSION, version_token.value)
            message_node.add_child(version_node)
        else:
            self._error("Expected version marker (@v1.0)")
        
        # Expect opening brace
        self._consume(TokenType.OPEN_BRACE, "Expected '{' after version marker")
        
        # Parse message contents
        while not self._check(TokenType.CLOSE_BRACE) and not self._is_at_end():
            if self._match(TokenType.CONCEPT):
                concept_token = self._previous()
                concept_node = self._parse_concept(concept_token.value)
                message_node.add_child(concept_node)
            elif self._match(TokenType.RELATION):
                relation_token = self._previous()
                relation_node = self._parse_relation(relation_token.value)
                message_node.add_child(relation_node)
            elif self._match(TokenType.QUANTIFIER):
                quantifier_token = self._previous()
                quantifier_node = self._parse_quantifier(quantifier_token.value)
                message_node.add_child(quantifier_node)
            elif self._match(TokenType.REFERENCE):
                reference_token = self._previous()
                reference_node = ASTNode(ASTNodeType.REFERENCE, reference_token.value)
                message_node.add_child(reference_node)
            else:
                self._error(f"Unexpected token: {self._peek().value}")
                self._advance()
        
        # Expect closing brace
        self._consume(TokenType.CLOSE_BRACE, "Expected '}' to close message")
        
        return message_node
    
    def _parse_concept(self, concept_value: str) -> ASTNode:
        """Parse a concept definition."""
        concept_node = ASTNode(ASTNodeType.CONCEPT, concept_value)
        
        # Check if followed by opening brace
        if self._match(TokenType.OPEN_BRACE):
            # Parse concept contents
            while not self._check(TokenType.CLOSE_BRACE) and not self._is_at_end():
                if self._match(TokenType.CONCEPT):
                    subconcept_token = self._previous()
                    subconcept_node = self._parse_concept(subconcept_token.value)
                    concept_node.add_child(subconcept_node)
                elif self._match(TokenType.RELATION):
                    relation_token = self._previous()
                    relation_node = self._parse_relation(relation_token.value)
                    concept_node.add_child(relation_node)
                elif self._match(TokenType.QUANTIFIER):
                    quantifier_token = self._previous()
                    quantifier_node = self._parse_quantifier(quantifier_token.value)
                    concept_node.add_child(quantifier_node)
                elif self._match(TokenType.REFERENCE):
                    reference_token = self._previous()
                    reference_node = ASTNode(ASTNodeType.REFERENCE, reference_token.value)
                    concept_node.add_child(reference_node)
                else:
                    self._error(f"Unexpected token in concept: {self._peek().value}")
                    self._advance()
            
            # Expect closing brace
            self._consume(TokenType.CLOSE_BRACE, "Expected '}' to close concept")
        
        return concept_node
    
    def _parse_relation(self, relation_value: str) -> ASTNode:
        """Parse a relation definition."""
        relation_node = ASTNode(ASTNodeType.RELATION, relation_value)
        
        # Check if followed by opening brace
        if self._match(TokenType.OPEN_BRACE):
            # Parse relation contents
            while not self._check(TokenType.CLOSE_BRACE) and not self._is_at_end():
                if self._match(TokenType.CONCEPT):
                    subconcept_token = self._previous()
                    subconcept_node = self._parse_concept(subconcept_token.value)
                    relation_node.add_child(subconcept_node)
                elif self._match(TokenType.RELATION):
                    subrelation_token = self._previous()
                    subrelation_node = self._parse_relation(subrelation_token.value)
                    relation_node.add_child(subrelation_node)
                elif self._match(TokenType.REFERENCE):
                    reference_token = self._previous()
                    reference_node = ASTNode(ASTNodeType.REFERENCE, reference_token.value)
                    relation_node.add_child(reference_node)
                else:
                    self._error(f"Unexpected token in relation: {self._peek().value}")
                    self._advance()
            
            # Expect closing brace
            self._consume(TokenType.CLOSE_BRACE, "Expected '}' to close relation")
        
        return relation_node
    
    def _parse_quantifier(self, quantifier_value: str) -> ASTNode:
        """Parse a quantifier definition."""
        quantifier_node = ASTNode(ASTNodeType.QUANTIFIER, quantifier_value)
        
        # Check if followed by opening brace
        if self._match(TokenType.OPEN_BRACE):
            # Parse quantifier contents
            while not self._check(TokenType.CLOSE_BRACE) and not self._is_at_end():
                if self._match(TokenType.CONCEPT):
                    subconcept_token = self._previous()
                    subconcept_node = self._parse_concept(subconcept_token.value)
                    quantifier_node.add_child(subconcept_node)
                elif self._match(TokenType.QUANTIFIER):
                    subquantifier_token = self._previous()
                    subquantifier_node = self._parse_quantifier(subquantifier_token.value)
                    quantifier_node.add_child(subquantifier_node)
                elif self._match(TokenType.IDENTIFIER):
                    identifier_token = self._previous()
                    identifier_node = ASTNode(ASTNodeType.PROPERTY, identifier_token.value)
                    quantifier_node.add_child(identifier_node)
                else:
                    self._error(f"Unexpected token in quantifier: {self._peek().value}")
                    self._advance()
            
            # Expect closing brace
            self._consume(TokenType.CLOSE_BRACE, "Expected '}' to close quantifier")
        
        return quantifier_node
    
    def _match(self, *types: TokenType) -> bool:
        """
        Check if the current token matches any of the given types.
        If it matches, consume the token and return True.
        """
        for token_type in types:
            if self._check(token_type):
                self._advance()
                return True
        return False
    
    def _check(self, token_type: TokenType) -> bool:
        """Check if the current token is of the given type."""
        if self._is_at_end():
            return False
        return self._peek().type == token_type
    
    def _advance(self) -> Token:
        """Advance to the next token."""
        if not self._is_at_end():
            self.current += 1
        return self._previous()
    
    def _is_at_end(self) -> bool:
        """Check if we've reached the end of the token stream."""
        return self._peek().type == TokenType.EOF
    
    def _peek(self) -> Token:
        """Return the current token without consuming it."""
        return self.tokens[self.current]
    
    def _previous(self) -> Token:
        """Return the most recently consumed token."""
        return self.tokens[self.current - 1]
    
    def _consume(self, token_type: TokenType, error_message: str) -> Token:
        """
        Consume the current token if it matches the expected type.
        Otherwise, report an error.
        """
        if self._check(token_type):
            return self._advance()
        
        self._error(error_message)
        return self._peek()
    
    def _error(self, message: str):
        """Report a parsing error."""
        token = self._peek()
        error = f"Error at line {token.line}, column {token.column}: {message}"
        self.errors.append(error)
        raise Exception(error)


###############################
# Semantic Analysis Phase     #
###############################

class SemanticAnalyzer:
    """
    Semantic analyzer for LLM-CL language.
    Performs semantic checks on the AST.
    """
    
    def __init__(self, ast: ASTNode, concept_space: Dict[str, Dict[str, Any]]=None):
        """
        Initialize the semantic analyzer.
        
        Args:
            ast: The AST to analyze
            concept_space: Optional dictionary mapping concept IDs to definitions
        """
        self.ast = ast
        self.errors = []
        self.warnings = []
        self.concept_space = concept_space or {}
        
    def analyze(self) -> Tuple[List[str], List[str]]:
        """
        Analyze the AST for semantic errors and warnings.
        
        Returns:
            Tuple of (errors, warnings)
        """
        self._analyze_node(self.ast)
        return self.errors, self.warnings
    
    def _analyze_node(self, node: ASTNode):
        """Analyze a single AST node recursively."""
        if node.type == ASTNodeType.MESSAGE:
            self._check_message_structure(node)
        elif node.type == ASTNodeType.CONCEPT:
            self._check_concept(node)
        elif node.type == ASTNodeType.REFERENCE:
            self._check_reference(node)
        
        # Recursively analyze children
        for child in node.children:
            self._analyze_node(child)
    
    def _check_message_structure(self, node: ASTNode):
        """Check if the message has the correct structure."""
        # Check for version node
        version_nodes = [child for child in node.children if child.type == ASTNodeType.VERSION]
        if not version_nodes:
            self.errors.append("Message missing version marker")
        
        # Check for at least one content node (concept, relation, etc.)
        content_nodes = [child for child in node.children 
                         if child.type not in (ASTNodeType.VERSION,)]
        if not content_nodes:
            self.warnings.append("Message has no content nodes")
    
    def _check_concept(self, node: ASTNode):
        """Check if the concept is valid."""
        # Extract concept ID if it exists
        concept_id = None
        if node.value and node.value.startswith('#c') and '~' not in node.value:
            concept_id = node.value[1:]  # Remove # prefix
            
            # Check if concept exists in concept space
            if self.concept_space and concept_id not in self.concept_space:
                self.warnings.append(f"Unknown concept ID: {concept_id}")
    
    def _check_reference(self, node: ASTNode):
        """Check if the reference syntax is valid."""
        if not node.value:
            self.errors.append("Reference node has no value")
            return
            
        ref_value = node.value
        
        # Check reference format
        if not ref_value.startswith('^'):
            self.errors.append(f"Invalid reference format: {ref_value}")
            return
            
        # Check for presence of at least one path segment
        path_parts = ref_value[1:].split('.')
        if len(path_parts) < 1:
            self.errors.append(f"Reference needs at least one path segment: {ref_value}")
            
        # Check if first segment is valid
        first_segment = path_parts[0]
        if not (first_segment == 'self' or first_segment == 'shared' or 
                first_segment.startswith('prev')):
            self.warnings.append(f"Unusual reference type: {first_segment}")
            
        # Check prev format
        if first_segment.startswith('prev'):
            index_part = first_segment[4:]
            if not index_part.isdigit():
                self.errors.append(f"Invalid prev index: {first_segment}")


###################################
# Intermediate Representation (IR) #
###################################

class IRBuilder:
    """
    Builds an intermediate representation (IR) from the AST.
    This IR is more suitable for code generation and optimization.
    """
    
    def __init__(self, ast: ASTNode):
        """
        Initialize the IR builder.
        
        Args:
            ast: The AST to convert to IR
        """
        self.ast = ast
        
    def build(self) -> Dict[str, Any]:
        """
        Build the intermediate representation.
        
        Returns:
            Dictionary representation of the IR
        """
        return self._build_node_ir(self.ast)
    
    def _build_node_ir(self, node: ASTNode) -> Dict[str, Any]:
        """Build IR for a single node recursively."""
        if node.type == ASTNodeType.MESSAGE:
            return self._build_message_ir(node)
        elif node.type == ASTNodeType.CONCEPT:
            return self._build_concept_ir(node)
        elif node.type == ASTNodeType.RELATION:
            return self._build_relation_ir(node)
        elif node.type == ASTNodeType.QUANTIFIER:
            return self._build_quantifier_ir(node)
        elif node.type == ASTNodeType.REFERENCE:
            return self._build_reference_ir(node)
        else:
            # Generic handling for other node types
            return {
                'type': node.type.name,
                'value': node.value,
                'attributes': node.attributes,
                'children': [self._build_node_ir(child) for child in node.children]
            }
    
    def _build_message_ir(self, node: ASTNode) -> Dict[str, Any]:
        """Build IR for a message node."""
        message_ir = {'type': 'Message'}
        
        # Extract version
        version_nodes = [child for child in node.children if child.type == ASTNodeType.VERSION]
        if version_nodes:
            version_node = version_nodes[0]
            # Extract version number from @vX.Y format
            version_match = re.search(r'v(\d+\.\d+)', version_node.value)
            if version_match:
                message_ir['version'] = version_match.group(1)
        
        # Extract content nodes
        content_nodes = [child for child in node.children 
                         if child.type not in (ASTNodeType.VERSION,)]
        
        if content_nodes:
            message_ir['content'] = [self._build_node_ir(child) for child in content_nodes]
        
        return message_ir
    
    def _build_concept_ir(self, node: ASTNode) -> Dict[str, Any]:
        """Build IR for a concept node."""
        concept_ir = {'type': 'Concept'}
        
        # Extract concept ID and qualifier
        if node.value:
            parts = node.value[1:].split('~')  # Remove # prefix
            concept_ir['id'] = parts[0]
            if len(parts) > 1:
                concept_ir['qualifier'] = parts[1]
        
        # Add children
        if node.children:
            concept_ir['children'] = [self._build_node_ir(child) for child in node.children]
        
        return concept_ir
    
    def _build_relation_ir(self, node: ASTNode) -> Dict[str, Any]:
        """Build IR for a relation node."""
        relation_ir = {'type': 'Relation'}
        
        # Extract relation name
        if node.value:
            relation_ir['name'] = node.value[1:]  # Remove ~ prefix
        
        # Add children
        if node.children:
            relation_ir['children'] = [self._build_node_ir(child) for child in node.children]
        
        return relation_ir
    
    def _build_quantifier_ir(self, node: ASTNode) -> Dict[str, Any]:
        """Build IR for a quantifier node."""
        quantifier_ir = {'type': 'Quantifier'}
        
        # Extract quantifier name
        if node.value:
            quantifier_ir['name'] = node.value[1:]  # Remove $ prefix
        
        # Add children
        if node.children:
            quantifier_ir['children'] = [self._build_node_ir(child) for child in node.children]
        
        return quantifier_ir
    
    def _build_reference_ir(self, node: ASTNode) -> Dict[str, Any]:
        """Build IR for a reference node."""
        reference_ir = {'type': 'Reference'}
        
        # Extract reference path
        if node.value:
            path_parts = node.value[1:].split('.')  # Remove ^ prefix
            reference_ir['source'] = path_parts[0]
            if len(path_parts) > 1:
                reference_ir['path'] = path_parts[1:]
        
        return reference_ir


########################
# Optimization Phase   #
########################

class Optimizer:
    """
    Optimizer for LLM-CL intermediate representation.
    Performs various optimizations to improve code quality and efficiency.
    """
    
    def __init__(self, ir: Dict[str, Any]):
        """
        Initialize the optimizer.
        
        Args:
            ir: The intermediate representation to optimize
        """
        self.ir = ir
        
    def optimize(self) -> Dict[str, Any]:
        """
        Optimize the intermediate representation.
        
        Returns:
            Optimized intermediate representation
        """
        # Perform optimizations
        optimized_ir = self.ir.copy()
        
        # Apply optimizations recursively
        optimized_ir = self._optimize_node(optimized_ir)
        
        return optimized_ir
    
    def _optimize_node(self, node: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize a single node recursively.
        """
        if isinstance(node, dict):
            # Apply node-specific optimizations
            if node.get('type') == 'Message':
                return self._optimize_message(node)
            elif node.get('type') == 'Concept':
                return self._optimize_concept(node)
            elif node.get('type') == 'Relation':
                return self._optimize_relation(node)
            
            # Recursively optimize children
            for key, value in node.items():
                if isinstance(value, (dict, list)):
                    node[key] = self._optimize_node(value)
                    
            return node
        elif isinstance(node, list):
            # Optimize each item in the list
            return [self._optimize_node(item) for item in node]
        else:
            # Primitive value, no optimization needed
            return node
    
    def _optimize_message(self, node: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize a message node.
        
        Args:
            node: Message node to optimize
            
        Returns:
            Optimized message node
        """
        # Ensure version is included
        if 'version' not in node:
            node['version'] = '1.0'  # Default version
        
        # Optimize content nodes
        if 'content' in node and isinstance(node['content'], list):
            # Filter out empty nodes
            node['content'] = [n for n in node['content'] if n is not None]
            
            # Sort content by type for more predictable output
            node['content'].sort(key=lambda x: (x.get('type', ''), x.get('id', ''), x.get('name', '')))
            
            # Recursively optimize each content node
            node['content'] = [self._optimize_node(item) for item in node['content']]
        
        return node
    
    def _optimize_concept(self, node: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize a concept node.
        
        Args:
            node: Concept node to optimize
            
        Returns:
            Optimized concept node
        """
        # Ensure ID is included
        if 'id' not in node:
            # Generate a placeholder ID for concepts without explicit IDs
            node['id'] = f"concept_{id(node)}"
        
        # Optimize children
        if 'children' in node and isinstance(node['children'], list):
            # Filter out empty children
            node['children'] = [n for n in node['children'] if n is not None]
            
            # Group relations and concepts separately
            relations = [n for n in node['children'] if n.get('type') == 'Relation']
            concepts = [n for n in node['children'] if n.get('type') == 'Concept']
            others = [n for n in node['children'] if n.get('type') not in ('Relation', 'Concept')]
            
            # Combine and sort for more predictable output
            node['children'] = concepts + relations + others
            
            # Recursively optimize each child
            node['children'] = [self._optimize_node(item) for item in node['children']]
        
        return node
    
    def _optimize_relation(self, node: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize a relation node.
        
        Args:
            node: Relation node to optimize
            
        Returns:
            Optimized relation node
        """
        # Ensure name is included
        if 'name' not in node:
            # Generate a placeholder name for relations without explicit names
            node['name'] = f"relation_{id(node)}"
        
        # Optimize children
        if 'children' in node and isinstance(node['children'], list):
            # Filter out empty children
            node['children'] = [n for n in node['children'] if n is not None]
            
            # Recursively optimize each child
            node['children'] = [self._optimize_node(item) for item in node['children']]
        
        return node


########################
# Code Generation Phase #
########################

class CodeGenerator:
    """
    Code generator for LLM-CL language.
    Converts optimized IR to LLM-CL code.
    """
    
    def __init__(self, ir: Dict[str, Any]):
        """
        Initialize the code generator.
        
        Args:
            ir: The optimized intermediate representation
        """
        self.ir = ir
        self.indent_level = 0
        self.indent_size = 2
        
    def generate(self) -> str:
        """
        Generate LLM-CL code from the IR.
        
        Returns:
            Generated LLM-CL code as string
        """
        return self._generate_node(self.ir)
    
    def _generate_node(self, node: Dict[str, Any]) -> str:
        """
        Generate code for a single node recursively.
        
        Args:
            node: IR node to generate code for
            
        Returns:
            Generated code for the node
        """
        if not isinstance(node, dict) or 'type' not in node:
            return ""
            
        node_type = node.get('type')
        
        if node_type == 'Message':
            return self._generate_message(node)
        elif node_type == 'Concept':
            return self._generate_concept(node)
        elif node_type == 'Relation':
            return self._generate_relation(node)
        elif node_type == 'Quantifier':
            return self._generate_quantifier(node)
        elif node_type == 'Reference':
            return self._generate_reference(node)
        else:
            # Default handling for other node types
            return ""
    
    def _generate_message(self, node: Dict[str, Any]) -> str:
        """Generate code for a message node."""
        version = node.get('version', '1.0')
        code = f"@v{version}{{\n"
        
        self.indent_level += 1
        
        # Generate code for content nodes
        if 'content' in node and isinstance(node['content'], list):
            for content_node in node['content']:
                content_code = self._generate_node(content_node)
                if content_code:
                    indented_code = self._indent(content_code)
                    code += indented_code + "\n"
        
        self.indent_level -= 1
        code += "}"
        
        return code
    
    def _generate_concept(self, node: Dict[str, Any]) -> str:
        """Generate code for a concept node."""
        concept_id = node.get('id', '')
        qualifier = node.get('qualifier', '')
        
        # Format concept tag
        if qualifier:
            tag = f"#{concept_id}~{qualifier}"
        else:
            tag = f"#{concept_id}"
        
        # If no children, return just the tag
        if 'children' not in node or not node['children']:
            return tag
        
        # Otherwise, include children
        code = f"{tag}{{\n"
        
        self.indent_level += 1
        
        # Generate code for child nodes
        for child in node['children']:
            child_code = self._generate_node(child)
            if child_code:
                indented_code = self._indent(child_code)
                code += indented_code + "\n"
        
        self.indent_level -= 1
        code += self._indent("}")
        
        return code
    
    def _generate_relation(self, node: Dict[str, Any]) -> str:
        """Generate code for a relation node."""
        relation_name = node.get('name', '')
        
        # Format relation tag
        tag = f"~{relation_name}"
        
        # If no children, return just the tag
        if 'children' not in node or not node['children']:
            return tag
        
        # Otherwise, include children
        code = f"{tag}{{\n"
        
        self.indent_level += 1
        
        # Generate code for child nodes
        for child in node['children']:
            child_code = self._generate_node(child)
            if child_code:
                indented_code = self._indent(child_code)
                code += indented_code + "\n"
        
        self.indent_level -= 1
        code += self._indent("}")
        
        return code
    
    def _generate_quantifier(self, node: Dict[str, Any]) -> str:
        """Generate code for a quantifier node."""
        quantifier_name = node.get('name', '')
        
        # Format quantifier tag
        tag = f"${quantifier_name}"
        
        # If no children, return just the tag
        if 'children' not in node or not node['children']:
            return tag
        
        # Otherwise, include children
        code = f"{tag}{{\n"
        
        self.indent_level += 1
        
        # Generate code for child nodes
        for child in node['children']:
            child_code = self._generate_node(child)
            if child_code:
                indented_code = self._indent(child_code)
                code += indented_code + "\n"
        
        self.indent_level -= 1
        code += self._indent("}")
        
        return code
    
    def _generate_reference(self, node: Dict[str, Any]) -> str:
        """Generate code for a reference node."""
        source = node.get('source', '')
        path = node.get('path', [])
        
        # Format reference
        if not path:
            return f"^{source}"
        else:
            path_str = '.'.join(path)
            return f"^{source}.{path_str}"
    
    def _indent(self, code: str) -> str:
        """Add indentation to code."""
        spaces = ' ' * (self.indent_level * self.indent_size)
        return spaces + code


#######################
# Complete Compilation #
#######################

class LLMCLCompiler:
    """
    Complete compiler for LLM-CL language.
    Combines all compilation phases.
    """
    
    def __init__(self, source: str, concept_space: Dict[str, Dict[str, Any]]=None):
        """
        Initialize the compiler.
        
        Args:
            source: LLM-CL source code to compile
            concept_space: Optional dictionary mapping concept IDs to definitions
        """
        self.source = source
        self.concept_space = concept_space or {}
        
        # Initialize components
        self.lexer = Lexer(source)
        self.tokens = None
        self.parser = None
        self.ast = None
        self.semantic_analyzer = None
        self.errors = []
        self.warnings = []
        self.ir = None
        self.optimized_ir = None
        self.generated_code = None
        
    def compile(self) -> Tuple[bool, str]:
        """
        Compile the source code.
        
        Returns:
            Tuple of (success_flag, result)
                success_flag: True if compilation succeeded, False otherwise
                result: Generated code if successful, error message if failed
        """
        # Lexical analysis
        try:
            self.tokens = self.lexer.tokenize()
        except Exception as e:
            self.errors.append(f"Lexical error: {str(e)}")
            return False, '\n'.join(self.errors)
        
        # Syntax analysis
        self.parser = Parser(self.tokens)
        self.ast = self.parser.parse()
        if self.parser.errors:
            self.errors.extend(self.parser.errors)
            return False, '\n'.join(self.errors)
        
        # Semantic analysis
        self.semantic_analyzer = SemanticAnalyzer(self.ast, self.concept_space)
        semantic_errors, semantic_warnings = self.semantic_analyzer.analyze()
        self.errors.extend(semantic_errors)
        self.warnings.extend(semantic_warnings)
        
        if self.errors:
            return False, '\n'.join(self.errors)
        
        # Generate IR
        ir_builder = IRBuilder(self.ast)
        self.ir = ir_builder.build()
        
        # Optimize IR
        optimizer = Optimizer(self.ir)
        self.optimized_ir = optimizer.optimize()
        
        # Generate code
        code_generator = CodeGenerator(self.optimized_ir)
        self.generated_code = code_generator.generate()
        
        return True, self.generated_code
    
    def get_ast(self) -> Dict[str, Any]:
        """Get the AST as a dictionary."""
        return self.ast.to_dict() if self.ast else None
    
    def get_ir(self) -> Dict[str, Any]:
        """Get the unoptimized IR."""
        return self.ir
    
    def get_optimized_ir(self) -> Dict[str, Any]:
        """Get the optimized IR."""
        return self.optimized_ir
    
    def get_warnings(self) -> List[str]:
        """Get compilation warnings."""
        return self.warnings
        

def main():
    """Demo of LLM-CL compiler."""
    # Example LLM-CL code
    example_code = """@v1.0{
  #request~information
  #topic{
    #c501~approaches
    #c142~agi
    #c4492~research
  }
  $quantity{3}
}"""

    # Print original code
    print("Original LLM-CL code:")
    print(example_code)
    print()
    
    # Create compiler
    compiler = LLMCLCompiler(example_code)
    
    # Compile code
    success, result = compiler.compile()
    
    if success:
        print("Compilation successful!")
        print("\nGenerated code:")
        print(result)
        
        # Print AST
        print("\nAST:")
        print(json.dumps(compiler.get_ast(), indent=2))
        
        # Print IR
        print("\nIntermediate Representation:")
        print(json.dumps(compiler.get_ir(), indent=2))
        
        # Print optimized IR
        print("\nOptimized IR:")
        print(json.dumps(compiler.get_optimized_ir(), indent=2))
        
        # Print warnings
        if compiler.get_warnings():
            print("\nWarnings:")
            for warning in compiler.get_warnings():
                print(f"- {warning}")
    else:
        print("Compilation failed with errors:")
        print(result)


if __name__ == "__main__":
    main()
