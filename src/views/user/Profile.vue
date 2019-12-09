<template>
  <div class="container">
    <van-nav-bar left-arrow @click-left="$router.back()"  title="编辑资料" right-text="保存" @click-right='save' ></van-nav-bar>
    <van-cell-group>
      <!-- 单元格 -->
      <van-cell is-link title="头像" @click="showPhoto=true" center>
        <van-image
          slot="default"
          width="1.5rem"
          height="1.5rem"
          fit="cover"
          round
          :src="photo"
        />
        <!-- 控制显示窗口上传头像 ，用下面的本地相册click触发该点击事件$refs.该ref名-->
        <input type="file" @change="preview" ref="fileInput" style="display:none">
      </van-cell>
      <!-- 名称单元格 -->
      <van-cell is-link title="名称" @click="showName=true" :value="user.name" />
      <van-cell is-link title="性别" @click="showGender=true" :value="user.gender===0?'男':'女'" />
      <!-- 依赖日期选择插件 -->
      <van-cell is-link title="生日" @click="openDate()" :value="user.birthday" />
    </van-cell-group>
    <van-popup v-model="showPhoto" position="bottom">
      <!-- js目前只能调用本地，不能调用摄像头，只有打包成app再去调用摄像头 -->
      <van-cell value="本地相册选择" @click="$refs.fileInput.click()"  is-link/>
      <van-cell value="拍照" is-link/>
    </van-popup>
    <!-- 头像对话框 -->
    <van-popup v-model="showName" position="bottom"><!--position='bottom'弹出在下方显示-->
      <van-field v-model="user.name" required placeholder="请输入用户名" /> <!--required星号-->
    </van-popup>
       <!-- 性别对话框 -->
    <van-popup v-model="showGender" position="bottom">
      <van-cell value="男" @click="changeGender(0)" is-link/>
      <van-cell value="女" @click="changeGender(1)" is-link/>
    </van-popup>
    <!-- 打开生日对话框 -->
    <van-popup v-model="showBirthday" position="bottom">
      <!-- 生日选择，标题，双向绑定数据，年月日，
      最小可选日期，最大可选日期，cancel关闭对话框  -->
      <van-datetime-picker
        title="选择生日"
        v-model="nowDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @cancel="dateShow=false"
        @confirm="confirmDate"
      />
    </van-popup>
  </div>
</template>

<script>
import { getUserProfile, saveUserPhoto, saveUserInfo } from '@/api/user'
var dayjs = require('dayjs')// 处理日期格式，可以转时间格式
export default {
  name: 'user-profile',
  data () {
    return {
      showPhoto: false, // 打开头像上传的选择对话框
      showName: false, // 输入名称对话框
      showGender: false, // 选择性别对话框
      showBirthday: false, // 选择生日对话框
      nowDate: new Date(), // 日期控件的默认时间
      minDate: new Date('1950-01-01'), // 最小可选日期
      maxDate: new Date(), // 最大可选日期，现在时间就是最大的可选日期
      photo: null, // 头像，因为一个接口无法实现，所以和user分开了
      user: { // 默认用户信息
        name: '',
        gender: 0, // 性别 0为男，1为女
        birthday: ''
      }
    }
  },
  created () {
    this.getUserProfile()// 组件初始化拿编辑资料信息
  },
  methods: {
    async save () {
      try {
        const formData = new FormData() // 1. 上传头像
        formData.append('photo', this.$refs.fileInput.files[0])
        await saveUserPhoto(formData)
        const { name, gender, birthday } = this.user // 2. 保存信息
        await saveUserInfo(name, gender, birthday)
        this.$toast.success('保存成功')
      } catch (e) {
        this.$toast.fail('保存失败')
      }
    },
    preview () { // 预览图片
      // 获取当前选择的文件对象
      const file = this.$refs.fileInput.files[0]// src不能直接读取object成为一张图片的
      // 从你选择的文件对象读取文件信息（base64编码格式，可以看到图片）
      const fileReader = new FileReader()// filereader对象可以根据file读取base64编码数据
      fileReader.readAsDataURL(file)// 读取文件对象
      fileReader.onload = () => { // onload读取完毕
        this.photo = fileReader.result// 把读取后的数据 (编码64数据)赋值给 src属性即可
        this.showPhoto = false// 关闭对话框
      }
    },
    async getUserProfile () {
      const data = await getUserProfile()
      this.user = data // 已经赋值给data
      this.photo = data.photo
    },
    openDate () { // 打开日期控件
      if (this.user.birthday) { // 有生日数据，让控件默认选中你的生日日期
        this.nowDate = new Date(this.user.birthday)
      }
      this.showBirthday = true// 打开对话框
    },
    confirmDate (value) { // 确认时间后  把Date转换成String
      this.user.birthday = dayjs(value).format('YYYY-MM-DD')// 格式化，因为服务端需要字符串格式
      this.showBirthday = false// 关闭对话框
    },
    changeGender (gender) {
      this.user.gender = gender // 选择性别 gender 0 男  1 女
      this.showGender = false
    }
  }
}
</script>

<style scoped lang='less'></style>
