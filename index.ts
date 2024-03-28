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


const run = () => {
    try {
        const bot = new TelegramBot(token!, { polling: true });
        const currentUTCDate = new Date().toISOString();
        fs.appendFileSync('log.txt', `${currentUTCDate} : Bot started\n`)
        console.log("Bot started");
        bot.getMe().then(user => {
            botName = user.username!.toString()
        })

        bot.setMyCommands(commands.commandList)

        init()

        bot.on(`message`, async (msg) => {
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
                        await bot.deleteMessage(chatId, msgId)
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
                            // bot.once(`message`, async (msg) => {
                            //     if (msg.text == 'no' || msg.text == 'No' || msg.text == 'NO' || msg.text == 'n' || msg.text == 'N') {
                            //         await bot.deleteMessage(chatId, msg.message_id)
                            //         result = await commands.welcome(chatId, botName)
                            //         await bot.sendMessage(
                            //             chatId,
                            //             result.title,
                            //             {
                            //                 reply_markup: {
                            //                     inline_keyboard: result.content,
                            //                     resize_keyboard: true
                            //                 }, parse_mode: 'HTML'
                            //             }
                            //         )
                            //     } else if (msg.text) {
                            //         const refResult = await commands.addreferral(chatId, msg.text, botName)
                            //         if (refResult.flag) {
                            //             result = await commands.welcome(chatId, botName)
                            //             await bot.sendMessage(
                            //                 chatId,
                            //                 result.title,
                            //                 {
                            //                     reply_markup: {
                            //                         inline_keyboard: result.content,
                            //                         resize_keyboard: true
                            //                     }, parse_mode: 'HTML'
                            //                 }
                            //             )
                            //         } else {
                            //             await bot.sendMessage(
                            //                 chatId,
                            //                 "Invalid referral link"
                            //             )
                            //         }
                            //     }
                            //     return
                            // })
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

                    case `/settings`:
                        await bot.deleteMessage(chatId, msgId)
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

                    case '/wallet':
                        await bot.deleteMessage(chatId, msgId)
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

                    case '/buy':
                        await bot.deleteMessage(chatId, msgId)
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
                            await bot.deleteMessage(chatId, msg.message_id)
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
                        })
                        break

                    case '/sell':
                        await bot.deleteMessage(chatId, msgId)
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
                    case '/leaderboard':
                        await bot.deleteMessage(chatId, msgId)
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

                    case '/referral':
                        await bot.deleteMessage(chatId, msgId)
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

                    case '/help':
                        await bot.deleteMessage(chatId, msgId)
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

                    default:
                        break
                }
            } catch (e) {
                const currentUTCDate = new Date().toISOString();
                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                fs.appendFileSync('log.txt', log)
                console.log(log)
                console.log(1)
                bot.stopPolling()
                run()
            }
        });

        bot.on('callback_query', async (query: CallbackQuery) => {
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
                                await bot.deleteMessage(chatId, inputMsg.message_id)
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
                                bot.stopPolling()
                                console.log(123)
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
                                await bot.deleteMessage(chatId, msg?.message_id)
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
                            }
                            return
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
                            await bot.deleteMessage(chatId, msg.message_id)
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
                        await bot.deleteMessage(chatId, msgId)
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
                        await bot.deleteMessage(chatId, msgId)
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

                    case 'refreshwallet':
                        await bot.deleteMessage(chatId, msgId)
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
                            await bot.deleteMessage(chatId, msg.message_id)
                            await bot.deleteMessage(chatId, desc.message_id)
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
                        await bot.deleteMessage(chatId, msgId)
                        break

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
                            bot.deleteMessage(chatId, txConfirm.message_id)
                            bot.sendMessage(chatId,
                                tx.title, {
                                reply_markup: {
                                    inline_keyboard: tx.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                            )
                        })
                    } else {
                        const txConfirm = await bot.sendMessage(chatId, 'Transaction sent. Confirming now...')
                        const tx = await commands.swapTokens(chatId, method, address, 'buy')
                        bot.deleteMessage(chatId, txConfirm.message_id)
                        bot.sendMessage(chatId,
                            tx.title, {
                            reply_markup: {
                                inline_keyboard: tx.content,
                                resize_keyboard: true
                            }, parse_mode: 'HTML'
                        }
                        )
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
                            bot.deleteMessage(chatId, txConfirm.message_id)
                            bot.sendMessage(chatId,
                                tx.title, {
                                reply_markup: {
                                    inline_keyboard: tx.content,
                                    resize_keyboard: true
                                }, parse_mode: 'HTML'
                            }
                            )
                        })
                    } else {
                        const txConfirm = await bot.sendMessage(chatId, 'Transaction sent. Confirming now...')
                        const tx = await commands.swapTokens(chatId, method, address, 'sell')
                        bot.deleteMessage(chatId, txConfirm.message_id)
                        bot.sendMessage(chatId,
                            tx.title, {
                            reply_markup: {
                                inline_keyboard: tx.content,
                                resize_keyboard: true
                            }, parse_mode: 'HTML'
                        }
                        )
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
                console.log('-------------------------')
                const currentUTCDate = new Date().toISOString();
                const log = `${currentUTCDate} : ${chatId} : error -> ${e}\n`
                fs.appendFileSync('log.txt', log)
                console.log(log)
                console.log(324234)
                bot.stopPolling()
                run()
            }
        })
        // await bot.answerCallbackQuery(callbackQueryId, { text: 'Input Token address to buy' })
    } catch (e) {
        const currentUTCDate = new Date().toISOString();
        const log = `${currentUTCDate} : error -> ${e}\n`
        fs.appendFileSync('log.txt', log)
        console.log(log)
        run()
    }
}

run()