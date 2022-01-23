var fs = require('fs');
const SAMPLE_FILE_NAME = 'samples/randomArray.txt';
const RESULT_FILE_NAME = 'samples/sortedArray.txt';
const TEMP_FOLDER_NAME = 'tempFiles'; 
const TEMP_FILE_NAME = 'tempArray';


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
            const sorted = arrayData.sort((a, b) => {
                return parseInt(a) - parseInt(b);
            });
            writableStream.write(JSON.stringify({data:sorted}));
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

const sortFilesInChunks = (fileList) => {
    console.log('fileList', fileList.length);
    let dataToSort = [];
    fileList.forEach((path, index) => {
        let content = JSON.parse(fs.readFileSync(path, 'utf8')).data;
        // console.log(content.data.length);
        let arrayChunk = content.splice(0, 1);
        dataToSort = [...dataToSort, ...arrayChunk];
        // console.log(content.data.length);
        if(content.length === 0) {
            fileList.splice(index, 1);
        } else {
            fs.writeFileSync(path, JSON.stringify({data: content}));
        }
    });
    dataToSort.sort();
    console.log('dataToSort', dataToSort.length);
    var stream = fs.createWriteStream(RESULT_FILE_NAME, {flags:'a'});
    stream.write(dataToSort.toString());
    stream.end();
    return Promise.resolve(fileList);
};

const sortFilesUntillEmpty = (filesArray) => {
    return sortFilesInChunks(filesArray)
    .then((list) => {
        console.log('list length', list.length);
        if(list.length === 0) {
            return Promise.resolve();
        } else {
            return sortFilesUntillEmpty(list);
        }
    })
};

createChunksForSorting(SAMPLE_FILE_NAME)
.then(data => {
    // console.log(data);
    // let content = JSON.parse(fs.readFileSync(data[0], 'utf8'));
    // console.log(content);
    return sortFilesUntillEmpty(data);
})
.then(() => {
    console.log('sorting complete');
})
.catch(err => {
    console.log(err);
})
