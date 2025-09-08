//Async Function examples

// async function abcd() { return "X"; }   // returns an already-resolved promise
// async function caller() {
//   console.log(await abcd());
//   console.log('HI');
// }
// console.log('start');
// caller();
// console.log('end');


//Example 2
async function utility(){        
    let delhiMausam = new Promise(function(resolve, reject){
        setTimeout(() => {
            console.log("1");
            resolve("Delhi me bht garmo hai!")
        }, 1000);
    });
    
    let goaMausam = new Promise(function(resolve, reject){
        setTimeout(() => {
            console.log("2");
            resolve("Goa me Sardi hai!")
        }, 5000);
    });

    let dM = await delhiMausam; //Now the execution of aysnc function utility stops here until delhiMausam is either resolved or rejected (i.e have any state other than pending)
    /* 
    "dM" is just a varaible waiting for Promise object "delhiMausam" to change state from Pending to fulfilled and then whatever will be the "value" of "delhiMausam" upon being fulfilled, it will be copied into "dM" (or dM will be a reference to it if the "value" is not a primitive data-type)
    */
    
    console.log(`3 | delhiMausam has been resolve!`)
    let gM = goaMausam; //gM is just a reference to the Promise object "goaMausam"


    return [dM, gM];
}

utility();
console.log("4");