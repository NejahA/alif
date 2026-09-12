function findMax(arr) {
    var  i=0;
    var  max = 0;
     for (i=0;i<arr.length-1; i++)
     {
         if (arr[i]>arr[i+1]) {
             max = arr[i];
         }
         
         else {
             max =arr [i+1];
         }
     }
    
     return max; 
 }

 function oddNumbers() {
    var arr = [];
    var i= 0 ;
    for (i=0;i<=50;i++){
        if (i%2 =! 0 ) {
            arr.push(i)
        }
    }
    return arr; 
}

function greaterY(arr, Y) {
    i=0;
    count=0;
    for (i=0;i<arr.length ; i++) {
        if (arr[i]>Y) {
            count = count+1;
        }
    }
    return count; 
}

function noNeg(arr) {
    i=0;
    
    for (i=0;i<arr.length ; i++) {
        if (arr[i]<0) {
            arr[i] = 0;
        }
    }
        
    return arr; 
}
function findAvg(arr) {
    
    var avg=0;
    var sum=0;
    
    for (i=0; i<arr.length; i++) {
        
        sum = sum + arr[i];
    }
    
    avg = sum / arr.length;
 
    return avg; 
}

function maxMinAvg(arr) {
    var arrnew= [];
    var  max = 0;
    var min = 0;
    var avg=0;
    var sum=0;
     for (var i=0;i<arr.length; i++)
     {
         max = arr[0];
         if (arr[i]>max){
             max = arr[i];
         }
         
    
     }
     
     
    for ( i=0;i<arr.length; i++)
     {
         min = arr[0];
         if (arr[i]<min){
             min = arr[i];
         }
         
    
     }
     
     
     for (i=0; i<arr.length; i++) {
        
        sum = sum + arr[i];
    }
    
    avg = sum / arr.length;
    
    arrnew.push(max);
    arrnew.push(min);
    arrnew.push(avg);
    
    return arrnew; 
}

function swap(arr) {
    
    var temp=0;
    temp=arr[0];
    arr[0]=arr[arr.length-1];
    arr[arr.length-1]=temp;
    return arrnew; 
}