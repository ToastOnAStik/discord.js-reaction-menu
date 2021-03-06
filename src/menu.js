const { Message } = require('discord.js')

module.exports = class Menu {
    static defaultReactions = { back: '◀', next: '▶', stop: '⏹' }

    constructor(opts = {}) {
        const { message = new Message, userID, pages = [], page = 0, time = 120000, reactions = Menu.defaultReactions, customCatch = console.error } = opts
        this.message = message
        this.pages = pages
        this.time = time
        this.reactions = reactions
        this.page = page
        this.catch = customCatch
        if (this.pages.length > 1 && !this.pages[page].footer.text.includes('Page')) {
            this.pages[page].footer.text += `Page ${page+1}/${this.pages.length}`
        }
        message.util.send(pages[page]).then(msg => {
            this.msg = msg
            this.addReactions()
            this.createCollector(userID)
        }).catch(customCatch)
    }
    select(pg = 0) {
        this.page = pg
        if (this.pages.length > 1 && !this.pages[pg].footer.text.includes('Page')) {
            this.pages[pg].footer.text += `Page ${pg+1}/${this.pages.length}`
        }
        this.msg.edit(this.pages[pg]).catch(this.catch)
    }
    createCollector(uid) {
        const collector = this.msg.createReactionCollector((r, u) => u.id == uid, { time: this.time })
        this.collector = collector;
        collector.on('collect', r => {
            if (r.emoji.name == this.reactions.first) {
                if (this.page != 0) this.select(0)
            } else if (r.emoji.name == this.reactions.back) {
                if (this.page != 0) this.select(this.page - 1)
            } else if (r.emoji.name == this.reactions.next) {
                if (this.page < this.pages.length - 1) this.select(this.page + 1)
            } else if (r.emoji.name == this.reactions.last) {
                if (this.page != this.pages.length) this.select(this.pages.length - 1)
            } else if (r.emoji.name == this.reactions.stop) collector.stop()
            r.users.remove(uid).catch(this.catch)
        })
        collector.on('end', () => {
            this.msg.reactions.removeAll().catch(this.catch)
        })
    }
    async addReactions() {
        try {
            if (this.reactions.back)  await this.msg.react(this.reactions.back)
            if (this.reactions.next)  await this.msg.react(this.reactions.next)
            if (this.reactions.stop)  await this.msg.react(this.reactions.stop)
        } catch (e) {
            this.catch(e)
        }
    }
}
