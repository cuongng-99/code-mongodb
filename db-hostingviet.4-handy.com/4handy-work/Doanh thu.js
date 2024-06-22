db.saleentries.aggregate()
    .match({
        created: {
            $gte: moment("2023-01-01").toDate(),
            $lte: moment("2023-01-07").endOf("day").toDate()
        },
        status: {$ne: "void"},
        business: db.businesses.findOne({code: "ABBY"})["_id"]
    })
    .unwind("$order.items")
    .lookup({
        from: "products",
        localField: "order.items.sku",
        foreignField: "sku", 
        as: "product"
    })
    .unwind("$product")
    .lookup({
        from: "tetcategories", 
        localField: "product.tetCategory", 
        foreignField: "_id",
        as: "catman"
    })
    .unwind("$catman")
    .group({
        _id: "$catman.isTet",
        revenue: {$sum: "$order.items.lineTotal"}
    })