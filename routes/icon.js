var express = require('express');
var router = express.Router();

// 파일첨부 라이브러리 가져오기
var multer = require('multer');
// 파일첨부 후 저장방식 (파일 => 현재 PC에 저장, 메모리=>DB에 저장)
var upload = multer({ storage: multer.memoryStorage() });

//모델 객체
var Icon = require('../models/iconmodel');

// 아이콘등록 => 127.0.0.1:3000/api/icon/inserticon.json
router.post('/inserticon.json', upload.single("file"), async function (req, res, next) {
    try {
        const icon = new Icon();
        icon.name = req.body.name;
        icon.filedata = req.file.buffer;
        icon.filename = req.file.originalname;
        icon.filetype = req.file.mimetype;
        icon.filesize = req.file.size;

        const result = await icon.save();

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

//아이콘 목록 => 127.0.0.1:3000/api/icon/selecticon.json?text=검색어
router.get('/selecticon.json', async function (req, res, next) {
    try {
        const text= req.query.text; //검색어

        const query = { name: new RegExp(text, 'i')};
        const project = {
            filedata: 0,
            filename: 0,
            filesize: 0,
            filetype: 0,
        };
        const result = await Icon.find(query, project)

        for (let tmp of result) {
            //이미지URL 생성                          
            tmp.imageurl = `/api/icon/image?_id=${tmp._id}&ts=${Date.now()}`;
        }
        return res.send({ status: 200, result: result });
    } catch (e) {
        console.error(e);
        return res.send({ status: -1, result: e });
    }
});

//이미지 URL => 127.0.0.1:3000/api/icon/image?_id=3
router.get('/image', async function (req, res, next) {
    try {

        const query = { _id: Number(req.query._id) };
        const project = { filedata: 1, filetype: 1 };
        const result = await Icon.findOne(query, project);

        res.contentType(result.filetype);

        return res.send(result.filedata);

    } catch (e) {
        console.error(e);
        return res.send({ status: -1, result: e });
    }
});

module.exports = router;