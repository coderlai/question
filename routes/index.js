var express = require('express');
var router = express.Router();
var connection = require('../model/mysql');
var moment = require('moment');

//主页
router.get('/', function (req, res, next) {
    var sql = "SELECT * FROM question limit 10";
    var promise = new Promise(function (resolve, reject) {
        connection.query(sql, function (error, result) {
            if (error) throw error;
            console.log(result);
            resolve(result);

        });
    });

    promise.then(function (data) {
        var sql = "select * from question where reward>0 limit 10";
        connection.query(sql, function (error, result) {
            if (error) throw error;
            res.render('index', {newQuestion: data, rewardQuestion: result})
        });
    });
});
//登录页
router.get('/login', function (req, res, next) {
    res.render('login');
});
//问题列表页
router.get('/question', function (req, res, next) {
    res.render('question');
});
//提交问题页
router.get('/questioncreate', function (req, res, next) {
    res.render('questioncreate');
});
// 问题详情页
router.get('/questiondetail/:questionId', function (req, res, next) {
    var questionId = req.params.questionId;
    var promise = new Promise(function (resolve, reject) {
        var sql = "select * from question where id=" + questionId;
        connection.query(sql, function (error, result) {
            if (error) throw error;
            resolve(result[0]);
        });
    });

    promise.then(function (data) {
        var sql = "select * from answer where questionId=" + questionId + " limit 1";
        connection.query(sql, function (error, result) {
            if (error) throw error;
            res.render('questiondetail', {question: data, answer: result[0]});
        });
    });


});
// 注册页
router.get('/register', function (req, res, next) {
    res.render('register');
});
//话题详情页
router.get('/topic', function (req, res, next) {
    res.render('topic');
});
//话题列表页
router.get('/topics', function (req, res, next) {
    var sql = "select topicName,introduction,follows from topics order by follows desc";
    connection.query(sql, function (error, result) {
        if (error) throw error;
        res.render('topics', {topicList: result});
    });

});
//忘记密码页
router.get('/forget', function (req, res, next) {
    res.render('forgetPassword');
});
//问题保存接口
router.post("/question/store", function (req, res, next) {
    var body = req.body;
    if(req.session.userName){
        //判断该用户金币是否足够
        new Promise(function (resolve, reject) {
            var sql = "select coins from users where username=?";
            var sqlModel = [req.session.userName];
            connection.query(sql,sqlModel,function (error, result) {
                if(error) throw error;
                if(result[0].coins<body.reward){
                    reject(result[0].coins);
                }else{
                    resolve();
                }
            });
        })
        .then(function () {
            //将问题添加到数据库中
            //(info,reward,answer,follow,createTime,poster,subscriber,visits,comments)
            var sql = "INSERT INTO question(info,reward,createTime,poster,detail,tags) VALUES(?,?,?,?,?,?)";
            var timeStamp = new Date().getTime();
            var tags = JSON.stringify({tags:body.tags});
            var sqlModel = [body.info,body.reward,timeStamp,req.session.userName,body.detail,tags];
            connection.query(sql,sqlModel,function (error, result) {
                if(error) throw error;
                if(result.affectedRows){
                    res.json({isSuccess:true,message:"问题提交成功"});
                }else{
                    res.json({isSuccess:false,message:"问题提交失败"});
                }
            });
        })
        .catch(function (coins) {
            res.json({isSuccess:false,message:"金币不足,您当前剩余金币数为"+coins});
        })
    }else{
        res.json({isSuccess:false,message:'登录后才能提问'});
    }
});
//返回话题列表接口
router.get('/ajax/loadTags', function (req, res, next) {
    var word = req.query.word;
    var sql = "select topicName from topics";
    connection.query(sql, function (error, result) {
        if (error) throw error;
        console.log("tags",result);
        res.json({result:result});
    });

});


//添加关注接口
router.post('/ajax/addFollow', function (req, res) {
    if (!req.session.userName) {
        res.json({isSuccess: false, message: "97-你还未登录"});
        return;
    }
    var questionId = req.body.questionId;
    var promise = new Promise(function (resolve, reject) {
        var sql = "select myFollow from users where username='" + req.session.userName + "'";
        connection.query(sql, function (error, result) {
            if (error) throw error;
            // console.log(result[0]);
            var follow = null;
            if (result[0].myFollow) {
                follow = JSON.parse(result[0].myFollow);
                if (follow.follows.indexOf(questionId) > -1) {
                    reject({isSuccess: false, message: "109-已关注过该问题"});
                }
            } else {
                follow = {"follows": []};
            }
            follow.follows.push(questionId);
            var followStr = JSON.stringify(follow);
            resolve(followStr);
        });
    })
        .then(function (str) {
            var sql = "update users set myFollow='" + str + "' where username='" + req.session.userName + "'";
            connection.query(sql, function (error, result) {
                if (error) throw error;
                // console.log("affectedRows", result.affectedRows);
                if (result.affectedRows) {
                    return Promise.resolve();
                } else {
                    return Promise.reject();
                }
            });
        })
        .catch(function (ex) {
            return Promise.reject(ex);
        })
        .then(function () {
            var sql = "update question set follow=follow+1 where id=" + questionId;
            connection.query(sql, function (error, result) {
                if (error) throw error;
                if (result.affectedRows) {
                    console.log("update question follow", result);
                    res.json({isSuccess: true, message: "141-关注成功"});
                } else {
                    res.json({isSuccess: false, message: "143-关注失败"});
                }
            });
        })
        .catch(function (ex) {
            res.json(ex);
        });

});

module.exports = router;


