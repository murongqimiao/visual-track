<template>
  <el-dialog title="添加事件监控" :visible.sync="show" @closed="onClosed">
    <el-form :model="form" label-position="right" label-width="80px">
      <el-form-item label="触发条件">
        <el-select v-model="form.level" placeholder="请选择">
          <el-option label="浏览" value="1"></el-option>
          <el-option label="曝光" value="2"></el-option>
          <el-option label="点击" value="3"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="页面地址">
        <el-input v-model="form.page" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="XPath">
        <el-input v-model="form.selector" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="evt_id">
        <el-input v-model="form.evt_id" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="uicode">
        <el-input v-model="form.uicode" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="pid">
        <el-input v-model="form.pid" autocomplete="off"></el-input>
      </el-form-item>

      <el-form-item label="xhr参数">
        <!-- <el-input v-model="form.apiParams" autocomplete="off"></el-input> -->
        <treeselect v-model="form.value" :multiple="true" :options="options" />
      </el-form-item>

      <!-- <el-form-item label="选择器">
        <el-input type="textarea" :rows="4" v-model="form.selector" autocomplete="off"></el-input>
      </el-form-item>-->

      <!-- <el-form-item label="事件类型">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option label="点击次数" value="0"></el-option>
        </el-select>
      </el-form-item>-->
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="hideModal">取 消</el-button>
      <el-button type="primary" @click="saveEvent">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { mapState } from 'vuex'

export default {
  name: 'EventModal',
  components: { Treeselect },
  data () {
    return {
      show: false,
      form: {
        level: '1', // 事件等级
        page: '', // 页面地址
        selector: '', // 选择器
        type: '0', // 时间类型
        id: '',
        XPath: '', // XPath
        value: [] // xhr选择的结果
      },

      options: [{
        id: 'a',
        label: 'a',
        children: [{
          id: 'aa',
          label: 'aa',
          children: [{
            id: 'cc',
            label: 'cc'
          }, {
            id: 'dd',
            label: 'dd',
            children: [{
              id: 'ee',
              label: 'ee'
            }, {
              id: 'ee1',
              label: 'ee1'
            }]
          }]
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
  computed: {
    ...mapState(['ajaxListInfo'])
  },
  methods: {

    // 保存事件
    saveEvent () {
      this.$emit('saveEvent', Object.assign(this.form, { options: this.options }))
      this.hideModal()
    },

    // 展示模态框
    showModal (data) {
      if (!data.options) { // options 初始化
        this.value = [] // 初始化value
        this.options = [{
          id: '/common/getUserInfo',
          label: '/common/getUserInfo',
          children: [{
            id: 100302,
            label: 100302
          }]
        }]
        this.options = this.initOptions(this.ajaxListInfo)

        console.log('this.ajaxListInfo', this.options)
      } else {
        this.options = data.options
        delete data.options
      }
      this.form = { ...this.form, ...data } // 更新form的值
      this.show = true
    },

    // 隐藏模态框
    hideModal () {
      console.log(this.value)
      this.show = false
    },

    // 模态框隐藏回调
    onClosed () {
      this._data = Object.assign(this._data, this.$options.data())
    },

    // 根据xhrList的内容转成初始化的options
    initOptions (list, sign) {
      const isNormal = (value) => { return typeof value !== 'object' }
      const isObject = (value) => { return Object.prototype.toString.call(value) === '[object Object]' }
      const isArray = (value) => { return Object.prototype.toString.call(value) === '[object Array]' }
      if (isNormal(list)) { // 普通内容
        return [{
          id: sign ? sign + '.' + list : list,
          label: list
        }]
      } else if (isArray(list)) {
        let _result = []
        list.map((item, index) => {
          _result.push({
            id: sign ? sign + '.' + '[' + index + ']' : index,
            label: index,
            children: this.initOptions(item, sign + '[' + index + ']')
          })
        })
        return _result
      } else if (isObject(list)) {
        let _result = []
        let arr = Object.keys(list)
        arr.map(key => {
          _result.push({
            id: sign ? sign + '.' + key : key,
            label: key,
            children: this.initOptions(list[key], sign ? sign + '.' + key : key)
          })
        })
        return _result
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
