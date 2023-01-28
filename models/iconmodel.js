var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var IconSchema = new mongoose.Schema({
    _id     : { type : Number, default : 0 }, // 글번호, 기본키
    name     : { type : String, default : '' }, // 글번호, 기본키
    filedata : { type : Buffer, default : null}, //파일데이터
    filename : { type : String, default : '' }, //파일명
    filetype : { type : String, default : '' }, //파일종류
    filesize : { type : Number, default : 0 }, //파일크기
    imageurl : { type : String, default : '' }, //이미지 URL
},    
{
    versionKey:false
});

IconSchema.plugin(sequence, {
    id : 'SEQ_ICONS_NO', //counters의 id 값
    inc_field:'_id', //스키마 값
    start_seq:1 //시작값
});

module.exports = mongoose.model('icons', IconSchema);