import * as esprima from 'esprima';

//part 1 variables
let numOfLine=1;
let table=[];

//part 2 variables
let funcArgs;
let argumentsDictionary;
let variablesDictionary;
let allValus;
let newFunction;    
//let isNotTrue;


const parseCode = (codeToParse) => {
    numOfLine=1;
    table=[];
    return esprima.parseScript(codeToParse);
};
export {parseCode};

function parsedCodeToSymbolicSubstitutionWithColor(args,parsedCode){
    argumentsDictionary = new Map();
    variablesDictionary = new Map();
    allValus = new Map();
    newFunction = [];
    funcArgs = args.split('|');
    //isNotTrue = false;
    return parsedCodeToSymbolicSubstitution(parsedCode);
}
export {parsedCodeToSymbolicSubstitutionWithColor};

function parsedCodeToSymbolicSubstitution(parsedCode){
    switch (parsedCode.type) {
    case ('Program'):
        parseProgramPart2(parsedCode);
        console.log(newFunction);
        return newFunction;
    case ('FunctionDeclaration'):
        parseFunctionDeclarationPart2(parsedCode);
        break;
    case ('BlockStatement'):
        parseBlockStatementPart2(parsedCode.body);
        break;
    default:
        return switchCaseContinue1Part2(parsedCode);
    }
}

function switchCaseContinue1Part2(parsedCode) {
    switch (parsedCode.type) {
    case ('VariableDeclaration'):
        parseVariableDeclarationPart2(parsedCode.declarations);
        break;
    case ('ExpressionStatement'):
        return parseExpressionStatementPart2(parsedCode);
    case ('AssignmentExpression'):
        parseAssignmentExpressionPart2(parsedCode);
        break;
    default:
        return switchCaseContinue2Part2(parsedCode);
    }
}

function switchCaseContinue2Part2 (parsedCode) {
    switch (parsedCode.type) {
    case ('BinaryExpression'):
        return parseBinaryExpressionPart2(parsedCode);
    case ('Identifier'):
        return parseIdentifierPart2(parsedCode);
    case ('Literal'):
        return parseLiteralPart2(parsedCode);
    case ('WhileStatement'):
        parseWhileStatementPart2(parsedCode);
        break;
    default:
        return switchCaseContinue3Part2(parsedCode);
    }
}

function switchCaseContinue3Part2 (parsedCode) {
    switch (parsedCode.type) {
    case ('IfStatement'):
        parseIfStatementPart2(parsedCode,0);
        break;
    case ('MemberExpression'):
        return parseMemberExpressionPart2(parsedCode);
    case ('UnaryExpression'):
        return parseUnaryExpressionPart2(parsedCode);
    case ('ReturnStatement'):
        parseReturnStatementPart2(parsedCode);
        break;
    }
}

function parseProgramPart2(parsedCode) {
    parsedCodeToSymbolicSubstitution(parsedCode.body[0]);
}

function parseFunctionDeclarationPart2 (parsedCode){
    let name = parsedCode.id.name;
    let varDecString ='';
    for (let i = 0; i < parsedCode.params.length; i++) {
        varDecString+=parsedCode.params[i].name;
        varDecString+=', ';
    }
    varDecString = varDecString.substr(0,varDecString.length-2);
    let funcDecLine = 'function ' + name + ' (' + varDecString + '){';
    newFunction.push({str:funcDecLine, color:''});
    parseFunctionVariableDeclarationPart2(parsedCode.params);
    parsedCodeToSymbolicSubstitution(parsedCode.body);
    newFunction.push({str: '}', color: ''});
}

function parseFunctionVariableDeclarationPart2 (parsedCode){
    if (typeof parsedCode !== 'undefined' && parsedCode.length > 0) {
        let i;
        for (i = 0; i < parsedCode.length; i++) {
            argumentsDictionary.set(parsedCode[i].name,funcArgs[i]);
        }
    }
}

function parseBlockStatementPart2(parsedCode) {
    if (typeof parsedCode !== 'undefined' && parsedCode.length > 0) {
        let i;
        for (i = 0; i < parsedCode.length; i++) {
            parsedCodeToSymbolicSubstitution(parsedCode[i]);
        }
    }
}

function parseVariableDeclarationPart2 (parsedCode) {
    if (typeof parsedCode != 'undefined') {
        let i;
        for (i = 0; i < parsedCode.length; i++) {
            let value = parsedCode[i].id.name;
            if (parsedCode[i].init != null) {
                value = parsedCodeToSymbolicSubstitution(parsedCode[i].init);
                let stringToEval = calcStringToNumbersString(parsedCode[i].init);
                allValus.set(parsedCode[i].id.name,eval(stringToEval));
            }
            variablesDictionary.set(parsedCode[i].id.name,value);

        }
    }
}

function parseExpressionStatementPart2 (parsedCode){

    return parsedCodeToSymbolicSubstitution(parsedCode.expression);
}

function parseAssignmentExpressionPart2 (parsedCode) {
    //  if (!isNotTrue) {

    if (argumentsDictionary.has(parsedCode.left.name)) {

        argumentsDictionary.set(parsedCode.left.name, eval(calcStringToNumbersString((parsedCode.right))));
    } else {
        variablesDictionary.set(parsedCode.left.name, parsedCodeToSymbolicSubstitution(parsedCode.right));
        let stringToEval = calcStringToNumbersString(parsedCode.right);
        allValus.set(parsedCode.left.name, eval(stringToEval));
    }
    //}
}

function parseBinaryExpressionPart2(parsedCode){
    let left = parsedCodeToSymbolicSubstitution(parsedCode.left);
    let operator = parsedCode.operator;
    let right = parsedCodeToSymbolicSubstitution(parsedCode.right);
    if (isNumber(left) && isNumber(right))
        return eval( left + operator + right);
    return left + operator + right;
}

function parseIdentifierPart2(parsedCode){
    if (variablesDictionary.has(parsedCode.name)){ // if it's a declared variable
        return variablesDictionary.get(parsedCode.name);
    }
    return parsedCode.name;
}

function parseLiteralPart2(parsedCode){
    return parsedCode.value;
}

function parseMemberExpressionPart2 (parsedCode){
    let obj=parsedCodeToSymbolicSubstitution(parsedCode.object);
    let prop =parsedCodeToSymbolicSubstitution(parsedCode.property);
    return obj+ '[' + prop +']';
}

function parseUnaryExpressionPart2 (parsedCode){
    let argument = parsedCodeToSymbolicSubstitution(parsedCode.argument);
    let operator = parsedCode.operator;
    return operator+argument;
}

function parseIfStatementPart2(parsedCode,isElseIf) {
    let ifLine='';   let conditionRealResult;   let left =parsedCodeToSymbolicSubstitution(parsedCode.test.left);     let right = parsedCodeToSymbolicSubstitution(parsedCode.test.right);
    let op = parsedCode.test.operator;
    if (isElseIf === 0) {ifLine+='if';}
    else {ifLine+='else if';}
    ifLine+=' (' + left+ ' '+ op + ' ' + right + ') {';
    let condition = calcStringToNumbersString(parsedCode.test);
    conditionRealResult = eval(condition);
    if (conditionRealResult) {newFunction.push({str: ifLine, color: 'green'});}
    else{  /* isNotTrue = true;*/   newFunction.push({str: ifLine, color: 'red'});}
    let tempArgumentDitionary = new Map(argumentsDictionary);  //inside if block we should save the primerly position and change it back at th end of the if block
    let tempAllValuesDictionary = new Map(allValus);
    let tempVariablesDictionary = new Map(variablesDictionary);
    parsedCodeToSymbolicSubstitution(parsedCode.consequent);
    argumentsDictionary = tempArgumentDitionary;     allValus = tempAllValuesDictionary;     variablesDictionary = tempVariablesDictionary;
    /* isNotTrue = false;*/     newFunction.push({str: '}', color: ''});
    if ( parsedCode.alternate !== null) {
        if (parsedCode.alternate.type === 'IfStatement') { parseIfStatementPart2(parsedCode.alternate, 1);}
        else { parseElseStatementPart2(parsedCode.alternate,!conditionRealResult);}}}

function parseElseStatementPart2(parsedCode,conditionRealResult) {
    let ifLine='';
    let color;
    if (conditionRealResult){
        color = 'green';
    }
    else{
        color='red';
        //isNotTrue = true;
    }
    ifLine+='else{';
    newFunction.push({str:ifLine, color:color});
    parsedCodeToSymbolicSubstitution(parsedCode);
    //isNotTrue = false;
    newFunction.push({str: '}', color: ''});
}

function parseWhileStatementPart2 (parsedCode){
    let left = parsedCodeToSymbolicSubstitution(parsedCode.test.left);
    let right = parsedCodeToSymbolicSubstitution(parsedCode.test.right);
    let operator = parsedCode.test.operator;
    let whileLine = 'while ( ' + left + ' ' + operator + ' ' + right + ') {';
    let conditionRealResult = eval(calcStringToNumbersString(parsedCode.test));
    if (conditionRealResult) {
        newFunction.push({str: whileLine, color: 'green'});}
    else{
        //isNotTrue=true;
        newFunction.push({str: whileLine, color: 'red'});}
    parsedCodeToSymbolicSubstitution(parsedCode.body);
    //isNotTrue=false;
    newFunction.push({str: '}', color: ''});
}

function parseReturnStatementPart2 (parsedCode) {
    let returnLine = '';
    let arg = parsedCodeToSymbolicSubstitution(parsedCode.argument);
    returnLine+='return ' + arg + ';';
    newFunction.push({str:returnLine, color:''});
}

function calcStringToNumbersString(condition) {
    if (condition.type == 'BinaryExpression') {
        return calcBinaryToVal(condition);
    }
    if (condition.type == 'Identifier') {
        if (argumentsDictionary.has(condition.name))
            return argumentsDictionary.get(condition.name);
        return allValus.get(condition.name);
    }
    if (condition.type == 'Literal')
        return condition.raw;
    //if (condition.type == 'MemberExpression'){
    let obj = condition.object.name;
    let argObject = argumentsDictionary.get(obj);
    let realArray = JSON.parse(argObject);
    let propVal = calcStringToNumbersString(condition.property);
    let propRealVal = eval(propVal);
    let realValueFromArrayToReturn = realArray[propRealVal];
    return realValueFromArrayToReturn;
}

function calcBinaryToVal(condition) {
    let left = calcStringToNumbersString(condition.left);
    let right = calcStringToNumbersString(condition.right);
    let op = condition.operator;
    return ( left + op + right);

}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//
//
//
//
//
// ---------------------part 1------------------------
//
//
//
//
//
//
//

function parsedCodeToTable (parsedCode){

    switch (parsedCode.type) {
    case ('Program'):
        parseProgram(parsedCode);
        return table;
    case ('FunctionDeclaration'):
        parseFunctionDeclaration(parsedCode);
        break;
    case ('BlockStatement'):
        parseBlockStatement(parsedCode.body);
        break;
    default:
        return switchCaseContinue1(parsedCode);
    }
}
export {parsedCodeToTable};

function switchCaseContinue1(parsedCode) {
    switch (parsedCode.type) {
    case ('VariableDeclaration'):
        parseVariableDeclaration(parsedCode.declarations);
        break;
    case ('ExpressionStatement'):
        return parseExpressionStatement(parsedCode);
        //break;
    case ('AssignmentExpression'):
        parseAssignmentExpression(parsedCode);
        break;
    default:
        return switchCaseContinue2(parsedCode);
    }
}

function switchCaseContinue2 (parsedCode) {
    switch (parsedCode.type) {
    case ('BinaryExpression'):
        return parseBinaryExpression(parsedCode);
    case ('Identifier'):
        return parseIdentifier(parsedCode);
    case ('Literal'):
        return parseLiteral(parsedCode);
    case ('WhileStatement'):
        parseWhileStatement(parsedCode);
        break;
    default:
        return switchCaseContinue3(parsedCode);
    }
}

function switchCaseContinue3 (parsedCode) {
    switch (parsedCode.type) {
    case ('IfStatement'):
        parseIfStatement(parsedCode,0);
        break;
    case ('MemberExpression'):
        return parseMemberExpression(parsedCode);
    case ('UnaryExpression'):
        return parseUnaryExpression(parsedCode);
    case ('ReturnStatement'):
        parseReturnStatement(parsedCode);
        break;
    default:
        return switchCaseContinue4(parsedCode);

    }
}

function switchCaseContinue4 (parsedCode) {
    switch (parsedCode.type) {
    case ('ForStatement'):
        ParseForStatement(parsedCode);
        break;
    }
}

function parseProgram(parsedCode) {
    parsedCodeToTable(parsedCode.body[0]);
}

function parseFunctionDeclaration(parsedCode) {
    table.push({Line:numOfLine, Type:'function declaration', Name: parsedCode.id.name, Condition:'', Value:''});
    parseFunctionVariableDeclaration(parsedCode.params);
    parsedCodeToTable(parsedCode.body);
}

function parseFunctionVariableDeclaration(parsedCode) {
    if (typeof parsedCode !== 'undefined' && parsedCode.length > 0) {
        let i;
        for (i = 0; i < parsedCode.length; i++) {
            table.push({
                Line: numOfLine,
                Type: 'variable declaration',
                Name: parsedCode[i].name,
                Condition: '',
                Value: ''
            });
        }
        numOfLine++;
    }
}

function parseBlockStatement(parsedCode) {
    if (typeof parsedCode !== 'undefined' && parsedCode.length > 0) {
        let i;
        for (i = 0; i < parsedCode.length; i++) {
            parsedCodeToTable(parsedCode[i]);
        }
    }
}

function parseVariableDeclaration(parsedCode) {
    if (typeof parsedCode != 'undefined' ) {
        let i;
        for (i = 0; i < parsedCode.length; i++) {
            let value = 'null';
            if (parsedCode[i].init != null)
                value = parsedCodeToTable(parsedCode[i].init);

            table.push({
                Line: numOfLine,
                Type: 'variable declaration',
                Name: parsedCode[i].id.name,
                Condition: '',
                Value: value
            });
        }
        numOfLine++;
    }
}

function parseExpressionStatement (parsedCode){

    return parsedCodeToTable(parsedCode.expression);
}

function parseIdentifier(parsedCode){
    return parsedCode.name;
}

function parseLiteral(parsedCode){
    return parsedCode.value;
}

function parseBinaryExpression(parsedCode){
    let left = parsedCodeToTable(parsedCode.left);
    let operator = parsedCode.operator;
    let right = parsedCodeToTable(parsedCode.right);
    return left + operator + right;
}

function parseAssignmentExpression (parsedCode){
    let le = parsedCodeToTable(parsedCode.left);
    let ri = parsedCodeToTable(parsedCode.right);
    table.push({
        Line: numOfLine,
        Type: 'assignment expression',
        Name: le,
        Condition: '',
        Value: ri
    });
    numOfLine++;
}

function parseWhileStatement (parsedCode){
    let left = parsedCodeToTable(parsedCode.test.left);
    let right = parsedCodeToTable(parsedCode.test.right);
    let operator = parsedCode.test.operator;
    table.push({
        Line: numOfLine,
        Type: 'while statement',
        Name: '',
        Condition: left+operator+right,
        Value: ''
    });
    numOfLine++;
    parsedCodeToTable(parsedCode.body);
}

function parseMemberExpression (parsedCode){
    let left=parsedCodeToTable(parsedCode.object);
    let right =parsedCodeToTable(parsedCode.property);
    return left+ '[' + right +']';
}

function parseIfStatement(parsedCode,isElseIf) {
    let type;
    let left =parsedCodeToTable(parsedCode.test.left);
    let right = parsedCodeToTable(parsedCode.test.right);
    let op = parsedCode.test.operator;
    if (isElseIf === 0) {type = 'if statement';}
    else {type = 'else if statement';}
    table.push({Line: numOfLine, Type: type, Name:'', Condition: left+op+right, Value:''});
    numOfLine++;
    parsedCodeToTable(parsedCode.consequent);
    if ( parsedCode.alternate !== null) {
        if (parsedCode.alternate.type === 'IfStatement') {
            parseIfStatement(parsedCode.alternate, 1);}
        else { parseElseStatement(parsedCode.alternate);}}}

function parseElseStatement(parsedCode) {
    table.push({
        Line: numOfLine, Type: 'else statement',
        Name: '', Condition: '', Value: ''
    });
    numOfLine++;
    parsedCodeToTable(parsedCode);

}

function ParseForStatement(parsedCode) {
    let left =parsedCodeToTable(parsedCode.test.left);
    let right = parsedCodeToTable(parsedCode.test.right);
    let op = parsedCode.test.operator;
    let condition = left+op+right;
    condition = condition.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    table.push(
        {Line:numOfLine,
            Type:'For Statement',
            Name:'',
            Condition:condition,
            Value:''
        });
    numOfLine++;
    parsedCodeToTable(parsedCode.body);
}

function parseReturnStatement (parsedCode) {
    let arg = parsedCodeToTable(parsedCode.argument);
    table.push({
        Line: numOfLine,
        Type: 'return statement',
        Name: '',
        Condition:'',
        Value: arg
    });
    numOfLine++;
}

function parseUnaryExpression (parsedCode){
    let argument = parsedCodeToTable(parsedCode.argument);
    let operator = parsedCode.operator;
    return operator+argument;
}
