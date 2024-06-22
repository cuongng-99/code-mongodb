const start = "2022-08-20";
const end = "2022-08-27";

console.log(`Ngày tạo	Mã NV	Tên NV	Rank	Outlet	Ticket/Usernote	Trạng thái	Loại ticket	Số tiền gửi phạt	Link checklist	Link complaint	Nội dung`)
const linkComplaint = "https://work.4-handy.com/#!/complaints/";
const linkChecklist = "https://work.4-handy.com/#!/checklist-entries/";

// Dữ liệu Nhân viên
const staffQc = db.users.find({
    outlet: db.outlets.findOne({code: "QC"})["_id"]
}).map(c=>c._id);

const staffAll = {};
db.users.aggregate()
.match({
    $or: [
        {created: {$gte: moment("2017-01-01").toDate()}},
        {$and: [
            {roles: {$nin: ["deleted", "inactive"]}},
            {created: {$lte: moment("2017-01-01").toDate()}},
        ]}
    ]
})
.lookup({
    from: "outlets",
    localField: "outlet",
    foreignField: "_id",
    as: "outlet"
})
.unwind("$outlet")
.forEach((it)=> { 
      staffAll[it._id] = `${it.code}\t${it.displayName}\t${it.rank}\t${it.outlet.code}`
});

// LINK complaint
const complaintMap = {}
db.complaints.find({
    created: {$gte : moment(start).subtract(2, "month").toDate()}
}).forEach((it)=> { 
      complaintMap[it._id] = `=HYPERLINK("${linkComplaint}${it._id.valueOf()}", "${it.complaintId}")`
});

// LINK checklist
const checkListMap = {}
db.checklistentries.find({
    created: {$gte : moment(start).subtract(2, "month").toDate()}
}).forEach((it)=> { 
      checkListMap[it._id] = `=HYPERLINK("${linkChecklist}${it._id.valueOf()}", "link")`
});

// Dữ liệu theo tickets
db.stickets.aggregate()
.match({
    user: {$in: staffQc},
    created: {
        $gte: moment(start).toDate(), 
        $lte: moment(end).endOf("day").toDate()
    },
    status: {$ne: "deleted"}
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
            moment(c.created).format("YYYY-MM-DD"),
            staffAll[c.staff], 
            "ticket",
            c.status, 
            c.type,
            c.fineMoney,
            checkListMap[c.checkListEntry],
            complaintMap[c.complaint],
            c.content.replace(/[\n\r]/g, " ")
        ]
    print(data.join("\t"))
});

// Dữ liệu theo usernote
db.usernotes.aggregate({
    user: {$in: staffQc},
    created: {
        $gte: moment(start).toDate(),
        $lte: moment(end).endOf("day").toDate()
    },
    status: {$ne: "deleted"}
})
.forEach(c=>{
    const data = [
            moment(c.created).format("YYYY-MM-DD"), 
            staffAll[c.staff],
            "usernote",
            c.status, , , 
            c.checkListEntry ? checkListMap[c.checkListEntry]: "", , 
            c.content.replace(/<[^>]*>?/gm, '').replace(/[\n\r]/g, "")
        ]
    print(data.join("\t"))
})
