import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'
import ExpenseForm from './components/ExpenseForm.tsx'
import ExpenseList from './components/ExpenseList.tsx'
import SettingsSheet from './components/SettingsSheet.tsx'
import type { Expense } from './types.ts'

/**
 * 冒烟测试：把界面真的渲染一遍，捕捉"构建能过但一打开就白屏"这类错误。
 * 用 react-dom/server 的 renderToString，不需要 jsdom。
 * 副作用在服务端渲染时不执行，所以 App 会停在读取中的状态。
 */

/** React 服务端渲染会在静态文本和插值之间插入 <!-- --> 分隔注释，断言前先去掉 */
function plain(html: string): string {
  return html.replaceAll('<!-- -->', '')
}

const render = (ui: React.ReactElement) => plain(renderToString(ui))

describe('App 渲染', () => {
  it('能渲染出主界面而不抛错', () => {
    expect(render(<App />)).toContain('本月支出')
  })

  it('初始显示读取中的占位文案', () => {
    expect(render(<App />)).toContain('正在读取账目')
  })

  it('渲染出月份切换、记账按钮和备份入口', () => {
    const html = render(<App />)
    expect(html).toContain('上个月')
    expect(html).toContain('下个月')
    expect(html).toContain('记一笔')
    expect(html).toContain('备份')
    // 金额分为「¥」符号和数字两个元素，这里分别断言
    expect(html).toContain('¥')
    expect(html).toContain('0.00')
  })
})

const record = (over: Partial<Expense> = {}): Expense => ({
  id: 'a1',
  amountCents: 1234,
  categoryId: 'food',
  subcategoryId: 'food.takeout',
  note: '',
  date: '2026-09-17',
  createdAt: '2026-09-17T04:00:00.000Z',
  updatedAt: '2026-09-17T04:00:00.000Z',
  ...over,
})

describe('ExpenseList 渲染', () => {
  it('没有记录时显示引导文案', () => {
    expect(render(<ExpenseList expenses={[]} onSelect={() => {}} />)).toContain('这个月还没有记账')
  })

  it('显示分类全名和金额', () => {
    const html = render(<ExpenseList expenses={[record()]} onSelect={() => {}} />)
    expect(html).toContain('餐饮 · 外卖')
    expect(html).toContain('¥12.34')
  })

  it('金额按分精确显示，不出现浮点误差', () => {
    const html = render(
      <ExpenseList
        expenses={[record({ amountCents: 1234 }), record({ id: 'b', amountCents: 2 })]}
        onSelect={() => {}}
      />,
    )
    expect(html).toContain('¥12.36')
    expect(html).not.toContain('12.360000000000001')
  })

  it('有备注时显示备注', () => {
    expect(render(<ExpenseList expenses={[record({ note: '公司楼下' })]} onSelect={() => {}} />)).toContain('公司楼下')
  })

  it('同一天的多条记录归到一组，小计只出现一次', () => {
    const html = render(
      <ExpenseList
        expenses={[record({ id: 'a' }), record({ id: 'b', createdAt: '2026-09-17T03:00:00.000Z' })]}
        onSelect={() => {}}
      />,
    )
    // 两条 12.34 归为一组时小计是 24.68；若没归组会得到两个 12.34 的小计
    expect(html.match(/¥24\.68/g)).toHaveLength(1)
  })

  it('不同日期的记录各成一组', () => {
    const html = render(
      <ExpenseList
        expenses={[record({ id: 'a', date: '2026-09-17' }), record({ id: 'b', date: '2026-09-15' })]}
        onSelect={() => {}}
      />,
    )
    // 两组，每组各有一条明细 -¥12.34 和一个当日小计 ¥12.34
    expect(html.match(/¥12\.34/g)).toHaveLength(4)
  })
})

describe('ExpenseForm 渲染', () => {
  const noop = async () => true

  it('新增模式下渲染出金额输入和分类选择', () => {
    const html = render(<ExpenseForm initial={null} onSubmit={noop} onDelete={() => {}} onCancel={() => {}} />)
    expect(html).toContain('记一笔')
    expect(html).toContain('餐饮')
    expect(html).toContain('交通')
    expect(html).toContain('今天')
    expect(html).toContain('保存')
    // 金额输入框必须唤起手机数字键盘（服务端渲染保留大小写，故忽略大小写比较）
    expect(html.toLowerCase()).toContain('inputmode="decimal"')
    // 未输入金额时保存按钮不可点
    expect(html).toContain('disabled')
  })

  it('新增模式下没有删除按钮', () => {
    expect(render(<ExpenseForm initial={null} onSubmit={noop} onDelete={() => {}} onCancel={() => {}} />)).not.toContain(
      '删除',
    )
  })

  it('编辑模式下带出原金额和分类，并显示删除按钮', () => {
    const html = render(
      <ExpenseForm initial={record({ amountCents: 2350, note: '午饭' })} onSubmit={noop} onDelete={() => {}} onCancel={() => {}} />,
    )
    expect(html).toContain('编辑')
    expect(html).toContain('23.50')
    expect(html).toContain('午饭')
    expect(html).toContain('删除')
  })

  it('编辑模式下选中项落在原来的分类上', () => {
    const html = render(
      <ExpenseForm initial={record({ subcategoryId: 'food.takeout' })} onSubmit={noop} onDelete={() => {}} onCancel={() => {}} />,
    )
    // 选中的小类按钮带深色背景
    expect(html).toContain('bg-slate-900 font-medium text-white">外卖')
  })
})

describe('SettingsSheet 渲染', () => {
  it('渲染出导出、恢复和归类规则入口', () => {
    const html = render(<SettingsSheet expenses={[record()]} onClose={() => {}} onApply={async () => true} />)
    expect(html).toContain('导出备份（1 条）')
    expect(html).toContain('从备份文件恢复')
    expect(html).toContain('归类规则')
    expect(html).toContain('数据体积')
  })

  it('提示用户备份是唯一保险', () => {
    const html = render(<SettingsSheet expenses={[]} onClose={() => {}} onApply={async () => true} />)
    expect(html).toContain('唯一的保险')
  })
})
