var express = require('express');
var router = express.Router();

//접속 ip확인모듈
var requestIp = require('request-ip');

// 파일첨부 라이브러리 가져오기
var multer = require('multer');
// 파일첨부 후 저장방식 (파일 => 현재 PC에 저장, 메모리=>DB에 저장)
var upload = multer({ storage: multer.memoryStorage() });

//모델 객체
var LoginIpLog = require('../models/loginiplogmodel');

// 로그인ip로그등록 => 127.0.0.1:3000/api/loginiplog/insertloginiplog.json
router.post('/insertloginiplog.json', async function (req, res, next) {
    try {
        console.log("client IP: " + requestIp.getClientIp(req));

        const loginiplog = new LoginIpLog();
        loginiplog.email = req.body.email;
        loginiplog.ip = requestIp.getClientIp(req); //클라이언트ip값

        const result = await loginiplog.save();

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

//월별 방문자 수 조회(로그인시 ip기준) => 127.0.0.1:3000/api/loginiplog/selectvisitcount.json
router.get('/selectvisitcount.json', async function (req, res, next) {
    try {
        const query1 = { "regdate": {$gte: "2023-01-01T00:00:00+09:00", $lte: "2023-01-31T23:59:59+09:00"}};
        const query2 = { "regdate": {$gte: "2023-02-01T00:00:00+09:00", $lte: "2023-02-28T23:59:59+09:00"}};
        const query3 = { "regdate": {$gte: "2023-03-01T00:00:00+09:00", $lte: "2023-03-31T23:59:59+09:00"}};
        const query4 = { "regdate": {$gte: "2023-04-01T00:00:00+09:00", $lte: "2023-04-30T23:59:59+09:00"}};
        const query5 = { "regdate": {$gte: "2023-05-01T00:00:00+09:00", $lte: "2023-05-31T23:59:59+09:00"}};
        const query6 = { "regdate": {$gte: "2023-06-01T00:00:00+09:00", $lte: "2023-06-30T23:59:59+09:00"}};
        const query7 = { "regdate": {$gte: "2023-07-01T00:00:00+09:00", $lte: "2023-07-31T23:59:59+09:00"}};
        const query8 = { "regdate": {$gte: "2023-08-01T00:00:00+09:00", $lte: "2023-08-31T23:59:59+09:00"}};
        const query9 = { "regdate": {$gte: "2023-09-01T00:00:00+09:00", $lte: "2023-09-30T23:59:59+09:00"}};
        const query10 = { "regdate": {$gte: "2023-10-01T00:00:00+09:00", $lte: "2023-10-31T23:59:59+09:00"}};
        const query11 = { "regdate": {$gte: "2023-11-01T00:00:00+09:00", $lte: "2023-11-30T23:59:59+09:00"}};
        const query12 = { "regdate": {$gte: "2023-12-01T00:00:00+09:00", $lte: "2023-12-31T23:59:59+09:00"}};

        const JanuaryIpCount = await LoginIpLog.distinct("ip",query1);
        const FebruaryIpCount = await LoginIpLog.distinct("ip",query2);
        const MarchIpCount = await LoginIpLog.distinct("ip",query3);
        const AprilIpCount = await LoginIpLog.distinct("ip",query4);
        const MayIpCount = await LoginIpLog.distinct("ip",query5);
        const JuneIpCount = await LoginIpLog.distinct("ip",query6);
        const JulyIpCount = await LoginIpLog.distinct("ip",query7);
        const AugustIpCount = await LoginIpLog.distinct("ip",query8);
        const SeptemberIpCount = await LoginIpLog.distinct("ip",query9);
        const OctoberIpCount = await LoginIpLog.distinct("ip",query10);
        const NovemberIpCount = await LoginIpLog.distinct("ip",query11);
        const DecemberIpCount = await LoginIpLog.distinct("ip",query12);


        return res.send({ status: 200, IpCount : [ JanuaryIpCount, FebruaryIpCount, MarchIpCount,AprilIpCount,MayIpCount,JuneIpCount,JulyIpCount
        ,AugustIpCount,SeptemberIpCount,OctoberIpCount,NovemberIpCount,DecemberIpCount]});
    } catch (e) {
        console.error(e);
        return res.send({ status: -1, result: e });
    }
});
module.exports = router;