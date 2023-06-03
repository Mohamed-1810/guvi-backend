// const express = require('express');
import express from 'express';
// const mysql = require('mysql');
import mysql from 'mysql';
// const cors = require('cors');
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: ["http://localhost:3000"],
        methods: ["POST", "GET"],
        credentials: true 
    }
));
// app.use(cors());
const db= mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "guvitask"
})

const verifyUser = (req,res,next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.json({Message:"we need token please provide it."})
    }
    else{
        jwt.verify(token, "our-jsonwebtoken-scret-key", (err, decoded) => {
            if(err){
                return res.json({Meassage :"Authentication Error."})
            }
            else{
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/',verifyUser, (req, res) => {
    return res.json({Status: "Success", name:req.name})
})
// import http from 'http';
// const server = http.createServer()
// server.on("request", (request, response) => {
//     // handle request based on method then URL
//     response.statusCode = 200;
//     response.write("Hello World")
//     response.end()
//     console.log("Hello");
//   })

app.post('/signup',(req,res)=>{
    const sql = "INSERT INTO users (`name`,`email`,`password`) VALUES(?)";
    const values =[
        req.body.name,
        req.body.email,
        req.body.password
    ]

    db.query(sql, [values], (err,data) =>{
        if(err){
            return res.json("Error");
        }
        return res.json(data);
    })
})

app.post('/login',(req,res)=>{
    const sql = "SELECT * FROM users WHERE `email` = ? AND `password` = ?";
    db.query(sql, [req.body.email,req.body.password], (err, data) =>{
        // console.log(data);
        if(err){
            return res.json({Message:"Server Side Error"});
        }
        if(data.length > 0){
            const name = data[0].name;
            const token = jwt.sign({name}, "our-jsonwebtoken-scret-key",{expiresIn:'1d'});
            res.cookie('token',token)
            return res.json("Success");
        }
        else{
            return res.json("Failed");
        }
    })
})
// console.log("hello");
const PORT = process.env.PORT || 8081
app.listen(PORT, ()=>{
    console.log("listening");
})