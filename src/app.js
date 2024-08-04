"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
var fs = require("fs");
var path = require("path");
var date_fns_1 = require("date-fns");
// Function to read JSON file and convert it to object
function readJsonFile(filePath) {
    // Resolve the full path of the file
    var fullPath = path.resolve(filePath);
    // Read the file content
    var fileContent = fs.readFileSync(fullPath, 'utf-8');
    // Parse the JSON content and return it as an object
    var jsonObject = JSON.parse(fileContent);
    return jsonObject;
}
function convertToCSV(input) {
    var lines = input.split('\n');
    var csvOutput = '';
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.trim()) {
            var csvLine = line.split('\t').join(',');
            csvOutput += csvLine + '\n';
        }
    }
    return csvOutput.trim();
}
function alignCSV(date, input) {
    var lines = input.split('\n');
    var regex = /TRA\d{4}/;
    var date_time = (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
    var lastTRAInfo = "";
    var csvOutput = '';
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        if (regex.test(line)) {
            lastTRAInfo = line;
            csvOutput += date_time + ',' + line + '\n';
        }
        else {
            csvOutput += date_time + ',' + lastTRAInfo + ',' + line + '\n';
        }
    }
    return csvOutput.trim();
}
function exportToFile(filePath, data) {
    fs.writeFileSync(filePath, data);
}
function main() {
    var filePath = process.argv.slice(2);
    var output = 'Date Time, AP_IP,AP_MAC,Channel No.,Noise Level (dBm),Channel Busy(%),AP Status,TRA,MDR_IP,MDR_MAC,UK 1,UK 2,MDR Status,MDR\n';
    if (filePath.length === 0) {
        console.error("Please provide at least one file.");
        process.exit(1);
    }
    var myObject = readJsonFile(filePath[0]);
    //console.log(myObject.log.entries.length)
    if (myObject.log.entries.length <= 0) {
        console.error("Input file is incorrect!!!!!");
        process.exit(1);
    }
    for (var _i = 0, _a = myObject.log.entries; _i < _a.length; _i++) {
        var entry = _a[_i];
        var dateStr = entry.response.headers[0].value;
        var date = (0, date_fns_1.parse)(dateStr, 'EEE MMM dd HH:mm:ss yyyy', new Date());
        var csv = convertToCSV(entry.response.content.text);
        var csvFinal = alignCSV(date, csv);
        output += csvFinal + '\n';
    }
    var fileName = "output_".concat(myObject.log.entries[0].response.headers[0].value, "_").concat(myObject.log.entries[myObject.log.entries.length - 1].response.headers[0].value, ".csv");
    exportToFile(fileName, output);
    //console.log(output)
}
main();
