var express = require('express');
var router = express.Router();

// 파일첨부 라이브러리 가져오기
var multer = require('multer');
// 파일첨부 후 저장방식 (파일 => 현재 PC에 저장, 메모리=>DB에 저장)
var upload = multer({storage : multer.memoryStorage()});

//모델 객체
var Bakery = require('../models/bakerymodel');

// 상점등록 => 127.0.0.1:3000/api/bakery/insertshop.json
//{"title":"a", "content":"b", "writer":"c","file":"첨부파일"}
router.post('/insertshop.json', async function (req, res, next){
    try {
      console.log('알이큐',req);
      console.log('바디', req.body);
      console.log('파일', req.file);     
  
      const bakery = new Bakery();
      bakery.name = req.body.name;
      bakery.address = req.body.address;
      bakery.addressdetail = req.body.addressdetail;
      bakery.phone = req.body.phone;
      bakery.parking = req.body.parking;
      bakery.menu = req.body.menu;
      bakery.price = req.body.price;
      bakery.holiday = req.body.holiday;
      bakery.point = req.body.point;
      bakery.hit = req.body.hit;
      bakery.bookmarkcount = req.body.bookmarkcount;
      bakery.strength = req.body.strength;
  
      const result = await bakery.save();
  
      if(result !== null){
        return res.send({status : 200});
      } else {
        return res.send({status : 0});
      }
    } catch (e) {
      console.error(e);
      return res.send({status : -1, result : e});
    }
  });
  

module.exports = router;