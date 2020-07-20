<!-- 右侧事件列表 -->
<template>
  <div class="event-list">
    <!-- 顶部按钮组 -->
    <div class="btn-container">
      <i class="fa fa-plus" @click="showModal"></i>
      <i class="fa fa-floppy-o right" @click="saveToFile"></i>
    </div>

    <!-- 事件列表 -->
    <div class="event-container">
      <img v-if="eventList.length === 0" class="empty-img" src="@/assets/img/empty.jpg" />

      <div class="event-item" v-for="(item, i) in eventList" :key="i + '_event'">
        <div class="info-container">
          <div class="info-item">
            <label>页面地址：</label>
            <span>{{item.page}}</span>
          </div>
          <div class="info-item">
            <label>evt_id:</label>
            <span>{{item.evt_id}}</span>
          </div>
          <div class="info-item">
            <label>uicode:</label>
            <span>{{item.uicode}}</span>
          </div>
          <div class="info-item">
            <label>选择器：</label>
            <span>{{item.selector}}</span>
          </div>
          <div class="info-item">
            <label>事件类型：</label>
            <span>{{getLevel(item.level)}}</span>
          </div>
        </div>

        <div class="event-btn-container">
          <div class="event-btn-context">
            <i class="fa fa-pencil" @click="editItem(item)"></i>
            <i class="fa fa-trash" @click="removeItem(item)"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加弹框 -->
    <event-modal ref="eventModal" @saveEvent="saveEvent"></event-modal>
  </div>
</template>

<script>
import EventModal from './EventModal'
import { remote } from 'electron'
import trackJs from './track.jsraw'
import fs from 'fs'

export default {
  name: 'Viewer',
  components: { EventModal },
  data () {
    return {
      eventList: [] // 事件列表
    }
  },
  methods: {
    getLevel (nth) {
      let arr = ['', '浏览', '曝光', '点击']
      return arr[nth]
    },
    // 展示事件弹框
    showModal (data) {
      this.$refs.eventModal.showModal(data)
    },

    // 添加事件
    saveEvent (data) {
      if (data && data.id !== '') {
        this.eventList = this.eventList.map((item) => {
          if (item.id === data.id) {
            return data
          }
          return item
        })
      } else {
        this.eventList.push({ ...data, id: this.$utils.getUUID() })
      }
      this.saveEventListIntoStorage()
    },
    /**
    * 方便复用放入缓存
    */
    saveEventListIntoStorage () {
      window.localStorage.setItem('eventList', JSON.stringify(this.eventList))
    },
    /**
    * 读取缓存里的eventList
    */
    readEventListIntoStorage () {
      let eventList = window.localStorage.getItem('eventList')
      if (eventList) {
        this.eventList = JSON.parse(eventList)
      }
    },
    // 对数组按照页面进行分组
    handleArray () {
      const map = {}
      const dest = []
      this.eventList.forEach((item) => {
        if (!map[item.page]) {
          dest.push({ page: item.page, events: [item] })
          map[item.page] = item
        } else {
          dest.forEach((destItem) => {
            if (destItem.page === item.page) {
              destItem.events.push(item)
            }
          })
        }
      })
      console.log('dest', dest)
      return dest
    },

    // 创建文件字符串
    createFileStr () {
      const arr = this.handleArray(this.eventList)
      const str = `const eventList = ${JSON.stringify(arr)}`
      return str + trackJs
    },

    // 将列表保存为 JS 文件
    saveToFile () {
      const writeList = {}
      const filePath = remote.dialog.showSaveDialog({ title: '请选择保存js文件的位置', message: '请选择保存JS文件的位置', defaultPath: 'track.js' })
      let eventList = localStorage.getItem('eventList')
      if (typeof eventList === 'string') {
        eventList = JSON.parse(eventList)
      }
      eventList.forEach(item => {
        let fileName = item.page.split('/').pop()
        if (!writeList[fileName]) { writeList[fileName] = [] }
        writeList[fileName].push(item)
      })
      if (filePath) {
        // fs.writeFileSync(filePath, this.createFileStr(), { encoding: 'UTF-8' }) 现在js执行文件为独立状态, json在init的时候注入
        fs.writeFileSync(filePath, trackJs, { encoding: 'UTF-8' })
        // 同时保存埋点json
        let jsonPath = filePath.split('/').slice(0, -1).join('/') + `/eventList_${Date.now()}.json`
        fs.writeFileSync(jsonPath, localStorage.getItem('eventList', { encoding: 'UTF-8' }))
        console.log(writeList, 'writeList')
        Object.keys(writeList).forEach(key => {
          console.log('key', key, filePath.split('/').slice(0, -1).join('/') + `/${key}.json`)
          fs.writeFileSync(filePath.split('/').slice(0, -1).join('/') + `/${key}.json`, JSON.stringify(writeList[key]).toString(), { encoding: 'UTF-8' })
        })
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
  },
  created () {
    this.readEventListIntoStorage()
  }
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
