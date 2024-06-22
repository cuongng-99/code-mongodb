print(["Tuần", "Cơ sở", "Số check tag giá"].join("\t"))
db.checklistentries.aggregate({
    created: {
        $gte: moment("2023-02-13").toDate(),
        $lte: moment("2023-02-19").endOf("day").toDate()
    },
    // outlet: db.outlets.findOne({code: "E1"})["_id"],
})
.unwind("$checklistCriterias")
.match({
    "checklistCriterias.content": /TAG GIÁ, BẢNG GIÁ - ĐẾM SỐ LƯỢNG TAG GIÁ SAI VỊ TRÍ, THIẾU/
})
.lookup({
    from: "outlets",
    localField: "outlet",
    foreignField: "_id",
    as: "outlet"
})
.unwind("$outlet")
.sort({outlet: -1})
.forEach(c=>{print([moment(c.created).format("W"), c.outlet.code, c.checklistCriterias.error].join("\t"))})