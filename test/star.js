const { doesNotMatch } = require('assert');
const assert = require('assert');
const request = require('supertest');
//const should = require('chai').should(); 
const expect = require('chai').expect;

//const host = 'http://47.108.167.42:10080/memory';
const host = 'http://127.0.0.1:10080/memory';
const req = request(host);
const page = '?page=0&size=20';

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

let hallId;

describe('funeral hall tests', function() {
  const path = '/funeralHalls';
  it("should get hall list", function() {
    req.get(path + page).expect(200, function(err) {
      console.log("error is", err);
    });
  });

  it("should create hall", function(done) {
    const test = `{
      "name":"屈原",
      "birthday":"0190-02-09T18:00:00Z",
      "passDate":"0230-07-08T00:00:00Z",
      "gender":"MALE",
      "lifeDescription":"屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人屈原是一个伟大的任务，他是一个可歌可泣的人",
      "picBucket":"funerals",
      "picName":"2ff85fb3db534c0ab5ddb27922ee0431-002.jpeg",
      "hengpi":"千古流芳",
      "shanglian":"海内存知己",
      "xialian":"云间涉德音",
      "memoMeetingTime": "2020-12-30T18:00:00Z",
      "memoMeetingAddress": "四川省成都市高新区666号",
      "announcement": "阿雷西博射电望远镜因抢救无效，于北京时间公元2020年12月1日晚离世，享年57岁。阿雷西博望远镜生于1963年，一生任劳任怨，居功至伟，成就非凡，奇功盖世。不幸于2020年11月6日突发馈源舱主钢缆断裂而陷入昏迷，经工程人员紧急会诊后仍无良药医治。12月1日馈源舱坠落主反射面，阿雷西博望远镜走完了其光辉灿烂的一生。阿雷西博同志永垂不朽！"
    }`
    const data = JSON.parse(test);
    req.post(path)
       .send(data)
       .set('Content-Type', 'application/json')
       .expect('Content-Type', /json/)
       .expect(200)
       .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.data).exist
        hallId = res.body.data;
        done();
       });
  });

  it('should get hall details', function(done) {
    req.get(path + '/' + hallId)
       .send()
       .expect(200)
       .end((err, res) => {
         if(err) done(err);
         expect(res.body.data.idStr).equal(hallId);
         done();
       });
  });

  it('should query halls', function(done){
    req.get(path + '/' + 'query'  + page + '&text=')
       .send()
       .expect(200)
       .end(function(err, res) {
         if (err) done(err);
         expect(res.body.data.items).be.a('array')
         expect(res.body.data.items).have.lengthOf.above(1)
         done()
       });
  });

  it('should get all halls', function(done){
    req.get(path + page)
       .send()
       .expect(200)
       .end(function(err, res){
         if(err) done(err);
         expect(res.body.data.items).be.a('array')
         expect(res.body.data.items).have.lengthOf.above(1)
         done();
       });
  });

  it('should give gift to hall', done => {
    const bodyString = `{"type":"FLOWER","count":10, "message": "很遗憾没有见上最后一面"}`;
    const reqBody = JSON.parse(bodyString);
    req.post(path + '/' + hallId + "/gifts")
       .set('Content-Type', 'application/json')
       .send(reqBody)
       .expect(200)
       .end((err, res) => {
         if(err) done(err);
         expect(res.body.data).be.a('number')
         done();
       });
  });

  it('should get hall gifts list', function(done){
    req.get(path + '/' + hallId + '/gifts?page=0&size=10')
       .set('Content-Type', 'application/json')
       .send()
       .expect(200)
       .end(function(err, res) {
         if(err) done(err);
         expect(res.body.data.items).lengthOf.that.least(1)
         done();
       })
  });

  it('should get hall events', function(done){
    req.get(path + '/' + hallId + '/events?page=0&size=10')
       .send()
       .expect(200)
       .end(function(err, res){
         if(err) done(err);
         expect(res.body.data.items).lengthOf.at.least(1)
         done()
       });
  });

  it('should create comments for funeral', function(done){
    let reqBody = JSON.parse(`{
      "entityId": "538160437179715584",
      "entityType": "FUNERAL_HALL",
      "content": "屈原是一个伟大的人，我对他的事迹铭记于心，非常仰慕。希望能够向他学习。"
    }`);
    reqBody.entityId = hallId;
    req.post('/comments')
       .set('Content-Type', 'application/json')
       .send(reqBody)
       .expect(200)
       .end(function(err, res){
         if(err) done(err);
         expect(res.body.data).be.a('number')
         done();
       });
  });

  it('should get funeral comments', function(done){
    req.get('/comments?page=0&size=10&entityId=' + hallId + '&entityType=FUNERAL_HALL')
       .send()
       .expect(200)
       .end(function(err, res){
         if(err) done(err);
         expect(res.body.data.items).lengthOf.at.least(1);
         done();
       });
  });

  it('should create user activity', function(done){
    let reqBody = JSON.parse(`
    {
      "activityType": "SHANGXIANG",
      "entityId": 538859239473680384,
      "entityType": "FUNERAL_HALL" 
    }
    `);
    reqBody.entityId = hallId;
    req.post('/activities')
       .set('Content-Type', 'application/json')
       .send(reqBody)
       .expect(200)
       .end(function(err, res){
         if(err) done(err);
         expect(res.body.data).be.a('number')
         done();
       });
  });
});

describe('gift tests', function(){
  it('should get default gift list', function(done){
    req.get('/gifts?page=0&size=10')
       .send()
       .expect(200)
       .end(function(err, res) {
         if(err) done(err);
         expect(res.body.data.items).lengthOf.at.least(1);
         done();
       })
  })
});

describe('user relateds tests', function() {
  it('should get user quota for one funeral', function(done){
    req.get('/user/quota?hallId=' + hallId)
       .send()
       .expect(200)
       .end(function(err, res){
         if(err) done(err);
         expect(res.body.data.freeGiftsQuota).equal(1);
         expect(res.body.data.giftsCount).be.at.least(0);
         done();
       });
  });

  it('should get user halls', function(done){
    req.get('/user/funeralHalls')
       .send()
       .expect(200)
       .end(function(err, res){
         if(err) done(err);
         expect(res.body.data.items).lengthOf.at.least(1);
         done();
       });
  });

  it('should get user activities', function(done){
    req.get('/activities/user?page=0&size=20')
       .send()
       .expect(200)
       .end(function(err, res){
        if(err) done(err);
        expect(res.body.data.items).lengthOf.at.least(1);
        done();
       });
  });
});