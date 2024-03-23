const express = require('express');
const router = express.Router();
const dbConfig = require('../dbconfig');
const mysql = require('mysql');

// DB 연결 풀 생성
const pool = mysql.createPool(dbConfig);

// 세션 설정
router.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

router.get('/', function(req, res, next) {
  let message = req.session.message;
  req.session.message = null;
  res.render('index', { message });
});

router.post('/', function(req, res, next) {
  const { username, password } = req.body;

  pool.getConnection(function(err, connection) {
    if (err) {
      console.error('DB connection error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    connection.query('SELECT * FROM account WHERE username = ?', [username], function(err, results) {
      if (err) {
        console.error('DB query error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }

      if (results.length === 0) {
        const hashedPassword = password; // Perform password hashing here
        connection.query('INSERT INTO account (username, salt, verifier) VALUES (?, \'\', ?)', [username, hashedPassword], function(err, results) {
          if (err) {
            console.error('DB insert error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
            return;
          }
          req.session.message = '새 계정이 성공적으로 생성되었습니다!';
          res.redirect('/');
        });
      } else {
        req.session.message = '이미 존재하는 사용자 이름입니다. 다른 이름을 선택해 주세요.';
        res.redirect('/');
      }

      connection.release();
    });
  });
});

module.exports = router;
