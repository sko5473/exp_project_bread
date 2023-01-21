var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var BakeryReviewSchema = new mongoose.Schema({
    _id     : { type : Number, default : 0 }, // 글번호, 기본키
    bakery_id     : { type : Number, default : 0 }, // 빵집번호
    writer : { type : String, default : ''}, //작성자
    point : { type : Number, default : '0'}, //평점
    content : { type : String, default : ''}, //내용
    regdate : { type : Date,   deafult : Date.now}, //등록일자
    regdate1 : { type : String,   deafult :''}, //등록일자 포맷 변경
    filedata : { type : Buffer, default : null}, //파일데이터
    filename : { type : String, default : '' }, //파일명
    filetype : { type : String, default : '' }, //파일종류
    filesize : { type : Number, default : 0 }, //파일크기
    imageurl : { type : String, default : '' }, //이미지 URL
},    
{
    versionKey:false
});

BakeryReviewSchema.plugin(sequence, {
    id : 'SEQ_BAKERYREVIEWS_NO', //counters의 id 값
    inc_field:'_id', //스키마 값
    start_seq:1 //시작값
});

module.exports = mongoose.model('bakeryreviews', BakeryReviewSchema);