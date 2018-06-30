# hecheng
一款简易的、用于微信文章合成的浏览器扩展。

## 安装
```bash
> git clone https://github.com/gaoshu883/hecheng.git
> cd your-path/hecheng
> npm install gulp-cli -g
> npm install bower -g
> npm install
> bower install
> gulp build
```
打开浏览器的扩展管理-高级管理-开发者模式，加载已解压的扩展程序，选择`your-path/hecheng/dist`。

## 使用和功能
+ 该扩展在微信公众号-素材管理页面使用
+ 选择N篇文章（1≤N≤8）
+ 点击扩展图标
+ 在popup窗口对已选文章进行拖拽排序、删除
+ 点击合成，当前页面刷新，新的图文素材生成
+ 素材合成到其他帐号：同一浏览器打开M个公众号页面，实现跨帐号素材添加、合成

## 开发
```bash
> gulp watch
```