var express = require('express');
var router = express.Router();
const { auth } = require("../middleware/auth");

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

var Bakeryreview = require('../models/bakeryreviewmodel');

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
        user.isadmin = false; //관리자유무 기본 false, 관리자 등록시 DB에 직접 true 입력

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

//유저수정 127.0.0.1:3000/api/user/updateuser.json
router.put('/updateuser.json', upload.single("file"), async function(req, res, next){
    try {
        console.log('파일', req.file);
        const query = { email : req.body.email };
        const user   = await User.findOne(query);
        
        user.password = req.body.password;
        user.address = req.body.address;
        user.detailaddress = req.body.detailaddress;
        user.filedata = req.file.buffer;
        user.filename = req.file.originalname;
        user.filetype = req.file.mimetype;
        user.filesize = req.file.size;
  
        const result = await user.save();

        if(result !== null){
          return res.send({status : 200});
        }
        return res.send({status : 0});
    } catch (e) {
      
      console.error(e);
      return res.send({status : -1, result : e});
    }
  });

  //유저 리뷰카운트 수정 127.0.0.1:3000/api/user/userupdatereviewcount.json
router.put('/userupdatereviewcount.json', async function(req, res, next){
    try {
        const query = { email : req.body.email };
        const user   = await User.findOne(query);
        //전체 리뷰수 +1
        user.totalreveiwcount = user.totalreveiwcount + 1;
        const query1 =  { $and: [{ writer : req.body.email }, { bakery_id: req.body.bakery_id }] };
        // const query1 =  { writer : req.body.email };
        const project = {
            filedata: 0,
            filename: 0,
            filesize: 0,
            filetype: 0,
          };

        const bakeryreview = await Bakeryreview.findOne(query1, project);
        
        if(bakeryreview === null){ //등록이 먼저 된 후 검색 되므로 리뷰 수(조회 결과) 가 1개 이하 일 때 인증리뷰카운트 +1
            user.certreveiwcount = user.certreveiwcount + 1; 
        }

        const result = await user.save();

        if(result !== null){
          return res.send({status : 200, result : result});
        }
        return res.send({status : 0});
    } catch (e) {
      
      console.error(e);
      return res.send({status : -1, result : e});
    }
  });


//로그인 로직 /api/user/login.json
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

//구글로그인시 회원db에 아이디 있는지 확인 /api/user/googlelogin.json
router.post("/googlelogin.json", async (req, res) => {
    //로그인을할때 아이디와 비밀번호를 받는다
    const query = { email: req.body.email };
    const result = await User.findOne(query);
    console.log('조회결과',result);
    if (result === null) {
        return res.send({ status: -1});
    } else {
        result.generateToken()
            .then((user) => {
                res.cookie("token", user.token)
                    .json({ //로그인 성공시 화면에 전달하는 정보
                        userName: user.name,
                        userEmail: user.email,
                        isadmin: user.isadmin,
                        status: 200
                    })
            })
            .catch((err) => {
                res.status(400).send(err);
            });
    }
});

//auth 미들웨어를 가져온다
//auth 미들웨어에서 필요한것 : Token을 찾아서 검증하기
router.get("/auth", auth, (req, res) => {
    //auth 미들웨어를 통과한 상태 이므로
    //req.user에 user값을 넣어줬으므로
    res.status(200).json({ //재 인증 후 전달해줄 정보
        email: req.user.email,
        name: req.user.name,
        gender: req.user.gender,
        address: req.user.address,
        detailaddress: req.user.detailaddress,
        totalreveiwcount: req.user.totalreveiwcount,
        certreveiwcount: req.user.certreveiwcount,
        isadmin: req.user.isadmin,
        imageurl: `/api/user/image?_id=${req.user._id}&ts=${Date.now()}`
    });
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