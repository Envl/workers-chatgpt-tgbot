# Telegram Bot for ChatGPT running on Cloudflare Workers

## feature

- supports thread  
![image](https://user-images.githubusercontent.com/9925116/206849903-fe23684c-be9e-4b7b-9215-2e1aed8076c2.png)


## usage

### 0. install dependencies

`pnpm i`

### 1. fill in cookie and access tokens in `wrangler.toml`

```
TG_BOT_TOKEN = "<TELEGRAM_BOT_TOKEN>"
CHAT_GPT_COOKIE="<CHAT_GPT_COOKIE>"

[[kv_namespaces]]
binding = "KV_STORE"
id = "<WORKERS_KV_ID>"
```

### 1. generate types for environment variables

`wrangler types`

### 2. dev

`wrangler dev`

### 3. publish

`wrangler publish`
