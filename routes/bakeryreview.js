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
var BakeryReview = require('../models/bakeryreviewmodel');

// 리뷰등록 => 127.0.0.1:3000/api/bakeryreview/insertshopreview.json?_id=15
//{"title":"a", "content":"b", "writer":"c","file":"첨부파일"}
router.post('/insertshopreview.json', upload.single("file"), async function (req, res, next) {
  try {
    console.log('알이큐', req);
    console.log('바디', req.body);
    console.log('파일', req.file);

    const bakeryreview = new BakeryReview();
    bakeryreview.bakery_id = req.query._id;
    bakeryreview.point = req.body.point;
    bakeryreview.content = req.body.content;
    bakeryreview.filedata = req.file.buffer;
    bakeryreview.filename = req.file.originalname;
    bakeryreview.filetype = req.file.mimetype;
    bakeryreview.filesize = req.file.size;

    const result = await bakeryreview.save();

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

//상점페이지 안 리뷰데이터 수신
// 리뷰등록 => 127.0.0.1:3000/api/bakeryreview/selectreview.json?bakery_id=15
router.get('/selectreview.json', async function (req, res, next) {
  try {
    const bakery_id = req.query._id;
    const page = req.query.page; //1

    //전체 데이터에서 제목이 검색어가 포함된 것 가져오기
    // a => a123, 
    const query = { bakery_id: new RegExp(bakery_id, 'i') }; //RegExp(포함된 것을 찾아내는 함수)
    const project = {
      filedata: 0,
      filename: 0,
      filesize: 0,
      filetype: 0,
    };
    const result = await BakeryReview.find(query, project)
      .sort({ _id: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    //등록일, 이미지URL 수동 생성                          
    for (let tmp of result) {
      //format("YYYY-MM-DD HH:mm:ss")
      tmp.regdate1 = moment(tmp.regdate).format("YYYY-MM-DD");
      tmp.imageurl = `/api/bakeryreview/image?_id=${tmp._id}&ts=${Date.now()}`;
    }

    //페이지네이션용 전체 개수
    const total = await BakeryReview.countDocuments(query);

    return res.send({ status: 200, total: total, result: result });
  } catch (e) {
    console.error(e);

    return res.send({ status: -1, result: e });
  }
});

//이미지 URL => 127.0.0.1:3000/api/bakeryreview/image?_id=3
//<img src="/api/bakeryreview/image?_id=3">
router.get('/image', async function (req, res, next) {
  try {

    const query = { _id: Number(req.query._id) };
    const project = { filedata: 1, filetype: 1 };
    const result = await BakeryReview.findOne(query, project);
    //console.log(result);

    res.contentType(result.filetype);

    return res.send(result.filedata);

  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });
  }
});

module.exports = router;