
# NS_DS_Commander Plugin

## Introduction

NS_DS_Commander is a dedicated server (DS) scheduling and management tool. It provides matchmaking, room management, server health monitoring, and scheduled task capabilities between a master server, child servers, and UE clients.

**Key Features:**
- Master server handles regions, room matchmaking, and cloud server lifecycle
- Child server manages local DS processes and forwards master-DS communication
- UE client blueprint nodes for matchmaking, connection, and state reporting
- Scheduled tasks (Cron) for automatic room creation and release
- Custom field data reporting for room filtering and display

**Engine Version:** Unreal Engine 5.0+

## System Architecture

![System Architecture](/images/ns-ds-commander/architecture.png)

<hr />

## Quick Start

### Get Subsystem

All client blueprint nodes are called through the `NS_Matchmaking Subsystem`. Get this subsystem instance before using any node.

![Get Subsystem](/images/ns-ds-commander/get-subsystem.png)

<hr />

## Connection Flow

### Client Connect to Main Server

The client connects to the master server via WebSocket. After authentication, it can matchmake, fetch room lists, etc.

![Client Connection Flow](/images/ns-ds-commander/flow-client-connect.png)

<hr />

### DS Connect to Child Server

The dedicated server connects to the local child server after startup. The child server then maintains communication with the master server for registration and heartbeat.

![DS Connection Flow](/images/ns-ds-commander/flow-ds-connect.png)

<hr />

## Client Nodes

::: client Connect to Server

Connect to the master server using a WebSocket URL and password. This is a prerequisite for all other client nodes.

![Connect to Server](/images/ns-ds-commander/node-connect-to-server.png)

<hr />

:::

::: client Disconnect

Disconnect from the master server.

![Disconnect](/images/ns-ds-commander/node-disconnect.png)

<hr />

:::

::: client Is Connected

Check whether the client is currently connected to the master server.

![Is Connected](/images/ns-ds-commander/node-is-connected.png)

<hr />

:::

::: client In Lobby

Mark the client as being in the lobby state.

![In Lobby](/images/ns-ds-commander/node-in-lobby.png)

<hr />

:::

::: client In Game

Mark the client as being in an active game match.

![In Game](/images/ns-ds-commander/node-in-game.png)

<hr />

:::

::: client Set Player Info

Set custom player information such as nickname, avatar, rank, etc., for matchmaking and room display.

![Set Player Info](/images/ns-ds-commander/node-set-player-info.png)

<hr />

:::

::: client Send Chat Message

Send a chat message to the current room.

![Send Chat Message](/images/ns-ds-commander/node-send-chat-message.png)

<hr />

:::

::: client Send Custom Operate Reply

Send a custom operation reply, commonly used for client responses after server-issued commands.

![Send Custom Operate Reply](/images/ns-ds-commander/node-send-custom-operate-reply.png)

<hr />

:::

::: client Start Matchmaking

Start matchmaking. The client requests the master server to join an available room or create a new room in the specified region.

![Start Matchmaking](/images/ns-ds-commander/node-start-matchmaking.png)

<hr />

:::

::: client Cancel Matchmaking

Cancel the current matchmaking request.

![Cancel Matchmaking](/images/ns-ds-commander/node-cancel-matchmaking.png)

<hr />

:::

::: client Is Matchmaking

Check whether the client is currently matchmaking.

![Is Matchmaking](/images/ns-ds-commander/node-is-matchmaking.png)

<hr />

:::

::: client Get Available Regions

Asynchronously request the latest available regions from the master server. The result is returned via the `OnComplete` callback when the server responds, and the local cache is updated at the same time.

| Parameter | Type | Description |
|------|------|------|
| OnComplete | Delegate | `bSuccess`(Boolean) + `Regions`(String array) |

> If not connected, the callback fires immediately with `bSuccess = false` and an empty array, without making a network request. After the connection is confirmed, the plugin automatically fetches the region list from the server once to update the local cache.

![Get Available Regions](/images/ns-ds-commander/node-get-available-regions.png)

<hr />

:::

::: client Create Server

Create a new dedicated server room in the specified region.

![Create Server](/images/ns-ds-commander/node-create-server.png)

<hr />

:::

::: client Get Room List

Get the room list, optionally filtered by region and game mode.

![Get Room List](/images/ns-ds-commander/node-get-room-list.png)

<hr />

:::

::: client Get Server Stats

Get server runtime statistics such as CPU, memory, and online player count.

![Get Server Stats](/images/ns-ds-commander/node-get-server-stats.png)

<hr />

:::

## DS Server Nodes

The following nodes run on the Dedicated Server (DS) side to interact with the scheduling system.

::: ds DS Connect to Child Server

The DS connects to the local child server after startup.

![DS Connect to Child Server](/images/ns-ds-commander/node-ds-connect-to-child-server.png)

<hr />

:::

::: ds DS Close Room

Close the current room. Usually called during scheduled release or admin-initiated shutdown.

![DS Close Room](/images/ns-ds-commander/node-ds-close-room.png)

<hr />

:::

::: ds DS Set Room Joinable Status

Set whether the room allows new players to join.

![DS Set Room Joinable Status](/images/ns-ds-commander/node-ds-set-room-joinable-status.png)

<hr />

:::

::: ds DS Report Custom Fields Data

Report custom field data to the scheduling system for room filtering and display.

![DS Report Custom Fields Data](/images/ns-ds-commander/node-ds-report-custom-fields-data.png)

<hr />

:::

## JSON Utility Nodes

::: json Extract Json Value

Extract the value of a specified key from a JSON string.

![Extract Json Value](/images/ns-ds-commander/node-extract-json-value.png)

<hr />

:::

::: json Get Json Keys

Get all top-level keys from a JSON object.

![Get Json Keys](/images/ns-ds-commander/node-get-json-keys.png)

<hr />

:::

::: json Json Has Key

Check whether a JSON object contains the specified key.

![Json Has Key](/images/ns-ds-commander/node-json-has-key.png)

<hr />

:::

## Notes

1. **Master Server Address** - Default WebSocket port is 8088. Make sure the firewall allows it.
2. **Password Authentication** - A valid password is required when connecting to the master server.
3. **DS Local Port** - DS connects to the child server via local port 8081 by default.
4. **Scheduled Tasks** - Configure via the Web admin panel or REST API. DS will be notified before release.
5. **Custom Fields** - Fields reported by `Report Custom Fields Data` can be used for room list filtering.

## Support

- Author: NodeSmith
- Fab Store: com.epicgames.launcher://ue/Fab/product79aa810c-f7a0-4582-b257-287d7f42aefe
