const arr1 =[1,2,3,4,5];
const arr2 = [2,4,5,7,8];

let i=0;
while(i<arr1.length){
    let end =arr1.pop()
    arr1.unshift(end)
    i++;
}

console.log(arr1)