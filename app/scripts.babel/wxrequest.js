/*
 * Name: wxrequest.js
 * Created Date:  2018-06-30 1:41:39 pm
 * Author: xiaolu
 * Last Modified: 2018-07-25 10:51:00 am
 * Modified By: xiaolu
 */
import { getUrlParam } from './base'
export default {
  /**
   * 获取指定条数的素材文章
   * @param {int} count
   */
  getArticles: (count) => {
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
  },
  /**
   * 根据图文素材id得到详细信息
   * @param {int} appmsgid
   */
  getNewsById: (appmsgid) => {
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
  },
  /**
   * 保存素材
   * @param {Object} params
   * @param {Boolean} isAgain
   */
  saveArticles: (params, isAgain) => {
    let formData = Object.assign({
      token: getUrlParam('token'),
      lang: 'zh_CN',
      f: 'json',
      ajax: 1,
      random: Math.random(),
      AppMsgId: ''
    }, params)
    // #fix bug 再次保存
    isAgain && Object.assign(formData, { confirm: 1, confirm_treatment: 40 })
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
}