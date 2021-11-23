const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

mongoose.connect("mongodb+srv://kimg00n:rkawk369!@cluster0.v8o3q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=>console.log("MongoDB Connected"))
.catch(err => console.log(err));


app.get("/", (req, res) => res.send("Hello world"));

app.listen(port, function(){
    console.log(`Example app listening on port ${port}!`);
});