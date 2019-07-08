let local = {};

async function initResource(){
  const { localLanguage } = require('../utils/languageUtils');
  local = require(`./languages/${localLanguage().file}.js`);
}

initResource();

function i18n(key, ...args){

  let arr = args;
  if(!Array.isArray(args)){
    arr = [args];
  }
  const pathArr = key.split('.');
  let value;
  pathArr.forEach(path=>{
    if(!value){
      value = local[path];
    }else{
      value = value[path];
    }
  });

  if(!value){
    console.log(`i18n error: ${key} not exist`);
    return '';
  }

  return value.replace(/{(\d+)}/g, (match, number)=>{
    const v = arr[number];
    if(v !== undefined){
      return v;
    }
    return match;
  });

}

module.exports = {
  initResource,
  i18n,
};
