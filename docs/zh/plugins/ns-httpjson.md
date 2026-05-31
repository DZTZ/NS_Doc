
# NS_HttpJson 插件

## 简介

NS_HttpJson 提供了简单易用的 HTTP 请求和 JSON 数据处理功能。

## 功能特性

- 支持 GET、POST、PUT、DELETE 请求
- 自动 JSON 序列化和反序列化
- 异步请求处理
- 错误处理和重试机制

## 快速开始

### 发送 GET 请求

```cpp
UHttpJsonClient* Client = NewObject&lt;UHttpJsonClient&gt;();
Client-&gt;Get("https://api.example.com/data", [this](FHttpResponse Response) {
    if (Response.Success) {
        FJsonData Data = Response.GetJsonData();
        UE_LOG(LogTemp, Log, TEXT("Received: %s"), *Data.ToString());
    }
});
```

### 发送 POST 请求

```cpp
FJsonObject Payload;
Payload.SetStringField("username", "testuser");
Payload.SetNumberField("score", 100);

Client-&gt;Post("https://api.example.com/submit", Payload, [this](FHttpResponse Response) {
    // 处理响应
});
```

## 截图

![HTTP 请求控制台](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=unreal%20engine%20http%20request%20console&image_size=landscape_16_9)

![JSON 数据查看器](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=unreal%20engine%20json%20data%20viewer&image_size=landscape_16_9)

## API 参考

### Get

```cpp
UFUNCTION(BlueprintCallable, Category = "HttpJson")
void Get(FString Url, FHttpResponseDelegate OnResponse);
```

发送 GET 请求。

