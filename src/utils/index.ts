/**
 * 随机颜色 16进制
 * @returns #cccccc
 */
export const getRandomColor = () => {
  return `#${random().toString(16)}${random().toString(16)}${random().toString(16)}`;
};

/**
 * 获取0 - 256 的随机数
 * @returns 随机数
 */
const random = () => {
  return Math.floor(Math.random() * 256);
};

/**
 * 随机id
 * @params length {number} 长度
 * @returns id {string} 随机id
 */
export const getRandomId = (length?: number) => {
  return (Math.random() + new Date().getTime()).toString(32).slice(0, length || 10);
};
