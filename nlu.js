const TelegrafWit = require('telegraf-wit')
const Promise = require('bluebird')

const wit = new TelegrafWit('HCVYZ7TZGPL2KBH5LKKZB6OLN4YWCB5T')

module.exports = (message) => {
    return new Promise((resolve, reject) => {
        wit.meaning(message.text).then(result => {
            //console.log(result.entities.intent);
            message.nlu = result
            resolve(message)
        })
    })
}