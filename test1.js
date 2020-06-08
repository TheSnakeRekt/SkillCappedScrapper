const fs = require("fs");

const text = fs.readFileSync("D:\\scrapped\\Top\\0-TOP STARTER COURSE\\0-split push-to-collapse.m3u8");

const fileTmp =  Buffer.from(text).toString("utf8").split("\n");

const arr = fileTmp.map(line=>{
    return line.replace("HIDDEN4500","https://d13z5uuzt1wkbz.cloudfront.net/p4s09l3dzn/HIDDEN4500")
})

console.log(arr);