const link = 'https://work.4-handy.com/#!/online-orders/'
const sku = db.products.aggregate()
    .lookup({
          from: "productcats",
          localField: "category.cat",
          foreignField: "_id",
          as: "cat"
    })
    .unwind("$cat")
    .match({
        description: {$not: /BTP/},
        "cat.name": {$in: ["Bánh sinh nhật"]}
    })
    .map(c=>c.sku)

db.saleentries.aggregate({
    created: {
        $gte: moment("2024-05-24").toDate(),
        $lte: moment("2024-06-02").endOf("days").toDate()
    },
    business: db.businesses.findOne({code: "SAVOR"})["_id"]
    "order.items.sku" : {$in: sku},
    status : {$ne: "void"},
})
.lookup({
    from: "onlineorders",
    localField: "onlineOrder",
    foreignField: "_id",
    as: "onlineorder" 
})
.unwind({path: "$onlineorder", preserveNullAndEmptyArrays: true})
.unwind("$order.items")
.match({"order.items.sku": {$in: sku}})
.lookup({
    from: "outlets",
    localField: "outlet",
    foreignField: "_id",
    as: "outlet"
})
.unwind("$outlet")
.forEach(c=>{
    const textInCake = c.onlineorder ? c.onlineorder.items.flatMap(item => item.variants?.map(variantItem => variantItem.description) || []): []
    const data = [
            c._id.valueOf(),
            c.order.items.sku, 
            c.order.items.description,
            c.order.items.quantity, 
            c.order.items.soldPrice,
            c.onlineorder ? moment(c.onlineorder.created).format("YYYY-MM-DD"): "",
            moment(c.created).format("YYYY-MM-DD"),
            moment(c.created).format("YYYY-MM-DD HH:mm"),
            c.onlineorder ? moment(c.onlineorder.deliverStartTime).format("HH:mm"): "",
            c.onlineorder ? c.onlineorder.receiverCustomer.ward: "",
            c.onlineorder ? c.onlineorder.receiverCustomer.district: "",
            c.onlineorder ? c.onlineorder.receiverCustomer.address.replace(/[\n]/g, ""): "",
            c.order.saleTotal,
            c.outlet.code, c.onlineorder ? c.onlineorder.shipping.provider: "",
            textInCake.join("; ")
        ]
    print(data.join("\t"))
})