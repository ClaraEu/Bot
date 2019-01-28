const Telegraf = require('telegraf')
const express = require('express')
const expressApp = express()
const request = require('request');
const bodyParser = require('body-parser');
const axios = require('axios');
const nlu = require('./nlu')
const dialog = require('./dialog')
const googleTts = require('google-tts-api')

const bot = new Telegraf('760297667:AAGnzrUTY8T4lCczodk3WF1O0KfIF2VTqgE')
expressApp.use(bot.webhookCallback('/secret-path'))
bot.telegram.setWebhook('https://e91ed9fd.ngrok.io/secret-path')
// bot.telegram.setWebhook('https://server.tld:8443/secret-path')

expressApp.get('/', (req, res) => {
	res.send('Hello World!')
})

expressApp.post('/secret-path', (req, res)=>{
	res.send('¿Qué pasa por tu casa?')
})

expressApp.get('http://api.openweathermap.org/data/2.5/weather?q=Madrid&APPID=4e137d9ae1b64c00c46846e9bea151c5', (req, res)=>{
	console.log(res.json())
	const clima = res.send('Recibiendo datos weather')
})

expressApp.listen(3000, () => {
	console.log('App escuchando al puerto 3000!')
})


bot.command('weather', (ctx)=>{
	// console.log(ctx.message.text.split("/weather ")[1])
	 // console.log(ctx.message.chat.id)
	 request(`http://api.openweathermap.org/data/2.5/weather?q=${ctx.message.text.split("/weather ")[1]}&APPID=4e137d9ae1b64c00c46846e9bea151c5`, function (error,response, body) {
	 	// console.log(body.cod)
	 	let respuesta = JSON.parse(body)
	 	if(respuesta.cod == 404){
	 		bot.telegram.sendMessage(ctx.message.chat.id, 'Ciudad no encontrada')
	 	}else{
	 		bot.telegram.sendMessage(ctx.message.chat.id, respuesta.weather[0].description)
	 	}
 		// console.log('statusCode:', response && response.statusCode); 
  		// console.log('body:', body); 
		// ctx.reply('Aqui devuelvo el tiempo')	
	})
})

bot.command('/whereami', (ctx) => {
    let espacio = ctx.message.text.indexOf(' ')
    let ciudad = ctx.message.text.substring((espacio+1), (ctx.message.text).length)
    console.log(ciudad)
    axios.get(`https://geocode.xyz/${ciudad}?json=1`)
    .then(response => {
        bot.telegram.sendPhoto(ctx.from.id, `https://maps.googleapis.com/maps/api/staticmap?center=${response.data.latt},${response.data.longt}&zoom=17&size=1200x600&maptype=roadmap&markers=color:red%7Clabel:%7C${response.data.latt},${response.data.longt}&key=AIzaSyD5h7iot54V6U35ggOGvW6MQGE1Zciune4`)
        bot.telegram.sendMessage(ctx.from.id, `La latitud de ${ciudad} es: ${response.data.latt}° y la longitud: ${response.data.longt}°`)
        console.log(response.data.latt);
        console.log(response.data.longt);
    })
    .catch(error => {
        console.log(error);
    });
})


bot.on('text', (ctx) => {
  //console.log(ctx.message)
  nlu(ctx.message)
    .then(dialog)
    .then((value) => {
      googleTts(value, 'es', 1).then((url) => {
        bot.telegram.sendAudio(ctx.from.id, url)
      })
      bot.telegram.sendMessage(ctx.from.id, value)
    })
})



bot.start((ctx) => ctx.reply('Bienvenido'))
bot.help((ctx) => ctx.reply('Pídeme un sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.command('creator', ({ reply }) => reply('Jose Alberto; Tony; Sergio'))


bot.hears('como?', (ctx) => ctx.reply('¿Además de subnormal eres sordo?'))
bot.hears('hola', (ctx) => ctx.reply('Buenos días pa tu puta madre'))
bot.hears('Hola', (ctx) => ctx.reply('Buenos días pa tu puta madre'))