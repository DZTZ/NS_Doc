
# NS_DS_Commander 插件

## 简介

NS_DS_Commander 是一套专用服务器（DS）调度管理工具，提供主服务器、子服务器与 UE 客户端之间的匹配、房间管理、服务器状态监控与定时任务能力。

**主要特性：**
- 主服务器负责区域、房间匹配与云服务器生命周期管理
- 子服务器负责本地 DS 进程管理与主从转发
- UE 客户端蓝图节点完成匹配、连接、状态上报
- 支持定时任务（Cron）自动开房与释放
- 支持自定义字段数据上报

**引擎版本要求：** Unreal Engine 5.0+

## 系统架构

![系统架构](/images/ns-ds-commander/architecture.png)

<hr />

## 快速开始

### 获取子系统

所有客户端蓝图节点都通过 `NS_Matchmaking Subsystem` 调用。使用前请先获取该子系统实例。

![获取子系统](/images/ns-ds-commander/get-subsystem.png)

<hr />

## 连接流程

### 客户端连接主服务器

客户端通过 WebSocket 连接主服务器，认证成功后即可进行匹配、获取房间列表等操作。

![客户端连接流程](/images/ns-ds-commander/flow-client-connect.png)

<hr />

### DS 连接子服务器

专用服务器启动后连接本地子服务器，子服务器再与主服务器保持通信，完成注册与心跳。

![DS 连接流程](/images/ns-ds-commander/flow-ds-connect.png)

<hr />

## 客户端节点

::: client Connect to Server

使用 WebSocket URL 与密码连接主服务器。这是客户端使用所有其他节点的前提。

![连接服务器](/images/ns-ds-commander/node-connect-to-server.png)

<hr />

:::

::: client Disconnect

断开与主服务器的连接。

![断开连接](/images/ns-ds-commander/node-disconnect.png)

<hr />

:::

::: client Is Connected

检查当前是否已连接主服务器。

![是否已连接](/images/ns-ds-commander/node-is-connected.png)

<hr />

:::

::: client In Lobby

标记当前客户端处于大厅状态。

![在大厅](/images/ns-ds-commander/node-in-lobby.png)

<hr />

:::

::: client In Game

标记当前客户端处于游戏对局中状态。

![在游戏中](/images/ns-ds-commander/node-in-game.png)

<hr />

:::

::: client Set Player Info

设置玩家自定义信息（如昵称、头像、段位等），供匹配与房间展示使用。

![设置玩家信息](/images/ns-ds-commander/node-set-player-info.png)

<hr />

:::

::: client Send Chat Message

发送聊天消息到当前房间。

![发送聊天消息](/images/ns-ds-commander/node-send-chat-message.png)

<hr />

:::

::: client Send Custom Operate Reply

发送自定义操作回复，常用于服务端下发指令后的客户端响应。

![发送自定义操作回复](/images/ns-ds-commander/node-send-custom-operate-reply.png)

<hr />

:::

::: client Start Matchmaking

开始匹配，客户端向主服务器请求加入可用房间或在指定地区创建新房间。

![开始匹配](/images/ns-ds-commander/node-start-matchmaking.png)

<hr />

:::

::: client Cancel Matchmaking

取消当前匹配请求。

![取消匹配](/images/ns-ds-commander/node-cancel-matchmaking.png)

<hr />

:::

::: client Is Matchmaking

检查当前是否处于匹配中状态。

![是否匹配中](/images/ns-ds-commander/node-is-matchmaking.png)

<hr />

:::

::: client Get Available Regions

通过回调异步获取可用地区列表。调用后插件会向主服务器实时请求最新列表，收到服务端返回后通过回调返回结果，同时更新本地缓存。

| 参数 | 类型 | 说明 |
|------|------|------|
| OnComplete | 回调 | `bSuccess`(Boolean) + `Regions`(String 数组) |

> 未连接时会立即以 `bSuccess = false` 和空数组回调，不会发起网络请求；连接确认成功后插件会自动从服务端拉取一次地区列表更新缓存。

![获取可用地区](/images/ns-ds-commander/node-get-available-regions.png)

<hr />

:::

::: client Create Server

在指定地区创建新的专用服务器房间。

![创建服务器](/images/ns-ds-commander/node-create-server.png)

<hr />

:::

::: client Get Room List

获取房间列表，支持按地区、模式等条件筛选。

![获取房间列表](/images/ns-ds-commander/node-get-room-list.png)

<hr />

:::

::: client Get Server Stats

获取服务器运行统计信息，如 CPU、内存、在线人数等。

![获取服务器状态](/images/ns-ds-commander/node-get-server-stats.png)

<hr />

:::

## DS 服务器节点

以下节点运行在专用服务器（DS）端，用于与调度系统交互。

::: ds DS Connect to Child Server

DS 启动后连接本地子服务器。

![DS 连接子服务器](/images/ns-ds-commander/node-ds-connect-to-child-server.png)

<hr />

:::

::: ds DS Close Room

关闭当前房间，通常在定时任务释放或管理员主动关闭时调用。

![DS 关闭房间](/images/ns-ds-commander/node-ds-close-room.png)

<hr />

:::

::: ds DS Set Room Joinable Status

设置房间是否允许新玩家加入。

![DS 设置房间可加入状态](/images/ns-ds-commander/node-ds-set-room-joinable-status.png)

<hr />

:::

::: ds DS Report Custom Fields Data

向调度系统上报自定义字段数据，可用于房间筛选与展示。

![DS 上报自定义字段数据](/images/ns-ds-commander/node-ds-report-custom-fields-data.png)

<hr />

:::

## JSON 工具节点

::: json Extract Json Value

从 JSON 字符串中提取指定键的值。

![提取 JSON 值](/images/ns-ds-commander/node-extract-json-value.png)

<hr />

:::

::: json Get Json Keys

获取 JSON 对象中所有顶层键名。

![获取 JSON 键](/images/ns-ds-commander/node-get-json-keys.png)

<hr />

:::

::: json Json Has Key

检查 JSON 对象中是否包含指定键。

![JSON 包含键](/images/ns-ds-commander/node-json-has-key.png)

<hr />

:::

## 注意事项

1. **主服务器地址** - 默认 WebSocket 端口为 8088，请确保防火墙放行。
2. **密码认证** - 连接主服务器时需提供正确密码。
3. **DS 本地端口** - DS 默认通过本地 8081 端口连接子服务器。
4. **定时任务** - 通过 Web 管理端或 REST API 配置，到期前会提前通知 DS 释放。
5. **自定义字段** - 使用 `Report Custom Fields Data` 上报的字段可用于房间列表筛选。

## 技术支持

- 插件作者：NodeSmith
- Fab商店：com.epicgames.launcher://ue/Fab/product79aa810c-f7a0-4582-b257-287d7f42aefe
