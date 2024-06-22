const startDate = "2024-06-03"
const endDate = "2024-06-09"

const title = [
    "Tuần", "Mã complaint", "Chuỗi", "Cơ sở", 
    "Loại complaint", "Nhóm phụ", "Nội dung", "Sản phẩm",
    "Nhân viên", "Ticket", "Voucher Xin lỗi", "Giá trị", "Người gửi",
    "Giá trị PR", "Thời gian tạo",  "Trạng thái"
]
print(title.join("\t"))
let staffMap = {}
db.users.find().forEach(c=>staffMap[c._id] = c)

let voucherMap = {}
db.vouchers.find({
    created: {$gte: moment(startDate).subtract(1, 'month').toDate()}
}).forEach(c=>voucherMap[c._id] = c)

let paymentRequestValue = {}
db.paymentrequests.find({
    created: {$gte: moment(startDate).subtract(1, 'month').toDate()}
}).forEach(c=>paymentRequestValue[c._id] = c.totalMoney)


let ticketMap = {}
db.stickets.find({
    created: {$gte: moment(startDate).subtract(1, 'month').toDate()},
    complaint: {$exists: true}
}).forEach(c=>ticketMap[c.complaint] = c.fineMoney)

const link = "https://work.4-handy.com/#!/complaints/"
db.complaints.aggregate()
    .match({
        // complaintId: 8769,
        created : {
            $gte : moment(startDate).startOf("day").toDate(),
            $lte : moment(endDate).endOf("day").toDate()
        },
        status : {$ne: "inactive"},
        type: "external",
    })
    .lookup({
        from : "outlets",
        localField : "outlet",
        foreignField : "_id",
        as : "outlet"
    }).unwind("$outlet")
    .lookup({
        from : "businesses",
        localField : "business",
        foreignField : "_id",
        as : "business"
    }).unwind("$business")
    
    .forEach(c=>{
        let firstCall 
            for (let i = 0; i < c.notes.length; i++) {
                if(c.notes[i].content.includes("Đã gọi điện khách hàng")) {
                    firstCall = c.notes[i].time
                }
            }
        let voucher = ''
        if (c.voucher) {
            voucher = `${voucherMap[c.voucher].name}\t${voucherMap[c.voucher].quantity}\t${staffMap[voucherMap[c.voucher].user].code} - ${staffMap[voucherMap[c.voucher].user].displayName}`
        } else if (c.refundVoucher) {
            voucher = `${voucherMap[c.refundVoucher].name}\t${voucherMap[c.refundVoucher].quantity}\t`
        } else {
            voucher = '\t\t'
        } 
        
        let prValue = ''
        for (let prId of c.paymentRequests) {
            prValue = `${paymentRequestValue[prId]} ${prValue}`
        }

        let listProducts = []
        c.products.forEach(c=>{
            listProducts.push(`${c.sku} - ${c.description}`)
        })
        
        let staffs = []
        c.staffs.forEach(c=>{
            staffs.push(`${staffMap[c].code} - ${staffMap[c].displayName}`)
        })
        
        const data = [
            moment(c.created).format("W"),
            `=HYPERLINK("${link}${c._id.valueOf()}";"${c.complaintId}")`,
            c.business.code,
            c.outlet.code, 
            c.categories,
            c.subCategories,
            c.title.replace( /(<([^>]+)>)/ig, ''),
            listProducts.join("; "),
            staffs.join("; "),
            ticketMap[c._id],
            voucher,
            prValue,
            moment(c.created).format("YYYY-MM-DD HH:mm"),
            c.status
        ]
        print(data.join("\t"))
    })