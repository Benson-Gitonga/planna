import express from "express";
import pg from "pg"
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import session from "session";
import env from "dotenv";
env.config();

const app = express();
//Port server will be running 
const  serverport = 5000;
app.use(express.json());




app.listen(serverport, () => {
    console.log(`Server is running on port ${serverport}`);
})