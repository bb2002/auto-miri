const { Client, GatewayIntentBits } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

exports.initDiscord = async function() {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

    // DISCORD 봇 로그인
    client.login(BOT_TOKEN);

    await (new Promise((resolve, reject) => {
        client.on('ready', () => {
            console.log(`[DISCORD] Logged in as ${client.user.tag}`);
            resolve();
        })
    }))
}

exports.sendMessage = async function(message, img) {
    const CHANNEL_ID = process.env.DISCORD_CHANNEL;

    await (new Promise((resolve, reject) => {
        // 예약 메시지 전달
        client.channels.cache.get(CHANNEL_ID).send(message);

        if (img) {
            const file = new AttachmentBuilder(img);
            client.channels.cache.get(CHANNEL_ID).send({ files: [file] });
        }

        resolve()
    }))

    
}