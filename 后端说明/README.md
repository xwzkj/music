# 后端需要自行搭建！
首先是Netease Cloud Music Api 自行寻找并搭建
然后你最好在本项目的nginx/apache等的配置文件设置一个反代 比如 /api指向 你的api

示例
```
location /api {
proxy_pass http://127.0.0.1:3000;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header REMOTE-HOST $remote_addr;        
proxy_set_header X-Host $host:$server_port;
proxy_set_header X-Scheme $scheme;
}
```
你还需要配置一个我自己写的api 包含获取客户端ip的功能 同样设置反代

最终是
yourdomain.com/api => NeteaseCloudMusicApi
yourdomain.com/api/api => 我写的api

当然你也可以自定义 api有跨域处理
