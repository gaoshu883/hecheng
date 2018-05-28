/**
 * 读取本地存储的数据
 * @param {Object} params
 */
export const getData = (params) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(params, (items) => {
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
    chrome.storage.sync.set(params, function () {
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