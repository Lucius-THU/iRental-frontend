export default function format(time, format='yyyy-MM-dd HH:mm:ss') { // 处理同服务器返回的时间格式
    let t = new Date(time)
    let tf = i => ((i < 10 ? '0' : '') + i)
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, a => {
        switch(a) {
            case 'yyyy':
                return tf(t.getFullYear())
            case 'MM':
                return tf(t.getMonth() + 1)
            case 'mm':
                return tf(t.getMinutes())
            case 'dd':
                return tf(t.getDate())
            case 'HH':
                return tf(t.getHours())
            case 'ss':
                return tf(t.getSeconds())
            }
    })
}