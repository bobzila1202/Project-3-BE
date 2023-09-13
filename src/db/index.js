const {MongoClient} = require("mongodb")
const connectionUrl = process.env.DB_URL;



const client = new MongoClient(connectionUrl)

const connectDB = async () => {
    try {
        await client.connect()
        console.log("Connected successfully");
    } catch (error) {
        console.log(error);
    }
}

connectDB().then();

process.on("SIGINT", () => {
    client.close().then(() => {
        console.log("Disconnected from MongoDB");
        process.exit(0);
    });
});
module.exports = client