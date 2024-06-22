const title = [
    "Tuần", "Cơ sở", "Tiêu đề",	"Trạng thái", "Loại OR",
    "Thời gian tạo", "Deadline", "Thời gian done đầu tiên",	"Thời gian done"
]
print(title.join("\t"))
db.outletreports.aggregate()
.match({
    created: {
        $gte: moment("2023-01-26").startOf("day").toDate(),
        $lte: moment("2023-02-26").endOf("day").toDate()
    },
    type:{$in: ["checklist-entry", "other"]}
    outlet: {$in: db.outlets.find({business: db.businesses.findOne({code: "ABBY"})["_id"]}).map(c=>c._id)}
})
.lookup({
    from: "outlets",
    localField: "outlet",
    foreignField: "_id",
    as: "outlet"
})
.unwind("$outlet")
.forEach(c=>{
    
    const data = [
            moment(c.created).format("W"),
            c.outlet.code,
            c.title, c.status, c.type,
            moment(c.created).format("YYYY-MM-DD HH:mm"),
            c.deadline ? moment(c.deadline).format("YYYY-MM-DD HH:mm"): "",
            c.firstDone ? moment(c.firstDone).format("YYYY-MM-DD HH:mm"): "",
            c.done ? moment(c.done).format("YYYY-MM-DD HH:mm"): ""
        ]
    print(data.join("\t"))
})
