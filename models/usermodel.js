var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const jwtKey = 'a1b1c1d1Token';

var UserSchema = new mongoose.Schema({
    _id: { type: Number, default: 0 }, // 회원번호
    email: { type: String, default: '' }, // 이메일
    name: { type: String, default: '' }, // 이름
    address: { type: String, default: '' }, //주소
    isadmin: { type: Boolean, default: false }, //관리자유무
    detailaddress: { type: String, default: '' }, //상세주소
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

UserSchema.methods.comparePassword = function (plainPassword) {
    //plainPassword를 암호화해서 현재 비밀번호화 비교
    return bcrypt
        .compare(plainPassword, this.password)
        .then((isMatch) => isMatch)
        .catch((err) => err);
};

UserSchema.methods.generateToken = function () {
    const token = jwt.sign({
        _id: this._id,
    }, jwtKey ,{
        algorithm: 'HS256', //암호화 알고리즘
        expiresIn: '59m' //jwt쿠키 만료시간(59분)
    });
    this.token = token;
    return this.save()
        .then((user) => user)
        .catch((err) => err);
};

UserSchema.statics.findByToken = function (token) {
    let user = this;
    //secretToken을 통해 user의 id값을 받아오고 해당 아이디를 통해
    //Db에 접근해서 유저의 정보를 가져온다  
    return jwt.verify(token, jwtKey , function (err, decoded) {
        return user
            .findOne({ _id: decoded, token: token })
            .then((user) => user)
            .catch((err) => err);
    });
};

module.exports = mongoose.model('users', UserSchema);