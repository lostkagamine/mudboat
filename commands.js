module.exports = {
    async meme(ctx, args) {
        await ctx.send('hi world')
    },
    async tell(ctx, args) {
        if (ctx.author.id !== '190544080164487168') return await ctx.message.addReaction('🚫')
        let to = args.shift()
        let msg = args.join(' ')
        let r = ctx.chat.tell(to, msg)
        if (!r.ok) {
            return await ctx.send(`\`\`\`diff\n- ${r.msg}\`\`\``)
        }
        let now = new Date()
        let timestamp = `${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`
        return await ctx.send(`\`\`\`${timestamp} to ${to} :::${msg}:::\`\`\``)
    },
    async send(ctx, args) {
        if (ctx.author.id !== '190544080164487168') return await ctx.message.addReaction('🚫')
        let to = args.shift()
        let msg = args.join(' ')
        let r = ctx.chat.send(to, msg)
        if (r !== true) {
            return await ctx.send(`\`\`\`diff\n- ${r.msg}\`\`\``)
        }
        let now = new Date()
        let timestamp = `${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`
        return await ctx.send(`\`\`\`${timestamp} ${to} ${ctx.chat.user} :::${msg}:::\`\`\``)
    },
    async crash(ctx, args) {
        if (ctx.author.id !== '190544080164487168') return await ctx.message.addReaction('🚫')
        throw new Error();
    },
    async user(ctx, args) {
        if (ctx.author.id !== '190544080164487168') return await ctx.message.addReaction('🚫')
        ctx.chat.user = args[0];
        return await ctx.message.addReaction('👌')
    }
}