const { TextChannel } = require('discord.js')
const { MessageEmbed } = require('discord.js')
const { Message } = require('discord.js')

module.exports = class Menu {
    static defaultReactions = { first: '⏪', back: '⬅️', next: '➡️', last: '⏩', stop: '⏹' }

    constructor(opts = {}) {
        const { channel = new TextChannel, message = new Message, userID, pages = [], page = 0, time = 120000, reactions = Menu.defaultReactions, customCatch = console.error } = opts
        this.channel = channel
        this.message = message
        this.pages = pages
        this.time = time
        this.reactions = reactions
        this.page = page
        this.catch = customCatch
        message.reply("", { embed: pages[page].setFooter((this.pages.length > 1 ? `${pages[page].footer.text} | Page ${page+1}/${this.pages.length}` : pages[page].footer.text), pages[page].footer.iconURL), allowedMentions: { replied_user: false } }).then(msg => {
            this.msg = msg
            this.addReactions()
            this.createCollector(userID)
        }).catch(() => {
            message.reply("", { embed: pages[page].setThumbnail('').setFooter((this.pages.length > 1 ? `${pages[page].footer.text} | Page ${page+1}/${this.pages.length}` : pages[page].footer.text), pages[page].footer.iconURL), allowedMentions: { replied_user: false } }).then(msg => {
                this.msg = msg
                this.addReactions()
                this.createCollector(userID)
            })
        })
    }
    select(pg = 0) {
        this.page = pg
        if (this.pages.length > 1) {
            this.pages[pg].footer.text += ` | Page ${pg+1}/${this.pages.length}`
        }
        this.msg.edit("", { embed: this.pages[pg].setFooter((this.pages.length > 1 ? `${this.pages[pg].footer.text} | Page ${pg+1}/${this.pages.length}` : this.pages[pg].footer.text), this.pages[pg].footer.iconURL), allowedMentions: { replied_user: false } }).catch(() => {
            this.msg.edit("", { embed: this.pages[pg].setThumbnail((this.pages.length > 1 ? `${this.pages[pg].footer.text} | Page ${pg+1}/${this.pages.length}` : this.pages[pg].footer.text), this.pages[pg].footer.iconURL), allowedMentions: { replied_user: false } })
        })
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
        if (this.pages.length > 1) {
            try {
                if (this.reactions.first) await this.msg.react(this.reactions.first)
                if (this.reactions.back) await this.msg.react(this.reactions.back)
                if (this.reactions.next) await this.msg.react(this.reactions.next)
                if (this.reactions.last) await this.msg.react(this.reactions.last)
                if (this.reactions.stop) await this.msg.react(this.reactions.stop)
            } catch (e) {
                this.catch(e)
            }
        }
    }
}
