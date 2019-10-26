require('dotenv').config();
const config = require('./config');
const { sendMail } = require('./mail-sender');

const modules = config['use-modules'].reduce((modules, m) => {
  modules[m] = require(`./modules/${m}/index`);
  return modules;
}, {});

const checkUpdate = () => {
  Object.keys(modules).forEach(name => {
    const m = modules[name];
    name = config['module-name'][name] || name;

    m.fetchData()
      .then(m.buildMailContent)
      .then(mailContent => {
        if (mailContent.length > 0) 
        sendMail(config['mailing-list'], `${name} 에서 새로운 소식`, mailContent);
      });
  });
}

const prepareAll = Promise.all(Object.values(modules).map(m => m.prepare()));

prepareAll.then(() => {
  checkUpdate();
  setInterval(checkUpdate, 10 * 60 * 1000);
});
