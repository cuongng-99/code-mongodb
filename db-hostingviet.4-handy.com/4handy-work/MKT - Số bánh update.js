db.users.aggregate()
.match({
    roles: {$nin: ["deleted", "inactive", "outlet", "trainee"]},
    //code: "D8145"
    //code: "D10830"
})
.lookup({
    from: "outlets",
    localField: "outlet",
    foreignField: "_id",
    as: "outlet"
})
.unwind("$outlet")
.match({"outlet.code": /^[ME]\d+/})
.lookup({
    from: "applicationforms",
    localField: "applicationForm",
    foreignField: "_id",
    as: "appform"
})
.unwind({path: "$appform", "preserveNullAndEmptyArrays": true})
.match({
    $or: [
        {"appform.stages.employee.time": {
            $lt: moment("2023-11-25").toDate(),
        }},
        {"appform.stages.employee.time": {$exists: false}}
    ]
})
.forEach(c=>print([c.outlet.code, c.code, c.displayName, c.position, c?.appform?.stages?.employee ?  moment(c.appform.stages.employee.time).format("YYYY-MM-DD") : ""
 //c.appform.stages.time ? moment(c.appform.stages.employee.time).format("YYYY-MM-DD"): ""
 ].join("\t"))