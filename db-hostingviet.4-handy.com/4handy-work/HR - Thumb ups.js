const link = "https://work.4-handy.com/#!/thumb-ups/"
db.thumbups.aggregate({
    created: {
        $gte: moment("2022-09-01").toDate(),
        $lte: moment("2022-09-30").endOf("days").toDate()
    },
   // _id: ObjectId("6315803920ea0a38f5d65eeb")
})
   .lookup({
       from: "users",
       localField: "staff",
       foreignField: "_id",
       as: "staff"
   })
   .unwind("$staff")
   .lookup({
       from: "outlets",
       localField: "staff.outlet",
       foreignField: "_id",
       as: "outlet"
   })
   .unwind("$outlet")
   .match({
       "outlet.code": /^[MES]\d+/
   })
   .forEach(c=>{
       const data = [
            `=HYPERLINK("${link}${c._id.valueOf()}", "${c.name.replace(/[\n\t]/g, " ")}")`,
            moment(c.created).format("YYYY-MM-DD"),
            c.staff.code, c.staff.displayName, c.outlet.code, c.thumbUpType, c.status, c.group, c.prizeMoney
           ]
        print(data.join("\t"))
   })