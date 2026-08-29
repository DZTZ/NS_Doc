# NS_DS_Commander

## Plugin Introduction

NS_DS_Commander is the client-side plugin of a complete **UE5 Dedicated Server (DS) Scheduling & Matchmaking System**. It connects the UE side (player clients / DS game servers) to the Go-based server cluster, providing:

- Player matchmaking (grouped by map / region / team size / game mode)
- Server (room) query, manual creation and shutdown
- Player state synchronization (lobby / in game)
- Lobby chat and room chat
- DS registration, FPS reporting, custom field reporting, and joinable status control
- Server-pushed notifications, kicks, shutdown countdown events, etc.

**Module Information**

<table class="ns-module-table">
  <thead>
    <tr><th>Item</th><th>Value</th></tr>
  </thead>
  <tbody>
    <tr><td>Module Name</td><td><code>NS_DS_Commander</code></td></tr>
    <tr><td>Module Type</td><td>Runtime</td></tr>
    <tr><td>Dependencies</td><td>Core, CoreUObject, Engine, WebSockets, Json, JsonUtilities</td></tr>
    <tr><td>Engine Version</td><td>Unreal Engine 5.5</td></tr>
    <tr><td>Core Class</td><td><code>UNS_MatchmakingSubsystem</code> (GameInstance subsystem, blueprint display name <code>NS_Matchmaking Subsystem</code>)</td></tr>
    <tr><td>Utility Class</td><td><code>UNS_JsonUtilsBlueprintLibrary</code> (JSON utility library)</td></tr>
  </tbody>
</table>

## System Architecture

![System Architecture](../../images/ns-ds-commander/architecture.png)

## Quick Start

### Player Client Integration Flow

1. Get the **NS_Matchmaking Subsystem** via `Get Subsystem` in the Game Instance blueprint
2. Call **Connect To Server** with the WebSocket address and password
3. Bind the required events (`On Connection Success`, `On Match Result`, etc. — see the node documentation below)
4. After `On Connection Success` fires, call **Set Player Info** to set the player name and player ID
5. Call **Start Matchmaking** to begin matching; in `On Match Result`, get the server address and enter via `Open Level` / `Client Travel`

![Client Connection Flow](../../images/ns-ds-commander/flow-client-connect.png)

### DS Server Integration Flow

1. Get the **NS_Matchmaking Subsystem** in the DS GameMode blueprint
2. Call **DS Connect To Child Server**; the plugin automatically parses `-port=` from the command line and connects to the local child server
3. Call **DS Set Room Joinable Status** when needed to control whether new players can join
4. Call **DS Report Custom Fields Data** to report business custom fields (JSON string)
5. Bind `On DS Shutdown` to handle the scheduled shutdown countdown

![DS Connection Flow](../../images/ns-ds-commander/flow-ds-connect.png)

## Get Subsystem

The subsystem is a `UGameInstanceSubsystem`, unique across the entire Game Instance lifecycle. The WebSocket connection is **not disconnected when switching levels**.

Get it in blueprint:

![Get Subsystem](../../images/ns-ds-commander/get-subsystem.png)

## Enums & Structs

### EConnectionStatus

Connection success / player info confirmation result status.

| Value | Description |
|------|------|
| Normal | Connected successfully |
| Banned | Account is banned (triggered when the server returns `banned=true`) |

---
### ERoomSourceType

Room source type, used for `Get Room List` filtering and `Create Server` source.

| Value | Server `source_type` | Description |
|------|------|------|
| Match | `match` | Room automatically created by the matchmaking system |
| System | `system` | Room created by a system task |
| Activity | `activity` | Room created by an activity |

---
### EChatType

Chat type, used by `Send Chat Message`.

| Value | Description |
|------|------|
| Lobby | Lobby chat, visible to all online players |
| Room | Room chat, only visible to players in the current room |

---
### FRoomInfo (Room Info)

Room information struct returned by the `Get Room List` callback (read-only).

| Field | Type | Description |
|------|------|------|
| RoomName | String | Room name |
| MapName | String | Map name |
| GameMode | String | Game mode |
| Region | String | Region |
| ServerIP | String | Server IP |
| Port | Integer | Server port |
| CurrentPlayers | Integer | Current player count |
| MaxPlayers | Integer | Maximum player count |
| TeamSize | Integer | Team size |
| bAllowJoin | Boolean | Whether new players can join |
| bAllowMatch | Boolean | Whether the room can be found by matchmaking (defaults to true if not provided by the server) |
| SourceType | String | Source type: `match` / `system` / `activity` |
| PermissionTag | String | Permission tag (can be set for system / activity rooms) |
| FPS | Float | Current DS frame rate |

---
### FCreateServerParams (Create Server Params)

Input parameters for `Create Server`. Fields match the "Manual Create Server" dialog in the Web admin panel.

| Field | Type | Default | Description |
|------|------|--------|------|
| Region | String | Empty | Region (corresponds to a key in the server's `create_server_config`, e.g. `Asia` / `NA` / `EU`) |
| RoomName | String | Empty | Room name; auto-generated if empty |
| MapName | String | Empty | Map name (required) |
| GameMode | String | Empty | Game mode (required) |
| TeamSize | Integer | 1 | Team size (must be ≥ 1) |
| bAllowMatch | Boolean | false | Whether the room can be found by matchmaking |
| bUseIdleTimeout | Boolean | false | Whether idle timeout auto-close is enabled (false = not affected by `room_idle_timeout`) |
| SourceType | ERoomSourceType | System | Source type; Match is reserved for the matchmaking system, the plugin defensively maps it to System |
| PermissionTag | String | Empty | Permission tag for business-side permission checks |
| EndAfterDays | Integer | 0 | End days (all three zero = no end time, no auto release) |
| EndAfterHours | Integer | 0 | End hours (≤ 23) |
| EndAfterMinutes | Integer | 0 | End minutes (≤ 59) |
| NotifyBeforeMinutes | Integer | 0 | Minutes before end to notify the DS |

---
### FServerStats (Server Stats)

Statistics returned by the `Get Server Stats` callback (read-only).

| Field | Type | Description |
|------|------|------|
| LobbyPlayers | Integer | Players in lobby |
| MatchingPlayers | Integer | Players matchmaking |
| GamingPlayers | Integer | Players in game |
| TotalPlayers | Integer | Total online players |
| ServerCount | Integer | Number of child servers |
| RoomCount | Integer | Number of rooms |

## Blueprint Nodes

Nodes are classified into three categories by available role. There is a `NetMode` check inside the code; calling with a mismatched role returns nothing:

- **【Client】** Only callable by player clients; invalid on DS / listen servers
- **【DS】** Only callable by dedicated servers; invalid on clients
- **【Common】** Callable by both clients and DS

---

### Player-Side Functions

#### <span style="color:#41aef5">Connect To Server</span>【Client】

Connects to the master (matchmaking) server. It first writes the input parameters into the subsystem's config properties, then initiates the WebSocket connection. On successful connection, it automatically sends the auth message (`client_type = player`).

| Parameter | Type | Default | Description |
|------|------|--------|------|
| InWebSocketURL | String | - | Master server WebSocket address, e.g. `ws://127.0.0.1:8088/ws` |
| InPassword | String | - | Connection password (MD5 hashed inside the plugin before sending) |
| InReconnectAttempts | Integer | -1 | Reconnect attempts; -1 = unlimited |
| InReconnectDelay | Float | 5.0 | Reconnect interval (seconds) |

**Notes**

- Calling on a DS / listen server returns immediately with a warning log
- An empty URL returns immediately with an error log
- On a wrong password, the server disconnects and the plugin does **not** auto-reconnect (no retry on auth failure)
- `On Connection Success` only fires after `Set Player Info` is called

![Node - ConnectToServer](../../images/ns-ds-commander/node-connect-to-server.png)

---

#### <span style="color:#41aef5">Disconnect</span>【Client】

Disconnects the WebSocket and clears the reconnect timer.

![Node - Disconnect](../../images/ns-ds-commander/node-disconnect.png)

---

#### <span style="color:#41aef5">Is Connected</span>【Client】

Checks whether currently connected.

| Return | Type | Description |
|------|------|------|
| ReturnValue | Boolean | true when the WebSocket is connected **and** the player info has been confirmed by the server |

> After the DS connects to the child server, there is no player info confirmation step; it returns true as soon as the connection succeeds.

![Node - IsConnected](../../images/ns-ds-commander/node-is-connected.png)

---

#### <span style="color:#41aef5">Start Matchmaking</span>【Client】

Starts matchmaking.

| Parameter | Type | Default | Description |
|------|------|--------|------|
| MapName | String | - | Map name |
| Region | String | - | Region, e.g. `Asia` / `NA` / `EU` |
| TeamSize | Integer | 1 | Team size |
| GameMode | String | "1" | Game mode |

**Prerequisite**: `Is Connected` is true, `Set Player Info` has been called, and not currently matchmaking.

Receive the result via `On Match Result`; error code `1` keeps the matchmaking state and keeps waiting.

![Node - StartMatchmaking](../../images/ns-ds-commander/node-start-matchmaking.png)

---

#### <span style="color:#41aef5">Cancel Matchmaking</span>【Client】

Cancels the current matchmaking. Requires being connected and currently matchmaking.

![Node - CancelMatchmaking](../../images/ns-ds-commander/node-cancel-matchmaking.png)

---

#### <span style="color:#41aef5">Is Matchmaking</span>【Client】

Checks whether currently matchmaking.

| Return | Type | Description |
|------|------|------|
| ReturnValue | Boolean | Whether matchmaking has been started and has not finished yet |

![Node - IsMatchmaking](../../images/ns-ds-commander/node-is-matchmaking.png)

---

#### <span style="color:#41aef5">Set Player Info</span>【Client】

Sets and submits the player info. `On Connection Success` only fires after the server confirms it.

| Parameter | Type | Default | Description |
|------|------|--------|------|
| InPlayerName | String | - | Player name (cannot be empty) |
| InPlayerID | String | - | Player unique ID (cannot be empty) |
| CustomData | String | Empty | Optional custom data, passed through to the server as-is |

**Notes**

- Must be called after the WebSocket is connected (it is normal for `Is Connected` to still be false at that point)
- An empty player name or ID is skipped with a warning
- After a successful reconnection, the plugin re-sends the player info automatically; no need to call again

![Node - SetPlayerInfo](../../images/ns-ds-commander/node-set-player-info.png)

---

#### <span style="color:#41aef5">In Game</span>【Client】

Notifies the server that the player has entered the game (call after entering the DS map).

**Prerequisite**: connected, player info set, and a current room ID exists (automatically recorded from `room_id` in `On Match Result`).

> After calling, the current room and state are saved, and on disconnect/reconnect the "in game" state is restored automatically.

![Node - InGame](../../images/ns-ds-commander/node-in-game.png)

---

#### <span style="color:#41aef5">In Lobby</span>【Client】

Notifies the server that the player is back in the lobby (call when returning from the DS to the lobby).

**Note**: if not connected when called, the plugin retries every 1 second until the connection is available, then sends automatically. The current room ID is cleared after calling.

![Node - InLobby](../../images/ns-ds-commander/node-in-lobby.png)

---

#### <span style="color:#41aef5">Send Custom Operate Reply</span>【Client】

Replies with the result of a "custom operation" sent by the server. Must be called after receiving `On Message Notification` carrying a `request_id`.

| Parameter | Type | Description |
|------|------|------|
| Result | String | Processing result string, business-defined |

**Note**: returns immediately with an error log if there is no pending request ID; the request ID is cleared after a successful send.

![Node - SendCustomOperateReply](../../images/ns-ds-commander/node-send-custom-operate-reply.png)

---

#### <span style="color:#41aef5">Send Chat Message</span>【Client】

Sends a chat message.

| Parameter | Type | Description |
|------|------|------|
| ChatType | EChatType | Lobby = lobby chat; Room = room chat |
| InPlayerName | String | Sender name (cannot be empty) |
| Content | String | Message content (cannot be empty) |

**Notes**

- There is a **0.5 second** send interval rate limit; calls that are too frequent are dropped with a warning
- Room chat uses the current room ID recorded inside the plugin; sending without being in a room may be ineffective

![Node - SendChatMessage](../../images/ns-ds-commander/node-send-chat-message.png)

---

### DS-Side Functions

#### <span style="color:#f97316">DS Connect To Child Server</span>【DS】

Connects the DS to the local child server. The plugin automatically parses `-port=` from the startup command line (assigned and written into the launch arguments by the child server), connects to `ws://127.0.0.1:8081/ws` without authentication, then sends `ds_register` to register and starts **FPS auto-reporting every 5 seconds**.

**Notes**

- DS-only; invalid on clients
- Returns immediately with an error log if `-port=` is missing from the command line
- Connection timeout is 5 seconds; on failure, it reconnects up to 10 times at 5-second intervals
- The parsed port is reused by `Set Room Joinable Status` / `Report Custom Fields Data` / `DS Close Room`

![Node - DSConnectToChildServer](../../images/ns-ds-commander/node-ds-connect-to-child-server.png)

---

#### <span style="color:#f97316">DS Set Room Joinable Status</span>【DS】

Sets whether the current room allows new players to join (e.g. closing the room after the match starts).

| Parameter | Type | Description |
|------|------|------|
| bAllowJoin | Boolean | true = allow joining; false = disallow |

**Prerequisite**: connected to the child server and the port has been parsed successfully.

![Node - DSSetRoomJoinableStatus](../../images/ns-ds-commander/node-ds-set-room-joinable-status.png)

---

#### <span style="color:#f97316">DS Report Custom Fields Data</span>【DS】

Reports business custom fields; the data is synced with the room info to the master server and the Web admin panel.

| Parameter | Type | Description |
|------|------|------|
| JsonData | String | JSON string, e.g. `{"level":5,"mode":"rank"}` |

**Note**: if JSON parsing fails, it returns immediately with an error log; on success, the data is sent nested as a `custom_fields` object.

![Node - DSReportCustomFieldsData](../../images/ns-ds-commander/node-ds-report-custom-fields-data.png)

---

#### <span style="color:#f97316">DS Close Room</span>【DS】

The DS actively requests to close the current room immediately (e.g. match ended, match error, or self-check failure).

**Note**: only callable on a pure DS (`NM_DedicatedServer`); invalid on clients.

![Node - DSCloseRoom](../../images/ns-ds-commander/node-ds-close-room.png)

---

### Common Functions

#### <span style="color:#41aef5">Get Available Regions</span>【Common】

Gets the available region list, returned via an asynchronous callback. The plugin requests the latest list from the master server in real time and returns the result through the callback when `available_regions_response` is received.

| Parameter | Type | Description |
|------|------|------|
| OnComplete | Delegate | `bSuccess`(Boolean) + `Regions`(String array) |

**Notes**

- If not connected, the callback fires immediately with `bSuccess = false` and an empty array, without making a network request
- Callbacks are matched by `request_id` internally and can be called concurrently safely
- After the connection is confirmed, the plugin automatically fetches the region list from the server once to update the cache (no callback); no need to call manually

![Node - GetAvailableRegions](../../images/ns-ds-commander/node-get-available-regions.png)

---

#### <span style="color:#41aef5">Get Room List</span>【Common】

Gets the room list filtered by source type, returned via an asynchronous callback.

| Parameter | Type | Description |
|------|------|------|
| SourceType | ERoomSourceType | Filter type: Match / System / Activity |
| OnComplete | Delegate | `bSuccess`(Boolean) + `RoomList`(FRoomInfo array) |

**Notes**

- If not connected, the callback fires immediately with `bSuccess = false` and an empty array, without making a network request
- Callbacks are matched by `request_id` internally and can be called concurrently safely
- The server only returns rooms with an assigned port (DS already started), sorted by creation time in descending order

![Node - GetRoomList](../../images/ns-ds-commander/node-get-room-list.png)

---

#### <span style="color:#41aef5">Get Server Stats</span>【Common】

Gets the server cluster statistics, returned via an asynchronous callback.

| Parameter | Type | Description |
|------|------|------|
| OnComplete | Delegate | `bSuccess`(Boolean) + `Stats`(FServerStats) |

If not connected, the callback fires immediately with `bSuccess = false` and zero-value stats.

![Node - GetServerStats](../../images/ns-ds-commander/node-get-server-stats.png)

---

#### <span style="color:#41aef5">Create Server</span>【Common】

Manually creates a server (room). Parameters match the "Manual Create Server" dialog in the Web admin panel; the result is returned via an asynchronous callback.

| Parameter | Type | Description |
|------|------|------|
| Params | FCreateServerParams | Create parameters (see the struct description) |
| OnComplete | Delegate | `bSuccess`(Boolean) + `Message`(String) + `ErrorCode`(Integer) |

**Server validation rules**

- `Region`, `MapName`, `GameMode` cannot be empty
- `TeamSize` must be ≥ 1
- `EndAfterHours` ≤ 23, `EndAfterMinutes` ≤ 59; end-time fields cannot be negative
- `NotifyBeforeMinutes` cannot be negative

> A return of `bSuccess = true` means the **create request has been accepted** (the room waits for the cloud server to be created / the DS to start). You can then poll with `Get Room List` to check whether the room is ready.

![Node - CreateServer](../../images/ns-ds-commander/node-create-server.png)

---

## Events

All events are bindable multicast delegates. Bind them on the subsystem instance you obtained.

### <span style="color:#bd0907">On Connection Success</span>

Triggered after the player info is confirmed by the server (only on the first confirmation; re-sent info after reconnection does not trigger it again).

| Parameter | Type | Description |
|------|------|------|
| Status | EConnectionStatus | Normal = OK; Banned = account banned |

### <span style="color:#bd0907">On Connection Lost</span>

Triggered when the WebSocket connection is lost (connection error, closed by the server, etc.). After that, the plugin auto-reconnects according to `ReconnectAttempts` / `ReconnectDelay`.

### <span style="color:#bd0907">On Kicked From Game</span>

Triggered when kicked by the server.

| Parameter | Type | Description |
|------|------|------|
| KickDataJson | String | Full JSON string of the kick data; use the JSON utility functions to parse fields such as the reason |

### <span style="color:#bd0907">On Message Notification</span>

Triggered when a server notification is received, including global notifications and "custom operations" (operation requests sent to a specific player from the Web admin panel).

| Parameter | Type | Description |
|------|------|------|
| EventName | String | Event name; empty for normal notifications |
| Content | String | Notification content |

> If the notification carries a `request_id` (custom operation), the plugin caches it; you can then reply via **Send Custom Operate Reply**.

### <span style="color:#bd0907">On Match Result</span>

Matchmaking result callback.

| Parameter | Type | Description |
|------|------|------|
| ServerAddress | String | Assigned DS address (IP:Port); empty on error |
| ErrorCode | Integer | `0` = matched; `1` = no available server (still matchmaking); others = failure |

### <span style="color:#bd0907">On Lobby Chat Message</span>

Triggered when a lobby chat message is received.

| Parameter | Type | Description |
|------|------|------|
| SenderName | String | Sender name |
| Content | String | Message content |

### <span style="color:#bd0907">On Room Chat Message</span>

Triggered when a room chat message is received.

| Parameter | Type | Description |
|------|------|------|
| SenderName | String | Sender name |
| Content | String | Message content |

### <span style="color:#bd0907">On DS Shutdown</span>

**DS-specific event**. Shutdown countdown notification broadcast by the server when a scheduled / manually created room is about to expire and close.

| Parameter | Type | Description |
|------|------|------|
| RemainingSeconds | Integer | Seconds remaining before shutdown |

> Only the DS connected to a child server receives this event; player clients do not. Use it to show a "Server will close in N seconds" UI prompt and save results.

## JSON Utility Functions

`UNS_JsonUtilsBlueprintLibrary` provides lightweight JSON read/write capabilities, commonly used to parse the JSON string from `On Kicked From Game`. All three functions are pure functions (no exec pins) and can be called in the editor.

### Extract JSON Value

Gets a value by key from a JSON string and converts it to a string.

| Parameter / Return | Type | Description |
|------|------|------|
| JsonString | String | JSON string to parse |
| Key | String | Key to get |
| ReturnValue | String | Strings returned as-is; integers formatted as `%.0f`, decimals as `%.2f`; booleans as `true` / `false`; empty string if not found |

![Node - ExtractJsonValue](../../images/ns-ds-commander/node-extract-json-value.png)

---

### JSON Has Key

Checks whether a key exists in the JSON.

| Parameter / Return | Type | Description |
|------|------|------|
| JsonString | String | JSON string to parse |
| Key | String | Key to check |
| ReturnValue | Boolean | true if the key exists |

![Node - JsonHasKey](../../images/ns-ds-commander/node-json-has-key.png)

---

### Get JSON Keys

Gets all keys of a JSON object.

| Parameter / Return | Type | Description |
|------|------|------|
| JsonString | String | JSON string to parse |
| ReturnValue | String array | List of all keys; empty array if parsing fails or the string is empty |

![Node - GetJsonKeys](../../images/ns-ds-commander/node-get-json-keys.png)

---

## Notes

1. **Connection & Authentication**
   - The password is MD5 hashed (`FMD5::HashAnsiString`) before sending, and compared with the MD5 of the server-configured password
   - On auth failure the server actively disconnects and the plugin **does not reconnect**; check the password
   - `Is Connected` means "connected **and** player info confirmed", not whether the WebSocket is established

2. **Reconnection**
   - Auto-reconnects on connection error or close; interval controlled by `ReconnectDelay`, attempts by `ReconnectAttempts` (-1 = unlimited)
   - After reconnecting, the plugin re-sends the player info with the previous room ID and state to restore the "in game" state
   - `On Connection Success` does **not** fire again after reconnection (only on the first confirmation)

3. **Role Validation**
   - Client-only nodes return nothing with a warning log when called on a DS / listen server
   - DS-only nodes return nothing when called on a client
   - `DS Close Room` only works on a pure DS (`NM_DedicatedServer`)

4. **DS Port & Address**
   - The DS port comes from the `-port=` command line argument, assigned by the child server; no manual entry needed
   - The DS connects to the child server at a fixed `ws://127.0.0.1:8081/ws` (local child server listening, no auth)

5. **Async Callbacks**
   - `Get Room List` / `Get Server Stats` / `Create Server` match callbacks by `request_id` and can be called concurrently
   - Callbacks are not triggered on timeout; if the server does not respond, the callback is never called

6. **Other**
   - Chat messages are rate-limited to one send every 0.5 seconds
   - When the Game Instance is destroyed while the player is still in a room, the plugin automatically reports the `left_game` state
   - `Get Available Regions` returns the region list pushed by the server in real time via callback and updates the local cache, keeping consistent with `available_regions` in `master_config.json`
   - If the server does not provide the `allow_match` field, `FRoomInfo.bAllowMatch` stays `true`
