'use strict';
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
    arr.forEach(function(item, index) {
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
 * HTML创建
 */
function makeButton() {
    $(document.body).append('<div class="xiaolu__composite"><div class="xiaolu__btn weui-desktop-btn weui-desktop-btn_main weui-desktop-btn_primary">合成器</div><section class="xiaolu__list"></section></div>')
    $('.xiaolu__btn').click(function (e) {
        $('.xiaolu__list').toggleClass('xiaolu__toggle')
    });
    $(document).on('click', '.xiaolu__submit', function (e) {
        var appids = []
        $('.xiaolu__item:checked').each(function (idx, item) {
            appids.push(item.value)
        })
        if (!appids.length) {
            alert('请选择至少一篇文章')
        } else if (appids.length > 8) {
            alert('最多只能选择八篇文章哦')
        } else {
            var promiseAll = appids.map(function (item, index) {
                var adid = item.split('_');
                return new Promise(function (resolve) {
                    getNewsById(adid[0]).done(function(res) {
                        resolve({
                            res: res,
                            idx: adid[1]
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
                saveArticles(_convertToMpParam(scs)).done(function (res) {
                    if (res.base_resp && res.base_resp.ret == 0) {
                        window.location.reload();
                    }
                })
            })
        }
    })
    getArticles(12).done(function (res) {
        console.log(res, '前12条图文')
        getNewsById(res.app_msg_list[0].appmsgid).done(function (res) {
            console.log('获取微信图文素材详情', JSON.parse(res.app_msg_info))
        })
        if (res.base_resp.ret == 0) {
            var html = '';
            if (res.app_msg_list.length) {
                res.app_msg_list.forEach(function (item, index) {
                    html += '<p style="margin-bottom:10px"><input class="xiaolu__item" id="' + item.aid + '" type="checkbox" value="' + item.aid + '"><label style="cursor:pointer" for="' + item.aid + '">' + '<span style="font-size:0.75em">[' + new Date(item.update_time * 1000).toLocaleString() + ']</span> <span style="font-weight:bold;color:#008cee;">' + item.title + '</span></label></p>'
                });
                html += '<button class="xiaolu__submit weui-desktop-btn weui-desktop-btn_main weui-desktop-btn_primary">合成</button>'
            } else {
                html = '请创建素材~'
            }
            $('.xiaolu__list').append(html)
        }
    })
}

/**
 * 开始工作
 */
makeButton();