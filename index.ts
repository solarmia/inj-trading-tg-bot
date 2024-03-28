import "dotenv/config";
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import * as fs from 'fs';

import * as commands from './commands'
import { BotToken } from "./config";
import { addPlaceOrder, init, placeLimitOrder } from "./commands/helper";

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
                        try {
                            result = await commands.referralCheck(chatId)
                            if (result) {
                                await bot.sendMessage(
                                    chatId,
                                    result.title, {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                                )
                            } else {
                                result = await commands.welcome(chatId, botName)
                                await bot.sendMessage(
                                    chatId,
                                    result.title,
                                    {
                                        reply_markup: {
                                            inline_keyboard: result.content,
                                            resize_keyboard: true
                                        }, parse_mode: 'HTML'
                                    }
                                )

                            }
                            break;
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case `/settings`:
                        try {
                            result = await commands.settings(chatId)
                            await bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                            )
                            break;
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case '/wallet':
                        try {
                            result = await commands.wallet(chatId)

                            await bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                            )

                            break
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case '/buy':
                        try {
                            result = await commands.buy(chatId)
                            await bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                            )
                            bot.once(`message`, async (msg) => {
                                try {
                                    result = await commands.getTokenInfo(chatId, msg.text!, 'buy')
                                    if (result) await bot.sendMessage(
                                        chatId,
                                        result.title,
                                        {
                                            reply_markup: {
                                                inline_keyboard: result.content,
                                                resize_keyboard: true
                                            }, parse_mode: 'HTML'
                                        },
                                    )
                                    else {
                                        const issue = commands.invalid('inputBuyTokenAddress')
                                        await bot.sendMessage(chatId, issue.title, {
                                            reply_markup: {
                                                inline_keyboard: issue.content,
                                                resize_keyboard: true
                                            }, parse_mode: 'HTML'
                                        })
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
                        } catch (e) {
                            const currentUTCDate = new Date().toISOString();
                            const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                            fs.appendFileSync('log.txt', log)
                            console.log(log)
                            bot.stopPolling()
                            run()
                        }

                    case '/sell':
                        try {
                            result = await commands.sell(chatId)
                            await bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                            )

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
                            bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                })
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
                            await bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                            )

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
                            await bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                            )

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
                        const inputMsg = await bot.sendMessage(
                            chatId,
                            `Please input your private key`,
                            {
                                reply_markup: {
                                    inline_keyboard: [[{ text: 'close', callback_data: 'cancel' }]],
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )

                        bot.once(`message`, async (msg) => {
                            try {
                                await bot.deleteMessage(chatId, msg.message_id)
                                result = await commands.importWallet(chatId, msg.text!, botName)
                                await bot.sendMessage(
                                    chatId,
                                    result.title,
                                    {
                                        reply_markup: {
                                            inline_keyboard: result.content,
                                            resize_keyboard: true
                                        }, parse_mode: 'HTML'
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

                    case 'welcome':
                        result = await commands.welcome(chatId, botName)
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )
                        break

                    case 'inputref':
                        await bot.sendMessage(
                            chatId,
                            'Please input valid referral link'
                        )
                        bot.once(`message`, async (msg) => {
                            if (msg.text) {
                                try {
                                    const refResult = await commands.addreferral(chatId, msg.text, botName)
                                    if (refResult.flag) {
                                        result = await commands.welcome(chatId, botName)
                                        await bot.sendMessage(
                                            chatId,
                                            result.title,
                                            {
                                                reply_markup: {
                                                    inline_keyboard: result.content,
                                                    resize_keyboard: true
                                                }, parse_mode: 'HTML'
                                            }
                                        )
                                    } else if (refResult.content) {
                                        await bot.sendMessage(
                                            chatId,
                                            "Invalid referral link",
                                            {
                                                reply_markup: {
                                                    inline_keyboard: refResult.content,
                                                    resize_keyboard: true
                                                }, parse_mode: 'HTML'
                                            }
                                        )
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
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )
                        break

                    case 'register':
                        result = await commands.welcome(chatId, botName, true)
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )
                        break

                    case 'buy':
                        result = await commands.buy(chatId)
                        const buyMsg = await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )

                        bot.once(`message`, async (msg) => {
                            try {
                                const result = await commands.getTokenInfo(chatId, msg.text!, 'buy')
                                if (result) await bot.sendMessage(
                                    chatId,
                                    result.title,
                                    {
                                        reply_markup: {
                                            inline_keyboard: result.content,
                                            resize_keyboard: true
                                        }, parse_mode: 'HTML'
                                    },

                                )
                                else {
                                    const issue = commands.invalid('inputBuyTokenAddress')
                                    await bot.sendMessage(chatId, issue.title, {
                                        reply_markup: {
                                            inline_keyboard: issue.content,
                                            resize_keyboard: true
                                        }, parse_mode: 'HTML'
                                    })
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
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )

                        break

                    case 'wallet':
                        result = await commands.wallet(chatId)
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )

                        break

                    case 'reset':
                        result = await commands.confirm('resetWallet')
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )

                        break

                    case 'export':
                        result = await commands.confirm('exportKey')
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )

                        break

                    case 'show':
                        try {
                            result = await commands.showKey(chatId)
                            await bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                            )

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
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )

                        break

                    case 'settings':
                        await bot.sendMessage(
                            chatId,
                            (await commands.settings(chatId)).title,
                            {
                                reply_markup: {
                                    inline_keyboard: (await commands.settings(chatId)).content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )
                        break

                    case 'refresh':
                        try {
                            result = await commands.refresh(chatId)
                            bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                })

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
                            bot.sendMessage(
                                chatId,
                                result.title,
                                {
                                    reply_markup: {
                                        inline_keyboard: result.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                })

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
                        bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            })
                        break

                    case 'pin':
                        await bot.editMessageReplyMarkup(
                            {
                                inline_keyboard: (await commands.welcome(chatId, botName, true)).content
                            },
                            {
                                chat_id: chatId,
                                message_id: msgId
                            }
                        )
                        await bot.pinChatMessage(chatId, msgId)
                        break

                    case 'unpin':
                        await bot.editMessageReplyMarkup(
                            {
                                inline_keyboard: (await commands.welcome(chatId, botName, false)).content
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

                        const desc = await bot.sendMessage(
                            chatId,
                            editText)

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
                        await bot.sendMessage(
                            chatId,
                            result.title,
                            {
                                reply_markup: {
                                    inline_keyboard: result.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )
                        break

                    case 'cancel':
                        try {
                            await bot.deleteMessage(chatId, msgId)
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
                        await bot.sendMessage(
                            chatId,
                            commands.inputBuyAmount().title,
                            {
                                reply_markup: {
                                    inline_keyboard: (commands.inputBuyAmount()).content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )
                        bot.once('message', async (msg: any) => {
                            if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                                const issue = commands.invalid('inputINJAmount')
                                await bot.sendMessage(chatId, issue.title, {
                                    reply_markup: {
                                        inline_keyboard: issue.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                })
                                return
                            }
                            const txConfirm = await bot.sendMessage(chatId, 'Transaction sent. Confirming now...')
                            const tx = await commands.swapTokens(chatId, msg.text!, address, 'buy')
                            try {
                                bot.deleteMessage(chatId, txConfirm.message_id)
                                bot.sendMessage(chatId,
                                    tx.title, {
                                    reply_markup: {
                                        inline_keyboard: tx.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                                )
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
                        const txConfirm = await bot.sendMessage(chatId, 'Transaction sent. Confirming now...')
                        const tx = await commands.swapTokens(chatId, method, address, 'buy')
                        try {
                            bot.deleteMessage(chatId, txConfirm.message_id)
                            bot.sendMessage(chatId,
                                tx.title, {
                                reply_markup: {
                                    inline_keyboard: tx.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                            )
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
                    if (result) await bot.sendMessage(
                        chatId,
                        result.title,
                        {
                            reply_markup: {
                                inline_keyboard: result.content,
                                resize_keyboard: true
                            }, parse_mode: 'HTML'
                        },
                    )
                } else if (action.startsWith('sellS') || action.startsWith('sellL') || action.startsWith('sellX')) {
                    const method = action.split(':')[0]
                    const address = action.split(':')[1]
                    if (method == 'sellX') {
                        await bot.sendMessage(
                            chatId,
                            commands.inputSellAmount().title,
                            {
                                reply_markup: {
                                    inline_keyboard: (commands.inputSellAmount()).content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                        )
                        bot.once('message', async (msg: any) => {
                            if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                                const issue = commands.invalid('inputTokenAmount')
                                await bot.sendMessage(chatId, issue.title, {
                                    reply_markup: {
                                        inline_keyboard: issue.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                })
                                return
                            }
                            if (Number(msg.text) > 100) {

                            }
                            const txConfirm = await bot.sendMessage(chatId, 'Transaction sent. Confirming now...')
                            const tx = await commands.swapTokens(chatId, msg.text!, address, 'sell')
                            try {
                                bot.deleteMessage(chatId, txConfirm.message_id)
                                bot.sendMessage(chatId,
                                    tx.title, {
                                    reply_markup: {
                                        inline_keyboard: tx.content,
                                        resize_keyboard: true
                                    }, parse_mode: 'HTML'
                                }
                                )
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
                        const txConfirm = await bot.sendMessage(chatId, 'Transaction sent. Confirming now...')
                        const tx = await commands.swapTokens(chatId, method, address, 'sell')
                        try {
                            bot.deleteMessage(chatId, txConfirm.message_id)
                            bot.sendMessage(chatId,
                                tx.title, {
                                reply_markup: {
                                    inline_keyboard: tx.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                            )
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
                    await bot.sendMessage(
                        chatId,
                        'Please input token price as USD'
                    )
                    let price: number = 0
                    bot.once('message', async (msg) => {
                        if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                            const issue = commands.invalid('inputTokenPrice')
                            await bot.sendMessage(chatId, issue.title, {
                                reply_markup: {
                                    inline_keyboard: issue.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            })
                            return
                        } else {
                            price = Number(msg.text)
                            await bot.sendMessage(
                                chatId,
                                'Please input INJ amount to buy'
                            )
                            let amount: number = 0
                            bot.once('message', async (msg) => {
                                if (isNaN(Number(msg.text)) || !Number(msg.text)) {
                                    const issue = commands.invalid('inputINJAmount')
                                    await bot.sendMessage(chatId, issue.title, {
                                        reply_markup: {
                                            inline_keyboard: issue.content,
                                            resize_keyboard: true
                                        }, parse_mode: 'HTML'
                                    })
                                    return
                                } else {
                                    amount = Number(msg.text)
                                    const flag = await addPlaceOrder(chatId, price, amount, address, 'buy')
                                    if (flag) await bot.sendMessage(
                                        chatId,
                                        'Successfully ordered'
                                    )
                                    else await bot.sendMessage(
                                        chatId,
                                        'Ordered failed, Try again'
                                    )
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