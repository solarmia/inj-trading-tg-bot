import { dojoPairUrl, injExplorer } from '../config';
import { errorTitle } from '../utils/type';
import { swapTokenHelper, checkInfo, createWalletHelper, fetch, getSetting, getTokenInfoHelper, getTopTradersHelper, importWalletHelper, setSettings, validReferalLink, getAllTokenList, isValidAddress } from './helper'

interface IConfirm {
    [key: string]: {
        title: string;
        content: { text: string; callback_data: string; }[][];
    };
}

const confirmList: IConfirm =
{
    exportKey: {
        title: "Are you sure you want to export your Private Key?",
        content: [
            [{ text: `Confirm`, callback_data: `show` }, { text: `❌ Cancel`, callback_data: `cancel` }]
        ]
    },
    resetWallet: {
        title: "Are you sure you want to reset your wallet?",
        content: [
            [{ text: `Import you own Wallet`, callback_data: `import` }, { text: `Create new Wallet`, callback_data: `create` }], [{ text: `❌ Cancel`, callback_data: `cancel` }]
        ]
    },
}

export const commandList = [
    { command: 'start', description: 'Start the bot' },
    { command: 'buy', description: 'Buy tokens' },
    { command: 'sell', description: 'Sell your token' },
    { command: 'wallet', description: 'View wallet info' },
    { command: 'leaderboard', description: 'Show 5 top traders ranking' },
    { command: 'settings', description: 'Show the settings menu' },
    { command: 'referral', description: 'Refer your friend' },
    { command: 'help', description: 'Tips and faqs' }
];

const mainContent = (pin: boolean = false) => [
    [{ text: `💸 Buy`, callback_data: 'buy' }, { text: `🛒 Sell`, callback_data: 'sell' }],
    [{ text: `👜 Wallet`, callback_data: 'wallet' }, { text: `⚙️ Settings`, callback_data: 'settings' }],
    [{ text: `🥰 Refer Friend`, callback_data: 'refer' }, { text: `❓ Help`, callback_data: 'help' }],
    [{ text: `🔃 Refresh`, callback_data: 'refresh' }, { text: `🧾 Leader Board`, callback_data: 'leaderboard' }],
    [{ text: `${pin ? '📍 Unpin' : '📌 Pin'}`, callback_data: `${pin ? 'unpin' : 'pin'}` }],
]

export const referralCheck = async (chatId: number) => {
    if (!(await checkInfo(chatId))) {
        const title = 'Did you receive a referral link?'
        const content = [[{ text: '✔️ Yes', callback_data: "inputref" }, { text: '❌ No', callback_data: "welcome" }]]
        return { title, content }
    }
    return undefined
}

export const addreferral = async (chatId: number, referralLink: string, botName: string) => {
    const validation = await validReferalLink(referralLink, botName, chatId)
    if (validation) return { data: 'Successfully added referral link', flag: true }
    return { data: '❌ Invalid referral link', content: [[{ text: '🔁 Try again', callback_data: 'inputref' }, { text: '❌ Cancel', callback_data: 'cancel' }]], flag: false }
}

export const welcome = async (chatId: number, botName?: string, pin: boolean = false) => {

    if (await checkInfo(chatId)) {
        const data = await fetch(chatId, botName)
        if (!data) return undefined
        const { publicKey, balance } = data

        const title = `Welcome to Scale Bot
        
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`

        const content = mainContent(pin)

        return {
            title, content
        }
    } else {

        const title = `Welcome to Scale Bot
    
Are you going to create new wallet or import your own wallet?`

        const content = [
            [{ text: `📩 Import`, callback_data: 'import' }, { text: `🆕 Create`, callback_data: 'create' }],
        ]

        return {
            title, content
        }
    }
}

export const importWallet = async (chatId: number, privateKey: string, botName: string) => {
    const data = await importWalletHelper(chatId, privateKey, botName)
    if (data) {
        const publicKey = data?.publicKey
        const balance = data?.balance
        const title = `Successfully imported!
    
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`

        const content = mainContent()

        return {
            title, content
        }
    } return invalid('invalidPrivKey')
}

export const refresh = async (chatId: number) => {
    const data = await fetch(chatId)
    if (data) {
        const { publicKey, balance, sclx } = data

        const title = `Successfully refreshed!
        
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ
SCLX amount: ${sclx} SCLX

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`

        const content = mainContent()
        return {
            title, content
        }
    } else return register()
}

export const refreshWallet = async (chatId: number) => {
    const data = await fetch(chatId)
    if (data) {
        const { publicKey, balance, sclx } = data

        const title = `Successfully refreshed!
    
Your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ
SCLX amount: ${sclx} SCLX

Tap to copy the address and send INJ to deposit.`

        const content = [
            [{ text: `🔎 View on explorer`, url: `https://explorer.injective.network/account/${publicKey}` }, { text: `🔃 Refresh`, callback_data: `refresh` }],
            // [{ text: `Withdraw all INJ`, callback_data: `withdraw` }, { text: `Withdraw X INJ`, callback_data: `withdrawX` }],
            [{ text: `🔑 Export Private Key`, callback_data: `export` }, { text: `♻️ Reset wallet`, callback_data: `reset` }],
            [{ text: `🚫 Close`, callback_data: `cancel` }]
        ]

        return {
            title, content
        }
    } else return register()
}

export const createWallet = async (chatId: number, botName: string) => {
    const data = await createWalletHelper(chatId, botName)
    if (data) {
        const { publicKey, balance } = data

        const title = `Successfully Created!
    
To get started with trading, send some INJ to your Scale Bot wallet address:
<code>${publicKey}</code>

INJ balance: ${balance} INJ

Once done tap refresh and your balance will appear here.

To buy a token just enter a token address.

For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on ScaleXFi Bot, but if you expose your private key your funds will not be safe.`

        const content = mainContent()

        return {
            title, content
        }
    }
}

export const buy = async (chatId: number) => {
    if (await checkInfo(chatId)) {
        const title = `Buy Token:
  
Input cw20 token address to buy. 

ex: inj123456789abc...`

        const content = [
            [{ text: `❌ Cancel`, callback_data: 'cancel' }]
        ]

        return {
            title, content
        }
    } else return register()
}

const register = () => {
    const title = `Please register your wallet first. Please click button to register.`
    const content = [
        [{ text: `✍ Register`, callback_data: 'register' }]
    ]
    return {
        title, content
    }
}

export const inputBuyAmount = () => {
    const title = `Buy Token:
  
Input INJ amount to buy tokens in the scope of your balance.`

    const content = [
        [{ text: `❌ Cancel`, callback_data: 'cancel' }]
    ]

    return {
        title, content
    }
}

export const inputSellAmount = () => {
    const title = `Sell Token:
  
Input token percentage to sell tokens.(1 ~ 100%)`

    const content = [
        [{ text: `❌ Cancel`, callback_data: 'cancel' }]
    ]

    return {
        title, content
    }
}

export const sell = async (chatId: number) => {
    const data = await fetch(chatId)
    if (data) {
        const ownTokens = await getAllTokenList(chatId)
        if (ownTokens.length) {
            const title = `Token list you have in your wallet. Select token to sell.`
            const content: {
                text: string;
                callback_data: string;
            }[][] = []
            ownTokens.map((val: any) => {
                content.push([{ text: `Token: ${val.token.symbol}   Balance: ${val.balance / Math.pow(10, val.token.decimals)}`, callback_data: `sell:${val.contractAddress}` }])
            })
            content.push([{ text: `🚫 Close`, callback_data: `cancel` }])
            return {
                title, content
            }
        } else {
            const title = `You have no tokens in your wallet.`
            const content = [[{ text: `🚫 Close`, callback_data: `cancel` }]]
            return {
                title, content
            }
        }
    } else return register()
}

export const wallet = async (chatId: number) => {
    const data = await fetch(chatId)
    if (data) {
        const { publicKey, balance, sclx } = data
        const title = `Your Wallet:
    
Your Scale Bot wallet address: <code>${publicKey}</code>
INJ Balance: ${balance} INJ
SCLX amount: ${sclx} SCLX

Tap to copy the address and send INJ to deposit.`

        const content = [
            [{ text: `🔎 View on explorer`, url: `https://explorer.injective.network/account/${publicKey}` }, { text: `🔃 Refresh`, callback_data: `refreshwallet` }],
            // [{ text: `Withdraw all INJ`, callback_data: `withdraw` }, { text: `Withdraw X INJ`, callback_data: `withdrawX` }],
            [{ text: `🔑 Export Private Key`, callback_data: `export` }, { text: `♻️ Reset wallet`, callback_data: `reset` }],
            [{ text: `🚫 Close`, callback_data: `cancel` }]
        ]

        return {
            title, content
        }
    } else return register()
}

export const confirm = async (status: string) => {
    const title = confirmList[status].title

    const content = confirmList[status].content

    return {
        title, content
    }
}

export const showKey = async (chatId: number) => {
    const data = await fetch(chatId)
    if (data) {
        const { privateKey } = data
        const title = `Your Private Key is:

<code>${privateKey}</code>
    
Delete this message once you are done.`

        const content = [
            [{ text: `🗑️ Delete`, callback_data: `cancel` }]
        ]

        return {
            title, content
        }
    } else return register()
}

export const refer = async (chatId: number) => {
    const data = await fetch(chatId)
    if (data) {
        const { referralLink, referees, referrer } = data

        const title = `Referral Link: 
<code>${referralLink}</code>

Referrals counts: ${referees.length}
You can get reward if you refer someone

${referrer ? "You have been referred" : ""}`

        const content = [
            [{ text: `🚫 Close`, callback_data: `cancel` }]
        ]

        return {
            title, content
        }
    } else return register()
}

export const settings = async (chatId: number) => {
    const title = `Settings

BUTTONS CONFIG
Customize your buy and sell buttons for buy token and manage position. Tap to edit.

SLIPPAGE CONFIG
Customize your slippage settings for buys and sells. Tap to edit.
Max Price Impact is to protect against trades in extremely illiquid pools.`

    const { buy1, buy2, sell1, sell2, slippage1, slippage2, } = await getSetting(chatId)
    const content = [
        [{ text: `--- Buy Amount Config ---`, callback_data: `buy config` }],
        [{ text: `✏️ Left: ${buy1} INJ`, callback_data: `buy1` }, {
            text: `✏️ Right: ${buy2} INJ`, callback_data: `buy2`
        }],
        [{ text: `--- Sell Amount Config ---`, callback_data: `sell config` }],
        [{ text: `✏️ Left: ${sell1} %`, callback_data: `sell1` }, {
            text: `✏️ Right: ${sell2} %`, callback_data: `sell2`
        }],
        [{ text: `--- Slippage Percentage Config ---`, callback_data: `slippage config` }],
        [{ text: `✏️ Buy: ${slippage1} %`, callback_data: `slippage1` }, {
            text: `✏️ Sell: ${slippage2} %`, callback_data: `slippage2`
        }],
        [{ text: `🚫 Close`, callback_data: `cancel` }]
    ]

    return { title, content }
}

export const newSettings = async (chatId: number, category: string, value?: any) => {
    const title = `Settings

BUTTONS AMOUNT CONFIG
Customize your buy buttons for buy token amount and manage position. Tap to edit.

SELL PERCENTAGE CONFIG
Customize your sell buttons for sell token percentage and manage position. Tap to edit.

SLIPPAGE CONFIG
Customize your slippage settings for buys and sells. Tap to edit.
Max Price Impact is to protect against trades in extremely illiquid pools.`

    const { announcement, buy1, buy2, sell1, sell2, slippage1, slippage2, priority, priorityAmount } = await setSettings(chatId, category, value)
    const content = [
        [{ text: `--- Buy Amount Config ---`, callback_data: `buy config` }],
        [{ text: `✏️ Left: ${buy1} INJ`, callback_data: `buy1` }, {
            text: `✏️ Right: ${buy2} INJ`, callback_data: `buy2`
        }],
        [{ text: `--- Sell Percentage Config ---`, callback_data: `sell config` }],
        [{ text: `✏️ Left: ${sell1} %`, callback_data: `sell1` }, {
            text: `✏️ Right: ${sell2} %`, callback_data: `sell2`
        }],
        [{ text: `--- Slippage Percentage Config ---`, callback_data: `slippage config` }],
        [{ text: `✏️ Buy: ${slippage1} %`, callback_data: `slippage1` }, {
            text: `✏️ Sell: ${slippage2} %`, callback_data: `slippage2`
        }],
        [{ text: `🚫 Close`, callback_data: `cancel` }]
    ]

    return { title, content }
}

export const getTokenInfo = async (chatId: number, address: string, method: string) => {
    try {
        const flag = isValidAddress(address)
        if (flag) {
            const result = await getTokenInfoHelper(address, chatId)
            if (result) {
                if (method == 'buy') {
                    const title = `${result.tokenInfo.name} | ${result.tokenInfo.symbol} | <code>${address}</code>

Price: $${result.price}
5m: ${result.priceChange.m5}%, 1h: ${result.priceChange.h1}%, 6h: ${result.priceChange.h6}%, 24h: ${result.priceChange.h24}%
Market Cap: $${result.fdv}

Wallet Balance: ${result.balance} INJ
To buy press one of the buttons below.`

                    const { buy1, buy2 } = await getSetting(chatId)
                    const content = [
                        [{ text: `🔎 Token Explorer`, url: `${injExplorer}/account/${address}` }, { text: `🔎 Pair Explorer`, url: `${dojoPairUrl}/${result.pairAddress}` }],
                        [{ text: `💸 Buy ${buy1} INJ`, callback_data: `buyS:${result.pairAddress}` }, {
                            text: `💸 Buy ${buy2} INJ`, callback_data: `buyL:${result.pairAddress}`
                        }, { text: `💸 Buy X INJ`, callback_data: `buyX:${result.pairAddress}` }],
                        [{ text: `📄 Limit Order`, callback_data: `limitB:${address}` }],
                        [{ text: `🚫 Close`, callback_data: `cancel` }]
                    ]
                    return { title, content }
                } else {
                    const title = `${result.tokenInfo.name} | ${result.tokenInfo.symbol} | <code>${address}</code>

Price: $${result.price}
5m: ${result.priceChange.m5}%, 1h: ${result.priceChange.h1}%, 6h: ${result.priceChange.h6}%, 24h: ${result.priceChange.h24}%
Market Cap: $${result.fdv}

Wallet Balance: ${result.balance} INJ
To sell press one of the buttons below.`

                    const { sell1, sell2 } = await getSetting(chatId)

                    const content = [
                        [{ text: `🔎 Token Explorer`, url: `${injExplorer}/account/${address}` }, { text: `🔎 Pair Explorer`, url: `${dojoPairUrl}/${result.pairAddress}` }],
                        [{ text: `🛒 Sell ${sell1} %`, callback_data: `sellS:${address}` }, {
                            text: `🛒 Sell ${sell2} %`, callback_data: `sellL:${address}`
                        }, { text: `🛒 Sell X %`, callback_data: `sellX:${address}` }],
                        [{ text: `🚫 Close`, callback_data: `cancel` }]
                    ]
                    return { title, content }
                }
            } else return { title: errorTitle.inputBuyTokenAddress, content: [[{ text: '🚫 Close', callback_data: 'cancel' }]] }
        } else return { title: errorTitle.inputBuyTokenAddress, content: [[{ text: '🚫 Close', callback_data: 'cancel' }]] }
    } catch (e) {
        console.log(e)
        return undefined
    }
}

export const swapTokens = async (chatId: number, value: string, address: string, type: string) => {
    const result = await swapTokenHelper(chatId, value, address, type)
    if (result && result?.success) {
        const title = `✔️ Transaction Sucesss `
        const content = [[{ text: `🔎 View on explorer`, url: `https://explorer.injective.network/transaction/${result.data}/` }]]
        return { title, content }
    } else {
        const title = `❌ Transaction Failed\n${result?.data}`
        const content = [[{ text: `🚫 Close`, callback_data: `cancel` }]]
        return { title, content }
    }
}

export const checkINJBalance = async (chatId: number, value: string) => {
    const data = await fetch(chatId)
    const balance = data && data?.balance ? data?.balance : 0
    return (balance < Number(value))
}

export const invalid = (type: string) => {
    const title = errorTitle[type]
    const content = [[{ text: `🚫 Close`, callback_data: `cancel` }]]
    return { title, content }
}

export const help = () => {
    const title = `Which tokens can I trade?
With Scale Bot you can trade any CW20 token that is an INJ pair on DojoSwap. We pick up pairs instantly and swap the token in only 1 minute.

How can I see how much money I've made from referrals?
Check the referrals button or type /referrals to see your payment in Scale World!

How can I create a new wallet on Scale Bot?
Click the Wallet button or type /wallet, and you will be able to configure your new wallet.

Can I import my previously created Injective wallet?
Yes, you can import your any Injective wallet you have previously created.

Is Scale Bot free? How much do I pay for transactions?
Scale Bot is absolutely free! It will always be free. We only charge 1% on transactions, and we will continue to keep the bot free so everyone can use it.

How does Scale Bot guarantee transaction success rates?
Scale Bot provides the best service for transactions while also providing the option to increase fees for transactions. To adjust the fee amount, simply click the settings button or type /settings.

Why are my profits lower than expected?
Your net profit is calculated after deducting all associated costs, including Price Impact, Transfer Tax, DEX Fees, and a 1% Scale Bot fee. This ensures the figure you see is what you actually receive, accounting for all transaction-related expenses.

Is there a difference between Scale Bot and other bots?
Yes, Scale Bot is much faster than any other trading bots built on Injective ecosystem, and Scale Bot comes with several new features like:
- Refer to Earn
- Weekly Leaderboard
- Rewards for Top Traders
- Wallet Import`

    const content = [[{ text: 'close', callback_data: 'cancel' }]]
    return { title, content }
}

export const leaderBoard = async () => {
    const title = `Top trader ranking`
    const content = await getTopTradersHelper()
    return { title, content }
}
