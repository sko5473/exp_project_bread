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
var Question = require('../models/questionmodel');

// 1:1문의글 등록 => 127.0.0.1:3000/api/question/insertquestion.json
router.post('/insertquestion.json', async function (req, res, next) {
  try {
    const question = new Question();
    question.title = req.body.title;
    question.content = req.body.content;
    question.writer = req.body.writer;
    question.state = req.body.state;
    question.type = req.body.type;

    const result = await question.save();

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

// 1:1문의글 답변 등록 => 127.0.0.1:3000/api/question/insertshop.json
router.post('/replyquestion.json', async function (req, res, next) {
  try {
    const question = new Question();
    question.content = req.body.content;
    question.writer = req.body.writer;
    question.state = req.body.state;
    question.type = req.body.type;
    question.origin_id = req.body.origin_id; //원글번호

    const result = await question.save();

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

// 문의글 상태값 변경 => 127.0.0.1:3000/api/question/updatequestionstate.json?_id=15
router.put('/updatequestionstate.json', async function (req, res, next) {
  try {
    const query = { _id: Number(req.query._id) }; //원글의 번호
    const result = await Question.findOne(query);

    if (result !== null) {
      result.state = 1;
      const result1 = await result.save();
      if (result1 !== null) {
        return res.send({ status: 200 });
      }
    }
    return res.send({ status: 0 });
  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });
  }
});

//답글 상세 => /api/question/selectonequestionrelply.json?_id=15
router.get('/selectonequestionrelply.json', async function (req, res, next) {
  try {
    const origin_id = Number(req.query.origin_id);
    const query = { $and: [{ origin_id: origin_id }, { type: 1 }] };

    const result = await Question.findOne(query);

    if(result !== null){
      result.regdate1 = moment(result.regdate).format("YYYY-MM-DD");

      return res.send({
        status: 200,
        result: result
      });
    } else {
      return res.send({
        status: 0,
        result: null
      })
    }

  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });

  }
});

//관리자 1:1문의 목록 => 127.0.0.1:3000/api/question/selectquestion.json?page=1&text=검색어
router.get('/selectquestion.json', async function (req, res, next) {
  try {
    const text = req.query.text; //검색어
    const page = req.query.page; //1
    const query = { $and: [{ title: new RegExp(text, 'i') }, { type: 0 }] };  //RegExp(포함된 것을 찾아내는 함수)

    const result = await Question.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    //등록일, 이미지URL 수동 생성                          
    for (let tmp of result) {
      tmp.regdate1 = moment(tmp.regdate).format("YYYY-MM-DD HH:mm:ss");
    }

    //페이지네이션용 전체 개수
    const total = await Question.countDocuments(query);

    return res.send({ status: 200, total: total, result: result });
  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });
  }
});

//개인1:1문의 목록 => 127.0.0.1:3000/api/question/selectmyquestion.json?page=1&text=검색어&email=22@naver.com
router.get('/selectmyquestion.json', async function (req, res, next) {
  try {
    const text = req.query.text; //검색어
    const page = req.query.page; //1
    const writer = req.query.writer;
    const query = { $and: [{ title: new RegExp(text, 'i') }, { type: 0 }, { writer: writer }] };  //RegExp(포함된 것을 찾아내는 함수)

    const result = await Question.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    //등록일, 이미지URL 수동 생성                          
    for (let tmp of result) {
      tmp.regdate1 = moment(tmp.regdate).format("YYYY-MM-DD HH:mm:ss");
    }

    //페이지네이션용 전체 개수
    const total = await Question.countDocuments(query);

    return res.send({ status: 200, total: total, result: result });
  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });
  }
});

//1:1문의글 상세 => /api/question/selectonequestion.json?_id=15
router.get('/selectonequestion.json', async function (req, res, next) {
  try {
    const _id = Number(req.query._id);
    const query = { _id: _id };

    const result = await Question.findOne(query);

    if (result !== null) {
      result.regdate1 = moment(result.regdate).format("YYYY-MM-DD");

      //이전글
      // $lt 작다, $gt 크다, $lte 작거나 같다, $gte 크거나 같다.
      const query1 = { _id: { $lt: _id } };
      const project1 = { _id: 1 };
      let prev = await Question.find(query1, project1)
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
      let next = await Question.find(query2, project1)
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

      return res.send({
        status: 200,
        result: result,
        prev: prev,
        next: next,
      });
    }
    return res.send({ status: 0 });
  } catch (e) {
    console.error(e);
    return res.send({ status: -1, result: e });

  }
});

module.exports = router;