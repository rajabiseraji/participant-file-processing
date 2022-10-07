import pkg from 'json-2-csv';
const { json2csv } = pkg;
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

function processFile(data) {
    const finalResult = []
    data.forEach((line, index) => {
        if (index > 0) {
            const lineData = line.split('	');
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