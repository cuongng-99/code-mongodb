const link = "https://work.4-handy.com/#!/photo-reports/"
db.photoreports.aggregate()
.match({
    checkedTime: {
        $gte: moment("2023-01-23").toDate(),
        $lte: moment("2023-02-26").endOf("days").toDate()
    },
    // photoReportId: 118350,
    outlet: {$in: db.outlets.find({business: db.businesses.findOne({code: "ABBY"})["_id"]}).map(c=>c._id)}
})
.lookup({
    from: "users",
    localField: "checkedBy",
    foreignField: "_id",
    as: "checker"
})
.unwind("$checker")
.lookup({
    from: "outlets",
    localField: "outlet",
    foreignField: "_id",
    as: "outlet"
})
.unwind("$outlet")
.forEach(c=>{
    let result = c.images.map(c=>c.comment).filter(res=>typeof res === 'string').map(c=>c.replace(/[\n\r]/g, ", "))
    let checkType = c.checkedTypes.map(c=>c.name).map(c=>c.replace(/[\n\r]/g, ", "))
    let numCheckType = checkType.filter(c=>c!== "Khác").length
    
    const data = [
            `=HYPERLINK("${link}${c._id.valueOf()}", "${c.photoReportId}")`,
            moment(c.checkedTime).format("W"),
            moment(c.checkedTime).format("YYYY-MM-DD"),
            c.outlet.code,
            c.checker.code, c.checker.displayName, 
            result[0] ? `="- ${result.join("\"&CHAR(10)& \"- ")}"`: "",
            c.comment.replace(/[\n\r]/g, " "),
            checkType[0] ? `="- ${checkType.join("\"&CHAR(10)& \"- ")}"`: "",
            numCheckType
        ]
    print(data.join("\t"))
})