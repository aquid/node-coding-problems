let fs = require('fs');
let readline = require('readline');

const LOG_FILE_NAME = 'samples/logFile.txt';
let CountForController = 0;

var line = readline.createInterface({
    input: fs.createReadStream(LOG_FILE_NAME),
    console: false
});

line.on('line', function(line) {
    if(line.includes('SprintsController#')){
        CountForController++;
    }
});

line.on('close', () => {
    console.log('The total Count is => ', CountForController);
});




