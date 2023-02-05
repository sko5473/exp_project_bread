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
        const user = new User();
        user.email = req.body.email;
        user.name = req.body.name;
        user.address = req.body.address;
        user.detailaddress = req.body.detailaddress;
        user.gender = req.body.gender;
        user.password = req.body.password;
        user.isadmin = 'N'; //관리자유무 기본 N, 관리자 등록시 DB에 직접 Y 입력

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

//로그인 로직 /api/user/login_json
router.post("/login.json", async (req, res) => {
    //로그인을할때 아이디와 비밀번호를 받는다
    const query = { email: req.body.email };
    const result = await User.findOne(query);

    if (result === null) {
        return res.json({
            loginSuccess: false,
            message: "존재하지 않는 아이디입니다.",
        });
    } else {
        result.comparePassword(req.body.password)
            .then((isMatch) => {
                if (!isMatch) {
                    return res.json({
                        loginSuccess: false,
                        message: "비밀번호가 일치하지 않습니다",
                    });
                }

                //비밀번호 일치시 토큰 생성
                result.generateToken()
                    .then((user) => {
                        res.cookie("token", user.token)
                            .status(200)
                            .json({ //로그인 성공시 화면에 전달하는 정보
                                loginSuccess: true,
                                userName: user.name,
                                userEmail: user.email,
                                isadmin: user.isadmin,
                                status: 200
                            });
                    })
                    .catch((err) => {
                        res.status(400).send(err);
                    });
            })
            .catch((err) => res.json({ loginSuccess: false, err }));
    }
});

//로그아웃 로직
router.delete('/logout.json', (req, res) => {
    if (req.cookies && req.cookies.token) {
        res.clearCookie("token")
    }
    res.send(200);
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