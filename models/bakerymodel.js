var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var BakerySchema = new mongoose.Schema({
    _id     : { type : Number, default : 0 }, // 글번호, 기본키
    name   : { type : String, default : ''}, // 가게명
    address : { type : String, default : ''}, //주소(구)
    addressdetail  : { type : String, default : ''}, //주소 상세
    phone     : { type : String, default : ''}, //전화번호
    parking : { type : String, default : ''}, //주차공간
    menu : { type : String, default : ''}, //메뉴
    price : { type : String, default : ''}, //가격
    holiday : { type : String, default : ''}, //휴일
    point : { type : Number, default : 0}, //평점
    reviewcount : { type : Number, default : 0}, //리뷰수
    bookmarkcount : { type : Number, default : 0}, //즐겨찾기수
    strength : { type : String, default : ''}, //강점
    lat : { type : String, default : ''}, //위도
    lng : { type : String, default : ''}, //경도
    regdate : { type : Date,   default : Date.now}, //등록일자
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

BakerySchema.plugin(sequence, {
    id : 'SEQ_BAKERYS_NO', //counters의 id 값
    inc_field:'_id', //스키마 값
    start_seq:1 //시작값
});

module.exports = mongoose.model('bakerys', BakerySchema);