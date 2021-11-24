const {User} = require("../models/User");


let auth = (req, res, next) => {
    //인증처리용도
    //클라이언트 쿠키에서 토큰을 가져옴
    let token = req.cookies.x_auth;

    //토큰을 복호화후 유저를 찾는다.
    User.findByToken(token, function(err, user){
        if(err){
            throw err;
        }
        if(!user){
            return res.json({
                isAuth: false,
                error: true 
            });
        }else{
            req.token = token;
            req.user = user;
            next();
        }
    });
}

module.exports = {auth};