db.saleentries.aggregate()
    .match({
        created: {
            $gte: moment("2023-07-01").toDate(),
            $lte: moment("2023-07-31").endOf("day").toDate()
        },
        status: {$ne: "void"},
    })
    .unwind("$order.items")
    .match({
        "order.items.business": db.businesses.findOne({code: "SAVOR_CAKES"})["_id"],
        "order.items.lineTotal": {$gt: 0},
    })
    .lookup({
        from: "productcats",
        localField: "order.items.category.cat",
        foreignField: "_id", 
        as: "cat"
    })
    .unwind("$cat")
    .group({
        _id: {
            "cat": "$cat.name",
            "date": {
                "$dateToString": {
                    "date": "$created",
                    "format": "%Y-%m-%d",
                    "timezone": "+07"
                }
            },
            "outlet": "$outlet",
            "business": "$order.items.business"
        },
        cogs: {$sum: "$order.items.calculatedTotalCogs"},
        discount: {$sum: "$order.items.discount"},
        quantity: {$sum: "$order.items.quantity"},
        revenue: {$sum: "$order.items.lineTotal"},
        business: {$first: "$order.items.business"}
    })
    .lookup({
        from: "outlets",
        localField: "_id.outlet",
        foreignField: "_id",
        as: "outlet"
    })
    .unwind("$outlet")
    .lookup({
        from: "businesses",
        localField: "_id.business",
        foreignField: "_id",
        as: "business"
    })
    .unwind("$business")
    .forEach(c=>{
        const data = [c.business.code, c._id.date, c.outlet.code, c._id.cat, c.cogs, c.revenue, c.discount]
        print(data.join("\t"))
    })