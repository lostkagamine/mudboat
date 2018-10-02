const ENDPOINT = "https://www.hackmud.com/mobile/{}.json"
const getendpoint = s => ENDPOINT.replace('{}', s)

const EventEmitter = require('events')
const superagent = require('superagent')

module.exports = class ChatApi extends EventEmitter {
    constructor(token, defaultUser, options={}) {
        super();
        this.options = options
        this.token = token;
        this.user = defaultUser;
        this.lastMsg = null;
        this.fullLast = {};
        this.lasts = [];
        this.poll();
        let pollf = this.poll.bind(this)
        setInterval(pollf, 10e3);
    }
    async poll() {
        let msgs;
        let payload = {chat_token: this.token, usernames: [this.user]};
        if (this.lastMsg) payload.after = this.fullLast.t+1;
        try {
            msgs = await superagent.post(getendpoint('chats')).send(payload)
        } catch(e) {
            console.error(`oops: ${e}`)
            return
        }
        msgs = msgs.body;
        if (!msgs.ok) throw new Error(msgs.msg);
        let chats = msgs.chats[this.user]
        chats.sort((a,b) => a.t - b.t)
        //console.log(chats)
        let msg = chats[chats.length-1]
        for (let i of chats) {
            if (this.lasts.indexOf(i.id) !== -1) chats[chats.indexOf(i)] = null
            this.lasts.push(i.id)
        }
        chats = chats.filter(a => a !== null)
        if (!msg) return;
        if (msg.id === this.lastMsg) return;
        if (chats.length === 0) return;
        this.emit('message', chats)
        this.lastMsg = msg.id
        this.fullLast = msg
        if (chats.length !== 0) this.lasts = [];
    }
    async getToken(pass) {
        let temp = await superagent.post(getendpoint('get_token')).send({
            pass
        })
        let b = temp.body;
        if (!b.ok) return b;
        this.token = b.chat_token;
        return b.chat_token;
    }
    async tell(to, msg) {
        let t = await superagent.post(getendpoint('create_chat')).send({
            chat_token: this.token,
            username: this.user,
            tell: to,
            msg
        })
        let b = t.body;
        if (b.ok) return true;
        return b;
    }

    timestamp(date) {
        if (!date) date = new Date();
        return `${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`
    }
}