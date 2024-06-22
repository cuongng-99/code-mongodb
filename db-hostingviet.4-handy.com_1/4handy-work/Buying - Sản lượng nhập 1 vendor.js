const LINK = "https://work.4-handy.com/#!/buying-entries/"
const outletMap = {}
db.outlets.find({code:{$exists: true}}).forEach((it)=> { 
      outletMap[it._id] = `${it.code}\t${it.region}`
});
db.stockentries.aggregate()
.match({
    created : {
        $gte : moment("2023-10-01").toDate(),
        // $lte : moment("2023-10-17").endOf("day").toDate()
    },
    currentStatus : "received",
    type: "buy"
})
.unwind("$items")
.lookup({
    from: "buyingentries",
    localField: "buyingEntry",
    foreignField: "_id",
    as: "be"
})
.unwind("$be")
.match({
    "be.vendor": db.vendors.findOne({code: "HN411"})["_id"],
    "be.created": {
        $gte : moment("2023-11-13").toDate(),
        $lte : moment("2023-11-21").endOf("day").toDate()
    }
}) // HN411
.forEach(c=>{
   const data = [
            `=HYPERLINK("${LINK}${c.be._id.valueOf()}";"${c.be.buyingEntryId}")`,
            c.be.status,
            moment(c.be.created).format("YYYY-MM-DD"),
            moment(c.created).format("YYYY-MM-DD"),
            c.be.paymentStatus,
            outletMap[c.destination],
            c.items.sku,
            c.items.description,
            c.items.quantity,
            c.items.cogs
       ]
    print(data.join("\t"))
})