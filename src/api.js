const express = require("express");
const cron = require('node-cron');
const ENV = process.env.ENV;
const app = express();

// const db = require("./db/db");
const filter = require("./middleware/htmlFilter");
const jsonCheck = require("./middleware/corruptJsonCheck");


const user = require("./routes/user");
// const admins = require("./routes/admins");
const home = require("./routes/home");


// parse as json
app.use(express.json());

// set static files
app.use(express.static("static"));

// check for invalid json
app.use(jsonCheck)

// filter out direct requests to *.(html,htm) files
app.use(filter);

// routes mapping
app.use("/users", user);
// app.use("/admins", admins);

app.use("/", require("./middleware/googleOauth"));
app.use("/", require("./middleware/facebookOauth"));


// should always be last
app.use("/", home);

/* istanbul ignore next */
if (ENV === "production") {
    // Schedule the token delete task to run every 1 minute
    const client = require("./db");
    // delete expired tokens in token collection
    client.connect()
        .then(db => {
            // delete every 30 minutes
            cron.schedule('*/30 * * * *', () => {
                db.collection('Token').deleteMany({expires_at: {$lte: new Date()}});
            });

        })
        .catch(err => console.log(err.message));


    // apply various security patches
    const hardenedSecurityConfig = require("./middleware/hardenedServer");
    module.exports = hardenedSecurityConfig(app);
} else {
    // const populate_db = require("./db/data/populate_db");
    // const dropCollections = require("./db/dropCollections");
    //
    // dropCollections().then(() => populate_db().then());
    module.exports = app;
}