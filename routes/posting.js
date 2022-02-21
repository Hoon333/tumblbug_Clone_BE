const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const articles = require('../schemas/articleSchema');
const authMiddlleware = require('../middlewares/auth-middleware');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// hi

// 랜덤 게시글 8개 발송
router.get('/articles/mainProjects', async (req, res) => {
  const postings = await articles.aggregate([{ $sample: { size: 8 } }]);
  res.json({ result: true, mainProjects: postings });
});

// 인기 프로젝트 조회
router.get('/articles/popularProjects', async (req, res) => {
  const postings = await articles.find({}, { coontents: 0 });
  res.json({ result: true, popularProjects: postings });
});

// 상세(카테고리)
router.get('/articles/category', async (req, res) => {
  const { category } = req.query;
  const result = await articles.find({ category: category });
  const count = await result.length;
  const postings = await articles.find(
    { category: category },
    { coontents: 0 }
  );
  res.json({
    result: true,
    count: count,
    categorizedProjects: postings,
  });
});

// nickname & 후원한 프로젝트 조회 (마이페이지) => 구현 덜 됨
router.get('/articles/myDonatedProjects', async (req, res) => {
  const { user } = res.locals;
  const postings = await articles.find({}, { coontents: 0 });
  res.json({
    result: true,
    nickname: user.nickname,
    donatedProjects: postings,
  });
});

// 검색 ( 카테고리, title 기준 )
router.get('/articles', async (req, res) => {
  const keyword = req.query.search.replace(/ /gi, '');
  console.log(keyword);
  const postings = await articles.find(
    {
      $or: [{ category: new RegExp(keyword) }, { title: new RegExp(keyword) }],
    },
    { coontents: 0 }
  );
  res.json({
    result: true,
    matchedProjects: postings,
  });
});

// 상세 게시글 조회 (게시클 클릭)
router.get('/article/:articleId', async (req, res) => {
  const postings = await articles.findById(req.params.articleId);
  const donatorNum = await postings.donator.length;
  res.json({
    result: true,
    donatorNum: donatorNum,
    detailedProjects: postings,
  });
});

// 후원하기
try {
  router.patch(
    '/article/:articleId/donation',
    authMiddlleware,
    async (req, res) => {
      const { articleId } = req.params;
      const { user } = res.locals;
      console.log(user);

      await articles
        .findByIdAndUpdate(articleId, {
          $push: { donator: user.nickname },
          $inc: { totalAmount: +50000 },
        })
        .exec();
      res.json({
        result: true,
      });
    }
  );
} catch (error) {
  res.status(400).send({ result: false });
}

// 후원 취소
try {
  router.patch(
    '/article/:articleId/donationCancel',
    authMiddlleware,
    async (req, res) => {
      const { articleId } = req.params;
      const { user } = res.locals;

      const name = await articles.findById({
        _id: articleId,
      });

      const SW = name.donator.filter((e) => e !== user.nickname);

      await articles.findByIdAndUpdate(articleId, {
        $inc: { totalAmount: -50000 },
        donator: SW,
      });
      res.json({ result: true });
    }
  );
} catch (error) {
  res.status(400).send({ result: false });
}

module.exports = router;
