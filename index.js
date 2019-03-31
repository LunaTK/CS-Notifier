const MongoClient = require('mongodb').MongoClient;
const request = require('request');
const util = require('util');
const mail = require('./mail');
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
        mail.sendMail(`[SKKU] ${data.length} 개의 새로운 ${typeKor}`, `<h1>${typeKor}</h1>` + data.map(notice => {
          return `[${notice._id}] (${notice.category}) ${notice.title}\t\t${notice.time}`
        }).join('<br/><br/>>'));
      }
    });
  }
}

const options_notice = {
  url: process.env.REST_NOTICE,
  headers: {
    'User-Agent': 'node.js',
    Accept: '*/*',
    Host: 'cs.skku.edu'
  }
};
const options_recruit = {
  url: process.env.REST_RECRUIT,
  headers: {
    'User-Agent': 'node.js',
    Accept: '*/*',
    Host: 'cs.skku.edu'
  }
};

function checkNews() {
  const requestAsync1 = util.promisify(request);
  const requestAsync2 = util.promisify(request);
  Promise.all(['notice', '공지사항', getLastId('notice'), requestAsync1(options_notice)]).then(fetchNewNotices);
  Promise.all(['recruit', '취업 정보', getLastId('recruit'), requestAsync2(options_recruit)]).then(fetchNewNotices);
}


client.connect(err => {
  setInterval(checkNews, 30 * 60 * 1000);
})