const http = require('http');

// 创建服务器
const server = http.createServer((req, res) => {
    // 获取客户端的IP地址
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // 设置响应头和内容类型
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
    });
    // 返回客户端IP地址
    res.end(clientIp);
});

// 监听指定端口
const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
