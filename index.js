const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './whatsapp_sessions' }),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    }
});

client.on('qr', (qr) => {
    console.log('--- امسح الـ QR Code ده من لوحة تحكم Render (Logs) ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ تم الاتصال بالواتساب بنجاح والبوت شغال في السحابة!');
    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        console.log('--- قائمة الجروبات والـ IDs بتاعتها ---');
        groups.forEach(group => {
            console.log(`اسم الجروب: ${group.name} | الـ ID: ${group.id._serialized}`);
        });
    } catch (err) {
        console.log('خطأ في جلب الجروبات:', err);
    }
});

app.post('/send-attendance', async (req, res) => {
    const { groupId, message } = req.body;
    if (!groupId || !message) {
        return res.status(400).json({ status: 'error', message: 'بيانات ناقصة' });
    }
    try {
        await client.sendMessage(groupId, message);
        res.json({ status: 'success', message: 'تم إرسال الرسالة للجروب' });
    } catch (error) {
        console.error('خطأ في الإرسال:', error);
        res.status(500).json({ status: 'error', message: 'فشل إرسال الرسالة' });
    }
});

app.get('/', (req, res) => {
    res.send('Attendance Bot Server is Running Successfully! 🚀');
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على البورت ${PORT}`);
});