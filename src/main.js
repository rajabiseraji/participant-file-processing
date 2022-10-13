import pkg from 'json-2-csv';
import jpkg from 'tsv-json';
const { json2csv } = pkg;
const { tsv2json, json2tsv } = jpkg;
import { processLineByLine, readDir, writeFile} from './utils/toolbox.js'

function createObject(newObject){
    return {
        time: newObject.time ?? 0, 
        id: newObject.id ?? 0, 
        action: newObject.action ?? 'null', 
        operation: newObject.operation ?? 'null', 
        attributeId: newObject.attributeId ??  0, 
        attributeName: newObject.attributeName ??  'null', 
        collectionId: newObject.collectionId ??  0, 
        collectionName: newObject.collectionName ??  'null',
        contextId: newObject.contextId ??  0, 
        contextName: newObject.contextName ??  'null'
    }
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

function processCodapFiles(data) {
    const finalResult = []
    data.forEach((line, index) => {
        if (index > 0) {
            const lineData = line.split('\t');
            const userData = JSON.parse(lineData[1]);
            const newObject = createObject({
                tiem: lineData[0],
                id : userData.id,
                action : userData?.text?.action,
                operation : userData?.text?.values?.operation,
                attributeId : userData?.text?.values?.attribute?.id,
                attributeName : userData?.text?.values?.attribute?.name,
                collectionId : userData?.text?.values?.collection?.id,
                collectionName : userData?.text?.values?.collection?.name,
                contextId : userData?.text?.values?.context?.id,
                contextName : userData?.text?.values?.context?.name
            });
            finalResult.push(newObject);
        }
    })

    return finalResult;
}

function processData(data) {
    const finalResult = []
    console.log(data);
    data.forEach((line, index) => {
        if (index > 0) {
            const lineData = line.split("\t");
            finalResult.push(JSON.parse(lineData));
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
    // write the codap data in here
    for await (const file of getlines(files)) {
        var justName = file.filename.split("/")[2].split(".")[0];
        const regex = /^(Group\d)_(Task\w+\s?\d?)_(Participant\d+?)_(\w+)/;
        const [, group, task, paricipant, logName] =  regex.exec(justName) ?? [];
        // if(logName === "CodapData") {
        //     for await (const file of getlines(files)) {
        //         const jsonFile = processCodapFiles(file.data)
        //         json2csv(jsonFile, (err, csv) => {
        //             if (err) {
        //                 console.log(err);
        //                 return
        //             }
        //             writeFile(`./output/${file.filename}.csv`, csv);
        //         });
        //     }
        // }
        if (logName !== "CodapData") {
            const jsonFile = processData(file)
            console.log(jsonFile);
        }
        
    }
}

init()