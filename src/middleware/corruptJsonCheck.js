// check if json is valid
/* istanbul ignore next */
module.exports = ((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing error
        return res.status(400).json({error: 'Invalid JSON format.'});
    }
    // Forward other errors to the default Express error handler
    next(err);
});