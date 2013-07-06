#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://nameless-anchorage-7463.herokuapp.com";
var URL_HTML_FILE = "url.html";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(urlToCheck) {
    var validator = require('validator');
    try {
	validator.check(urlToCheck).isUrl();
    } catch (e) {
	console.log("%s.  Exiting.", e.message);
	process.exit(1);
    }
    return urlToCheck;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var processHtml = function(fileToProcess) {
    var checkJson = checkHtmlFile(fileToProcess, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

if(require.main == module) {
    program
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-u, --url <url>', 'URL to index.html', clone(assertUrlExists))
	.parse(process.argv);

    if (program.url) {
	var rest = require('restler');
	rest.get(program.url).on('complete', function(htmlFromUrl, response){
	fs.writeFileSync(URL_HTML_FILE, htmlFromUrl);
	processHtml(URL_HTML_FILE);
	});
    } else {
	processHtml(program.file);
    }

//    console.log(program.file);
//    console.log(program.checks);
//    console.log(program.url);
//    console.log(program.args);//always print empty array for some reason
//    console.log(process.argv);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
