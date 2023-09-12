const {PythonShell} = require("python-shell")
 
const express = require("express");
// const cron = require('node-cron');
const ENV = process.env.ENV;
const app = express();

const fs = require('fs')
const cors = require('cors')
const logger = require('morgan')

// const db = require("./db/db");
const filter = require("./middleware/htmlFilter");
const jsonCheck = require("./middleware/corruptJsonCheck");


// const users = require("./routes/users");
// const admins = require("./routes/admins");
const home = require("./routes/home");
const code = require("./routes/code")


// parse as json
app.use(express.json());

// set static files
app.use(express.static("static"));

app.use(logger('dev'))

app.use(cors())

// check for invalid json
app.use(jsonCheck)

// filter out direct requests to *.(html,htm) files
app.use(filter);

// routes mapping
// app.use("/users", users);
// app.use("/admins", admins);

// app.use("/code", code)

app.post("/python", (req, res) => {
    fs.writeFileSync('test.py', req.body.code)
    PythonShell.run('test.py', {mode: 'text', pythonOptions: ['-u'], args:[1,2,3]}).then(
        messages => {console.log(messages);
        res.send(messages);
        }
    )

    // PythonShell.run('test.py', {mode: 'text', pythonOptions: ['-u'], args:[1,2,3]}, function (err, results){
    //     console.log('Hello World');
    //     console.log('WORKING')
    //     if (err) throw err;
    //     console.log('line 57' + results);
    //     res.send({passOrFail: results[0]})
    //   })
})

// TODO: facebook & google oath2 mappings
// app.use("/", require("./routes/google"));
// app.use("/", require("./routes/facebook"));


// should always be last
app.use("/", home);

/* istanbul ignore next */
if (ENV === "production") {
    // Schedule the token delete task to run every 1 minute
    // cron.schedule('*/30 * * * *', () => {
    //     // delete expired session tokens
    //     db.query("SELECT delete_expired_session_tokens();")
    //         .then(() => console.log("Expired tokens deleted."));
    //
    //     // delete expired email tokens
    //     db.query("SELECT delete_expired_email_tokens();")
    //         .then(() => console.log("Expired email tokens deleted."));
    // });

    // apply various security patches
    const hardenedSecurityConfig = require("./middleware/hardenedServer");
    module.exports = hardenedSecurityConfig(app);
} else {
    module.exports = app;
}