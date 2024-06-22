const START = "2024-04-26"
const END = "2024-05-25"

print('date\toutlet\tstaffCode\tName\tPosition\tsalereportID\toverTime\tnote')
db.shiftreports.aggregate()
    .match({ 
        date: { 
            $gte: moment(START).startOf('day').toDate(), 
            $lte: moment(END).endOf('day').toDate() }, 
        "employees.hadOverTime": true,
        // outlet: {$in: db.outlets.find({ code: /^D\d+/}).map(d=>d._id) }
    })
    .unwind("$employees")
    .match({ "employees.hadOverTime": true })
    .sort({ _id: -1 })
    .lookup({
        from: 'outlets',
        localField: "outlet",
        foreignField: "_id",
        as: "outlet"
    })
    .unwind("$outlet")
    .lookup({
        from: 'users',
        localField: "employees.staff",
        foreignField: "_id",
        as: "employees.staff"
    })
    .unwind("$employees.staff")
    .forEach(it => {
        const staff = it.employees
        const data = [moment(it.date).format('YYYY-MM-DD'), it.outlet.code, staff.staff.code, staff.staff.displayName, staff.staff.position, it.shiftReportId, staff.overTime, it.employees.note]
        print(data.join('\t'))
    })