 const asyncHandler = (requestHandler) => { 
   return(req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
 // A asyncHandler is a High order  function matlab vo function jo ki function ko as a parameter bhi accept kar sakt hai, ya fir usko return kar sakta hi or a variable ki taraya hi treat kar ta hai



export {asyncHandler}


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

 // Try and Catch problem
// const asyncHandler = (fn) =>async (req, res, next) => {
//     try {
//         await fn (req, res, next)    
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: err.message 
//         })
        
//     }
// }


