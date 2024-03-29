import "dotenv/config";
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import * as fs from 'fs';

import * as commands from './commands'
import { BotToken } from "./config";
import { addPlaceOrder, deleteSync, init, placeLimitOrder, sendSyncMsg, sendSyncTitle } from "./commands/helper";

const token = BotToken
let botName: string
let editText: string

placeLimitOrder()

const bot = new TelegramBot(token!, { polling: true });

const run = () => {
    try {
        const originTime = Date.now() / 1000
        const currentUTCDate = new Date().toISOString();
        fs.appendFileSync('log.txt', `${currentUTCDate} : Bot started\n`)
        console.log("Bot started");
        bot.getMe().then(user => {
            botName = user.username!.toString()
        })

        bot.setMyCommands(commands.commandList)

        init()

        bot.on(`message`, async (msg) => {
            console.log(msg.date, originTime)
            const chatId = msg.chat.id!
            const text = msg.text!
            const msgId = msg.message_id!
            const username = msg.from!.username!
            if (text) {
                const currentUTCDate = new Date().toISOString();
                const log = `${currentUTCDate} : message : ${chatId} -> ${text}\n`
                fs.appendFileSync('log.txt', log)
                console.log(log)
            }
            else return
            let result
            try {
                switch (text) {
                    case `/start`:
                        result = await commands.referralCheck(chatId)
                        if (result) {
                            await sendSyncMsg(bot, chatId, result)
                        } else {
                            result = await commands.welcome(chatId, botName)
                            await sendSyncMsg(bot, chatId, result)
                        }
                        break;

                    case `/settings`:
                        result = await commands.settings(chatId)
                        await sendSyncMsg(bot, chatId, result)
                        break;

                    case '/wallet':
                        result = await commands.wallet(chatId)
                        await sendSyncMsg(bot, chatId, result)

                        break

                    case '/buy':
                        result = await commands.buy(chatId)
                        await sendSyncMsg(bot, chatId, result)

                        bot.once(`message`, async (msg) => {
                            try {
                                result = await commands.getTokenInfo(chatId, msg.text!, 'buy')
                                if (result) await sendSyncMsg(bot, chatId, result)
                                else {
                                    const issue = commands.invalid('inputBuyTokenAddress')
                                    await sendSyncMsg(bot, chatId, issue)
                                }
                                return
                            } catch (e) {
                                const currentUTCDate = new Date().toISOString();
                                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                                fs.appendFileSync('log.txt', log)
                                console.log(log)
                                bot.stopPolling()
                                run()
                            }
                        })
                        break

                    case '/sell':
                        try {
                            result = await commands.sell(chatId)
                            await sendSyncMsg(bot, chatId, result)
                            break

                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }
                    case '/leaderboard':
                        try {
                            result = await commands.leaderBoard()
                            await sendSyncMsg(bot, chatId, result)
                            break

                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case '/referral':
                        try {
                            result = await commands.refer(chatId)
                            await sendSyncMsg(bot, chatId, result)

                            break
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case '/help':
                        try {
                            result = commands.help()
                            await sendSyncMsg(bot, chatId, result)

                            break
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    default:
                        break
                }
            } catch (e) {
                const currentUTCDate = new Date().toISOString();
                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                fs.appendFileSync('log.txt', log)
                console.log(log)
                bot.stopPolling()
                run()
            }
        });

        bot.on('callback_query', async (query: CallbackQuery) => {
            console.log(query.message?.date!, originTime)
            const chatId = query.message?.chat.id!
            const msgId = query.message?.message_id!
            const action = query.data!
            const username = query.message?.chat?.username!
            const callbackQueryId = query.id;

            const currentUTCDate = new Date().toISOString();
            const log = `${currentUTCDate} : message : ${chatId} -> ${action}\n`
            fs.appendFileSync('log.txt', log)
            console.log(log)

            try {
                let result
                switch (action) {
                    case 'import':
                        result = { title: `Please input your private key`, content: [[{ text: 'close', callback_data: 'cancel' }]] }
                        const inputMsg = await sendSyncMsg(bot, chatId, result)

                        bot.once(`message`, async (msg) => {
                            try {
                                await deleteSync(bot, chatId, msg.message_id)
                                result = await commands.importWallet(chatId, msg.text!, botName)
                                await sendSyncMsg(bot, chatId, result)
                                return

                            } catch (e) {
                                const currentUTCDate = new Date().toISOString();
                                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                                fs.appendFileSync('log.txt', log)
                                console.log(log)
                                bot.stopPolling()
                                run()
                            }
                        })

                        break

                    case 'welcome':
                        result = await commands.welcome(chatId, botName)
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'inputref':
                        await sendSyncTitle(bot, chatId, 'Please input valid referral link')
                        bot.once(`message`, async (msg) => {
                            if (msg.text) {
                                try {
                                    const refResult = await commands.addreferral(chatId, msg.text, botName)
                                    if (refResult.flag) {
                                        result = await commands.welcome(chatId, botName)
                                        await sendSyncMsg(bot, chatId, result)
                                    } else if (refResult.content) {
                                        await sendSyncMsg(bot, chatId, refResult)
                                    }
                                    return

                                } catch (e) {
                                    const currentUTCDate = new Date().toISOString();
                                    const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                                    fs.appendFileSync('log.txt', log)
                                    console.log(log)
                                    bot.stopPolling()
                                    run()
                                }
                            }
                        })

                        break

                    case 'create':
                        result = await commands.createWallet(chatId, botName)
                        if (!result) {
                            const issue = commands.invalid('internal')
                            await sendSyncMsg(bot, chatId, issue)
                            return
                        }
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'register':
                        result = await commands.welcome(chatId, botName, true)
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'buy':
                        result = await commands.buy(chatId)
                        await sendSyncMsg(bot, chatId, result)

                        bot.once(`message`, async (msg) => {
                            try {
                                const result = await commands.getTokenInfo(chatId, msg.text!, 'buy')
                                if (result) await sendSyncMsg(bot, chatId, result)
                                else {
                                    const issue = commands.invalid('inputBuyTokenAddress')
                                    await sendSyncMsg(bot, chatId, issue)
                                }
                                return
                            } catch (e) {
                                const currentUTCDate = new Date().toISOString();
                                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                                fs.appendFileSync('log.txt', log)
                                console.log(log)
                                bot.stopPolling()
                                run()
                            }
                        })

                        break

                    case 'sell':
                        result = await commands.sell(chatId)
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'wallet':
                        result = await commands.wallet(chatId)
                        await sendSyncMsg(bot, chatId, result)

                        break

                    case 'reset':
                        result = await commands.confirm('resetWallet')
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'export':
                        result = await commands.confirm('exportKey')
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'show':
                        try {
                            result = await commands.showKey(chatId)
                            await sendSyncMsg(bot, chatId, result)
                            break
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case 'refer':
                        result = await commands.refer(chatId)
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'settings':
                        result = await commands.settings(chatId)
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'refresh':
                        try {
                            result = await commands.refresh(chatId)
                            await sendSyncMsg(bot, chatId, result)
                            break
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case 'refreshwallet':
                        try {
                            result = await commands.refreshWallet(chatId)
                            await sendSyncMsg(bot, chatId, result)
                            break
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case 'leaderboard':
                        result = await commands.leaderBoard()
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'pin':
                        result = await commands.welcome(chatId, botName, true)
                        if (!result) {
                            const issue = commands.invalid('internal')
                            await sendSyncMsg(bot, chatId, issue)
                            return
                        }
                        await bot.editMessageReplyMarkup(
                            {
                                inline_keyboard: result.content
                            },
                            {
                                chat_id: chatId,
                                message_id: msgId
                            }
                        )
                        await bot.pinChatMessage(chatId, msgId)
                        break

                    case 'unpin':
                        result = await commands.welcome(chatId, botName, false)
                        if (!result) {
                            const issue = commands.invalid('internal')
                            await sendSyncMsg(bot, chatId, issue)
                            return
                        }
                        await bot.editMessageReplyMarkup(
                            {
                                inline_keyboard: result.content
                            },
                            {
                                chat_id: chatId,
                                message_id: msgId
                            }
                        )
                        await bot.unpinChatMessage(chatId)
                        break

                    case 'priority':
                    case 'announcement':
                        await bot.editMessageReplyMarkup(
                            {
                                inline_keyboard: (await commands.newSettings(chatId, action)).content
                            },
                            {
                                chat_id: chatId,
                                message_id: msgId
                            }
                        )
                        break

                    case 'buy1':
                    case 'buy2':
                    case 'sell1':
                    case 'sell2':
                    case 'slippage1':
                    case 'slippage2':
                    case 'priorityAmount':
                        if (action == 'buy1' || action == 'buy2') editText = `Reply with your new setting for the ${action == 'buy1' ? 'left' : 'right'} Buy Button in SOL. Example: 0.5`
                        else if (action == 'sell1' || action == 'sell2') editText = `Reply with your new setting for the ${action == 'sell1' ? 'left' : 'right'} Sell Button in % (0 - 100%). Example: 100`
                        else if (action == 'slippage1' || action == 'slippage2') editText = `Reply with your new slippage setting for ${action == 'slippage1' ? 'buys' : 'sells'} in % (0.00 - 100.00%). Example: 5.5`
                        else if (action == 'priorityAmount') editText = `Reply with your new Transaction Priority Setting for sells in SOL. Example: 0.0001`

                        await sendSyncTitle(bot, chatId, editText)

                        bot.once(`message`, async (msg) => {
                            try {
                                await bot.editMessageReplyMarkup(
                                    {
                                        inline_keyboard: (await commands.newSettings(chatId, action, msg.text)).content
                                    },
                                    {
                                        chat_id: chatId,
                                        message_id: msgId
                                    }
                                )

                                return
                            } catch (e) {
                                const currentUTCDate = new Date().toISOString();
                                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                                fs.appendFileSync('log.txt', log)
                                console.log(log)
                                bot.stopPolling()
                                run()
                            }
                        })

                        break

                    case 'help':
                        result = commands.help()
                        await sendSyncMsg(bot, chatId, result)
                        break

                    case 'cancel':
                        try {
                            await deleteSync(bot, chatId, msgId)
                            break
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    default:
                        break
                }

                if (action.startsWith('buyS') || action.startsWith('buyL') || action.startsWith('buyX')) {
                    const address = action.split(':')[1]
                    const method = action.split(':')[0]
                    if (method == 'buyX') {
                        result = commands.inputBuyAmount()
                        await sendSyncMsg(bot, chatId, result)

                        bot.once('message', async (msg: any) => {
                            if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                                const issue = commands.invalid('inputINJAmount')
                                await sendSyncMsg(bot, chatId, issue)
                                return
                            }
                            const txConfirm = await sendSyncTitle(bot, chatId, 'Transaction sent. Confirming now...')
                            if (!txConfirm) return
                            const tx = await commands.swapTokens(chatId, msg.text!, address, 'buy')
                            try {
                                await deleteSync(bot, chatId, txConfirm.message_id)
                                await sendSyncMsg(bot, chatId, tx)
                            } catch (e) {
                                const currentUTCDate = new Date().toISOString();
                                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                                fs.appendFileSync('log.txt', log)
                                console.log(log)
                                bot.stopPolling()
                                run()
                            }
                        })
                    } else {
                        const txConfirm = await sendSyncTitle(bot, chatId, 'Transaction sent. Confirming now...')
                        if (!txConfirm) return
                        const tx = await commands.swapTokens(chatId, method, address, 'buy')
                        try {
                            await deleteSync(bot, chatId, txConfirm.message_id)
                            await sendSyncMsg(bot, chatId, tx)
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }
                    }
                } else if (action.startsWith('sell:')) {
                    const address = action.split(':')[1]
                    const result = await commands.getTokenInfo(chatId, address, 'sell')
                    if (result) await sendSyncMsg(bot, chatId, result)
                } else if (action.startsWith('sellS') || action.startsWith('sellL') || action.startsWith('sellX')) {
                    const method = action.split(':')[0]
                    const address = action.split(':')[1]
                    if (method == 'sellX') {
                        result = commands.inputSellAmount()
                        await sendSyncMsg(bot, chatId, result)
                        bot.once('message', async (msg: any) => {
                            if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                                const issue = commands.invalid('inputTokenAmount')
                                await sendSyncMsg(bot, chatId, issue)
                                return
                            }
                            if (Number(msg.text) > 100) {
                                await sendSyncTitle(bot, chatId, 'Transaction sent. Confirming now...')
                            }
                            const txConfirm = await sendSyncTitle(bot, chatId, 'Transaction sent. Confirming now...')
                            if (!txConfirm) return
                            const tx = await commands.swapTokens(chatId, msg.text!, address, 'sell')
                            try {
                                await deleteSync(bot, chatId, txConfirm.message_id)
                                await sendSyncMsg(bot, chatId, tx)
                            } catch (e) {
                                const currentUTCDate = new Date().toISOString();
                                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                                fs.appendFileSync('log.txt', log)
                                console.log(log)
                                bot.stopPolling()
                                run()
                            }
                        })
                    } else {
                        const txConfirm = await sendSyncTitle(bot, chatId, 'Transaction sent. Confirming now...')
                        if (!txConfirm) return
                        const tx = await commands.swapTokens(chatId, method, address, 'sell')
                        try {
                            await deleteSync(bot, chatId, txConfirm.message_id)
                            await sendSyncMsg(bot, chatId, tx)
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }
                    }
                } else if (action.startsWith('limitB')) {
                    const address = action.split(':')[1]
                    await sendSyncTitle(bot, chatId, 'Please input token price as USD')
                    let price: number = 0
                    bot.once('message', async (msg) => {
                        if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                            const issue = commands.invalid('inputTokenPrice')
                            await sendSyncMsg(bot, chatId, issue)
                            return
                        } else {
                            price = Number(msg.text)
                            await sendSyncTitle(bot, chatId, 'Please input INJ amount to buy')
                            let amount: number = 0
                            bot.once('message', async (msg) => {
                                if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                                    const issue = commands.invalid('inputINJAmount')
                                    await sendSyncMsg(bot, chatId, issue)
                                    return
                                } else {
                                    amount = Number(msg.text)
                                    const flag = await addPlaceOrder(chatId, price, amount, address, 'buy')
                                    if (flag) await sendSyncTitle(bot, chatId, 'Successfully ordered')
                                    else await sendSyncTitle(bot, chatId, 'Ordered failed, Try again')
                                }
                            })
                        }
                    })
                }

            } catch (e) {
                const currentUTCDate = new Date().toISOString();
                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                fs.appendFileSync('log.txt', log)
                console.log(log)
                bot.stopPolling()
                run()
            }
        })
    } catch (e) {
        const currentUTCDate = new Date().toISOString();
        const log = `${currentUTCDate} : error -> ${e}\n`
        fs.appendFileSync('log.txt', log)
        console.log(log)
        bot.stopPolling()
        run()
    }
}

run()