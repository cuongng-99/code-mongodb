const start = "2024-05-01"
const end = "2024-05-31"  
print("Mã đơn\tGiá trị tạo\tGiá trị done\tNgày tạo\tTrạng thái\tNgày done\tSKU\tDescription\tCatman\tSố lượng\tGiá trị\tLoại đơn\tNV tạo\tTỉnh\tKhách hàng\tSĐT")
const link = 'https://work.4-handy.com/#!/wholesale-orders/'
db.wholesaleorders.aggregate()
.match({
    "stages.done.time": {
        $gte: moment(start).toDate(),
        $lte: moment(end).endOf("days").toDate()
    }
})
.lookup({
    from: "saleentries",
    localField: "saleEntry",
    foreignField: "_id",
    as: "se"
})
.lookup({
    from: "businesscustomers",
    localField: "businessCustomer",
    foreignField: "_id",
    as: "customer"
})
.unwind("$customer")
.lookup({
    from: "users",
    localField: "user",
    foreignField: "_id",
    as: "staff"
})
.unwind("$staff")
.unwind({path: "$se", preserveNullAndEmptyArrays: true})
.unwind("$se.order.items")
.lookup({
    from: "products",
    localField: "se.order.items.product",
    foreignField: "_id",
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
.forEach(c=>{
    const data = [
            `=HYPERLINK("${link}${c._id.valueOf()}", "${c.wholesaleOrderId}")`,
            c.orderValue,
            c.se ? c.se.order.subTotal: "",
            moment(c.created).format("YYYY-MM-DD"),
            c.status,
            c.stages?.done ? moment(c.stages.done.time).format("YYYY-MM-DD"): "",
            c.se.order.items.sku, c.se.order.items.description, c.catman.name,
            c.se.order.items.quantity, c.se.order.items.lineTotal,
            c.customer.type.includes("Đại lý") ? "Đại lý": "Sỉ",
            `${c.staff.code} - ${c.staff.displayName}`,
            c.receiverCustomer.city,
            c.customer.name, 
            c.customer.cellphone
        ]
    print(data.join("\t"))
})