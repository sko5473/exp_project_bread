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

// 유저등록 => 127.0.0.1:3000/api/user/insertuser.json
router.post('/insertuser.json', upload.single("file"), async function (req, res, next) {
    try {
        console.log('알이큐', req);
        console.log('바디', req.body);
        console.log('파일', req.file);

        const user = new User();
        user.nickname = req.body.nickname;
        user.address = req.body.address;
        user.email = req.body.email;
        user.gender = req.body.gender;
        user.password = req.body.password;
        user.filedata = req.file.buffer;
        user.filename = req.file.originalname;
        user.filetype = req.file.mimetype;
        user.filesize = req.file.size;
    

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