import * as vscode from 'vscode'
import { YoudaoTranslator } from './Youdao'
import { OpenaiTranslator } from './OpenAI'

export enum TranslatorEnum {
  Youdao = '有道翻译',
  OpenAI = 'OpenAI',
}

export interface Translator {
  translate: (text: string) => Promise<string[]>
  validateKeys: () => Promise<boolean>
  inputKey: () => Promise<void>
  reconfigureKeys: () => Promise<void>
}

export class TranslationContext {
  private translator!: Translator
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.setTranslator()
  }

  /**
   * 设置翻译器
   */
  setTranslator() {
    const config = vscode.workspace.getConfiguration('cn2var')
    const translator = config.get<TranslatorEnum>('translator.engine')

    switch (translator) {
      case TranslatorEnum.OpenAI:
        this.translator = new OpenaiTranslator(this.context)
        break
      default:
        this.translator = new YoudaoTranslator(this.context)
        break
    }
  }

  async translate(text: string): Promise<string[]> {
    return this.translator.translate(text)
  }

  /**
   * 验证Api密钥是否存在
   */
  async validateKeys(): Promise<boolean> {
    return await this.translator.validateKeys()
  }

  /**
   * 设置Api密钥
   */
  async inputKey() {
    await this.translator.inputKey()
  }

  async reconfigureKeys() {
    await this.translator.reconfigureKeys()
  }
}
