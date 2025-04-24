const express = require('express');
const connectDB = require('./config/db');
const app = express();
const port = process.env.PORT || 8070;
const cors = require("cors");
const morgan = require("morgan");
var session = require("express-session");
var MongoStore = require("connect-mongo");
const fs = require("fs");
const path = require("path");

// Connect to MongoDB
connectDB();

// connect with frontend server
app.use(cors({ origin: "*", credentials: true }));

// connect session storage to mongodb server
app.use(
    session({
        cookie: {
            sameSite: true,
        },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI ,
            dbName: process.env.DB_NAME,
            collectionName: "session",
            ttl: 14 * 24 * 60 * 60,
            autoRemove: "interval",
            autoRemoveInterval: 10,
        }),
    })
);

// Morgan is HTTP request logger middleware
app.use(morgan("dev"));


// Convert request data into a JSON object
app.use(express.json());
app.use(express.urlencoded({ limit: "1mb", extended: false }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

fs.readdirSync(__dirname + "/routers").forEach((file) => {
    const router = require(path.join(__dirname + "/routers", file));
    app.use("/api/", router);
});

app.listen(port, () => console.log(`server running on port ${port}`));
