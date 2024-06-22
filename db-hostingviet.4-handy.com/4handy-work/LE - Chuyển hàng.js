const LINK = "https://work.4-handy.com/#!/buying-entries/"
const outletMap = {}
db.outlets.find({code:{$exists: true}}).forEach((it)=> { 
      outletMap[it._id] = it.code
});
const sku = `B10876
B10875
V2205
V2204`.split("\n")
db.stockentries.aggregate()
.match({
    created : {
        $gte : moment("2024-01-18").toDate(),
        $lte : moment("2024-03-30").endOf("day").toDate()
    },
    // outlet: {$in: db.outlets.find({code: /^D\d+/, region: "NORTH"}).map(c=>c._id)}
    destination : {$in: db.outlets.find({code: /^[ME]\d+/}).map(c=>c._id)},
    currentStatus : "received",
    "items.sku": {$in: sku}
})
.unwind("$items")
.forEach(c=>{
   const data = [
            `=HYPERLINK("${LINK}${c._id.valueOf()}";"${c.stockEntryId}")`,
            moment(c.created).format("YYYY-MM-DD"),
            c.currentStatus,
            c.type,
            outletMap[c.outlet],
            outletMap[c.destination],
            c.items.sku,
            c.items.description, c.items.quantity
       ]
    print(data.join("\t"))
})