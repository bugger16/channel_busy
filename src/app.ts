import { format, isValid, parse } from 'date-fns';
// Import dependencies
import * as fs from 'fs';
import * as path from 'path';

import * as _if from './Interface/interface'

let startTime: Date;
let startTimeFlag: boolean = true;
let endTime: Date;

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

function alignCSV(date: Date,input: string): string {
    
    const lines = input.split('\n');
    const TRARegex = /TRA\d{4}/;
    const MACAddress00Regex = /00:00:00:00:00:00/;
    const date_time = format(date, 'yyyy-MM-dd HH:mm:ss');
    let lastTRAInfo = "";
    let csvOutput = '';
    const lineCount = lines.length;
    
    for(let i = 0; i < lineCount; i++) {
        const line = lines[i];
        if(TRARegex.test(line)) {
            // Must check line length
            if(i < lineCount - 1) {
                const nextLine = lines[i+1]
                if(TRARegex.test(nextLine)){ // next line is TRA
                    csvOutput +=  date_time + ',' + line + '\n';      
                } else {
                    lastTRAInfo = line;
                }
            } 
        } else {
            if(MACAddress00Regex.test(line)) {
                csvOutput +=  date_time + ',' + lastTRAInfo + '\n';
            } else if (line.includes("MDR_")) {
                csvOutput +=  date_time + ',' + lastTRAInfo + ',' + line + '\n';
            } else {
                // Do nothing becase this line is not fulfill condition
            }
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
        let dateStr = entry.response.headers[0]?.value;
        if(dateStr) {
            const fixedString = dateStr.replace(/\s{2,}/g, ' ');
            const date = parse(fixedString, 'EEE MMM d HH:mm:ss yyyy', new Date());
            if(isValid(date)) {
                if (startTimeFlag) {
                    startTime = date;
                    startTimeFlag = false;
                }
                const csv = convertToCSV(entry.response.content.text);
                const csvFinal = alignCSV(date, csv);
                endTime = date;
                output += csvFinal + '\n';
            }
        }
    }
    const fileName = `output_${dateFormatter(startTime)}_${dateFormatter(endTime)}.csv`;
    console.log(fileName)
    exportToFile(fileName,output)
    /**
     * Test on entity
     */
    /*
    const dateStr =  myObject.log.entries[0].response.headers[0].value;
    const date = parse(dateStr, 'EEE MMM dd HH:mm:ss yyyy', new Date());
    const csv = convertToCSV( myObject.log.entries[0].response.content.text);
    console.log(csv);
    console.log("\n");
    const csvFinal = alignCSV(date, csv);
    console.log(csvFinal)
    */
}

function dateFormatter(date: Date):string {
    return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}${date.getSeconds().toString().padStart(2,'0')}`
}

main();