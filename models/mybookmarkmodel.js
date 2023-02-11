var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var MyBookmarkSchema = new mongoose.Schema({
    _id     : { type : Number, default : 0 }, // 글번호, 기본키
    bakerynum   : { type : Number, default : 0 }, // 상점번호
    email   : { type : String, default : '' }, // 이메일
    name   : { type : String, default : ''}, // 가게명
    address : { type : String, default : ''}, //주소(구)
},    
{
    versionKey:false
});

MyBookmarkSchema.plugin(sequence, {
    id : 'SEQ_MYBOOKMARKS_NO', //counters의 id 값
    inc_field:'_id', //스키마 값
    start_seq:1 //시작값
});

module.exports = mongoose.model('mybookmarks', MyBookmarkSchema);