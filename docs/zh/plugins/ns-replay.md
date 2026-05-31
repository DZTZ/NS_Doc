
# NS_Replay 插件

## 简介

NS_Replay 是一个功能完善的虚幻引擎回放系统，支持录制、文件管理、精确跳转和状态同步。

**主要特性：**
- 实时录制游戏会话
- 完整的回放列表管理
- 精确的时间跳转功能
- 支持暂停/继续播放
- 可调节播放速度
- 支持回放文件删除

**支持平台：**
- Windows (Win64)
- Mac
- iOS
- Android
- Linux

**引擎版本要求：** Unreal Engine 5.0.0+


## 蓝图节点说明

### 开始录制(StartRecording)

开始录制新的回放。

参数：
- ReplayName（字符串）- 回放文件的名称，留空则使用默认名称

返回：
- ReturnValue（布尔值）- 是否成功开始录制

### StopRecording

停止当前正在进行的录制。

参数：
无

返回：
- ReturnValue（布尔值）- 是否成功停止录制

### GetReplayList

获取所有已录制的回放列表。

参数：
- OutReplayList（FReplayInfo数组）- 输出的回放信息数组

返回：
- ReturnValue（布尔值）- 是否成功获取列表

### PlayReplay

播放指定的回放。

参数：
- ReplayName（字符串）- 要播放的回放名称

返回：
- ReturnValue（布尔值）- 是否成功开始播放

### GetReplayTotalDuration

获取当前回放的总时长（秒）。

参数：
无

返回：
- ReturnValue（浮点型）- 回放总时长，若无活动回放则返回 0.0

### SeekToTime

跳转到回放的指定时间点。

参数：
- TimeInSeconds（浮点型）- 目标时间（秒）

返回：
- ReturnValue（布尔值）- 是否成功跳转

### GetCurrentDateTime

获取当前系统日期时间，格式为 "YYYY-MM-DD HH-MM"。

参数：
无

返回：
- ReturnValue（字符串）- 格式化的日期时间字符串

### GetCurrentReplayTime

获取当前回放的播放进度时间（秒）。

参数：
无

返回：
- ReturnValue（浮点型）- 当前播放时间，若无活动回放则返回 0.0

### PauseReplay

暂停回放播放。

参数：
无

返回：
- ReturnValue（布尔值）- 是否成功暂停

### ResumeReplay

恢复回放播放。

参数：
无

返回：
- ReturnValue（布尔值）- 是否成功恢复

### SetReplayPlaybackSpeed

设置回放播放速度。

参数：
- PlaybackSpeed（浮点型）- 播放速度，范围 0.1 - 10.0，1.0 为正常速度

返回：
- ReturnValue（布尔值）- 是否成功设置速度

### DeleteReplay

删除指定的回放文件。

参数：
- ReplayName（字符串）- 要删除的回放名称

返回：
- ReturnValue（布尔值）- 是否成功删除

### IsWorldInReplay

检查当前世界是否正在回放模式中。

参数：
无

返回：
- ReturnValue（布尔值）- 是否在回放模式中

## 注意事项

1. **文件存储位置** - 回放文件默认存储在 `[项目目录]/Saved/Demos/` 文件夹中
2. **名称生成** - 如果未指定回放名称，会自动生成格式为 `Replay_YYYYMMDD_HHMMSS` 的名称
3. **速度限制** - 播放速度限制在 0.1x 到 10x 之间
4. **对象复制** - 确保需要录制的Actor设置了正确的复制属性
5. **网络模式** - 回放系统在单机和网络模式下都可使用

## 技术支持

- 插件作者：NodeSmith
- 官方文档：https://dztz.github.io/NS_Document/Replay/indexEn.html
- Fab商店：com.epicgames.launcher://ue/Fab/product79aa810c-f7a0-4582-b257-287d7f42aefe

