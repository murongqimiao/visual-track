<template>
  <div class="home-page">
    <!-- 顶部地址输入框 -->
    <top-bar ref="topBar"></top-bar>

    <div class="page-container">
      <!-- Webview -->
      <viewer ref="webview" @addEvent="addEvent" @updateTreeData="updateTreeData"></viewer>

      <!-- 中部按钮组 -->
      <btn-container></btn-container>

      <!-- 中部列表 -->
      <event-list ref="eventList"></event-list>

      <!-- 右侧xhr数据 -->
      <xhr-list :ajaxINfoList="ajaxINfoList" ref="xhrList"></xhr-list>
    </div>
  </div>
</template>

<script>
import TopBar from './TopBar'
import Viewer from './Viewer'
import BtnContainer from './BtnContainer'
import EventList from './EventList'
import XhrList from './XhrList'

export default {
  name: 'index',
  components: { TopBar, Viewer, BtnContainer, EventList, XhrList },
  data () {
    return {
      ajaxINfoList: []
    }
  },
  methods: {

    // 添加事件
    addEvent (data) {
      this.$refs.eventList.showModal(data)
    },
    updateTreeData (value) {
      console.log('------------->', value)
      this.ajaxINfoList = value
    }
  }
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
