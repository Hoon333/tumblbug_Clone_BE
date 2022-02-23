const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
});

// 사전 hook , save 시 password 암호화 해서 저장
UserSchema.pre("save", function (next) {
    let user = this;

    if (user.password) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) return next(err);
                user.password = hash;
            });
        });
    }
    next();
});

// 이전의 코드, 카카오 로그인 시 password라는 data가 없기 때문에 Error: data and salt arguments required 가 발생한다.
// UserSchema.pre("save", function (next) {
//     let user = this;
//     bcrypt.genSalt(10, (err, salt) => {
//         if (err) return next(err);
//         bcrypt.hash(user.password, salt, (err, hash) => {
//             if (err) return next(err);
//             user.password = hash;
//             next();
//         });
//     });
// });

// 해당 메소드 사용 시 기존과 비교 실시
UserSchema.methods.compare = function (password) {
    let user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model("User", UserSchema);
