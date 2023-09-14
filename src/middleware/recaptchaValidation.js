const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
/* istanbul ignore next */
const verify = async (req, res, next) => {
    const recaptchaResponse = req.body['g-recaptcha-response'];

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: RECAPTCHA_SECRET_KEY,
                response: recaptchaResponse,
            }),
        });

        const responseData = await response.json();

        if (responseData.success) {
            // reCAPTCHA's validation succeeded, process the form submission
            next();
        } else {
            // reCAPTCHA's validation failed
            res.status(400).send({error: 'reCAPTCHA validation failed'});
        }
    } catch (error) {
        res.status(500).send({error: 'reCAPTCHA validation failed'});
    }

};

module.exports = verify;