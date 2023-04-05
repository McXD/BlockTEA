const { MongoClient } = require("mongodb");
const WebSocket = require("ws");

const uri = "mongodb://localhost:27017/?replicaSet=rs0";
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function main() {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("blockchain_events");
    const eventsCollection = db.collection("events");

    const server = new WebSocket.Server({ port: 8081 });
    const clients = new Set();

    server.on("connection", async (socket) => {
        clients.add(socket);
        console.log("Client connected");

        // Send all events in the collection to the client on first connection
        const events = await eventsCollection.find().toArray();
        console.log(`Sending ${events.length} events to client`)
        events.forEach((event) => {
            // Send the event only to the newly connected client
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(event));
            }
        });

        socket.on("close", () => {
            clients.delete(socket);
            console.log("Client disconnected");
        });
    });

    function sendEventToClients(event) {
        const eventData = JSON.stringify(event);

        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(eventData);
            }
        });
    }

    const changeStream = eventsCollection.watch();

    changeStream.on("change", (change) => {
        if (change.operationType === "insert" || change.operationType === "update") {
            const event = change.fullDocument;
            sendEventToClients(event);
        }
    });
}

main().catch(console.error);
