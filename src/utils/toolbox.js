import fs from 'fs'
import csv from 'csvtojson'
import readline  from 'readline'
import { once } from 'events'

export const hasProperty = () => {

}

export const fileExists  = (path) => {
	try {
	  if (fs.existsSync(path)) {
	    return true;
	  }
	} catch(err) {
	  return false;
	}
}

export const writeFile = (filename, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export const readJSONfile = (filename) => new Promise((resolve, reject) => {
  var obj;
  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);
    resolve(obj);
  });
});

export const readCSV = (filename, callback) => csv()
.fromStream(fs.createReadStream(filename))
.subscribe(function(json){ //single json object will be emitted for each csv line
   // parse each json asynchronousely
   return new Promise(function(resolve){
        callback?.call(undefined, json, resolve)
   })
});

export const readDir = (dir) => new Promise((resolve, reject) => {
  fs.readdir(dir, (err, file) =>{
    if (err) throw err;

    resolve(file.map((fileName) => `${dir}/${fileName}`))
  });
});

export const processLineByLine = (file, callback) => new Promise(async (resolve, reject) => {
  const fileStream = fs.createReadStream(file);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  rl.on('line', callback);

  await once(rl , 'close');
  
  resolve()
});
