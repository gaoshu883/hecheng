'use strict';
// 缓存全部的文章列表
var articles = [];
/**
 * 解析当前网址参数
 */
function getUrlParam(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
/**
 * 获取指定条数的素材文章
 */
function getArticles(count) {
    return $.ajax({
        url: '/cgi-bin/appmsg',
        data: {
            lang: 'zh_CN',
            token: getUrlParam('token'),
            f: 'json',
            ajax: 1,
            random: Math.random(),
            action: 'list_ex',
            begin: 0,
            count: count,
            query: '',
            link: 1,
            scene: 1
        }
    })
}
/**
 * 查找文章
 * @param {String} appid
 * @param {String} idx  文章位置 （从1开始）
 */
function searchArticle(appid, idx) {
    console.log(appid, idx);
    var findYou = articles.find(function (article) {
        return article.appmsgid == appid && article.itemidx == idx
    });
    return findYou;
}
/**
 * 根据图文素材id得到详细信息
 * @param {int} appmsgid
 */
function getNewsById(appmsgid) {
    return $.ajax({
        url: '/cgi-bin/appmsg',
        data: {
            t: 'media/appmsg_edit',
            action: 'edit',
            lang: 'zh_CN',
            token: getUrlParam('token'),
            type: 10,
            appmsgid: appmsgid,
            isMul: 1,
            f: 'json'
        }
    })
}
/**
 * 保存素材
 * @param {Object} params
 */
function saveArticles(params) {
    var formData = Object.assign({
        token: getUrlParam('token'),
        lang: 'zh_CN',
        f: 'json',
        ajax: 1,
        random: Math.random(),
        AppMsgId: ''
    }, params)
    return $.post({
        url: '/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=10',
        data: formData,
        dataType: 'json',
        rtDesc: {
            ret_R: 'string',
            appMsgId_R: 'number'
        }
    })
}

/**
 * 数组转为微信文章参数
 * @param {array} arr
 */
function _convertToMpParam(arr) {
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
function prepareArticles(articles, cb) {
    var promiseAll = articles.map(function (item, index) {
        // 只需要appid和idx
        return new Promise(function (resolve) {
            getNewsById(item.appmsgid).done(function (res) {
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
        data.forEach(function (item, index) {
            var idx = item.idx;
            var res = item.res;
            if (res.base_resp.ret == 0) {
                var appmsgInfo = JSON.parse(res.app_msg_info);
                scs.push(appmsgInfo.item[0].multi_item[idx - 1]);
            }
        });
        console.log(scs, '素材数据')
        saveArticles(_convertToMpParam(scs)).done(function (res) {
            if (res.base_resp && res.base_resp.ret == 0) {
                window.location.reload();
                cb && cb()
            }
        })
    })
}

/**
 * 安装合成按钮
 */
function installButton() {
    var children = $('.weui-desktop-card__bd').each(function (idx, it) {
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
        chrome.runtime.sendMessage({ action: 'add-one', appmsg: target }, function (res) {
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
getArticles(999).done(function (res) {
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
                chrome.runtime.sendMessage({ action: 'finish-add' });
            })
            break;
    }
});