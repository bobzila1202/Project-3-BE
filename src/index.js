require("dotenv").config();

const PORT = process.env.PORT;
const api = require("./api");

api.listen(PORT, () => {
    console.log(`API listening on ${PORT}`);
})