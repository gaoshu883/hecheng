import Wxrequest from './wxrequest'
let reminderCodeList = [15801, 15802, 15803, 15804, 15805, 15806]
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
  delete item.update_time
  delete item.appmsgid
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
  return item;
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
    let appmsgid = $(e.target).attr('data-adids')
    var adids = appmsgid.split('_');
    var appid = adids[0];
    var idx = adids[1];
    Wxrequest.getNewsById(appid).done((res) => {
      if (res.base_resp.ret == 0) {
        let appmsgInfo = JSON.parse(res.app_msg_info)
        let update_time = appmsgInfo.item[0].update_time
        let target = appmsgInfo.item[0].multi_item[idx - 1]
        Object.assign(target, { update_time, appmsgid })
        console.log('当前用户选中的素材数据', target, appmsgInfo)
        chrome.runtime.sendMessage({
          action: 'add-one',
          appmsg: target
        }, function (res) {
          console.log(res, '来自后台的消息')
          if (res.ret === 0) {
            $(e.target).addClass('success');
            setTimeout(() => {
              $(e.target).removeClass('success');
            }, 2000);
          } else {
            alert('┗( T﹏T )┛出错啦，请再试一次')
          }
        });
      } else {
        alert('┗( T﹏T )┛出错啦，请再试一次')
      }
    })
      .catch(() => {
        alert('┗( T﹏T )┛出错啦，请再试一次')
      })
  })
}

/**
 * 素材合成
 * @param {Object} articles  文章数据
 * @param {Boolean} isAgain  是否再次保存
 * @param {Function} sendResponse  回调
 */
function compositeArticles(articles, isAgain, sendResponse) {
  Wxrequest.saveArticles(articles, isAgain).done(function (res) {
    if (res.ret == '0') {
      window.location.reload()
      sendResponse({
        action: 'success-finish-add'
      })
    } else if (reminderCodeList.includes(Number(res.ret))) {
      // 再次上传
      // #fix bug
      compositeArticles(articles, true, sendResponse)
    } else {
      sendResponse({
        action: 'fail-finish-add'
      })
    }
  })
}

/**
 * 开始工作
 */
installButton()
/**
 * 通讯
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case 'composite':
      var articles = request.articles
      articles = _convertToMpParam(articles.map(item => _handleShareArticle(_formatWxData(item))))
      compositeArticles(articles, false, sendResponse)
      break
  }
  return true
});