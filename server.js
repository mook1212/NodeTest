const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))

app.use('/view', express.static(__dirname + '/view'))
app.use(express.json());


const crypto = require('crypto');


// 세션 로그인
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드아무거나써도가능', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());



const { ObjectId } = require('mongodb')
const MongoClient = require('mongodb').MongoClient;

var db;

MongoClient.connect('mongodb+srv://skdo223:apsode1@cluster0.udjmfja.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (에러, client) {
    if (에러) return console.log(에러)
    db = client.db('project');

    app.listen(8080, function () {
        console.log('listening on 8080')
    });
});

// 기본 페이지
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view/main.html')
})

// write 페이지 이동
app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/view/write.html')
})


// 회원가입
app.post('/sign', (req, res) => {
    // 받아온 pw 데이터
    let password = req.body.pw;

    // Generate a salt
    crypto.randomBytes(16, function (err, salt) {
        if (err) throw err;

        // Hash the password using the salt
        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', function (err, key) {
            if (err) throw err;

            // Store the salt, iterations, key length, and digest algorithm
            // in the user's database record
            let hash = {
                salt: salt,
                iterations: 100000,
                keylen: 64,
                digest: 'sha512',
                hash: key.toString('hex')
            };

            // Save the user's ID and hashed password to the database
            db.collection('login').insertOne({ id: req.body.id, pw: hash }, () => {
                res.send(console.log('로그인성공'))
            });
        });
    });
});



// 로그인 페이지 이동
app.get('/login', (rqe, res) => {
    res.sendFile(__dirname + '/view/login.html')
})



// 로그인
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), (request, response) => {
    response.redirect('/')
})

// 로그인 실패
app.get('/fail', (req, res) => {
    res.send('로그인실패')
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (inputId, inputPassword, done) {
    // 입력한 아이디 비밀번호
    // console.log(inputId, inputPassword);
    db.collection('login').findOne({ id: inputId }, function (error, result) {
        // console.log(result);
        if (result === null) {
            return done(null, false, { message: '존재하지않는 아이디' })
        } else {
            const hash = result.pw;

            const salt = Buffer.from(hash.salt.buffer);

            crypto.pbkdf2(inputPassword, salt, hash.iterations, hash.keylen, hash.digest, function (err, key) {
                if (key.toString('hex') === hash.hash) {
                    return done(null, result);
                } else {
                    return done(null, false, { message: '비번틀림' });
                }
            });
        }

    });

}));
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

passport.deserializeUser(function (id, done) {
    done(null, {})
});




// 마이페이지
app.get('/mypage', Login, (req, res) => {
    res.sendFile(__dirname + '/view/mypage.html')
})
// 로그인 했는지 확인 함수
function Login(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.send('로그인 안함')
    }
}




// 게시글 작성
app.post('/writing', (req, res) => {

    db.collection('counter').findOne({ name: '총게시물' }, function (에러, 결과) {
        let count = 결과.totalpost // DB의 총 게시물갯수 가져오기

        db.collection('post').insertOne({ _id: count + 1, date: req.body.date, title: req.body.title, content: req.body.content, name: req.body.name }, function (에러, 결과) {
            console.log('일정 저장완료');

            db.collection('counter').updateOne({ name: '총게시물' }, { $inc: { totalpost: 1 } }, (에러, 결과) => {
                res.status(200).send({ message: '성공했음' });
            })
        })

    })
})


// 게시글 리스트 보여주기
app.get('/post-list', (req, res) => {
    db.collection('post').find().sort({ _id: -1 }).toArray((에러, 결과) => {
        // res.send()
        res.send(결과)
    })
})





// // 채팅 개설
// app.post('/chat-produce', (req, res) => {

//     // 누른 게시물 글쓴이 _id값 찾기
//     db.collection('login').findOne({ id: req.body.name }, (에러, 결과) => {

//         let date = new Date()

//         db.collection('chatroom').insertOne({ member: [결과._id, ObjectId(req.body.me)], date: date, title: 'test' }, (err) => {
//             res.status(200).send({ message: '성공했음' });

//         })

//     })
// })

// app.get('/chat',(req,res)=>{

//     db.collection('login').findOne({ id: 'me'}, (에러, 결과) => {
//         console.log(결과._id);
//         db.collection('chatroom').find({member : 결과._id}).toArray()
//         .then((결과)=>{
//             res.sendFile(__dirname + '/view/chat.html')
//             console.log(결과);
//         })
//     })

// })