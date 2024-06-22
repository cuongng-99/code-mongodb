print(`NV vi phạm	Trạng thái	Nội dung	Ngày tạo	Người gửi`)
const userMap = {}
db.users.find({
}).forEach((it)=> { 
    userMap[it._id] = `${it.code} - ${it.displayName}`
});
db.usernotes.aggregate()
.match({
    created: {
        $gte: moment("2022-06-26").toDate(),
        $lte: moment("2022-07-26").endOf("day").toDate()
    },
    user: {$in: db.users.find({outlet: db.outlets.findOne({code: "QC"})["_id"]}).map(c=>c._id)}
})
.forEach(c=>{
    const data = [
            userMap[c.staff], c.status, c.content.replace(/<[^>]*>?/gm, '').replace(/[\n\b]/g, " "),
            moment(c.created).format("YYYY-MM-DD"),
            c.user ? userMap[c.user]: ""
        ]
    print(data.join("\t"))
})