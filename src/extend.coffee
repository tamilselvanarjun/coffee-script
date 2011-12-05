
# Import all of this somehow into this scope
{count, starts, compact, last} = require './helpers'
CALLABLE  = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER']

exts = []

lexer = (tokenType, code) ->
    exts.push {type: tokenType, code: code} 
            
parser = (code) -> 

ast = (code) -> 

# Makes f! a function invocation
lexer 'literal', () ->
    prev = last @tokens
    value = @chunk.charAt 0
    
    if value is '!' and prev[0] in CALLABLE and not prev.spaced 
        prev[0] = 'FUNC_EXIST' if prev[0] is '?' # TODO: What is this line for?
        @token 'CALL_START', '('
        @token 'CALL_END', '('
        return 1
    else
      return false
        
parser ->
    
    
ast ->
  
  
exports.exts = exts
    