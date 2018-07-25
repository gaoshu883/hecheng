'use strict';
import { getData, saveData } from './base.js';
// 缓存合成器文章列表
let articles = [];

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'mp.weixin.qq.com/cgi-bin/appmsg' },
          })
        ],
        // And shows the extension's page action.
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
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
            sendResponse({ ret: 0, msg: 'success' });
          })
            .catch(() => {
              sendResponse({ ret: '-1', msg: 'fail' });
            })
        }
      });
      break;
  }
  return true;
});
