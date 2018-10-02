const eris = require('eris')
const superagent = require('superagent')
const ChatApi = require('./ChatApi.js')
const cfg = require('./config.json')
const bot = new eris(cfg.token);
const commands = require('./commands')
const prefixes = cfg.prefixes;
var ready = false;

var client = new ChatApi(cfg.chatToken, cfg.defaultUser)
bot.on('ready', () => {
    ready = true;
    console.log('alright we ready')
})

client.on('message', async chats => {
    if (!ready) return;
    let s = '';
    for (let m of chats) {
        let ispm = !m.channel
        if (!ispm) s += `${client.timestamp()} ${m.channel} ${m.from_user} :::${m.msg}:::\n`
        else s += `${client.timestamp()} ${m.from_user} > ${m.to_user} :::${m.msg}:::\n`
    }
    let ch = bot.guilds.get(cfg.homeGuild).channels.get(cfg.bridgeChannel)
    await ch.createMessage(`\`\`\`\n${s}\`\`\``)
})

bot.on('messageCreate', async msg => {
    if (msg.author.bot) return;
    let prefix = prefixes.filter(a => msg.content.toLowerCase().startsWith(a.toLowerCase()))[0]
    if (!prefix) return;
    let sliced = msg.content.slice(prefix.length);
    let split = sliced.split(' ');
    let cmd = split.shift();
    let ctx = {
        author: msg.author,
        member: msg.member,
        channel: msg.channel,
        guild: msg.channel.guild,
        bot,
        message: msg,
        chat: client,
        async send(msg) {
            await this.channel.createMessage(msg);
        }
    }
    if (!commands[cmd]) return;
    try {
        await commands[cmd](ctx, split)
    } catch(e) {
        await ctx.send(`\`\`\`diff\n-:::TRUST COMMUNICATION::: ${e}\n\`\`\``)
    }
})

bot.connect();