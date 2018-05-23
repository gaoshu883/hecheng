'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let { urls } = request;
  let promiseAll = urls.map((item) => {
    let temp = item.split('?');
    return new Promise((resolve) => {
      $.ajax({
        url: `${temp[0]}?f=json&${temp[1]}`
      })
        .done((res) => {
          resolve(res)
        })
    })
  });
  Promise.all(promiseAll).then((data) => {
    let arr = data.map((item, index) => {
      return _newsToMpParam(item, index);
    });
    sendResponse({ formData: _convertToMpParam(arr)})
  });
  return true;
});

/**
 *
 * @param {Object} item
 * @param {int} index
 */
function _newsToMpParam(item, index) {
  let obj = {};
  obj[`title${index}`] = item.title;
  obj[`content${index}`] = item.content_noencode;
  obj[`digest${index}`] = item.desc;
  obj[`author${index}`] = item.author;
  obj[`cdn_url${index}`] = item.cdn_url;
  obj[`sourceurl${index}`] = item.source_url;
  obj[`music_id${index}`] = '';
  obj[`video_id${index}`] = '';
  obj[`vid_type${index}`] = '';
  obj[`shortvideofileid${index}`] = '';
  obj[`copyright_type${index}`] = '';
  obj[`free_content${index}`] = '';
  obj[`fee${index}`] = '';
  obj[`voteid${index}`] = '';
  obj[`voteismlt${index}`] = '';
  obj[`ad_id${index}`] = '';
  obj[`copyright_type${index}`] = 0;
  obj[`ori_white_list${index}`] = '';
  obj[`original_article_type${index}`] = '';
  return obj;
}

/**
 * 数组转为微信文章参数
 * @param {array} arr
 */
function _convertToMpParam(arr) {
  let obj = {}
  arr.forEach((item, index) => {
    Object.assign(obj, item)
  })
  Object.assign(obj, {
    count: arr.length
  })
  return obj
}