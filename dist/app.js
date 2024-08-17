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
const date_fns_1 = require("date-fns");
// Import dependencies
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let startTime = new Date();
let startTimeFlag = true;
let endTime = new Date();
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
function alignCSV(date, region, input) {
    const lines = input.split('\n');
    const TRARegex = /TRA\d{4}/;
    const MACAddress00Regex = /00:00:00:00:00:00,0,0,0,Off/;
    const _date = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
    const _time = (0, date_fns_1.format)(date, "HH:mm:ss");
    let lastTRAInfo = "";
    let csvOutput = '';
    const lineCount = lines.length;
    for (let i = 0; i < lineCount; i++) {
        const line = lines[i];
        if (TRARegex.test(line)) {
            // Must check line length
            if (i < lineCount - 1) {
                const nextLine = lines[i + 1];
                if (TRARegex.test(nextLine)) { // next line is TRA
                    csvOutput += _date + ',' + _time + ',' + region + ',' + line + '\n';
                }
                else {
                    lastTRAInfo = line;
                }
            }
        }
        else {
            if (MACAddress00Regex.test(line)) {
                csvOutput += _date + ',' + _time + ',' + region + ',' + lastTRAInfo + '\n';
            }
            else if (line.includes("MDR_")) {
                csvOutput += _date + ',' + _time + ',' + region + ',' + lastTRAInfo + ',' + line + '\n';
            }
            else {
                // Do nothing becase this line is not fulfill condition
            }
        }
    }
    return csvOutput.trim();
}
function exportToFile(filePath, data) {
    fs.writeFileSync(filePath, data);
}
function main() {
    var _a;
    const filePath = process.argv.slice(2);
    let output = 'date,time,region,ap_ip,ap_mac,channel_no,noise_level,channel_busy,ap_status,tra,mdr_ip,mdr_mac,unknow_1,unknow_2,mdr_status,mdr\n';
    if (filePath.length === 0) {
        console.error("Please provide at least one file.");
        process.exit(1);
    }
    if (filePath[1] === undefined || !Number.isInteger((+filePath[1]))) {
        console.error("Region no is incorrect (integer only)");
        process.exit(1);
    }
    const region = +filePath[1];
    const myObject = readJsonFile(filePath[0]);
    //console.log(myObject.log.entries.length)
    if (myObject.log.entries.length <= 0) {
        console.error("Input file is incorrect!!!!!");
        process.exit(1);
    }
    for (const entry of myObject.log.entries) {
        let dateStr = (_a = entry.response.headers[0]) === null || _a === void 0 ? void 0 : _a.value;
        if (dateStr) {
            const fixedString = dateStr.replace(/\s{2,}/g, ' ');
            const date = (0, date_fns_1.parse)(fixedString, 'EEE MMM d HH:mm:ss yyyy', new Date());
            if ((0, date_fns_1.isValid)(date)) {
                const csv = convertToCSV(entry.response.content.text);
                const csvFinal = alignCSV(date, region, csv);
                if (csvFinal !== '' && csvFinal !== undefined) {
                    if (startTimeFlag) {
                        startTime = date;
                        startTimeFlag = false;
                    }
                    output += csvFinal + '\n';
                    endTime = date;
                }
            }
        }
    }
    const fileName = `output_R${region}_${dateFormatter(startTime)}_${dateFormatter(endTime)}.csv`;
    console.log(fileName);
    exportToFile(fileName, output);
}
function dateFormatter(date) {
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
}
main();
//# sourceMappingURL=app.js.map