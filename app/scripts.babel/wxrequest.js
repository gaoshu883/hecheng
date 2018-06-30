/*
 * Name: wxrequest.js
 * File: d:\WORK\日常supply\hecheng\app\scripts.babel\wxrequest.js
 * Project: d:\WORK\日常supply\hecheng
 * Created Date:  2018-06-30 1:41:39 pm
 * Author: xiaolu
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * Copyright (c) 2018 WenXu Tech.
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
   */
  saveArticles: (params) => {
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
}