'use strict';
import { getData, saveData } from './base.js';
// 缓存合成器文章列表
var articles = [];

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('收到content-script的消息', request);
  let { action } = request;
  switch (action) {
    case 'add-one':
      getData({ articles: [] }).then((items) => {
        articles = items.articles;
        if (articles.length >= 8) {
          alert('最多选择八篇文章哦~');
        } else {
          articles.push(request.appmsg);
          saveData({ articles }).then(() => {
            sendResponse({msg: 'success'});
          })
        }
      });
      return true;
      break;
    case 'finish-add':
      saveData({ articles: [] }).then(() => {
        console.log('清空数据');
      });
      break;
  }
});
