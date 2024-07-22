const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
               .catch((err) => next(err))
    }
}

export { asyncHandlers }



//step:1 const asyncHandlers = () => {}
//step:2 const asyncHandlers = (fn) => { () => {} } // HOF{Higher Order Function}    
//step:3 const asyncHandlers = (fn) => () => {} // could be written like this also.
// To make it async return:::::
// const asyncHandlers = (fn) => async () => {}


// Example of Try Catch block
// const asyncHandlers = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
// 
// export { asyncHandlers }