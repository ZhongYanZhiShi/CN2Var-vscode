import * as path from 'node:path'
import Mocha from 'mocha'
import { glob } from 'glob'

/**
 * 运行 Mocha 测试。
 * @returns 一个在所有测试完成后解析或在发生错误时拒绝的 Promise。
 */
export function run(): Promise<void> {
  // 创建 Mocha 测试运行器实例
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((c, e) => {
    // 设置测试文件的查找模式
    glob('**/**.test.js', { cwd: testsRoot }).then((files: string[]) => {
      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)))

      try {
        // 运行mocha测试
        mocha.run((failures: number) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`))
          } else {
            c()
          }
        })
      } catch (err) {
        console.error(err)
        e(err)
      }
    }, (err: any) => {
      e(err)
    })
  })
}
