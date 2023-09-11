const intRegex = /^[0-9]+$/;


// used to recursively validate all parameters from a request body
const validateParameters = (parameterTypes) => {
    return (req, res, next) => {
        const bodyParameters = req.body;
        console.log(req.body.image)

        try {
            for (const paramName in parameterTypes) {
                if (bodyParameters.hasOwnProperty(paramName)) {
                    const paramValue = bodyParameters[paramName];
                    const paramConfig = parameterTypes[paramName];

                    if (paramConfig.type === 'boolean' && typeof paramValue !== 'boolean') {
                        return res.status(400).json({error: `${paramName} should be a boolean.`});
                    } else if (paramConfig.type === 'string' || paramConfig.type === 'stringWithMaxLength' && typeof paramValue !== 'string') {
                        return res.status(400).json({error: `${paramName} should be a string.`});
                    } else if (paramConfig.type === 'int' && !intRegex.test(paramValue)) {
                        return res.status(400).json({error: `${paramName} should be a valid integer.`});
                    } else if (paramConfig.type === 'positiveInt' && (!intRegex.test(paramValue) || paramValue <= 0)) {
                        return res.status(400).json({error: `${paramName} should be a valid positive integer.`});
                    } else if (paramConfig.type === 'stringWithMaxLength' && paramValue.length > paramConfig.maxLength) {
                        return res.status(400).json({error: `${paramName} should have a maximum length of ${paramConfig.maxLength} characters.`});
                    } else if (paramConfig.type === 'image' && !paramValue.startsWith('data:image/')) {
                        return res.status(400).json({error: `${paramName} should be a valid base64 image.`});
                    }
                } else {
                    return res.status(400).json({error: `${paramName} is required.`});
                }
            }
        } catch (e) {
            return res.status(400).json({error: 'Invalid JSON format.'});
        }

        next();
    };
};

module.exports = validateParameters;