const fs = require('fs');
const SAMPLE_FILE_NAME = 'samples/randomArray.txt';
const RESULT_FILE_NAME = 'samples/sortedArray.txt';
const TEMP_FOLDER_NAME = 'tempFiles';
const TEMP_FILE_NAME = 'tempArray';
const CHUNK_SIZE = 3000;
const emptyDictionry = {};
let sortedArray = [];

/**
 * @description Method to create smaller chunks 
 * of file to store sprted chunks of data. This 
 * method creates temp files which are late combined
 * to create a single sorted file
 * 
 * @param {*} filePath 
 * @returns 
 */
const createChunksForSorting = (filePath) => {
    return new Promise((resolve, reject) => {
        let readStream = fs.createReadStream(`./${filePath}`, 'utf8');
        let tempIndex = 1;
        let tempFileName = [];

        // This catches any errors that happen while creating the readable stream (usually invalid names)
        readStream.on('error', function (err) {
            return reject(err);
        });

        readStream.on('data', (chunk) => {
            let writableStream = fs.createWriteStream(`./${TEMP_FOLDER_NAME}/${TEMP_FILE_NAME}-${tempIndex}.json`, { flags: 'w' });
            writableStream.on('error', (error) => {
                return reject(error);
            });
            let arrayData = chunk.split(',');
            let sorted = arrayData.sort((a, b) => {
                return parseInt(a) - parseInt(b);
            });
            sorted = sorted.filter(Number);
            writableStream.write(JSON.stringify({ data: sorted }));
            writableStream.end();
            writableStream.on('finish', () => {
                tempFileName.push(`./${TEMP_FOLDER_NAME}/${TEMP_FILE_NAME}-${tempIndex}.json`);
                tempIndex++;
            });
        });

        readStream.on('end', () => {
            return resolve(tempFileName);
        });
    });
};

/**
 * @description get the minimum value and which temp file it refers to.
 * @param {*} object 
 * @returns 
 */
const getMinimumValue = (object) => {
    let MIN = 100;
    let KEY = null;
    for (let prop in object) {
        if (object[prop].length === 0) {
            KEY = null;
            break;
        }
        if (object[prop].length && parseInt(object[prop][0]) < MIN) {
            MIN = object[prop][0];
            KEY = prop;
        }
    }
    return {
        key: KEY,
        min: MIN
    }

};

/**
 * @description Sort the K number of files which are sorted
 * @param {*} list 
 * @returns 
 */
const kFileSort = (list) => {
    sortedArray = [];
    if (list.length) {
        while (sortedArray.length < CHUNK_SIZE) {
            let { key, min } = getMinimumValue(emptyDictionry);
            if (!key) {
                break;
            } else {
                emptyDictionry[key].shift();
                sortedArray.push(min);
            }
        }
        return new Promise((resolve, reject) => {
            if (sortedArray.length) {
                var stream = fs.createWriteStream(RESULT_FILE_NAME, { flags: 'a' });
                stream.write(sortedArray.toString());
                stream.end();
                stream.on("finish", () => { resolve(list); });
                stream.on("error", reject);
            } else {
                resolve(list);
            }
        });
    }
    return Promise.resolve(list);
};

/**
 * @description This method reads data from temp file and stores
 * smaller array in memory which can bee sorted using K exterrnal
 * sort algorithm
 * 
 * @param {*} fileList 
 * @returns 
 */
const getDataFromFilesToSort = (fileList) => {
    let fileListCopy = fileList.filter((file) => {
        countLeft = emptyDictionry[file];
        let content = JSON.parse(fs.readFileSync(file, 'utf8')).data;
        let totalCount = content.splice(0, CHUNK_SIZE - countLeft.length);
        if ([...countLeft, ...totalCount].length === 0) {
            delete emptyDictionry[file];
        } else {
            emptyDictionry[file] = [...countLeft, ...totalCount];
            fs.writeFileSync(file, JSON.stringify({ data: content }));
            return file;
        }
    });
    return Promise.resolve(fileListCopy);
};

/**
 * @description Function which setups the intial map object
 * to store data for sorting and recussively calls the sorting
 * function to sort all the files untill its empty
 * 
 * @param {*} filesArray 
 * @param {*} init 
 */
const sortFilesUntillEmpty = (filesArray, init) => {
    if (init) {
        filesArray.forEach(path => {
            emptyDictionry[path] = [];
        });
    }

    getDataFromFilesToSort(filesArray)
        .then(list => {
            if (list.length === 0) {
                return Promise.resolve([]);
            }
            return kFileSort(list);
        })
        .then(res => {
            if (res.length) {
                return sortFilesUntillEmpty(res, false);
            }
            return Promise.resolve();
        });
};

/*
const clearFiles = (fileList) => {
    return new Promise((resolve, reject) => {
        console.log('list', fileList);
        fs.unlink(`./${RESULT_FILE_NAME}`, (err) => {
            if(err && err.code == 'ENOENT') {
                return resolve(fileList);
            } else if (err) {
                reject(err);
            } else {
                console.log('list', list);
                resolve(fileList);
            }
        });
    });
};
*/

/**
 * Main metion which initialises everything and runs sorrting
 */
createChunksForSorting(SAMPLE_FILE_NAME)
    // .then((data) => {
    //     console.log('data1', data);
    //     return clearFiles(data)
    // })
    .then(data => {
        return sortFilesUntillEmpty(data, true);
    })
    .then(() => {
        console.log('sorting complete');
    })
    .catch(err => {
        console.log(err);
    });
