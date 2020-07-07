<!-- 右侧事件列表 -->
<template>
  <div class="xhr-list">
    <!-- 顶部按钮组 -->
    <div class="btn-container">
      <p class="title">
        Xhr监听
        <!-- <i class="fa fa-plus" @click="showModal"></i>
        <i class="fa fa-floppy-o right" @click="saveToFile"></i>-->
      </p>
    </div>

    <!-- 事件列表 -->
    <div class="event-container">
      <img v-if="!ajaxInfoList" class="empty-img" src="@/assets/img/empty.jpg" />
      <div>
        <json-view v-if="ajaxInfoList" :data="ajaxInfoList" />
        <!-- <treeselect v-model="value" :multiple="true" :options="options" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import electron, { remote, ipcRenderer, ipcMain } from 'electron'
import trackJs from './track.jsraw'
import fs from 'fs'
import jsonView from 'vue-json-views'
// import the component
// import Treeselect from '@riophae/vue-treeselect'
// import the styles
// import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'Viewer',
  props: {},
  components: { jsonView },
  data () {
    return {
      ajaxInfoList: null,
      eventList: [], // 事件列表
      value: null,
      options: [{
        id: 'a',
        label: 'a',
        children: [{
          id: 'aa',
          label: 'aa'
        }, {
          id: 'ab',
          label: 'ab'
        }]
      }, {
        id: 'b',
        label: 'b'
      }, {
        id: 'c',
        label: 'c'
      }]
    }
  },
  created () {
  },
  methods: {
    updateAjaxInfoList (value) {
      this.ajaxInfoList = JSON.parse(JSON.stringify(value))
    },
    addXhrListener () {
      const that = this
      var OldXhr = window.XMLHttpRequest
      const newXHR = () => {
        var realXHR = new OldXhr()
        realXHR.addEventListener(
          'loadend',
          function (...params) {
            that.ajaxEventTrigger(that, 'ajaxLoadEnd', params)
          },
          false
        )
        realXHR.addEventListener(
          'readystatechange',
          function (...params) {
            that.ajaxEventTrigger(that, 'ajaxReadyStateChange', params)
          },
          false
        )
        return realXHR
      }
      window.XMLHttpRequest = newXHR
      console.log(window.XMLHttpRequest)
    },
    ajaxEventTrigger (event, params) {
      var ajaxEvent = new CustomEvent(event, { detail: this })
      if (!window.currentPageAjaxInfo) {
        window['currentPageAjaxInfo'] = {}
      }
      if (event === 'ajaxLoadEnd') {
        // 此时具有返回值
        const { target } = params[0]
        const { responseURL, response } = target
        const key = responseURL.split('?')[0].split(location.host)[1]
        const value = JSON.parse(response)
        window.currentPageAjaxInfo[key] = value
        this.updateXhrList(window.currentPageAjaxInfo)
      }
      window.dispatchEvent(ajaxEvent)
    },
    updateXhrList (info) {
      console.log(info, this)
    },
    // 展示事件弹框
    showModal (data) {
      // this.$refs.eventModal.showModal(data)
    },

    // 添加事件
    saveEvent (data) {
      if (data && data.id !== '') {
        this.eventList = this.eventList.map(item => {
          if (item.id === data.id) {
            return data
          }
          return item
        })
      } else {
        this.eventList.push({ ...data, id: this.$utils.getUUID() })
      }
    },

    // 对数组按照页面进行分组
    handleArray () {
      const map = {}
      const dest = []
      this.eventList.forEach(item => {
        if (!map[item.page]) {
          dest.push({ page: item.page, events: [item] })
          map[item.page] = item
        } else {
          dest.forEach(destItem => {
            if (destItem.page === item.page) {
              destItem.events.push(item)
            }
          })
        }
      })
      return dest
    },

    // 创建文件字符串
    createFileStr () {
      const arr = this.handleArray(this.eventList)
      const str = `const eventList = '${JSON.stringify(arr)}'`
      return str + trackJs
    },

    // 将列表保存为 JS 文件
    saveToFile () {
      const filePath = remote.dialog.showSaveDialog({
        title: '请选择保存位置',
        message: '请选择保存位置',
        defaultPath: 'track.js'
      })
      if (filePath) {
        fs.writeFileSync(filePath, this.createFileStr(), { encoding: 'UTF-8' })
      }
    },

    // 编辑事件
    editItem (item) {
      this.showModal(item)
    },

    // 删除事件
    removeItem (item) {
      const index = this.eventList.indexOf(item)
      this.eventList.splice(index, 1)
    }
  }
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
