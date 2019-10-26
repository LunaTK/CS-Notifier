const request = require('request');
const util = require('util');
const endpoint = 'https://cs.skku.edu/rest/board/list/';
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const pug = require('pug');
const compiledFunction = pug.compileFile(__dirname + '/mail-content.pug');

const getLastId = async (type) => {
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

const fetchNewNotices = async (params) => {
  const [type, typeKor, recentId, res] = params
  let data = JSON.parse(res.body).aaData;
  data = data.filter(notice => {
    notice['_id'] = notice.id;
    delete notice.id;
    return notice._id > recentId;
  });

  console.log('Fetching data ID after : ' + recentId);
  console.log(`${data.length} fetched`);

  if (data.length > 0) {
    const collection = client.db('skku').collection(type);
    const result = await collection.insertMany(data);
    if (result.result.ok == 1 && result.result.n > 0) {
      return data;
    }
  }
  return null;
}

const requestAsyncWithType = (type) => {
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

const buildMailContent = (data) => { 
  let mailContent = '';
  for (let type in data) {
    if (!data[type]) continue;
    const content = compiledFunction({
      type,
      title: type,
      news: data[type]
    });
    mailContent += content + '<br/>';
  }
  return mailContent;
}

const fetchData = async () => {
  const newNotices = await Promise.all(['notice', '새 공지사항', getLastId('notice'), requestAsyncWithType('notice')]).then(fetchNewNotices);
  const newJobs = await Promise.all(['recruit', '새 취업/인턴십', getLastId('recruit'), requestAsyncWithType('recruit')]).then(fetchNewNotices);
  const data = {
    'notice': newNotices,
    'recruit': newJobs
  };
  return data;
}

const prepare = async () => {
  const connectClient = util.promisify(client.connect.bind(client));
  await connectClient();
}

module.exports = {
    buildMailContent,
    fetchData,
    prepare
}