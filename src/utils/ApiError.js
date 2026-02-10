class ApiError extends Error {
    constructor (
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
       super(message)   // overwrite jab bhi kart hai tab hum ek supercall karta hi hai
       this.statusCode = statusCode
       this.data = null
       this.message = message
       this.success = false;
       this.errors = errors

       if (stack){
        this.stack = stack
       } else{
        Error.captureStackTrace(this,this.constructor)   // stackTrace  ma hum na uska instance pass kar diya hai matlab abhi app kis context pa bat kar rha ho
       }
    }
}

export {ApiError}

// error jo hai vo node ma to trace ho rha hai  lakin jo app req, response ka kam kar rha ho vo node js ma nhi kar rha ho iska liya apna ek framwork use kara hai  jo ki express