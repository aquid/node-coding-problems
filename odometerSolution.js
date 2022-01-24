/**
 * Module to help read from the stdin terminal
 */
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * occuranceTable - Holds the value of times 4 come in a given step size
 * for eg step sizes
 * 10 = 1
 * 100 = 19
 * 1000 = 271 ...
 * This helps to memoize data and not recalculate again
 */
let occuranceTable = [0];

/**
 * digitsCache - Array that holds the actual value of 4 skipped 
 * for a given length of digits of the input value. This is array 
 * is of the same size as the input value lenght and each elements
 * of the array keeps track of the total number skipped upto that lenth.
 */
let digitsCache = [];

/**
 * Variable to initiate the step and add trailing zeros 
 * based on the size of the length of string getting processed.
 */
let baseValueForOneDigit = '1';


/**
 * @description - This method takes substring and calculates the number
 * of 4's that comes in the given substring number and updates the
 * digitsCache array for memoization.
 * 
 * @param {*} digitNumber Takes the substring to be processed
 * @returns Void 
 */
function calculateNumberSkipped(digitNumber) {
    let lengthOftheNumber = digitNumber.toString().length;
    if (lengthOftheNumber == 1) {
        if (digitNumber < 4) {
            digitsCache[0] = 0;
        } else {
            digitsCache[0] = 1;
        }
        return digitsCache[0];
    } else {
        let stepSize = parseInt(baseValueForOneDigit.padEnd(lengthOftheNumber, '0'));
        let totalSteps = parseInt(Math.floor(digitNumber / stepSize));
        if(!occuranceTable[stepSize]) {
            occuranceTable[lengthOftheNumber - 1] = 9 * occuranceTable[lengthOftheNumber - 2] + (stepSize / 10)
        }
        if(totalSteps < 4) {
            digitsCache[lengthOftheNumber - 1] = (totalSteps * occuranceTable[lengthOftheNumber - 1]) + digitsCache[lengthOftheNumber - 2];
        } else {
            result = (totalSteps - 1 * digitsCache[lengthOftheNumber - 2]) + stepSize + digitsCache[lengthOftheNumber - 2];
            digitsCache[lengthOftheNumber - 1] = result;
        }
    }
}


/**
 * @description - This method takes the input number as string 
 * as starts calculating 4 coming from the last digit to the first
 * digit of the number
 * 
 * @param {*} numberValue Input Value
 * @returns {Number} Total value of 4 that came in the input value
 */
function countNumberSkipped(numberValue) {
    for(let i = 1; i <= numberValue.length; i++) {
        calculateNumberSkipped(numberValue.slice(i * -1)); 
    }
    return digitsCache[numberValue.length - 1];
}


/**
 * Reading the input and processing it to show results.
 */
readline.question(`Enter the input value -> `, value => {
    console.log(`Number entered is -> ${value}`);
    let data = countNumberSkipped(value);
    console.log(`The actual number is -> ${parseInt(value) - parseInt(data)}`);
    readline.close()
})