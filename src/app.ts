// Import dependencies
import * as fs from 'fs';
import * as path from 'path';

import * as _if from './Interface/interface'
import { format, parse } from 'date-fns';

// Function to read JSON file and convert it to object
function readJsonFile(filePath: string): _if.Root {
    // Resolve the full path of the file
    const fullPath = path.resolve(filePath);
    // Read the file content
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    // Parse the JSON content and return it as an object
    const jsonObject: _if.Root = JSON.parse(fileContent);
    return jsonObject;
}


function convertToCSV(input: string): string {
    const lines = input.split('\n');
    let csvOutput = '';
    for(const line of lines) {
        if (line.trim()) {
            const csvLine = line.split('\t').join(',');
            csvOutput += csvLine + '\n'
        }
    }
    return csvOutput.trim();
}

function alignCSV(date: Date, input: string): string {
    
    const lines = input.split('\n');
    const regex = /TRA\d{4}/;
    const date_time = format(date, 'yyyy-MM-dd HH:mm:ss');
    let lastTRAInfo = "";
    let csvOutput = '';
    
    for(const line of lines) {
        if(regex.test(line)) {
            lastTRAInfo = line;
            csvOutput += date_time + ','  + line + '\n';
            
        } else {
            csvOutput += date_time + ',' + lastTRAInfo + ',' + line + '\n';
        }
    }
    return csvOutput.trim();
}

function exportToFile(filePath: string, data: any): void {
    fs.writeFileSync(filePath,data)
}

function main() {
    const filePath = process.argv.slice(2);
    let output = 'Date Time, AP_IP,AP_MAC,Channel No.,Noise Level (dBm),Channel Busy(%),AP Status,TRA,MDR_IP,MDR_MAC,UK 1,UK 2,MDR Status,MDR\n'; 
    if(filePath.length === 0) {
        console.error("Please provide at least one file.")
        process.exit(1);
    }
    const myObject: _if.Root = readJsonFile(filePath[0])
    //console.log(myObject.log.entries.length)
    if (myObject.log.entries.length <= 0) {
        console.error("Input file is incorrect!!!!!")
        process.exit(1);
    }
    for (const entry of myObject.log.entries) {
        const dateStr = entry.response.headers[0].value;
        const date = parse(dateStr, 'EEE MMM dd HH:mm:ss yyyy', new Date());
        const csv = convertToCSV(entry.response.content.text);
        const csvFinal = alignCSV(date, csv);
        output += csvFinal + '\n';
    }
    const fileName = `output_${myObject.log.entries[0].response.headers[0].value}_${myObject.log.entries[myObject.log.entries.length - 1].response.headers[0].value}.csv`;
    exportToFile(fileName,output)
    //console.log(output)
}

main();