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
var MyBookmark = require('../models/mybookmarkmodel');

// 나의즐겨찾기등록 => 127.0.0.1:3000/api/mybookmark/insertbookmark.json
//{"title":"a", "content":"b", "writer":"c","file":"첨부파일"}
router.post('/insertbookmark.json', async function (req, res, next) {
  try {
    const mybookmark = new MyBookmark();
    mybookmark.bakerynum = req.body.bakerynum;
    mybookmark.name = req.body.name;
    mybookmark.email = req.body.email;
    mybookmark.address = req.body.address;

    const result = await mybookmark.save();

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

// 나의즐겨찾기 삭제 => 127.0.0.1:3000/api/mybookmark/deletemybookmark.json?_id=15
router.delete('/deletemybookmark.json', async function(req, res, next){
  try {
      const query = { bakerynum : Number(req.query._id)};
      const result = await MyBookmark.remove(query);

      if(result.deletedCount === 1){
        return res.send({status : 200});
      }
      return res.send({status : 0});
  } catch (e) {
    console.error(e);
    return res.send({status : -1, result : e});
  }
});

//나의즐겨찾기 1개 조회 => 127.0.0.1:3000/api/mybookmark/selectmybookmark.json?_id=15
router.get('/selectmybookmark.json', async function (req, res, next) {
  try {
    const bakerynum = req.query._id
    const query = { bakerynum : bakerynum};
    const result = await MyBookmark.find(query)
      .limit(1);

    return res.send({ status: 200, result: result });
  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });
  }
});

//나의즐겨찾기 모두 조회 => 127.0.0.1:3000/api/mybookmark/selectallmybookmark.json?email=22@naver.com
router.get('/selectallmybookmark.json', async function (req, res, next) {
  try {
    const page = req.query.page;
    const email = req.query.email
    const query = { email : email};
    const result = await MyBookmark.find(query)
                                  .sort({_id : -1})
                                  .skip((page-1)*10)
                                  .limit(10);

    const total = await MyBookmark.countDocuments(query);

    return res.send({ status: 200, result: result, total: total });
  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });
  }
});

module.exports = router;