print(`Mã đơn,Trạng thái,Ngày đặt,Ngày nhận,Thời gian nhận,SKU,Description,Quantity,Cơ sở,HT giao hàng`.split(",").join("\t"))
const link = 'https://work.4-handy.com/#!/online-orders/'
const sku = db.products.aggregate()
    .lookup({
          from: "productcats",
          localField: "category.cat",
          foreignField: "_id",
          as: "cat"
    })
    .unwind("$cat")
    .match({"cat.name": {$in: ["Bánh sinh nhật"]}})
    .map(c=>c.sku)

db.onlineorders.aggregate()
    .match({
        created: {
            $gte: moment("2024-03-01").toDate(),
            $lte: moment("2024-03-08").endOf("day").toDate()
        },
        // status: "done"
    })
    .unwind("$items")
    .match({"items.sku": {"$in": sku}})
    .lookup({
        from: "outlets",
        localField: "assignedOutlet",
        foreignField: "_id",
        as: "outlet"
    })
    .unwind("$outlet")
    .forEach(c=>{
        const data = [
                `=HYPERLINK("${link}${c._id.valueOf()}", "${c.onlineOrderId}")`,
                c.status,
                moment(c.created).format("YYYY-MM-DD"),
                moment(c.deliverStartTime).format("YYYY-MM-DD"),
                moment(c.deliverStartTime).format("HH:mm"),
                c.items.sku, c.items.description, c.items.quantity,
                c.outlet.code,c.localPickupMethod
            ]
        print(data.join("\t"))
    })