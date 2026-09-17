/** 分类的稳定标识，例如 'food'、'food.takeout'。一旦发布永不修改 */
export type CategoryId = string

/** 一条支出记录 */
export interface Expense {
  id: string
  /** 金额，单位「分」，必须是整数。¥12.34 → 1234 */
  amountCents: number
  categoryId: CategoryId
  subcategoryId: CategoryId
  /** 备注，没有时存空字符串，不存 undefined */
  note: string
  /** 记账日期，本地日期 'YYYY-MM-DD' */
  date: string
  /** 录入时间 ISO 8601 UTC。仅用于同一天内的排序，不显示给用户 */
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: CategoryId
  /** 显示名。改名只改这里，所有历史记录会自动跟着变 */
  name: string
  /** null 表示一级大类 */
  parentId: CategoryId | null
  sortOrder: number
}

export interface Settings {
  schemaVersion: number
  /** 上次导出备份的时间，ISO 8601。从未备份过时为 null */
  lastBackupAt: string | null
}

export interface BackupFile {
  app: string
  schemaVersion: number
  exportedAt: string
  /** 把分类表一起写进备份，文件才是自解释的、记事本可读 */
  categories: Category[]
  expenses: Expense[]
}

export const APP_ID = 'pingmian-jizhang'
export const SCHEMA_VERSION = 1

/** 存储键一律带 pmjz: 前缀和 :v1 版本后缀，便于将来平滑迁移 */
export const EXPENSES_KEY = 'pmjz:expenses:v1'
export const SETTINGS_KEY = 'pmjz:settings:v1'
