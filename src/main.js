import pkg from 'json-2-csv';
const { json2csv } = pkg;
import { processLineByLine, readDir, writeFile} from './utils/toolbox.js'

function createObject(){
    return {time:0, id:0, action:'', operation:''}
}

async function* getlines(files) {
    let object = []
    for(const fileIndex in files) {
        await processLineByLine(files[fileIndex], ( line ) => {
            object.push(line)
        });
        
        yield {data: object, filename: files[fileIndex]};
    }
}

function processFile(data) {
    const finalResult = []
    data.forEach((line, index) => {
        if (index > 0) {
            const newObject = createObject();
            const lineData = line.split('	');
            newObject.time = lineData[0];
            const userData = JSON.parse(lineData[1]);
            newObject.id = userData.id;
            newObject.action = userData?.text?.action;
            newObject.operation = userData?.text?.values?.operation;
            finalResult.push(newObject);
        }
    })

    return finalResult;
}

async function init() {
    let dir = './files'
    if (process.argv[2]){
        dir = process.argv[2]
    }
    const files = await readDir(dir);
    for await (const file of getlines(files)) {
        const jsonFile = processFile(file.data)
        json2csv(jsonFile, (err, csv) => {
            if (err) {
                console.log(err);
                return
            }
            writeFile(`./output/${file.filename}_csv.csv`, csv);
        });
    }
}

init()