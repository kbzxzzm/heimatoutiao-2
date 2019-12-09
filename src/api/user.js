// 定义用户相关的API
import request from '@/utils/request'

/**
 * 登录
 * @param {Object} loginForm - 登录用户信息（mobile,code）
 */
export const login = (loginForm) => {
  return request('/app/v1_0/authorizations', 'post', loginForm)
}

/**
 *该APi添加关注
 *@param {integer}  userId -用户id
 */
export const followed = (userId) => {
  return request('/app/v1_0/user/followings', 'post', {
    target: userId// 传递参数
  })
}

/**
 *该APi为取消关注
 *@param {integer}  userId -用户id
 */
export const unFollowed = (userId) => { // 调用接口
  return request(`/app/v1_0/user/followings/${userId}`, 'delete')
}
/**
 * 获取个人中心首页信息
 */
export const getUserInfo = () => {
  return request(`app/v1_0/user`, 'get')
}

/**
 * 获取个人中心编辑用户资料信息
 */
export const getUserProfile = () => {
  return request('/app/v1_0/user/profile', 'get')
}

/**
 * 修改头像
 * @param {Obejct} formData - 上传对象（包含字段photo）
 */
export const saveUserPhoto = (formData) => { // 发送图片信息，基于xhr发送一个formdata就是上传
  return request('/app/v1_0/user/photo', 'patch', formData)
}

/**
 * 修改用户信息
 * @param {String} name
 * @param {Integer} gender
 * @param {String} birthday
 */
export const saveUserInfo = (name, gender = 0, birthday) => {
  return request('/app/v1_0/user/profile', 'patch', { name, gender, birthday })
}

// patch和put区别是什么，put是完整修改，patch是局部修改
