# 拡張機能の書き方
## 実践編
### ファイル構成
```
your-extensions
 |
 |-- <extensionsID>.js
```
### `<extensionsID>.js`の中身
```js
class Test {

  constructor() {}

  getInfo() {
    return {
      id: '<extensionsID>',
      name: '<extensionsNAME>',
      blocks: [
        {
          opcode: 'hello',
          blockType: Scratch.BlockType.COMMAND,
          text: 'こんにちは、世界！'
        }
      ]
    }
  }

  hello() {
    console.log('こんにちは、世界！');
  }
}

Scratch.extensions.register(new Test());
```
