# 拡張機能の作り方

## 開発環境のセットアップ
### Hcratch3開発サーバーのセットアップ

拡張機能を開発するためには、あらかじめ [Hcratch3/scratch-vm#develop](https://github.com/hcratch3/scratch-vm/tree/develop) と [hcratch3/scratch-gui#develop](https://github.com/hcratch3/scratch-gui/tree/develop) を拡張機能のコードと同じディレクトリにクローンする必要があります。
開発時には以下のようなディレクトリ構成を想定しています。

```
.
├── scratch-vm
├── scratch-gui
└── your-extensions
```

次のコマンドで、scratch-vmとscratch-guiをクローンして、開発に必要なパッケージをインストールします。
最後のコマンドで、hcratch3/scratch-gui自体の開発環境をセットアップしています。

```sh
git clone -b xcratch https://github.com/hcratch3/scratch-vm.git
cd ./scratch-vm
npm install
cd ../
git clone -b xcratch https://github.com/hcratch3/scratch-gui.git
cd ./scratch-gui
npm install
npm run setup-dev
```

### ローカルリポジトリのセットアップ

このコードは[GitHub](https://github.com/)で公開する想定になっています。

```sh
cd your-extensions
git init -b main
```

GitHubで[新規リポジトリの作成](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-on-github/creating-a-new-repository)を行い、ローカルリポジトリのリモートとしてそのレポジトリーを追加します。

```sh
git remote add origin <REPO_URL>
```

Then commit and push all files like this.

```sh
git add .
git commit -m "Scaffold code"
git push -u origin main
```

次にNode.jsの依存パッケージをインストールします。

```sh
npm install
```

次のコマンドで、開発に必要な scratch-vm のフォルダへの参照リンクを作成します。

```sh
npm run setup-dev
```

### モジュールファイルのビルド

拡張機能を利用なモジュールファイルにビルドするには、[rollup.js](https://rollupjs.org/guide/en/) を使います。
次のコマンドで、rollup.jsによって必要なソースコードを一つにまとめたモジュールファイルがつくられます。

```sh
npm run build
```

ビルドされたモジュールは、`dist/extensionID.mjs` に保存されます。

ソースコードの変更に応じてビルドを自動的に行うには、`npm run watch` を実行します。

```sh
npm run watch
```

### モジュールファイルをWebサーバーで取得

ビルドされたモジュールをデバッグするためには、Webサーバー経由でモジュールを取得する必要があります。

例えば、ローカルリポジトリに[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)をセットアップし、Hcratch3エディタで以下のようにモジュールをロードします。(URLのポート番号やパスは、Live Serverの設定によって異なります)

1. Hcratch3 Editor を開きます。
2. 「拡張機能を追加」ボタンをクリックします。
3. 「拡張機能を読み込む」エクステンションを選択します。
4. 入力フィールドに以下のモジュールのURLを入力し、「OK」ボタンを押します。

```
https://localhost:5500/dist/extensionID.mjs
```

### Hcratch3開発サーバーによるデバッグ

xcratch/scratch-guiの開発環境をセットアップすると、`npm run start` で開発用サーバーを起動できます。
httpsサーバーが必要な場合は、`--https` オプションを付けて起動します。このためには、 [mkcert](https://github.com/FiloSottile/mkcert) などでローカルに証明書を用意する必要があります。

```sh
npm run start -- --https
```

[Visual Studio Code](https://code.visualstudio.com/) を使うと、```scratch-gui/.vscodde/launch.json``` の "debug on dev-server" を使って、開発用サーバーをデバッグすることができます。
この開発用サーバーで拡張機能のモジュールを読み込むと、Visual Studio Code のデバッグ機能により、拡張機能のソースコードにブレークポイントを設定してデバッグすることができます。

----

## 拡張機能の配布

### GitHub Pages への配置

拡張モジュールファイルのデプロイには、[GitHub Pages](https://pages.github.com/) を利用することができます。

GitHub Pageでモジュールを公開するには、[GitHub Docs](https://docs.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#choosing-a-publishing-source) にしたがって、リポジトリの設定でPagesの「Source」を設定します。

"`main`" ブランチでPagesの "Source"を"`/(root)`"に設定した場合、拡張モジュールは `https://<account>.github.io/<repository>/dist/<extensionID>.mjs` で公開されます。

拡張モジュールを別のサーバで公開したい場合は、そのサーバが `https://hcratch3.github.io/` から [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) を受け入れているかどうかを確認してください。サーバーでCORSが有効になっていない場合、Hcratch3はモジュールをインポートできません。


### 例を示す

Hcratch3は、URLからプロジェクトを開き、extension-URLを入力することなく、プロジェクトで使用されているすべての拡張機能を自動的にロードすることができます。

新しくつくった拡張機能の少なくとも1つのブロックを使用してサンプルプロジェクトを作成し、`projects/example.sb3` として保存すれば、このプロジェクトは、Hcratch3で以下のようなURLで開くことができます。

```
https://hcratch3.github.io/editor/#https://<account>.github.io/<repository>/projects/example.sb3
``` 

次のようなHTMLで、動くプロジェクトをWebページに埋め込むこともできます。

```html
<iframe src="https://hcratch3.github.io/editor/player#https://<account>.github.io/<repository>/projects/example.sb3" width="600px" height="500px"></iframe>
```
