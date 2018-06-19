'use strict';
import '../styles/reset.css';
import { getData, saveData, sendMessage } from './base.js';
import draggable from 'vuedraggable';
import spin from './spin';
import Vue from 'vue';
new Vue({
  el: '#app',
  data() {
    return {
      articles: [],
      ifDelete: false,
      pos: {
        top: 0,
        left: 0
      },
      current: null,
      loading: false
    }
  },
  components: {
    draggable,
    spin
  },
  methods: {
    addToComposite() {
      if (this.articles.length) {
        this.loading = true;
        sendMessage({ action: 'composite', articles: this.articles }, () => {
          this.loading = false;
          this.articles = []
          saveData({ articles: [] }).then(() => {
            console.log('清空数据');
          });
        })
      } else {
        alert('请添加文章')
      }
    },
    showDelete(e, item) {
      e.preventDefault();
      this.ifDelete = true;
      this.pos.top = `${e.clientY}px`;
      this.pos.left = `${e.clientX}px`;
      this.current = item
      console.log(item)
    },
    cancelMenu() {
      this.ifDelete = false
    },
    // 删除文章
    delArticle() {
      let index = this.articles.findIndex((item) => {
        return item.appmsgid === this.current.appmsgid && item.itemidx === this.current.itemidx
      })
      this.articles.splice(index, 1)
      saveData({ articles: this.articles })
    }
  },
  created() {
    getData({ articles: [] }).then((items) => {
      this.articles = items.articles;
    });
  }
});

//格式化日期函数new Date().Format("yyyy-MM-dd")
Date.prototype.Format = function (fmt) {
  //author: meizz
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  return fmt
};
