const staffMap = {}
db.users.find({code: {"$not": /^[MES]\d+/}}).forEach((it)=> { 
      staffMap[it._id] = `${it.code} - ${it.displayName}`
});
const link = "https://work.4-handy.com/#!/application-forms"
db.applicationforms.aggregate()
    .match({
        created: {
            $gte: moment("2024-02-01").toDate(),
            $lte: moment("2024-05-15").endOf("day").toDate()
        },
        //applicationFormId: 76903
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
                c.outlet.code, 
                `=HYPERLINK("${link}/${c._id.valueOf()}/edit", "${c.applicationFormId}")`,
                c.position,
                c.status,
                moment(c.created).format("YYYY-MM-DD"),
                c.interviewer ? `${staffMap[c.interviewer]}\t${moment(c.interviewDate).format("YYYY-MM-DD")}`: "\t",
                c?.stages?.confirmed?.time ? `${staffMap[c.stages.confirmed.user]}\t${moment(c.stages.confirmed.time).format("YYYY-MM-DD")}`: "\t",
                c?.stages?.interviewed?.time ? `${staffMap[c.stages.interviewed.user]}\t${moment(c.stages.interviewed.time).format("YYYY-MM-DD")}`: "\t",
                c?.stages?.probationary?.time ? `${staffMap[c.stages.probationary.user]}\t${moment(c.stages.probationary.time).format("YYYY-MM-DD")}`: "\t",
                c?.stages?.training?.time ? `${staffMap[c.stages.training.user]}\t${moment(c.stages.training.time).format("YYYY-MM-DD")}`: "\t",
                c?.stages?.employee?.time ? `${staffMap[c.stages.employee.user]}\t${moment(c.stages.employee.time).format("YYYY-MM-DD")}`: "\t",
                c?.stages?.eliminated?.time ? `${staffMap[c.stages.eliminated.user]}\t${moment(c.stages.eliminated.time).format("YYYY-MM-DD")}`: "\t"
            ]
        print(data.join("\t"))
    })