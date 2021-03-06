<!-- Webview -->
<template>
  <div class="viewer">
    <!-- 浏览器标题栏 -->
    <div class="header">
      <div class="back" v-if="canGoBack" @click="goBack">&lt;</div>
      <img v-if="loading" class="loading" src="@/assets/img/loading.gif" />
      <h1>{{title}}</h1>
      <div class="forward" v-if="canGoForward" @click="goForward">></div>
    </div>

    <!-- 浏览器内容 -->
    <webview
      ref="webview"
      nodeintegration
      class="webview"
      src="https://juejin.im/"
      @dom-ready="onDomReady"
      @console-message="onConsoleMessage"
      @ipc-message="onIpcMessage"
      @page-title-updated="onPageTitleUpdate"
      @did-navigate="onDidNavigate"
      @did-navigate-in-page="onDidNavigateInPage"
      @did-fail-load="onDidFailLoad"
      @did-start-loading="onDidStartLoading"
      @did-stop-loading="onDidStopLoading"
      @load-commit="onLoadCommit"
    ></webview>

    <img v-if="loadFail" class="img-404" src="@/assets/img/404.png" />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import URL from 'url'
import insertJs from './insert.jsraw'
import electron from 'electron'
import IPC from '@/../IPC.js'

export default {
  name: 'Viewer',
  data () {
    return {
      canGoBack: false,
      canGoForward: false,
      title: '',
      loading: false,
      loadFail: false // webview是否加载失败
    }
  },
  computed: {
    ...mapState(['webviewUrl', 'selecting'])
  },
  watch: {
    // DOM 选取状态
    selecting () {
      let insert = ''
      if (this.selecting) {
        insert = 'selectPlugin.startSelect()'
      } else {
        insert = 'selectPlugin.stopSelect()'
      }
      this.$refs.webview.executeJavaScript(insert)
    },

    webviewUrl ({ url, change }) {
      change && this.$refs.webview.loadURL(url)
    }
  },
  methods: {
    ...mapMutations(['setWebviewUrl']),

    // 初始化
    init () {
      electron.ipcRenderer.on(IPC.PRESS_CTRL_Q, (e) => { // 主进程监控到按键按下后发送至渲染进程，渲染进程再发送到 webview 内
        this.selecting && this.$refs.webview.executeJavaScript('selectPlugin.select()')
      })
    },

    // webview 返回的消息
    onIpcMessage (response) {
      const { channel, args } = response
      if (channel === 'selector') {
        const url = URL.parse(this.$refs.webview.getURL()).pathname // 针对react项目的history路由,使用它的pathName作为page的值
        const obj = {
          level: '1',
          page: url,
          selector: args[0] || ''
        }
        this.$emit('addEvent', obj)
      } else if (channel === 'ajaxListened' && args) {
        this.$emit('updateTreeData', args[0])
      }
    },

    // Webview 加载完成回调
    onDomReady () {
      this.$refs.webview.executeJavaScript(insertJs)
    },

    onDidStartLoading () {
      this.loading = true
    },

    onDidStopLoading () {
      this.loading = false
    },

    onDidNavigate ({ url }) {
      this.setWebviewUrl({ url, change: false })
      this.canGoBack = this.$refs.webview.canGoBack()
      this.canGoForward = this.$refs.webview.canGoForward()
    },

    onDidNavigateInPage ({ url }) {
      this.$refs.webview.executeJavaScript('selectPlugin.clearAjaxList()') // 跳页完成,清除上个页面的接口数据
      this.setWebviewUrl({ url, change: false })
      this.canGoBack = this.$refs.webview.canGoBack()
      this.canGoForward = this.$refs.webview.canGoForward()
    },

    // Webview 控制台收到消息回调
    onConsoleMessage ({ message }) {
      console.log(message)
    },

    // 页面标题改变事件
    onPageTitleUpdate () {
      this.title = this.$refs.webview.getTitle()
    },

    // 页面加载失败事件
    onDidFailLoad () {
      this.loadFail = true
      this.title = this.webviewUrl.url
    },

    onLoadCommit () {
      this.loadFail = false
    },

    // Webview 前进
    goForward () {
      this.$refs.webview.goForward()
    },

    // Webview 后退
    goBack () {
      this.$refs.webview.goBack()
    }
  },
  mounted () {
    this.init()
  },
  created () {
  }
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
