import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = '0.0.0.0';

import { connectToDb } from "./db/document.db";
connectToDb()

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port:${PORT}`);
});