const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- 1. 請填入你的 HiveMQ 資訊 ---
const MQTT_URL = 'mqtts://f17a8164c5cb466da01ab155fdc041cf.s1.eu.hivemq.cloud'; 
const MQTT_USER = 'ag-4320';
const MQTT_PASS = 'Jason5238137';

// --- 2. 連接到 HiveMQ ---
const mqttClient = mqtt.connect(MQTT_URL, {
    username: MQTT_USER,
    password: MQTT_PASS
});

mqttClient.on('connect', () => {
    console.log('✅ 成功連線到 HiveMQ！');
    mqttClient.subscribe('esp32/data'); 
});

mqttClient.on('message', (topic, message) => {
    const value = message.toString();
    console.log("收到數據:", value);
    // 透過 Socket.io 把數據傳給網頁
    io.emit('mqtt_data', value); 
});

// --- 3. 設定靜態檔案路徑 ---
// 這行最重要，它讓 Render 知道要去 public 資料夾找你的 HTML/CSS
app.use(express.static(path.join(__dirname, 'public')));

// 預設路由：當有人打開網址，直接給他 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- 4. 啟動伺服器 ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('🚀 伺服器已啟動，監聽 Port:', PORT);
});
