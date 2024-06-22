const START_DATE = '2024-05-06'
const END_DATE = '2024-05-12'

const saleEntryItems = db.saleentries.aggregate()
.match({
    created: {
       $gte: moment(START_DATE).startOf("day").toDate(),
       $lt: moment(END_DATE).endOf("day").toDate()
    },
    business: db.businesses.findOne({code: 'SAVOR'})._id,
    "order.items.category.cat": db.productcats.findOne({name: "Bánh sinh nhật"})._id,
    status: {$in: [null, 'closed', 'open']}
})
.unwind('$order.items')
.project('created order.items.sku order.items.description order.items.quantity order.items.lineTotal order.items.category.cat')
.toArray()
.map(d => {
    return {
        created: d.created,
        sku: _.get(d, 'order.items.sku'),
        description: _.get(d, 'order.items.description'),
        quantity: _.get(d, 'order.items.quantity', 0),
        lineTotal: _.get(d, 'order.items.lineTotal', 0),
        cat: _.invoke(d, 'order.items.category.cat.valueOf')

    }
})

const cakeItems = _.filter(saleEntryItems, { cat: '625ce6e71fac7f5be7c2c9f5'})
const nonCakeItems = _.reject(saleEntryItems, { cat: '625ce6e71fac7f5be7c2c9f5'})
const comboItems = cakeItems.filter(d => _.get(d, 'description', '').match(/combo/i))
const noncomboItems = cakeItems.filter(d => !_.get(d, 'description', '').match(/combo/i))
const cakeItemsSales = _.sumBy(cakeItems, 'lineTotal')
const nonCakeItemsSales = _.sumBy(nonCakeItems, 'lineTotal')

const saleEntries = db.saleentries.find({
    created: {
       $gte: moment(START_DATE).startOf("day").toDate(),
       $lt: moment(END_DATE).endOf("day").toDate()
    },
    business: db.businesses.findOne({code: 'SAVOR'})._id,
    "order.items.category.cat": db.productcats.findOne({name: "Bánh sinh nhật"})._id,
    status: {$in: [null, 'closed', 'open']}
})
.project('order.discount')
.toArray()

const totalDiscount = _.sumBy(saleEntries, 'order.discount')
const numOrder = saleEntries.length

const voucherTokens = db.vouchertokens.aggregate({
    createdAt: {
       $gte: moment(START_DATE).startOf("day").toDate(),
       $lt: moment(END_DATE).endOf("day").toDate()
    },
    saleEntry: {$exists: true}
})
.lookup({
    from: 'vouchers',
    localField: 'voucher',
    foreignField: '_id',
    as: 'vouchers'
})
.toArray()

const numVoucherTokens = voucherTokens.length
const numVouchers = _.flatten(_.map(voucherTokens, 'vouchers')).length

const vouchers = db.vouchers.find({
    voucherType: {$in: [
        "DISCOUNT_CAKE_ORDER",
    ]}
}).sort({_id: -1}).toArray()

const numUsedVouchers = db.saleentries.count({
    created: {
       $gte: moment(START_DATE).startOf("day").toDate(),
       $lt: moment(END_DATE).endOf("day").toDate()
    },
    voucher: {$in: _.map(vouchers, '_id')}
})

const saleBread = db.saleentries.aggregate()
.match({
    created: {
       $gte: moment(START_DATE).startOf("day").toDate(),
       $lt: moment(END_DATE).endOf("day").toDate()
    },
    business: db.businesses.findOne({code: "SAVOR"})["_id"],
    "order.items": {$not: {$elemMatch: {business: db.businesses.findOne({code: "SAVOR_CAKES"})["_id"]}}},
    status: {$ne: "void"}
}).toArray()

print({
    comboSalesQuantity: comboItems.length, cakeSalesQuantity: noncomboItems.length,
    cakeItemsSales,
    nonCakeItemsSales, totalDiscount, numOrder,
    numVoucherTokens, numVouchers, numUsedVouchers,
    saleSavorBread: _.sumBy(saleBread, "order.subTotal")
})
