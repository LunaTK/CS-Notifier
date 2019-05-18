const MongoClient = require('mongodb').MongoClient;
const request = require('request');
const util = require('util');
const mail = require('./mail');
const endpoint = 'https://cs.skku.edu/rest/board/list/';
require('dotenv').config();
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true
});

async function getLastId(type) {
  const cursor = client
    .db('skku')
    .collection(type)
    .find()
    .sort({
      _id: -1
    })
    .limit(1);

  const toArray = util.promisify(cursor.toArray.bind(cursor));
  return toArray()
    .then(docs => {
      return docs[0]['_id'];
    });
}

function fetchNewNotices(params) {
  const [type, typeKor, recentId, res] = params
  let data = JSON.parse(res.body).aaData;
  data.forEach(element => {
    element['_id'] = element.id;
    delete element.id;
  });
  data = data.filter(notice => {
    return notice._id > recentId;
  });
  console.log('Fetching data ID after : ' + recentId);
  console.log(`${data.length} fetched`);

  if (data.length > 0) {
    const collection = client.db('skku').collection(type);
    return collection.insertMany(data).then(result => {
      if (result.result.ok == 1 && result.result.n > 0) {
        const content = mail.generateContent(type, typeKor, data);
        mail.sendMail(`[SW-SKKU] ${data.length} 개의 새로운 ${typeKor}`, content);
      }
    });
  }
}

function requestAsyncWithType(type) {
  const options = {
    url: endpoint + type,
    headers: {
      'User-Agent': 'node.js',
      Accept: '*/*',
      Host: 'cs.skku.edu'
    }
  };
  return new Promise((resolve, reject) => {
    request.get(options, (err, res, body) => {
      resolve(res);
    });
  })
}

function checkNews() {
  Promise.all(['notice', '새 공지사항', getLastId('notice'), requestAsyncWithType('notice')]).then(fetchNewNotices);
  Promise.all(['recruit', '새 취업/인턴십', getLastId('recruit'), requestAsyncWithType('recruit')]).then(fetchNewNotices);
}


client.connect(err => {
  console.log('Service Started')
  checkNews();
  setInterval(checkNews, 30 * 60 * 1000);
  // checkNews()
})
