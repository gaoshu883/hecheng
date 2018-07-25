/**
 * 读取本地存储的数据
 * @param {Object} params
 */
export const getData = (params) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(params, (items) => {
      resolve(items);
    });
  });
}
/**
 * 存储数据
 * @param {Object} params
 */
export const saveData = (params) => {
  return new Promise((resolve) => {
    chrome.storage.local.set(params, function () {
      resolve();
    });
  })
}
/**
 * popup/background向content 发送消息
 * @param {*} message
 * @param {*} callback
 */
export const sendMessage = (message, callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      if (callback) callback(response);
    });
  });
}

/**
 * 解析当前网址参数
 * @param {string} name
 */
export const getUrlParam = (name) => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); //构造一个含有目标参数的正则表达式对象
  let r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; //返回参数值
}