const https = require("https");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");

module.exports = (app) => {
    const privateKey = fs.readFileSync("certificates/private_key.pem", "utf8");
    const certificate = fs.readFileSync("certificates/certificate.pem", "utf8");

    const credentials = {key: privateKey, cert: certificate};

    app.use(
        cors({
            // TODO: change this to the actual frontend url
            origin: "localhost",
            methods: "GET,POST",
            allowedHeaders: ["Authorization", "Content-Type"],
            credentials: true,
            maxAge: 3600,
            exposedHeaders: ["Content-Length"],
        })
    );

    // security headers
    app.use(helmet());
    app.use(helmet.referrerPolicy({policy: "strict-origin-when-cross-origin"}));
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'", "localhost"],
                connectSrc: ["'self'", "localhost"],
                scriptSrc: ["'self'", "localhost"],
                styleSrc: ["'self'", "localhost"],
            },
        })
    );

    // Enable the browser's built-in Cross-Site Scripting (XSS) protection
    app.use(helmet.xssFilter());
    // Prevents MIME sniffing attacks
    app.use(helmet.noSniff());
    // Hides powered by express
    app.use(helmet.hidePoweredBy());
    // don't allow browser to render page in a frame
    app.use(helmet.frameguard({action: "deny"}));
    // Instructs the browser to only access connection over HTTPS for a specified duration.
    app.use(
        helmet.hsts({maxAge: 31536000, includeSubDomains: true, preload: true})
    );
    // Prevents browsers from performing DNS prefetching on backend's links
    app.use(helmet.dnsPrefetchControl());
    // Prevents clickjacking
    app.use(
        helmet.permittedCrossDomainPolicies({
            permittedPolicies: "none",
        })
    );
    // Do not permit Internet Explorer to render the page in a different zone
    app.use(
        helmet.ieNoOpen()
    );

    return https.createServer(credentials, app);
};