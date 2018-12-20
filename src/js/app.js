import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {parsedCodeToSymbolicSubstitutionWithColor} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        console.log(parsedCode);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        $('#symbolicSubstitutionButton').click(() => {
            let args =  $('#arguments').val();
            let symbolicSubstitutionCodeJson = parsedCodeToSymbolicSubstitutionWithColor(args,parsedCode);
            document.querySelectorAll('span').forEach(function(a){
                a.remove();
            }); document.querySelectorAll('br').forEach(function(a){
                a.remove();
            });for (let i=0; i< symbolicSubstitutionCodeJson.length ; i++)   {
                let span = document.createElement('span');
                let text = document.createTextNode(symbolicSubstitutionCodeJson[i].str);
                span.style.backgroundColor = symbolicSubstitutionCodeJson[i].color;
                span.id = 'texting'+i;   span.appendChild(text);
                document.body.appendChild(span);
                document.body.appendChild(document.createElement('br'));
            } }); }); });








