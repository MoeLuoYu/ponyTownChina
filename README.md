# Pony Town  
一款关于小马建设城镇的游戏  
Translated by MoeLuoYu
## 前置要求  
* [Node.js](https://nodejs.org/download/release/v9.11.2/) (版本9)  
* 使用 npm 安装 gulp `npm install -g gulp`  
* MongoDB: [下载链接](https://www.mongodb.com/download-center/community) 和 [安装指南](https://docs.mongodb.com/manual/administration/install-community/)  
* [ImageMagick](https://imagemagick.org/script/download.php#windows) (可选，在动画工具中生成预览动图时需要)  

## 安装  
```bash  
npm install  
```  

## 数据库设置  
- 安装MongoDB  
- 从命令行启动`mongo` (在Windows上可能需要进入`C:\Program Files\MongoDB\Server\4.0\bin`路径来运行此命令)  
- 输入`use your_database_name`创建数据库  
- 输入`db.new_collection.insert({ some_key: "some_value" })`初始化数据库  
- 输入  
  ```javascript  
  db.createUser(  
    {  
      user: "your_username",  
      pwd: "your_password",  
      roles: [ { role: "readWrite", db: "your_database_name" } ]  
    }  
  )  
  ```  
  创建数据库用户。  
- 输入`quit()`退出mongo  

## 设置OAuth密钥  
为你选择的认证平台获取OAuth密钥 (github、google、twitter、facebook、vkontakte、patreon)  

### Github  
- 访问https://github.com/settings/developers 创建新的OAuth应用。  
- 将授权回调URL设置为`http://<your domain>/auth/github/callback`，对于本地服务器则设置为`http://localhost:8090/auth/github/callback`。  
- 将以下内容添加到`config.json`的`oauth`字段中  

```json  
"github": {  
  "clientID": "<your_client_id>",  
  "clientSecret": "<your_client_secret>"  
}  
```  

### Twitter  
- 访问https://developer.twitter.com/en/apps 创建新应用。  
- 将回调URL设置为`http://<your domain>/auth/twitter/callback`，对于本地服务器则设置为`http://localhost:8090/auth/twitter/callback`。  
- 将以下内容添加到`config.json`的`oauth`字段中  

```json  
"twitter": {  
  "consumerKey": "<your_consumer_key>",  
  "consumerSecret": "<your_consumer_secret>"  
}  
```  

### Google  
- 访问https://console.developers.google.com/apis/dashboard 从顶部下拉菜单创建新项目，进入“凭据”并创建新条目。  
- 在“授权的JavaScript来源”中添加`http://<your domain>`或本地服务器的`http://localhost:8090/`。  
- 在“授权的重定向URI”中添加`http://<your domain>/auth/google/callback`或本地服务器的`http://localhost:8090/auth/google/callback`。  
- 将以下内容添加到`config.json`的`oauth`字段中  

```json  
"google": {  
  "clientID": "<your_client_id>",  
  "clientSecret": "<your_client_secret>"  
}  
```  

### Facebook  
- 访问https://developers.facebook.com/apps/ 添加新应用。  
- 为应用添加“Facebook登录”功能  
- 启用“Web OAuth登录”  
- 在“有效OAuth重定向URI”中添加`https://<your domain>/auth/facebook/callback`  
- 将以下内容添加到`config.json`的`oauth`字段中（可在“设置 > 基本信息”中找到应用ID和应用密钥）  

```json  
"facebook": {  
  "clientID": "<your_app_id>",  
  "clientSecret": "<your_app_secret>",  
  "graphApiVersion": "v3.1"  
}  
```  

### VKontakte  
- 访问https://vk.com/apps?act=manage 创建新应用  
- 将“授权重定向URI”设置为`http://<your domain>/auth/vkontakte/callback`，对于本地服务器则设置为`http://localhost:8090/auth/vkontakte/callback`。  
- 将以下内容添加到`config.json`的`oauth`字段中  

```json  
"vkontakte": {  
  "clientID": "<your_app_id>",  
  "clientSecret": "<secure_key>"  
},  
```  

### 其他  
如果需要添加其他登录方式，需找到对应的[passport](http://www.passportjs.org/)插件，并在`src/ts/server/oauth.ts`中添加相关代码，同时在`config.json`中添加正确配置项。  

## 配置  
在根目录添加`config.json`文件，内容如下。可使用`config-template.json`作为配置模板（`config.json`文件中不要包含注释）  

```javascript  
{  
  "title": "Pony Town",  
  "twitterLink": "https://twitter.com/<twitter_name>", // 可选  
  "contactEmail": "<your_contact_email>",  
  "port": 8090,  
  "adminPort": 8091,  
  "host": "http://localhost:8090/",  
  "local": "localhost:8090",  
  "adminLocal": "localhost:8091",  
  "secret": "<some_random_string_here>",  
  "token": "<some_random_string_here>",  
  "db": "mongodb://<username>:<password>@localhost:27017/<database_name>", // 使用数据库设置时的参数  
  "analytics": { // 可选Google分析  
    "trackingID": "<tracking_id>"  
  },  
  "facebookAppId": "<facebook_id>", // 可选Facebook应用链接  
  "assetsPath": "<path_to_graphics_assets>", // 可选，用于资源生成  
  "oauth": {  
    "google": {  
      "clientID": "<CLIENT_ID_HERE>",  
      "clientSecret": "<CLIENT_SECRET_HERE>"  
    }  
    // 其他OAuth配置项  
  },  
  "servers": [  
    {  
      "id": "dev",  
      "port": 8090,  
      "path": "/s00/ws",  
      "local": "localhost:8090",  
      "name": "Dev server",  
      "desc": "Development server",  
      "flag": "test", // 可选标志（"test"、"star"或用空格分隔的国家/地区标志列表）  
      "flags": { // 可选功能标志  
        "test": true, // 测试服务器  
        "editor": true, // 游戏内编辑器  
      },  
      "alert": "18+", // 可选18+提醒（同时阻止未成年玩家）  
    },  
  ]  
}  
```  

## 运行  
### 生产环境  
```bash  
npm run build  
npm start  
```  

### 添加/删除角色  
```bash  
node cli.js --addrole <account_id> <role>   # 角色：superadmin、admin、mod、dev  
node cli.js --removerole <account_id> <role>  
```  

设置超级管理员角色使用以下命令：  
```bash  
node cli.js --addrole <your_account_id> superadmin  
```  

管理面板访问地址：`<base_url>/admin/`（需要admin或superadmin角色）  
工具面板访问地址：`<base_url>/tools/`（仅在开发模式或使用--tools标志启动时可用）  

### 多进程启动  
```bash  
node pony-town.js --login                    # 登录服务器  
node pony-town.js --game main                # 游戏服务器1（'main'需与config.json中的id匹配）  
node pony-town.js --game safe                # 游戏服务器2（'safe'需与config.json中的id匹配）  
node pony-town.js --admin --standaloneadmin  # 管理服务器  
```  

若要在同一URL下运行，需使用http代理将游戏服务器和管理服务器的路径绑定到正确端口。  
对于用户量较大的场景，建议为进程分配更大内存（尤其是管理和游戏进程），示例：  
```bash  
node --max_old_space_size=8192 pony-town.js --game main  
```  

### 测试环境（含开发工具和开发中功能）  
```bash  
npm run build-beta  
node pony-town.js --login --admin --game --tools --beta  
```  

### 开发模式运行  
```bash  
npm run ts-watch    # 终端1  
npm run wds         # 终端2  
gulp dev            # 终端3  
gulp test           # 终端4（可选）  
```  

```bash  
gulp dev --sprites  # 运行时生成雪碧图（使用src/ts/tools/trigger.txt触发雪碧图生成，无需重启gulp）  
gulp dev --test     # 运行时执行测试  
gulp dev --coverage # 运行时执行测试并生成代码覆盖率报告  
```  

## 自定义  
- `package.json` - 网站标题和描述设置  
- `assets/images` - 徽标和团队头像  
- `public/images` - 其他徽标  
- `public` - 隐私政策和服务条款  
- `favicons` - 图标  
- `src/ts/common/constants.ts` - 全局设置  
- `src/ts/server/maps/*` - 地图配置和设置  
- `src/ts/server/start.ts` - 世界初始化设置  
- `src/ts/components/services/audio.ts` - 添加/删除音轨  
- `src/ts/client/credits` - 鸣谢和贡献者  
- `src/style/partials/_variables.scss` - 页面样式配置  

### 自定义地图入门  
- `src/ts/server/start.ts:35` - 向世界添加自定义地图  
- `src/ts/server/map/customMap.ts` - 自定义地图注释指南
