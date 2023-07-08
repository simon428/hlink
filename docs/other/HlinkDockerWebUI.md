## Hlink 硬链接 群晖 Docker WebUI 配置

> 该文档由群友[Spirei](https://github.com/Spirei)提供

- Docker 映射配置
- Hlink 设置
  > 只要弄懂理解 Docker 的映射关系 就容易多了

### 1. Dokcer 配置

> 1）首先我们去商店下载镜像 选择第二个 选择桥接或者 Host

![iShot_2022-07-05_01.12.17.png](https://s2.loli.net/2022/07/05/SjykW4fP35Oms78.png)

> 2）环境变量增加：HLINK_HOME /data 以及需要硬链的文件夹

- 我们要先映射 data 的路径 然后 HLINK_HOME 才能读取到

- Demo/Pt 母文件夹 不需要过多映射到具体
  ![Docker.png](https://s2.loli.net/2022/07/05/3Wb2FLvDhYjU4qK.png)

- 关系图
  ![Hlink](https://s2.loli.net/2022/07/05/Ye6P8alIDEpKL5N.png)

> 需要强调的一点是 最好映射母文件夹 如果映射到具体的子文件夹 后续可能会出错

### 2. WebUI 配置 > ip:9090 登陆

1）配置列表 > 创建配置 然后根据自己情况稍加修改 以下是我的配置 仅供参考！需要注意 pathsMapping 的填写

2）任务列表 > 创建任务 任务类型选择（硬链 hlink） 配置文件（选择上一步我们创建的配置）

> 建议打开缓存 即 openCache: true
> 以下是我的配置 供参考

```ruby
// 重要说明路径地址都请填写 绝对路径！！！！
export default {
  /**
   * 源路径与目标路径的映射关系
   * 例子:
   *  pathsMapping: {
   *     '/path/to/exampleSource': '/path/to/exampleDest',
   *     '/path/to/exampleSource2': '/path/to/exampleDest2'
   *  }
   */
  pathsMapping: {
        '/Pt/Downloads/SourceCode/电影': '/Pt/Hlinks/电影',
        '/Pt/Downloads/SourceCode/番剧': '/Pt/Hlinks/番剧',
        '/Pt/Downloads/SourceCode/纪录片': '/Pt/Hlinks/纪录片',
        '/Pt/Downloads/SourceCode/剧集/华语': '/Pt/Hlinks/剧集/华语',
        '/Pt/Downloads/SourceCode/剧集/美剧': '/Pt/Hlinks/剧集/美剧',
        '/Pt/Downloads/SourceCode/剧集/韩剧': '/Pt/Hlinks/剧集/韩剧',
        '/Pt/Downloads/SourceCode/剧集/日剧': '/Pt/Hlinks/剧集/日剧'
  },
  /**
   * 需要包含的后缀，如果与exclude同时配置，则取两者的交集
   * include 留空表示包含所有文件
   *
   * 后缀不够用? 高阶用法: todo 待补充链接
   */
  include: [],
  /**
   * 需要排除的后缀，如果与include同时配置，则取两者的交集
   *
   * 后缀不够用? 高阶用法: todo 待补充链接
   */
  exclude: ['jpg','jpeg','png','nfo','txt','md5'],
  /**
   * @scope 该配置项 hlink 专用
   * 是否保持原有目录结构，为false时则只保存一级目录结构
   * 可选值: true/false
   * 例子：
   *  - 源地址目录为：/a
   *  - 目标地址目录为: /d
   *  - 链接的文件地址为 /a/b/c/z/y/mv.mkv；
   *  如果设置为true  生成的硬链地址为: /d/b/c/z/y/mv.mkv
   *  如果设置为false 生成的硬链地址为：/d/y/mv.mkv
   */
  keepDirStruct: false,
  /**
   * @scope 该配置项 hlink 专用
   * 是否打开缓存，为true表示打开
   * 可选值: true/false
   * 打开后，每次硬链后会把对应文件存入缓存，就算下次删除硬链，也不会进行硬链
   */
  openCache: true,
  /**
   * @scope 该配置项 hlink 专用
   * 是否为独立文件创建同名文件夹，为true表示创建
   * 可选值: true/false
   */
  mkdirIfSingle: true,
  /**
   * @scope 该配置项为 hlink prune 命令专用
   * 是否删除文件及所在目录，为false只会删除文件
   * 可选值: true/false
   */
  deleteDir: true,
}
```

### 3. Prune 命令暂时用不到 教程可以参考官方文档 Wiki > https://hlink.likun.me/other/prune.html
