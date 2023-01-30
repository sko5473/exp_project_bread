var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);
const bcrypt = require("bcrypt");
const saltRounds = 10;

var UserSchema = new mongoose.Schema({
    _id: { type: Number, default: 0 }, // 회원번호
    id: { type: String, default: '' }, // id
    address: { type: String, default: '' }, //주소
    detailaddress: { type: String, default: '' }, //상세주소
    email: { type: String, default: '' }, // 이메일
    gender: { type: String, default: '' }, //성별
    password: { type: String, default: '' }, //비밀번호
    reveiwcount: { type: Number, default: 0 }, //리뷰횟수
    joindate: { type: Date, default: Date.now }, //가입일자
    withdrawaldate: { type: Date, default: '' }, //탈퇴일자
    filedata: { type: Buffer, default: null }, //파일데이터
    filename: { type: String, default: '' }, //파일명
    filetype: { type: String, default: '' }, //파일종류
    filesize: { type: Number, default: 0 }, //파일크기
    imageurl: { type: String, default: '' }, //유저프로필사진 URL
},
    {
        versionKey: false
    });

UserSchema.plugin(sequence, {
    id: 'SEQ_USERS_NO', //counters의 id 값
    inc_field: '_id', //스키마 값
    start_seq: 1 //시작값
});

// save 메소드가 실행되기전에 비밀번호를 암호화하는 로직
UserSchema.pre("save", function (next) {
    let user = this;

    //model 안의 paswsword가 변환될때만 암호화
    if (user.isModified("password")) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

module.exports = mongoose.model('users', UserSchema);