const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const port = 4000;

const config = require("./config/key");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const {User} = require("./models/User");
const {auth} = require("./middleware/auth");

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=>console.log("MongoDB Connected"))
.catch(err => console.log(err));


app.get("/", (req, res) => res.send("Hello world"));

app.get("/api/hello", (req, res) => {
    res.send("안녕하세요~");
});

app.post("/api/users/register", (req,res) => {
    //회원가입 할때 필요한 정보들을 client에서 가져오면
    //그것들을 DB에 넣어줌
    const user = new User(req.body);
    user.save((err, userInfo) => {
        if(err){
            return res.json({success: false, err});
        }else{
            return res.status(200).json({
                success: true
            });
        }
    });
});

app.post("/api/users/login", (req, res) => {
    //요청된 이메일을 DB에서 있는지 찾는다.
    User.findOne({email: req.body.email}, function(err, user){
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "이메일에 해당하는 유저가 없습니다."
            });
        }else{
            //요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인.
            user.comparePassword(req.body.password, function(err, isMatch){
                if(!isMatch){
                    return res.json({
                        loginSuccess: false,
                        message: "비밀번호가 틀렸습니다."
                    });
                }
                //비밀번호 까지 맞다면 토큰을 생성하기
                else{
                    user.generateToken((err, user) => {
                        if(err){
                            return res.status(400).send(err);
                        }else{
                            //토큰 저장.
                            res.cookie("x_auth", user.token)
                            .status(200)
                            .json({
                                loginSuccess: true,
                                userId: user._id
                            });
                        }
                    });
                }
            });
        
        }
    });
});

app.get("/api/users/auth", auth, (req, res) => {
    //여기까지 미들웨어를 통과한것을 Authentication이 true라는 것
    res.status(200).json({
        _id: req.user._id, 
        isAdmin: req.user.role === 0 ? false : true, // role이 0이 아니면 admin
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    });
});

app.get("/api/users/logout", auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, {
        token: ""
    }, (err, user) => {
        if(err){
            return res.json({
                success: false,
                err
            });
        }else{
            return res.status(200).send({
                success: true
            });
        }
    });
});

app.listen(port, function(){
    console.log(`Example app listening on port ${port}!`);
});