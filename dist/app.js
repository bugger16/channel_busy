"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const date_fns_1 = require("date-fns");
// Function to read JSON file and convert it to object
function readJsonFile(filePath) {
    // Resolve the full path of the file
    const fullPath = path.resolve(filePath);
    // Read the file content
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    // Parse the JSON content and return it as an object
    const jsonObject = JSON.parse(fileContent);
    return jsonObject;
}
function convertToCSV(input) {
    const lines = input.split('\n');
    let csvOutput = '';
    for (const line of lines) {
        if (line.trim()) {
            const csvLine = line.split('\t').join(',');
            csvOutput += csvLine + '\n';
        }
    }
    return csvOutput.trim();
}
function alignCSV(date, input) {
    const lines = input.split('\n');
    const regex = /TRA\d{4}/;
    const date_time = (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
    let lastTRAInfo = "";
    let csvOutput = '';
    for (const line of lines) {
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
    const filePath = process.argv.slice(2);
    let output = 'Date Time, AP_IP,AP_MAC,Channel No.,Noise Level (dBm),Channel Busy(%),AP Status,TRA,MDR_IP,MDR_MAC,UK 1,UK 2,MDR Status,MDR\n';
    if (filePath.length === 0) {
        console.error("Please provide at least one file.");
        process.exit(1);
    }
    const myObject = readJsonFile(filePath[0]);
    //console.log(myObject.log.entries.length)
    if (myObject.log.entries.length <= 0) {
        console.error("Input file is incorrect!!!!!");
        process.exit(1);
    }
    for (const entry of myObject.log.entries) {
        const dateStr = entry.response.headers[0].value;
        const date = (0, date_fns_1.parse)(dateStr, 'EEE MMM dd HH:mm:ss yyyy', new Date());
        const csv = convertToCSV(entry.response.content.text);
        const csvFinal = alignCSV(date, csv);
        output += csvFinal + '\n';
    }
    const fileName = `output_${myObject.log.entries[0].response.headers[0].value}_${myObject.log.entries[myObject.log.entries.length - 1].response.headers[0].value}.csv`;
    exportToFile(fileName, output);
    //console.log(output)
}
main();
//# sourceMappingURL=app.js.map