db.calendarentries
  .aggregate({
    start: { $gte: moment('2023-02-01').startOf('day').toDate() },
    end: { $lte: moment('2023-03-31').endOf('day').toDate() },
    status: 'actived',
    outlet: {$in: db.outlets.find({code: "G3" }).map(d=>d._id) },
  })
  .lookup({
    from: 'users',
    localField: 'staff',
    foreignField: '_id',
    as: 'staff',
  })
  .unwind('$staff')
  .lookup({
    from: 'outlets',
    localField: 'outlet',
    foreignField: '_id',
    as: 'outlet',
  })
  .unwind('$outlet')
  .forEach((d) => {
    const diff = (moment(d.end).diff(moment(d.start), 'minutes'))/60
    const outletS = db.outlets.findOne({ _id: d.staff.outlet }).code

    const data = [
        d.staff.code, d.staff.displayName,
        d.staff.position,
        outletS, d.outlet.code,
        d.task,
        moment(d.start).format('YYYY-MM-DD'), ,diff  ]
    print(data.join('\t'))
  })
