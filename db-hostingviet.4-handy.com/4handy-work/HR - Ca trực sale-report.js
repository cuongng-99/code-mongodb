print(['Mã NV', 'Tên NV', 'Vị trí', 'CS chính', 'CS trực', 'Vị trí', 'Ngày', 'Ca trực', 'Giờ trực'].join('\t'))
const outlets = db.outlets.find().toArray()
const mapOutlets = _.reduce(outlets, (result, outlet) => {
    result[outlet._id.valueOf()] = outlet.code
    return result
}, {}) 
db.salereports.aggregate()
.match({
    date: { 
        $gte: moment('2024-02-08').startOf('day').toDate(),
        $lte: moment('2024-02-14').endOf('day').toDate()
    },
    //outlet: {$in: db.outlets.find({code: /^[MES]\d+/}).map(d=>d._id) }
})
.unwind('$employees')
.lookup({
    from: 'users',
    localField: 'employees.staff',
    foreignField: '_id',
    as: 'staff'
})
.unwind('$staff')
.forEach(d => {
    const data = [
        d.staff.code, 
        d.staff.displayName, 
        d.staff.position,
        mapOutlets[d.staff.outlet.valueOf()], 
        mapOutlets[d.outlet.valueOf()], 
        d.employees.positions, 
        moment(d.date).format('YYYY-MM-DD'), 
        d.shift, 
        Math.round(d.hours * 100) /100
    ]
    print(data.join('\t'))
})