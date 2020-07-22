const fetch = require("node-fetch")

const paintSeeds = [
    {
        name: "P250 - Crimson Kimono",
        paintSeeds: [222, 760, 86, 399, 425, 784, 739, 519, 583, 328, 818, 814, 736, 457, 449, 337, 761, 471, 299, 832],
        quality: false,
        links: []
    },
    {
        name: "ХМ1014 - Seasons",
        paintSeeds: [26,78,115,130,182,234,286,334,338,390,442,494,546,598,605,650,659,698,955],
        quality: false,
        links: []
    },
    {
        name: "Galil Sandstorm",
        paintSeeds: [583, 761, 739, 178, 555, 449, 873, 352, 177, 807, 786, 783, 774],
        quality: false,
        links: []
    }
]

async function getPaintSeed (link) {
    const json = await fetch("https://floats.gainskins.com/?url=" + link)
        .then(res => res.json())
        .catch(err => ({}))

    return json.iteminfo ? {
        paintSeed: json.iteminfo.paintseed,
        floatValue: json.iteminfo.floatvalue
    } : undefined
}
async function serialize(arr) {
    let serialized = await Promise.all(arr.map(async e => {
        if(e.price && e.converted_price) {
            let price = e.converted_price + e.converted_fee;
            price = +price.toString().slice(0, -2)

            const link = e.asset.market_actions[0].link
                .replace(/%listingid%/ig, e.listingid)
                .replace(/%assetid%/ig, e.asset.id)
            return {
                link,
                price,
                listingId: e.listingid,
                assetId: e.asset.id,
                data: await getPaintSeed(link),
                js: `javascript:BuyMarketListing('listing', '${e.listingid}', 730, '2', '${e.asset.id}')`
            }
        }
    }))
    serialized = serialized.filter(e => !!e)
    return serialized
}
async function getData(link) {
    const json = await fetch(link)
        .then(res => res.json())
        .then(json => Object.values(json.listinginfo));

    return await serialize(json)
}
async function filterPrice() {
    const link = `https://steamcommunity.com/market/listings/730/P250%20%7C%20Crimson%20Kimono%20%28Factory%20New%29/render/?query=&start=0&count=100&country=US&currency=5`
    const data = await getData(link)
    const firstPrice = data[0].price

    return data.filter(el => {
        return (el.price - firstPrice) < (firstPrice / 100) * 30
    })
}

async function f() {
    setInterval(async () => {
        const arr = await filterPrice();
        const newArr = arr.filter(el => {
            const res = paintSeeds[0].paintSeeds.find(e => +e === +el.data.paintSeed)
            if(res) {
                console.log("\007")
                return el
            }
        })
        console.log(newArr)
    }, 20000)
}
f()