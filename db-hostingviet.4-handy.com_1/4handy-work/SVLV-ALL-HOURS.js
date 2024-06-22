db.stockdatasnapshots.aggregate({
    "createdAt" : {
        $gte: ISODate("2023-07-07T07:00:00.000+07:00"),
        $lte: ISODate("2023-07-07T22:05:00.639+07:00"),
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
    "sku": "B8339",
   //  hour: 8,
})
// .sort({_id: -1})
.lookup({
    from: "outlets",
    localField: "outlet",
    foreignField: "_id",
    as: "outlet"
})
.unwind("$outlet")
.match({"outlet.code": /(^[ME]\d+)(?!E0)/})
.group({
    _id: "$outlet.region",
    num_record: {$sum: 1},
    num_stock : {$sum: {$cond: [{"$gt": ["$stock", 0]}, 1, 0]}}
})