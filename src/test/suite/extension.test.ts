import * as assert from 'node:assert'
import * as vscode from 'vscode'
import { CodeFormatter } from '../../core/CodeFormatter'
import { FormatEnum } from '../../types'
import { generateUUID, sha256, translateToNamesCase } from '../../utils/common'

describe('cN2Var Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  it('should format text correctly', () => {
    const formatter = new CodeFormatter()

    // 测试camelCase格式
    const camelCaseResult = formatter.format('user name', FormatEnum.CamelCase)
    assert.strictEqual(camelCaseResult, 'userName')

    // 测试PascalCase格式
    const pascalCaseResult = formatter.format('user name', FormatEnum.PascalCase)
    assert.strictEqual(pascalCaseResult, 'UserName')

    // 测试snake_case格式
    const snakeCaseResult = formatter.format('user name', FormatEnum.SnakeCase)
    assert.strictEqual(snakeCaseResult, 'user_name')

    // 测试kebab-case格式
    const kebabCaseResult = formatter.format('user name', FormatEnum.KebabCase)
    assert.strictEqual(kebabCaseResult, 'user-name')
  })

  it('should handle common utils correctly', () => {
    // 测试translateToNamesCase函数
    assert.strictEqual(translateToNamesCase('hello world', FormatEnum.CamelCase), 'helloWorld')
    assert.strictEqual(translateToNamesCase('hello world', FormatEnum.PascalCase), 'HelloWorld')
    assert.strictEqual(translateToNamesCase('hello world', FormatEnum.SnakeCase), 'hello_world')
    assert.strictEqual(translateToNamesCase('hello world', FormatEnum.KebabCase), 'hello-world')

    // 测试UUID生成
    const uuid = generateUUID()
    assert.strictEqual(uuid.length, 36)
    assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

    // 测试SHA256
    const hash = sha256('test')
    assert.strictEqual(hash.length, 64)
    assert.match(hash, /^[0-9a-f]{64}$/i)
  })
})
