const MongoClient = require('mongodb').MongoClient;
const request = require('request');
const util = require('util');
require('dotenv').config();
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true
});

const options = {
  url: process.env.REST_NOTICE,
  headers: {
    'User-Agent': 'node.js',
    Accept: '*/*',
    Host: 'cs.skku.edu'
  }
};

async function getLastId() {
  const connect = util.promisify(client.connect.bind(client));
  return connect()
    .then(err => {
      const cursor = client
        .db('skku')
        .collection('recruit')
        .find()
        .limit(1);
      const toArray = util.promisify(cursor.toArray.bind(cursor));
      return toArray();
    })
    .then(docs => {
      return docs[0]['_id'];
    });
}

getLastId().then(id => {
  console.log(id);
});

request(options, (err, res, body) => {
  if (err) {
    console.log('err');
  }
  data = JSON.parse(body).aaData;
  data.forEach(element => {
    element['_id'] = element.id;
    delete element.id;
  });

  client.connect(err => {
    const collection = client.db('skku').collection('recruit');
    collection.insertMany(data).then(result => {
      console.log(result);
    });
    console.log(err);
    // perform actions on the collection object
    client.close();
  });
});

/* client.connect((err) => {
  console.log(client.db('skku').collection('recruit').find().limit(1).toArray((err, docs) => {
    console.log(docs);
  }));
}) */
/* 
let data;

request(options, (err, res, body) => {
  if (err) {
    console.log('err');
  }
  data = JSON.parse(body).aaData;
  data.forEach(element => {
    element['_id'] = element.id;
    delete element.id;
  });

  client.connect(err => {
    const collection = client.db('skku').collection('recruit');
    collection.insertMany(data).then(result => {
      console.log(result);
    });
    console.log(err);
    // perform actions on the collection object
    client.close();
  });
}); */

/*
curl 'https://cs.skku.edu/rest/board/list/notice'\ -
    XGET\ -
    H 'Cookie: connect.sid=s%3AdZyoGveCmZwS9_F_aLE4AAJPOkmkbl1I.5apvdsQUyUHZ2IXRIUgTar8csjtkB6LLk8y7aVYrTqY; _ga=GA1.2.836153827.1552826266; loginMemberId=ahnv3'\ -
    H 'Accept-Language: ko-kr'\ -
    H 'Host: cs.skku.edu'\ -
    H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15'\ -
    H 'Referer: https://cs.skku.edu/news/notice/list'\ -
    H 'Accept-Encoding: br, gzip, deflate'\ -
    H 'Connection: keep-alive'\ -
    H 'X-Requested-With: XMLHttpRequest'

    */
