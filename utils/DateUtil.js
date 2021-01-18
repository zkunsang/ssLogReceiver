const moment = require('moment');

const _ = require('lodash');
const defaultDateFormat = 'YYYY-MM-DD HH:mm:ss';
const detailDateFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
const YYYYMMDD = 'YYYYMMDD';
class DateUtil {
    constructor() { }

    dsToUtsObj(object, columnName, dateFormat = defaultDateFormat) {
        object[columnName] = moment(object[columnName], dateFormat).unix();
    }

    utsToDsObj(object, columnName) {
        if(!object[columnName])
            return;
            
        const length = object[columnName].toString().length;
        if (length > 10)
            object[columnName] = object[columnName] / 1000;

        object[columnName] = moment.unix(object[columnName]).format(defaultDateFormat);
    }

    dsToUts(ds, dateFormat = defaultDateFormat) {
        return moment(ds, dateFormat).unix();
    }

    dsToDate(ds, dateFormat = defaultDateFormat) {
        return moment(ds, dateFormat);
    }

    utsToDs(uts, dateFormat = defaultDateFormat) {
        return this.utsToDate(uts).format(dateFormat);
    }

    utsToDate(uts) {
        const length = uts.toString().length;
        if (length > 10)
            uts = parseInt(uts / 1000);

        return moment.unix(uts);
    }

    
    isBetween(now, startDate, endDate) {
        return moment.unix(now / 1000).isBetween(
            moment.unix(startDate),
            moment.unix(endDate));
    }

    getHours() {
        return moment().hours();
    }
}

module.exports = new DateUtil();
module.exports.DEFAULT_FORMAT = defaultDateFormat;
module.exports.DETAIL_FORMAT = detailDateFormat;
module.exports.YYYYMMDD = YYYYMMDD;