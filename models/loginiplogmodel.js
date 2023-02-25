var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var LoginIpLogSchema = new mongoose.Schema({
    _id     : { type : Number, default : 0 }, // 글번호, 기본키
    email     : { type : String, default : '' }, //이메일 주소
    ip     : { type : String, default : '' }, //이메일 주소
    regdate : { type : Date,   default : Date.now} //방문일자
},    
{
    versionKey:false
});

LoginIpLogSchema.plugin(sequence, {
    id : 'SEQ_LOGINIPLOGS_NO', //counters의 id 값
    inc_field:'_id', //스키마 값
    start_seq:1 //시작값
});

module.exports = mongoose.model('loginiplog', LoginIpLogSchema);