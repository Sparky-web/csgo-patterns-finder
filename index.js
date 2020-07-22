const fetch = require("node-fetch");

async function start() {
    const totalCount = await fetch("https://steamcommunity.com/market/listings/730/Glock-18%20%7C%20Moonrise%20%28Well-Worn%29/render/?query=&start=10&count=10&country=RU&language=russian&currency=1")
        .then(res => res.json())
        .then(json => json.total_count)

    let counter = 0;
    for(let i = 10; i < totalCount - 100; i += 100) {
        const json = await fetch(`https://steamcommunity.com/market/listings/730/Glock-18%20%7C%20Moonrise%20%28Well-Worn%29/render/?query=&start=${i}&count=100&country=RU&language=russian&currency=1`)
            .then(res => res.json());

        const val = Object.values(json.listinginfo)
        const products = val.map(el => ({
            link: el.asset.market_actions[0].link
                .replace(/%listingid%/ig, el.listingid)
                .replace(/%assetid%/ig, el.asset.id),
            listingid: el.listingid,
            assetid: el.asset.id,
            el
        }))
        for (let product of products) {
            const data = await fetch("https://floats.gainskins.com/?url=" + product.link)
                .then(res => res.json())
            const paintSeeds = [31, 59, 90, 95, 102, 121, 165, 194, 237, 281, 355, 448, 484, 487, 617, 630, 667, 796, 769, 837, 913, 958, 968, 986]
            const currentPaintSeed = data.iteminfo?.paintseed

            const finded = paintSeeds.filter(el => +el === +currentPaintSeed)
            counter += 1
            if(finded.length) {
                console.log(counter - 10)
                console.log("Paint seed is" + finded[0])
                console.log(`javascript:BuyMarketListing('listing', '${product.listingid}', 730, '2', '${product.assetid}')`)
            }
        }
    }
}

start();
