import Wxrequest from './wxrequest'
// 缓存全部的文章列表
var articles = [];

/**
 * 查找文章
 * @param {String} appid
 * @param {String} idx  文章位置 （从1开始）
 */
function searchArticle (appid, idx) {
  console.log(appid, idx);
  var findYou = articles.find(function (article) {
    return article.appmsgid == appid && article.itemidx == idx
  });
  return findYou;
}

/**
 * 数组转为微信文章参数
 * @param {array} arr
 */
function _convertToMpParam (arr) {
  var obj = {}
  arr.forEach(function (item, index) {
    var it = {};
    for (var i in item) {
      it[i + index] = item[i];
    }
    Object.assign(obj, it)
  })
  Object.assign(obj, {
    count: arr.length
  })
  return obj
}
/**
 * 获取文章详情信息整理发送
 */
function prepareArticles (articles, cb) {
  var promiseAll = articles.map(function (item, index) {
    // 只需要appid和idx
    return new Promise(function (resolve) {
      Wxrequest.getNewsById(item.appmsgid).done(function (res) {
        resolve({
          res: res,
          idx: item.itemidx,
          realIndex: index
        })
      })
    })
  });
  Promise.all(promiseAll).then(function (data) {
    console.log(data, 'promise.all结果')
    var scs = [];
    data.forEach(function (item) {
      var idx = item.idx;
      var res = item.res;
      if (res.base_resp.ret == 0) {
        var appmsgInfo = JSON.parse(res.app_msg_info);
        scs.push(appmsgInfo.item[0].multi_item[idx - 1]);
      }
    });
    console.log(scs, '素材数据')
    scs.forEach(item => {
      _handleShareArticle(_formatWxData(item));
    });
    Wxrequest.saveArticles(_convertToMpParam(scs)).done(function (res) {
      if (res.base_resp && res.base_resp.ret == 0) {
        window.location.reload();
        cb && cb()
      }
    })
  })
}

/**
 * 格式化微信素材上传数据
 *
 * @param {Object} item
 * @returns
 * title
 * author
 * digest
 * auto_gen_digest
 * content
 * need_open_comment
 * only_fans_can_comment
 * cdn_url
 * cdn_url_back
 * show_cover_pic
 * cpyright_type
 * !ori_white_list  白名单列表
 * free_content
 *
 *! fileid 字段名称
 *! sourceurl 字段名称
 */
function _formatWxData (item) {
  item['fileid'] = item.file_id
  item['sourceurl'] = item.source_url
  item['ori_white_list'] = item.ori_white_list.replace(/&quot;/g, '"')
  return item;
}
/**
 * 针对分享数据进行格式化
 * @param {Object} item
 */
function _handleShareArticle (item) {
  let type = item.share_page_type * 1 || -1;

  switch (type) {
    case 5:
      item.share_video_id = item.share_videoinfo[0].video_id
      break;
    case 7:
      item.share_voice_id = item.share_voiceinfo[0].file_id
      break;
    case 8:
      item.share_imageinfo = JSON.stringify({
        list: item.share_imageinfo
      })
      break;
    default:
      break;
  }
}
/**
 * 安装合成按钮
 */
function installButton () {
  $('.weui-desktop-card__bd').each(function (idx, it) {
    var parent = $(it).parents('.weui-desktop-appmsg');
    var appid = parent.attr('data-appid');
    var children = $(it).children();
    children.each(function (index, item) {
      $(item).find('.weui-desktop-mask').append('<span title="添加到合成器" data-adids="' + appid + '_' + (index + 1) + '" class="xiaolu__add"></span>')
    })
  });

  $('.xiaolu__add').click(function (e) {
    var adids = $(e.target).attr('data-adids').split('_');
    var appid = adids[0];
    var idx = adids[1];
    var target = searchArticle(appid, idx);
    chrome.runtime.sendMessage({
      action: 'add-one',
      appmsg: target
    }, function (res) {
      console.log(res, '来自后台的消息')
      $(e.target).addClass('success');
      setTimeout(() => {
        $(e.target).removeClass('success');
      }, 2000);
    });
  })
}
/**
 * 开始工作
 */
installButton();
Wxrequest.getArticles(999).done(function (res) {
  if (res.base_resp.ret == 0) {
    articles = res.app_msg_list
  }
});
/**
 * 通讯
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case 'composite':
      var articles = request.articles;
      prepareArticles(articles, function () {
        sendResponse({
          action: 'finish-add'
        });
      })
      break;
  }
  return true;
});