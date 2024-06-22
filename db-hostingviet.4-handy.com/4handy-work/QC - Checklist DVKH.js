const start = "2022-11-20"
const end = "2022-11-30"

const link = 'https://work.4-handy.com/#!/checklist-entries/'
const title = [
    "Mã NV", "Tên NV", "Cơ sở", "Rank", "Là Thử việc",
    "Số lượt check", "Tổng điểm", "Điểm TB",
    "Link Check1", "Link Check2", "Link Check3"
]
print(title.join("\t"))
const checklist = db.checklistentries.aggregate()
.match({
    created: {
        $gte: moment(start).toDate(),
        $lte: moment(end).endOf("days").toDate()
    },
    type: "customerService"
})
.unwind("$staffs")
.lookup({
    from: "users",
    localField: "staffs.staff",
    foreignField: "_id",
    as: "staff"
})
.unwind("$staff")
.group({
    _id: "$staff.code",
    checklistId: {$push: "$_id"},
    result: {$push: {$ifNull: ["$result", ""]}},
    point: {$push: {$sum: "$pointTable.point"}}
})
.toArray()

const staffs = db.salereports.aggregate()
.match({
    date: { 
        $gte: moment(start).startOf('day').toDate(),
        $lte: moment(end).endOf('day').toDate()
    },
    outlet: {$in: db.outlets.find({code: /^[ME]\d+/}).map(d=>d._id) }
})
.unwind('$employees')
.lookup({
    from: 'users',
    localField: 'employees.staff',
    foreignField: '_id',
    as: 'staff'
})
.unwind('$staff')
.lookup({
    from: 'outlets',
    localField: 'staff.outlet',
    foreignField: '_id',
    as: 'outlet'
})
.unwind('$outlet')
.group({
    _id: "$staff.code",
    displayName: {$first: "$staff.displayName"},
    outlet: {$first: "$outlet.code"},
    rank: {$first: "$staff.rank"},
    roles: {$last: "$employees.positions"}
})
.toArray()

let data = staffs.map((staff1 => {
    let foundId = checklist.filter(staff2 =>  staff2._id === staff1._id)[0]
    if (foundId) {
        staff1.result = foundId.result
        staff1.point = foundId.point
        staff1.checklistId = foundId.checklistId
    }
    return staff1
}))
data.forEach(c=>{
        
    let listLink = []
    if (c.checklistId) {
        for (let i=0;i<c.checklistId.length;i++) {
            listLink.push(`=HYPERLINK("${link}${c.checklistId[i].valueOf()}", "${c.result[i].replace(/[\n\t]/g, "")}")`)
        }
    }

    let isTrainee = false
    if (c.roles.includes("PROBATION_A") || c.roles.includes("PROBATION_B")) {
        isTrainee = true
    }
    let data_export = [
            c._id, c.displayName, c.outlet, c.rank, isTrainee,
            c.point ? c.point.length: 0,
            c.point ? _.sum(c.point): 0,
            c.point ? _.mean(c.point): 0,
            listLink.join("\t")
        ]
    print(data_export.join("\t"))
})