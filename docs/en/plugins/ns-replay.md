
# NS_Replay Plugin

## Introduction

NS_Replay is a versatile full-featured replay system for Unreal Engine, supporting recording, file management, precise seeking, and state synchronization.

**Key Features:**
- Real-time game session recording
- Complete replay list management
- Precise time seeking
- Pause/resume playback support
- Adjustable playback speed
- Replay file deletion support

**Supported Platforms:**
- Windows (Win64)
- Mac
- iOS
- Android
- Linux

**Engine Version Requirement:** Unreal Engine 5.0.0+

## Installation

1. Copy the `NS_Replay` folder to your project's `Plugins` directory
2. Restart the Unreal Editor
3. Enable the **NS_Replay** plugin in the **Plugins** menu
4. Recompile your project

## Blueprint Node Reference

### StartRecording

Start recording a new replay.

Parameters:
- ReplayName (String) - Replay file name, uses default if empty

Returns:
- ReturnValue (Boolean) - Whether recording started successfully

### StopRecording

Stop current recording.

Parameters:
None

Returns:
- ReturnValue (Boolean) - Whether recording stopped successfully

### GetReplayList

Get all recorded replays.

Parameters:
- OutReplayList (FReplayInfo Array) - Output array of replay information

Returns:
- ReturnValue (Boolean) - Whether list was retrieved successfully

### PlayReplay

Play specified replay.

Parameters:
- ReplayName (String) - Name of replay to play

Returns:
- ReturnValue (Boolean) - Whether playback started successfully

### GetReplayTotalDuration

Get total duration of current replay (seconds).

Parameters:
None

Returns:
- ReturnValue (Float) - Total replay duration, returns 0.0 if no active replay

### SeekToTime

Jump to specified time in replay.

Parameters:
- TimeInSeconds (Float) - Target time (seconds)

Returns:
- ReturnValue (Boolean) - Whether seek was successful

### GetCurrentDateTime

Get current system date time in "YYYY-MM-DD HH-MM" format.

Parameters:
None

Returns:
- ReturnValue (String) - Formatted date time string

### GetCurrentReplayTime

Get current playback time of replay (seconds).

Parameters:
None

Returns:
- ReturnValue (Float) - Current playback time, returns 0.0 if no active replay

### PauseReplay

Pause replay playback.

Parameters:
None

Returns:
- ReturnValue (Boolean) - Whether pause was successful

### ResumeReplay

Resume replay playback.

Parameters:
None

Returns:
- ReturnValue (Boolean) - Whether resume was successful

### SetReplayPlaybackSpeed

Set replay playback speed.

Parameters:
- PlaybackSpeed (Float) - Playback speed, range 0.1 - 10.0, 1.0 is normal speed

Returns:
- ReturnValue (Boolean) - Whether speed was set successfully

### DeleteReplay

Delete specified replay file.

Parameters:
- ReplayName (String) - Name of replay to delete

Returns:
- ReturnValue (Boolean) - Whether deletion was successful

### IsWorldInReplay

Check if current world is in replay mode.

Parameters:
None

Returns:
- ReturnValue (Boolean) - Whether in replay mode

## Notes

1. **File Storage Location** - Replay files are stored in `[ProjectDir]/Saved/Demos/` folder by default
2. **Name Generation** - If no replay name is specified, auto-generated format is `Replay_YYYYMMDD_HHMMSS`
3. **Speed Limits** - Playback speed is limited between 0.1x and 10x
4. **Actor Replication** - Ensure Actors you want to record have proper replication properties set
5. **Network Mode** - Replay system works in both standalone and network modes

## Technical Support

- Author: NodeSmith
- Official Documentation: https://dztz.github.io/NS_Document/Replay/indexEn.html
- Fab Store: com.epicgames.launcher://ue/Fab/product79aa810c-f7a0-4582-b257-287d7f42aefe

