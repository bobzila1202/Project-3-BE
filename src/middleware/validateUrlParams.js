const intRegex = /^[0-9]+$/;

// used to validate a single parameter from a request body

module.exports = (expectedType) => {
    return function (req, res, next) {
        const id = req.params.id;

        if (expectedType === 'string') {
            // Check if id is a valid string
            if (typeof id === 'string' && id.trim() !== '') {
                next();
            } else {
                res.status(400).json({ error: 'Invalid URL string id' });
            }
        } else if (expectedType === 'int') {
            // Check if id is a valid integer
            if (intRegex.test(id)) {
                next();
            } else {
                res.status(400).json({ error: 'Invalid URL integer id' });
            }
        } else if (expectedType === 'boolean') {
            // Check if id is a valid boolean
            if (id === 'true' || id === 'false') {
                next();
            } else {
                res.status(400).json({ error: 'Invalid URL boolean id' });
            }
        } else {
            res.status(400).json({ error: 'Invalid type parameter' });
        }
    };
}