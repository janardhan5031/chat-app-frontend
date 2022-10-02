const arr1 =[1,2,3,4,5];
const arr2 = [2,4,5,7,8];

const set = new Set([...arr1,...arr2]);

console.log([...set])