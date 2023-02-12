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
    const bakeryreview = new BakeryReview();
    bakeryreview.bakery_id = req.query._id;
    bakeryreview.writer = req.body.writer;
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
//127.0.0.1:3000/api/bakeryreview/selectreview.json?page=1&bakery_id=15
router.get('/selectreview.json', async function (req, res, next) {
  try {

    const bakery_id = req.query.bakery_id;
    const page = req.query.page; //1
    console.log('리퀘스트 쿼리', req.query);
    console.log('리퀘스트', req);

    //전체 데이터에서 제목이 검색어가 포함된 것 가져오기
    // a => a123, 
    const query = { bakery_id: Number(bakery_id) }; //RegExp(포함된 것을 찾아내는 함수)
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
      tmp.regdate1 = moment(tmp.regdate).format("YYYY-MM-DD HH:mm:ss");
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

//모달창 내 1개 리뷰정보 수신
router.get('/selectreviewone.json', async function (req, res, next) {
  try {

    const _id = req.query._id;

    //전체 데이터에서 제목이 검색어가 포함된 것 가져오기
    // a => a123, 
    const query = { _id: Number(_id) }; //RegExp(포함된 것을 찾아내는 함수)
    const project = {
      filedata: 0,
      filename: 0,
      filesize: 0,
      filetype: 0,
    };

    const result = await BakeryReview.findOne(query,project);

    //등록일, 이미지URL 수동 생성                          
    if (result !== null) {
      //format("YYYY-MM-DD HH:mm:ss")
      result.regdate1 = moment(result.regdate).format("YYYY-MM-DD HH:mm:ss");
      result.imageurl = `/api/bakeryreview/image?_id=${_id}&ts=${Date.now()}`;

      //이전글
      // $lt 작다, $gt 크다, $lte 작거나 같다, $gte 크거나 같다.
      const query1 = { _id: { $lt: _id } };
      const project1 = { _id: 1 };
      let prev = await BakeryReview.find(query1, project1)
        .sort({ _id: -1 })
        .limit(1);
      console.log('prev=>', prev);

      if (prev.length > 0) {
        prev = prev[0]._id;
      }
      else {
        prev = 0;
      }

      //다음글
      const query2 = { _id: { $gt: _id } };
      let next = await BakeryReview.find(query2, project1)
        .sort({ _id: 1 })
        .limit(1);

      console.log('NEXT=>', next);

      if (next.length > 0) {
        console.log('확인', next[0]._id);
        next = next[0]._id;
      }
      else {
        next = 0;
      }

      //최신글에서 5번째 글번호 조회(더보기 띄우기용)
      // $lt 작다, $gt 크다, $lte 작거나 같다, $gte 크거나 같다.
      let prev5 = await BakeryReview.find({},project1)
        .sort({ _id: -1 })
        .skip(5)
        .limit(1);
      console.log('prev5=>', prev5);

      if (prev5.length > 0) {
        prev5 = prev5[0]._id;
      }
      else {
        prev5 = 0;
      }

      return res.send({
        status: 200,
        result: result,
        prev: prev,
        next: next,
        prev5 : prev5,
      });
    } return res.send({ status: 0 });
  } catch (e) {
    console.error(e);

    return res.send({ status: -1, result: e });
  }
});

//모달창 smallimg데이터 수신
router.get('/selectreviewsmallimg.json', async function (req, res, next) {
  try {
    const bakery_id = req.query.bakery_id;
    const page = req.query.page;
    const query = { bakery_id: Number(bakery_id) };
    const project = {
      filedata: 0,
      filename: 0,
      filesize: 0,
      filetype: 0,
    };

    const result = await BakeryReview.find(query, project)
                                     .sort({_id : -1})
                                     .skip((page-1)*10)
                                     .limit(10);

    //등록일, 이미지URL 수동 생성                          
    for (let tmp of result) {
      //format("YYYY-MM-DD HH:mm:ss")
      tmp.regdate1 = moment(tmp.regdate).format("YYYY-MM-DD HH:mm:ss");
      tmp.imageurl = `/api/bakeryreview/image?_id=${tmp._id}&ts=${Date.now()}`;
    }

    //페이지네이션용 전체 개수
    const total = await BakeryReview.countDocuments(query);

      return res.send({
        status: 200,
        result: result,
        total:total,
      });
    }  catch (e) {
    console.error(e);

    return res.send({ status: -1, result: e });
  }
});

//리뷰 내림차순 중 5번째 리뷰번호 받기용(더보기 띄우기)
router.get('/selectreviewone5.json', async function (req, res, next) {
  try {

      const project1 = { _id: 1 };
      // $lt 작다, $gt 크다, $lte 작거나 같다, $gte 크거나 같다.
      let prev5 = await BakeryReview.find({},project1)
        .sort({ _id: -1 })
        .skip(5)
        .limit(1);
      console.log('prev5=>', prev5);

      if (prev5.length > 0) {
        prev5 = prev5[0]._id;
      }
      else {
        prev5 = 0;
      }

      return res.send({
        status: 200,
        prev5 : prev5,
      });
  } catch (e) {
    console.error(e);

    return res.send({ status: -1, result: e });
  }
});

// /api/bakery/selectmyshopreviewcount.json
//전체리뷰수 조회
router.get('/selectmyshopreviewcount.json', async function (req, res, next) {
  try {
    //전체빵집수
    const query = { writer : req.query.writer};
    const total = await BakeryReview.countDocuments(query);

    return res.send({ status: 200, total: total });
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