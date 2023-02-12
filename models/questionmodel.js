var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var QuestionSchema = new mongoose.Schema({
    _id     : { type : Number, default : 0 }, // 글번호, 기본키
    origin_id     : { type : Number, default : '' }, // 답글시 원글id
    title   : { type : String, default : ''}, // 제목
    content : { type : String, default : ''}, // 내용
    writer : { type : String, default : ''}, // 글 작성자
    state : { type : Number, default : 0 }, // 진행상태(답글대기:0, 완료:1)
    type : { type : Number, default : 0 }, // 0:문의,1:답글
    regdate : { type : Date,   default : Date.now}, // 등록일자
    regdate1 : { type : String,   default : ''}, // 등록일자(포맷변경)
},    
{
    versionKey:false
});

QuestionSchema.plugin(sequence, {
    id : 'SEQ_QUESTIONS_NO', //counters의 id 값
    inc_field:'_id', //스키마 값
    start_seq:1 //시작값
});

module.exports = mongoose.model('questions', QuestionSchema);