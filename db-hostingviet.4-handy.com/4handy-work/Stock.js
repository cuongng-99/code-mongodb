db.stockdatasnapshots.aggregate({
    "createdAt" : {
        $gte: ISODate("2023-09-01T07:00:00.000+07:00"),
        $lte: ISODate("2023-09-15T08:05:00.639+07:00"),
    }
    // outlet: db.outlets.findOne({code: "B9133"})["_id"]
})
.unwind("$items")
.addFields({
    sku: {$arrayElemAt: ["$items",1]},
    stock: {$arrayElemAt: ["$items",2]},
    hour: {
        $hour: {
            date: "$created",
            timezone: "+07"
        }
    }
})
.match({
    "sku": "B7092",
    hour: 8,
    outletCode: "D6"
})
// .sort({_id: -1})
.forEach(c=>print([c.outletCode, c.stock].join("\t")
})