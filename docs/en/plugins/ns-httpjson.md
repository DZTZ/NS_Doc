# NS_HttpJson

## Plugin Introduction

NS_HttpJson is a UE Blueprint plugin for **HTTP communication and JSON data processing**. It provides ready-to-use Blueprint nodes for:

- HTTP requests: supports `GET` / `POST` / `PUT` / `DELETE` / `PATCH`, with custom headers and Post Data
- File download: progress feedback, save-path control, automatic renaming and timeout control
- File upload: uploads local files as `multipart/form-data`, with extra form fields and progress feedback
- JSON parsing: extract String / Int / Float / Bool / Array by `Key` or dot-notation `Path`, including JSON nested inside strings
- JSON building & editing: serialize a `Map` / array into JSON in one step, or modify nested values of an existing JSON
- Struct conversion: convert custom structs to/from JSON, including arrays and common types such as `FVector` / `FRotator` / `FTransform`

**Module Information**

<table class="ns-module-table">
  <thead>
    <tr><th>Item</th><th>Value</th></tr>
  </thead>
  <tbody>
    <tr><td>Module Name</td><td><code>NS_HttpJson</code></td></tr>
    <tr><td>Module Type</td><td>Runtime (Loading Phase: PreLoadingScreen)</td></tr>
    <tr><td>Dependencies</td><td>Core, CoreUObject, Engine, Slate, SlateCore, HTTP, Json, JsonUtilities</td></tr>
    <tr><td>Engine Version</td><td>Unreal Engine 5.x (current project based on UE 5.5)</td></tr>
    <tr><td>Supported Platforms</td><td>Win64, Mac, iOS, Android, Linux</td></tr>
    <tr><td>Core Classes</td><td><code>UNS_HttpJsonAsyncAction</code> (HTTP request), <code>UNS_FileUploadAsyncAction</code> (file upload), <code>UNS_FileDownloadAsyncAction</code> (file download)</td></tr>
    <tr><td>Utility Class</td><td><code>UNS_HttpJsonBPLibrary</code> (JSON utility library)</td></tr>
    <tr><td>Blueprint Categories</td><td>NS Http (request / upload / download), NS Json (JSON utility functions)</td></tr>
  </tbody>
</table>

> All HTTP nodes are **async actions**: they return immediately, and results are delivered asynchronously through the output exec pins (`On Completed`, `On Progress`) without blocking the game thread.

## Enumerations

### ENS_RequestType

The request-method selector for `NS Send HTTP Request`.

| Value | Description |
|------|------|
| GET | Retrieves a resource. `Post Data` is appended to the URL as query parameters (e.g. `?a=1&b=2`) |
| POST | Submits data. `Post Data` is serialized into a JSON request body |
| PUT | Updates a resource. `Post Data` is serialized into a JSON request body |
| DELETE | Deletes a resource. `Post Data` is appended to the URL as query parameters |
| PATCH | Partially updates a resource. `Post Data` is serialized into a JSON request body |

## HTTP Request Nodes

### <span style="color:#41aef5">NS Send HTTP Request</span> (Async)

A general-purpose HTTP request node supporting all five methods, custom headers and request body data.

| Parameter | Type | Default | Description |
|------|------|--------|------|
| URL | String | - | The full address of the target server, e.g. `https://api.example.com/data` |
| Request Type | ENS_RequestType | GET | The request method (see the table above) |
| Header | Map\<String, String\> | Empty | Optional: custom HTTP headers, such as `Authorization`, `Accept`, etc. |
| Post Data | Map\<String, String\> | Empty | Query parameters for GET / DELETE; request body data for POST / PUT / PATCH |
| Timeout | Float | 120.0 | Request timeout in seconds; treated as a failure when exceeded |

**Outputs (after On Completed)**

| Output | Type | Description |
|------|------|------|
| Response Json | String | The raw response content returned by the server (usually a JSON string) |
| Response Code | Integer | The HTTP status code returned by the server (`200` means success); `0` on network error / timeout / no response |

**Notes**

- `Post Data` does not need to be pre-formatted as JSON: for POST / PUT / PATCH the plugin serializes the Map into a JSON object and **automatically sets `Content-Type: application/json`**
- For GET / DELETE the `Post Data` is appended as a `key=value&...` query string **without URL encoding** — handle special characters yourself
- When the request fails or no valid response is received, `Response Json` is an empty string and `Response Code` is `0`; use that to decide whether the request really succeeded
- Multiple requests can safely run concurrently; every async node reports back independently

![Node - NSSendHttpRequest](../../images/ns-httpjson/http.png)

---

### <span style="color:#41aef5">NS Download File</span> (Async)

Downloads a file from the given URL and saves it locally, with progress feedback, relative-path support and timeout control.

| Parameter | Type | Default | Description |
|------|------|--------|------|
| Download URL | String | - | The full download URL of the file (HTTP / HTTPS) |
| Save Path | String | - | The **directory** to save into. When relative, it is based on the `[Project]/Content/` folder |
| Is Relative Path | Boolean | true | true = `Save Path` is a relative path; false = absolute path |
| Timeout | Float | 120.0 | Download timeout in seconds |
| File Name Alias | String | Empty | Optional: replaces the file name of the downloaded file; leave empty to use the original file name from the URL |

**Outputs (after On Completed)**

| Output | Type | Description |
|------|------|------|
| Success | Boolean | Whether the download finished and the file was written successfully |
| Saved File Path | String | The full path where the file was finally saved |
| File Name | String | The final file name (the alias may have been applied) |
| Progress Ratio | Float | Progress ratio, `1.0` when complete |

**Outputs (fired repeatedly by On Progress)**

| Output | Type | Description |
|------|------|------|
| Progress Ratio | Float | Current download progress ratio (0.0 ~ 1.0) |
| Bytes Received | Integer64 | Bytes received so far |
| Total Bytes | Integer64 | Total size in bytes; `-1` when the server sends no `Content-Length` (the progress is then an estimate) |

**Notes**

- The file name is taken from the last segment of the URL path by default (query parameters are stripped); if the URL has no file name at the end, `downloaded_file` is used
- `File Name Alias` only replaces the base name and **keeps the original extension** (e.g. `a.zip` with alias `my` becomes `my.zip`); if the original file has no extension the alias is used as-is
- The plugin creates missing save directories automatically (including nested levels)
- Unlike upload, download only checks whether a **valid response** was received and does not validate a 2xx status code — a 404 / 500 body is still saved, so validate it against your business rules
- The file is fully buffered in memory before being written to disk, so it is not suitable for extremely large files

![Node - NSDownloadFile](../../images/ns-httpjson/download.png)

---

### <span style="color:#41aef5">NS Upload File</span> (Async)

Uploads a local file as `multipart/form-data`, with progress tracking, custom headers and extra form fields.

| Parameter | Type | Default | Description |
|------|------|--------|------|
| Upload URL | String | - | The endpoint on the server that accepts the upload |
| File Path | String | - | The local file path to upload; a relative path is based on the `[Project]/Content/` folder |
| File Field Name | String | Empty | The form field name for the file; defaults to `file` when empty |
| Header | Map\<String, String\> | Empty | Optional: custom HTTP headers (e.g. an auth token) |
| Post Data | Map\<String, String\> | Empty | Optional: **extra form fields** sent with the request (e.g. user ID, file description), written before the file field |
| Is Relative Path | Boolean | true | true = `File Path` is a relative path; false = absolute path |
| Timeout | Float | 120.0 | Upload timeout in seconds |

**Outputs (after On Completed)**

| Output | Type | Description |
|------|------|------|
| Success | Boolean | Whether the upload succeeded (2xx response code) |
| Response Content | String | The raw response returned by the server (usually a JSON feedback) |
| Response Code | Integer | The HTTP status code returned by the server |
| Progress Ratio | Float | Progress ratio, `1.0` when complete |

**Outputs (fired repeatedly by On Progress)**

| Output | Type | Description |
|------|------|------|
| Progress Ratio | Float | Current upload progress ratio (0.0 ~ 1.0) |
| Bytes Sent | Integer64 | Bytes sent so far |
| Total Bytes | Integer64 | Total bytes to upload |

**Notes**

- Unlike download, an upload is considered successful **only when the server returns a 2xx status code**; otherwise `Success = false` and `Response Content` holds the error returned by the server
- If the file does not exist or cannot be read, the node reports back immediately: `Success = false`, `Response Code = 0`, with the reason in `Response Content` (e.g. `File not found: xxx`)
- The file field's `Content-Type` is fixed to `application/octet-stream`; the multipart boundary is generated automatically by the plugin
- The upload method is always `POST`

![Node - NSUploadFile](../../images/ns-httpjson/Upload.png)

## JSON Reading Nodes

All JSON reading nodes are **pure functions (no exec pins)** and can be used directly as value getters in Blueprints — pass in the JSON string and read the result.

They fall into two groups:

- **Value nodes**: read a `Key` from the **top-level object** of the JSON, best for flat structures
- **Path nodes**: use a dot-notation `Path` (e.g. `user.info.name`) to reach nested fields at any depth

> Both groups also handle JSON nested inside strings — a field value formatted as `"{...}"` / `"[...]"` can still be traversed further.

### <span style="color:#41aef5">NS Json Value To String / Int / Float / Bool</span>

Extracts the value for a `Key` from the JSON object and converts it to the target type.

**Shared inputs**

| Parameter | Type | Description |
|------|------|------|
| Json String | String | The JSON string to parse (usually from `Response Json` of `NS Send HTTP Request`) |
| Key | String | The target key, matched at the top level only. E.g. for `{"user_id": 123}` use `user_id` |

**Return values**

| Node | Return type | Description |
|------|---------|------|
| NS Json Value To String | String | Strings pass through unchanged; numbers / booleans become strings; objects / arrays become compact JSON strings |
| NS Json Value To Int | Integer | Rounds the number to an integer |
| NS Json Value To Float | Float | Returns the number |
| NS Json Value To Bool | Boolean | Returns the boolean |

**Note**: when the key is missing, the JSON fails to parse, or the type does not match, String returns an empty string, Int returns `0`, Float returns `0.0` and Bool returns `false`.

![Node group - NSJsonValueToType](../../images/ns-httpjson/getvalue.png)

---

### <span style="color:#41aef5">NS Json Path To String / Int / Float / Bool</span>

Deep JSON data extraction: use a dot-notation `Path` to reach nested structures directly, without multi-step parsing.

**Shared inputs**

| Parameter | Type | Description |
|------|------|------|
| Json String | String | The JSON string to parse |
| Path | String | A dot-notation path. E.g. for `{"user":{"info":{"name":"Test"}}}`, use `user.info.name` to get the name |

**Return values** are the same as the Value group (String / Int / Float / Bool), depending on the node you use.

**Note**: when any segment of the path is missing, is not an object, or cannot be traversed, the node returns the default value of the target type (`""` / `0` / `0.0` / `false`); the path can also pass through JSON objects nested inside strings.

![Node group - NSJsonPathToType](../../images/ns-httpjson/getvalue2.png)

---

### <span style="color:#41aef5">NS Json Value / Path To Array</span>

Extracts a JSON array into a Blueprint array variable. Six nodes are provided:

| Node | Inputs | Return type |
|------|------|---------|
| NS Json Value To Array (String) | Json String + Key | String array |
| NS Json Value To Array (Int) | Json String + Key | Integer array |
| NS Json Value To Array (Float) | Json String + Key | Float array |
| NS Json Path To Array (String) | Json String + Path | String array |
| NS Json Path To Array (Int) | Json String + Path | Integer array |
| NS Json Path To Array (Float) | Json String + Path | Float array |

**Details**

- Works with real arrays (`"scores":[10,20,30]`) as well as arrays stored as strings (`"scores":"[10,20,30]"`)
- Elements are converted automatically: e.g. the Int nodes turn numbers, strings (`Atoi`) and booleans (true = 1) into integers
- If the key / path is missing, is not an array, or a conversion fails, an **empty array** is returned (no error)

![Node group - NSJsonValuePathToArray](../../images/ns-httpjson/getvalueArr.png)

## JSON Building Nodes

### <span style="color:#41aef5">NS Map To Json</span>

Serializes a Blueprint `Map<String, String>` into a JSON object string — the core tool for building HTTP request bodies.

| Parameter / Return | Type | Description |
|------|------|------|
| Map | Map\<String, String\> | Keys become JSON field names, values become field values |
| Return Value | String | The serialized JSON string |

**Automatic nesting rules**

If a Map value is itself valid `{...}` (object) or `[...]` (array) text, it is parsed automatically into a nested object / array; otherwise it is stored as a plain string value.

For example, feeding the output of **NS Int Array To Json** (`[10,20,30]`) as a Map value produces nested JSON like `{"user_id":"101","scores":[10,20,30]}`.

> Since `TMap` is unordered under the hood, the **field order of the output JSON is not guaranteed** to match insertion order — do not rely on ordering (JSON semantics do not depend on it either).

![Node - NSMapToJson](../../images/ns-httpjson/makeJson.png)

---

### <span style="color:#41aef5">NS String / Int / Float Array To Json</span>

Quickly serializes primitive-type arrays into JSON array strings. Three nodes are provided:

| Node | Input type | Returns | Example output |
|------|---------|------|---------|
| NS String Array To Json | String array | String | `["item1","item2"]` |
| NS Int Array To Json | Integer array | String | `[10,20,30]` |
| NS Float Array To Json | Float array | String | `[1.5,2.5]` |

**Note**: elements of a String array that look like `{...}` / `[...]` text are parsed into nested objects / arrays as well. The serialized result is commonly used as a sub-value (string) inside the Map of **NS Map To Json** to build complex request bodies.

![Node group - NSArrayToJson](../../images/ns-httpjson/makearr.png)

---

### <span style="color:#41aef5">NS Json Array To String Array</span>

Converts a **pure array string without keys** into a String array, for interfaces that return values such as `["key1","key2",...]`.

| Parameter / Return | Type | Description |
|------|------|------|
| Json Array String | String | Must be a valid JSON array wrapped in `[` `]`, e.g. `["apple","banana"]` |
| Return Value | String array | The converted string array |

**Note**: number, boolean, nested object / array elements are also converted to strings; if the input cannot be parsed at all, the original input is returned as a single-element array.

![Node - NSJsonArrayToStringArray](../../images/ns-httpjson/arrtojson.png)

## JSON Editing Nodes

### <span style="color:#41aef5">NS Set Json Value (String / Int / Float / Bool)</span>

Sets (adds or overwrites) one field in an existing JSON and returns the modified full JSON string. Four nodes are provided, distinguished by the type of the `Value` parameter.

| Parameter | Type | Description |
|------|------|------|
| Json String | String | The original JSON string |
| Key | String | The field key; **supports dot-notation paths**, e.g. `data.name` modifies a nested field |
| Value | String / Integer / Float / Boolean | The value to write, depending on the node type |
| Return Value | String | The modified full JSON string |

**Notes**

- `Key` supports dot-notation paths: missing intermediate nodes are **created as objects automatically**; if an intermediate node is JSON nested inside a string, it is parsed, modified and written back as a string
- If the JSON fails to parse, the input `Json String` is returned unchanged, so no data is lost

![Node group - NSSetJsonValue](../../images/ns-httpjson/set-json-value.png)

## Struct Conversion Nodes

The struct-to-JSON conversion nodes are reflection-based and work well with HTTP responses for typed "JSON → struct variable" reads.

There are four nodes, grouped by **conversion direction**:

- **Parsing direction (JSON → Struct)**: fills struct variables from JSON — `NS Json To Struct` (single object), `NS Json To Struct Array` (array of objects)
- **Serialization direction (Struct → JSON)**: outputs struct variables as JSON strings — `NS Struct To Json` (single struct), `NS Struct Array To Json` (array of structs)

Both directions share the same reflection rules:

- Field names match the names shown in the editor for the struct (case-sensitive); properties without a matching JSON field keep their original value
- Bool / Int / Int64 / Float / String, nested structs, one-dimensional basic arrays are supported, plus `FVector` / `FRotator` / `FTransform`

### Parsing Direction: JSON → Struct

Parse JSON returned by the server straight into struct variables, avoiding per-field extraction. Both nodes **modify the target variable in place (they have exec pins)**; when the JSON is invalid or fields are missing the original data stays unchanged, so they are safe for tolerant reads.

#### <span style="color:#41aef5">NS Json To Struct</span>

Fills a struct variable from a single JSON object string, matching fields by name.

| Parameter | Type | Description |
|------|------|------|
| Json String | String | The JSON object string to parse |
| In Out Struct | Any struct | The target struct variable, filled after the call |

> In JSON, `FVector` / `FRotator` / `FTransform` can be object forms (`{X,Y,Z}` / `{Pitch,Yaw,Roll}`) or UE string forms.

#### <span style="color:#41aef5">NS Json To Struct Array</span>

Parses a JSON array string and fills a struct-array variable.

| Parameter | Type | Description |
|------|------|------|
| Json String | String | The JSON array string to parse |
| In Out Struct Array | Struct array | The target struct-array variable, filled after the call |

> Array elements can be JSON objects or JSON objects nested inside strings; the array stays unchanged if parsing fails.

![Node group - NSJsonToStruct / NSJsonToStructArray](../../images/ns-httpjson/json-to-struct.png)

---

### Serialization Direction: Struct → JSON

Serializes struct variables into JSON, commonly used to pack config / result objects into request bodies before uploading. Both nodes are **pure functions**. On failure they return `{}` / `[]` respectively.

#### <span style="color:#41aef5">NS Struct To Json</span>

Serializes a single struct into a JSON object string.

| Parameter / Return | Type | Description |
|------|------|------|
| In Struct | Any struct | The struct variable to serialize |
| Return Value | String | The JSON string; returns `{}` on failure |

> `FVector` / `FRotator` / `FTransform` are emitted as UE `ToString` strings; nested structs are emitted as JSON objects.

#### <span style="color:#41aef5">NS Struct Array To Json</span>

Serializes an array of structs into a JSON array string.

| Parameter / Return | Type | Description |
|------|------|------|
| In Struct Array | Struct array | The elements must be structs |
| Return Value | String | The JSON array string; returns `[]` on failure |

![Node group - NSStructToJson / NSStructArrayToJson](../../images/ns-httpjson/struct-to-json.png)

## Notes

1. **Requests & callbacks**
   - `NS Send HTTP Request` calls back **exactly once** for success / failure: a valid response triggers the callback with its status code; network errors / timeouts call back with an empty response and code `0`
   - An upload succeeds only with a `2xx` status code; a download only checks whether a response body was received and does not validate the status code
   - All three HTTP nodes are async actions registered with the GameInstance, so they can safely run concurrently

2. **Post Data / request body**
   - For GET / DELETE the `Post Data` becomes a query string (appended with `&` when the URL already contains `?`), **without URL encoding**
   - For POST / PUT / PATCH the `Post Data` is serialized into a JSON request body and `Content-Type: application/json` is set automatically (it overrides the same-named preset value in `Header`)

3. **Path meaning**
   - When `Is Relative Path` is checked for upload / download, `File Path` / `Save Path` are relative to the `[Project]/Content/` directory (`ProjectContentDir`)
   - The download `Save Path` is the target **directory** (created automatically if missing); the file name comes from the URL or `File Name Alias`

4. **JSON extraction**
   - `NS Json Value To X` reads only top-level keys, while `NS Json Path To X` traverses deep paths with dot notation; both handle JSON nested inside strings
   - Extraction never fails hard: String returns an empty string, Int returns `0`, Float returns `0.0`, Bool returns `false`, arrays return empty — confirm the field exists first

5. **Map to JSON**
   - `TMap` is unordered, so the field order of `NS Map To Json` output is not guaranteed; for order-dependent servers prefer the struct conversion nodes
   - Generate an array text with `[Type] Array To Json` and use it as a Map value, then run `NS Map To Json` to build nested structures — the recommended way to assemble complex request bodies

6. **Struct conversion**
   - Field names match the names shown in the editor, case-sensitive; mark your structs with `BlueprintType` so they can be created as variables
   - `NS Json To Struct` / `NS Json To Struct Array` keep the original data unchanged when JSON parsing fails, so they are safe for tolerant reads
