var express = require('express');
var router = express.Router();

// 타임 존 설정하기
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 파일첨부 라이브러리 가져오기
var multer = require('multer');
// 파일첨부 후 저장방식 (파일 => 현재 PC에 저장, 메모리=>DB에 저장)
var upload = multer({ storage: multer.memoryStorage() });

//모델 객체
var User = require('../models/usermodel');

// 유저등록 => 127.0.0.1:3000/api/user/insertuser.json upload.single("file"), 
router.post('/insertuser.json', async function (req, res, next) {
    try {
        console.log('알이큐', req);
        console.log('바디', req.body);
        console.log('파일', req.file);

        const user = new User();
        user.id = req.body.id;
        user.address = req.body.address;
        user.detailaddress = req.body.detailaddress;
        user.email = req.body.email;
        user.gender = req.body.gender;
        user.password = req.body.password;
        // user.filedata = req.file.buffer;
        // user.filename = req.file.originalname;
        // user.filetype = req.file.mimetype;
        // user.filesize = req.file.size;


        const result = await user.save();

        if (result !== null) {
            return res.send({ status: 200 });
        } else {
            return res.send({ status: 0 });
        }
    } catch (e) {
        console.error(e);
        return res.send({ status: -1, result: e });
    }
});

router.post("/login.json", async (req, res) => {
    //로그인을할때 아이디와 비밀번호를 받는다
    User.findOne({ id: req.body.id }, (err, user) => {
        if (err) {
            return res.json({
                loginSuccess: false,
                message: "존재하지 않는 아이디입니다.",
            });
        }
        user.comparePassword(req.body.password)
            .then((isMatch) => {
                if (!isMatch) {
                    return res.json({
                        loginSuccess: false,
                        message: "비밀번호가 일치하지 않습니다",
                    });
                }
               
                //비밀번호가 일치하면 토큰을 생성한다
                //jwt 토큰 생성하는 메소드
                user.generateToken()
                    .then((user) => {
                        console.log('여기3');
                        res.cookie("x_auth", user.token)
                           .status(200)
                           .json({ loginSuccess: true, userId: user._id });
                           console.log('여기2');
                    })
                    .catch((err) => {
                        res.status(400).send(err);
                        console.log('여기');
                    });
            })
            .catch((err) => res.json({ loginSuccess: false, err }));
            console.log('여기1');
    });
});



//이미지 URL => 127.0.0.1:3000/api/user/image?_id=3
//<img src="/api/user/image?_id=3">
router.get('/image', async function (req, res, next) {
    try {

        const query = { _id: Number(req.query._id) };
        const project = { filedata: 1, filetype: 1 };
        const result = await User.findOne(query, project);

        res.contentType(result.filetype);

        return res.send(result.filedata);

    } catch (e) {
        console.error(e);
        return res.send({ status: -1, result: e });
    }
});

module.exports = router;