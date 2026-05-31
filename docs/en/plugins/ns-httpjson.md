
# NS_HttpJson Plugin

## Introduction

NS_HttpJson provides easy-to-use HTTP request and JSON data processing functionality.

## Features

- Support for GET, POST, PUT, DELETE requests
- Automatic JSON serialization and deserialization
- Asynchronous request handling
- Error handling and retry mechanism

## Quick Start

### Sending GET Request

```cpp
UHttpJsonClient* Client = NewObject&lt;UHttpJsonClient&gt;();
Client-&gt;Get("https://api.example.com/data", [this](FHttpResponse Response) {
    if (Response.Success) {
        FJsonData Data = Response.GetJsonData();
        UE_LOG(LogTemp, Log, TEXT("Received: %s"), *Data.ToString());
    }
});
```

### Sending POST Request

```cpp
FJsonObject Payload;
Payload.SetStringField("username", "testuser");
Payload.SetNumberField("score", 100);

Client-&gt;Post("https://api.example.com/submit", Payload, [this](FHttpResponse Response) {
    // Handle response
});
```

## Screenshots

![HTTP Request Console](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=unreal%20engine%20http%20request%20console&image_size=landscape_16_9)

![JSON Data Viewer](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=unreal%20engine%20json%20data%20viewer&image_size=landscape_16_9)

## API Reference

### Get

```cpp
UFUNCTION(BlueprintCallable, Category = "HttpJson")
void Get(FString Url, FHttpResponseDelegate OnResponse);
```

Sends a GET request.

