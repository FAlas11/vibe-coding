import type { Category, CategoryId } from './types.ts'

/** 数据表见 产品设计文档.md 第 4 节。ID 一旦发布永不修改，中文名可以改 */
const top = (id: CategoryId, name: string, sortOrder: number): Category => ({
  id,
  name,
  parentId: null,
  sortOrder,
})

const sub = (parentId: CategoryId, slug: string, name: string, sortOrder: number): Category => ({
  id: `${parentId}.${slug}`,
  name,
  parentId,
  sortOrder,
})

export const CATEGORIES: Category[] = [
  // 1. 餐饮
  top('food', '餐饮', 10),
  sub('food', 'breakfast', '早餐', 10),
  sub('food', 'lunch', '午餐', 20),
  sub('food', 'dinner', '晚餐', 30),
  sub('food', 'late_night', '夜宵', 40),
  sub('food', 'takeout', '外卖', 50),
  sub('food', 'groceries', '买菜做饭', 60),
  sub('food', 'snacks', '零食饮料', 70),
  sub('food', 'fruit', '水果', 80),
  sub('food', 'coffee_tea', '咖啡奶茶', 90),
  sub('food', 'tobacco_alcohol', '烟酒', 100),
  sub('food', 'dining_out', '聚餐下馆子', 110),

  // 2. 交通
  top('transport', '交通', 20),
  sub('transport', 'public', '公交地铁', 10),
  sub('transport', 'taxi', '打车', 20),
  sub('transport', 'bike', '共享单车 / 电动车', 30),
  sub('transport', 'fuel', '加油', 40),
  sub('transport', 'parking', '停车费', 50),
  sub('transport', 'toll', '过路费', 60),
  sub('transport', 'train', '火车 / 高铁', 70),
  sub('transport', 'flight', '飞机', 80),
  sub('transport', 'coach', '长途汽车', 90),
  sub('transport', 'maintenance', '车辆保养维修', 100),
  sub('transport', 'fine', '违章罚款', 110),

  // 3. 购物
  top('shopping', '购物', 30),
  sub('shopping', 'daily', '日用百货', 10),
  sub('shopping', 'clothing', '服饰鞋包', 20),
  sub('shopping', 'beauty', '化妆护肤', 30),
  sub('shopping', 'digital', '数码电器', 40),
  sub('shopping', 'home', '家居用品', 50),
  sub('shopping', 'baby', '母婴用品', 60),
  sub('shopping', 'sports', '运动户外', 70),
  sub('shopping', 'jewelry', '珠宝配饰', 80),
  sub('shopping', 'other', '其他购物', 90),

  // 4. 居住
  top('housing', '居住', 40),
  sub('housing', 'rent', '房租', 10),
  sub('housing', 'mortgage', '房贷', 20),
  sub('housing', 'property_fee', '物业费', 30),
  sub('housing', 'water', '水费', 40),
  sub('housing', 'electricity', '电费', 50),
  sub('housing', 'gas', '燃气费', 60),
  sub('housing', 'heating', '取暖费', 70),
  sub('housing', 'repair', '房屋维修', 80),
  sub('housing', 'renovation', '装修', 90),
  sub('housing', 'moving_agency', '搬家 / 中介费', 100),

  // 5. 通讯
  top('comm', '通讯', 50),
  sub('comm', 'phone_bill', '手机话费', 10),
  sub('comm', 'broadband', '宽带 / 网费', 20),
  sub('comm', 'data', '流量包', 30),
  sub('comm', 'cable_tv', '有线电视', 40),
  sub('comm', 'repair', '手机维修', 50),

  // 6. 医疗健康
  top('medical', '医疗健康', 60),
  sub('medical', 'clinic', '门诊挂号', 10),
  sub('medical', 'medicine', '药品', 20),
  sub('medical', 'hospital', '住院', 30),
  sub('medical', 'checkup', '体检', 40),
  sub('medical', 'dental', '口腔牙科', 50),
  sub('medical', 'optical', '眼科 / 配镜', 60),
  sub('medical', 'supplement', '保健品', 70),
  sub('medical', 'tcm', '中医理疗', 80),
  sub('medical', 'vaccine', '疫苗', 90),

  // 7. 教育
  top('education', '教育', 70),
  sub('education', 'tuition', '学费', 10),
  sub('education', 'training', '培训课程', 20),
  sub('education', 'hobby_class', '兴趣班', 30),
  sub('education', 'tutor', '家教', 40),
  sub('education', 'books', '书籍教材', 50),
  sub('education', 'stationery', '文具用品', 60),
  sub('education', 'exam_fee', '考试报名费', 70),
  sub('education', 'online_course', '网课 / 知识付费', 80),
  sub('education', 'school_misc', '学校杂费', 90),

  // 8. 娱乐
  top('ent', '娱乐', 80),
  sub('ent', 'movie_show', '电影演出', 10),
  sub('ent', 'travel', '旅游度假', 20),
  sub('ent', 'tickets', '景点门票', 30),
  sub('ent', 'fitness', '运动健身', 40),
  sub('ent', 'games', '游戏充值', 50),
  sub('ent', 'subscription', '会员订阅', 60),
  sub('ent', 'party', '聚会娱乐', 70),
  sub('ent', 'hobby', '兴趣爱好', 80),

  // 9. 人情往来
  top('social', '人情往来', 90),
  sub('social', 'red_packet', '红包', 10),
  sub('social', 'wedding_gift', '份子钱 / 随礼', 20),
  sub('social', 'gift', '礼品礼物', 30),
  sub('social', 'elders', '孝敬长辈', 40),
  sub('social', 'treating', '请客招待', 50),
  sub('social', 'visit', '探病慰问', 60),
  sub('social', 'donation', '慈善捐赠', 70),

  // 10. 生活服务
  top('services', '生活服务', 100),
  sub('services', 'hair_beauty', '理发美容', 10),
  sub('services', 'laundry', '洗衣干洗', 20),
  sub('services', 'cleaning', '家政保洁', 30),
  sub('services', 'courier', '快递邮寄', 40),
  sub('services', 'appliance_repair', '家电维修', 50),
  sub('services', 'printing', '打印复印', 60),
  sub('services', 'photo', '照相 / 证件照', 70),
  sub('services', 'admin_fee', '办事手续费', 80),

  // 11. 宠物
  top('pets', '宠物', 110),
  sub('pets', 'food', '宠物口粮', 10),
  sub('pets', 'supplies', '宠物用品', 20),
  sub('pets', 'medical', '宠物医疗', 30),
  sub('pets', 'grooming', '宠物美容', 40),
  sub('pets', 'boarding', '宠物寄养', 50),
  sub('pets', 'medicine', '宠物药品', 60),
  sub('pets', 'training', '宠物训练', 70),

  // 12. 其他
  top('other', '其他', 120),
  sub('other', 'work', '办公 / 工作支出', 10),
  sub('other', 'fees', '手续费与利息', 20),
  sub('other', 'loss', '意外损失', 30),
  sub('other', 'unsorted', '待分类', 40),
  sub('other', 'misc', '其他杂项', 50),
]

/** 一级大类，按 sortOrder 排好 */
export const TOP_CATEGORIES: Category[] = CATEGORIES.filter((c) => c.parentId === null).sort(
  (a, b) => a.sortOrder - b.sortOrder,
)

const byId = new Map(CATEGORIES.map((c) => [c.id, c]))

export function categoryById(id: CategoryId): Category | undefined {
  return byId.get(id)
}

/** 某个大类下的二级小类，按 sortOrder 排好 */
export function subcategoriesOf(parentId: CategoryId): Category[] {
  return CATEGORIES.filter((c) => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder)
}

/** '餐饮 · 外卖'。遇到未知 ID 返回占位文案而不是崩溃 */
export function categoryPath(subcategoryId: CategoryId): string {
  const s = byId.get(subcategoryId)
  if (!s) return '未知分类'
  const parent = s.parentId ? byId.get(s.parentId) : undefined
  return parent ? `${parent.name} · ${s.name}` : s.name
}
