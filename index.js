const util = require('util');
const {Builder, By} = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const download_dir = __dirname;
const converter = require("handbrake-js") ;
const fetch = require('node-fetch');
const jsonfile = require('jsonfile');

let videos = {Mid:[],Jungle:[],Adc:[],Support:[],Top:[]} ;

//Download ffmpeg plugin and set the path here

const ffmpegPath = "";
const ffmpegProbePath = "";

// 
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath); 
ffmpeg.setFfprobePath(ffmpegProbePath);

const streamPipeline = util.promisify(require('stream').pipeline)

const mainCDN = "https://d13z5uuzt1wkbz.cloudfront.net/";
const file = "/HIDDEN4500.m3u8";

let options = new firefox.Options();


options.setPreference("browser.download.dir", download_dir)
options.setPreference("browser.download.folderList", 2)
options.setPreference("browser.download.useDownloadDir", true);
options.setPreference("browser.download.manager.showWhenStarting", false )
options.setPreference("pdfjs.disabled", true );
options.setPreference("browser.helperApps.alwaysAsk.force", false);
options.setPreference("browser.helperApps.neverAsk.saveToDisk","application/download, application/octet-stream, video/mp4, video/m3u8, application/apple.vnd.mpegurl, application/x-mpegurl, video/mp2t, application/vnd.apple.mpegurl, application/mp4, video/mp4")
options.setPreference("browser.download.manager.alertOnEXEOpen", false);
options.setPreference("browser.download.manager.focusWhenStarting", false);  
options.setPreference("browser.helperApps.alwaysAsk.force", false);
options.setPreference("browser.download.manager.alertOnEXEOpen", false);
options.setPreference("browser.download.manager.closeWhenDone", true);
options.setPreference("browser.download.manager.showAlertOnComplete", false);
options.setPreference("browser.download.manager.useWindow", false);
options.setPreference("services.sync.prefs.sync.browser.download.manager.showWhenStarting",false);


const fs = require("fs");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

const homeDir = "D:\\scrapped";



let titles = [];
let courses = [];
let subtitles = [];
let totalVideos = 0;

const url = "https://www.skill-capped.com/lol/browse";

async function a() {
    
    let driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
    
   
    driver.manage().setTimeouts({pageLoad:3000});
    await driver.navigate().to(url);
    await getTitles(driver);

    await  driver.manage().window().maximize();

    const topics = Object.keys(videos) ;  
        for(let t = 0; t < titles.length; t++){

           
            await titles[t].elem.click();
            await driver.sleep(800);
            await getCourses(driver);
            
            for(let j = 0; j < courses.length; j++){
       
                if(j == 0){
                    continue;
                }
                 try {
                    await driver.executeScript("arguments[0].scrollIntoView();",courses[j]);
                 } catch (error) {
                     
                 } 
               
                
                
                
                await driver.sleep(1500);
                
                let section = await driver.executeScript(`return arguments[0].querySelectorAll("[class='title-text css-1ai61ue'] div")[0].childNodes[0].textContent`,courses[j]);
                let ind = videos[topics[t]].push({Course:section.replace("?"," "),Vids:[]})
                
                
    
    
                if(!subtitles.includes(section)){
                    subtitles.push(section)
                    
                    const vids =  await driver.executeScript("return arguments[0].getElementsByClassName('elem-course-row-video');",courses[j]);
                    const links = [];
    
                    for(let v = 0; v<vids.length;v++){
                        await links.push((await vids[v].getAttribute("href")).replace("https://www.skill-capped.com/lol/course/",""))
                    }
    
                    for(let l =0; l< links.length; l++){
                        const id = links[l].split("/")[3];
                        const titleVid = links[l].split("/")[2].replace("-", " ");
                        console.log(titleVid)
                        videos[topics[t]][ind - 1]["Vids"].push({title:titleVid,id:id});
                    }
                            
                }
            }

            await driver.sleep(800);
            await driver.executeScript("window.scrollTo(0, 0);");
            await driver.sleep(800);
        }

    driver.close();
    
    var keys = Object.keys(videos);
    jsonfile.writeFileSync(homeDir+"\\videos.json", videos);
    
    for(let o = 0; o < keys.length; o++){
        try {
            fs.mkdirSync(homeDir+"\\"+keys[o]); 
        } catch (error) {
            
        }
       
        var course =  videos[keys[o]];

        for(let u = 0; u < course.length;u++){
            let p = course[u].Course.replace(":"," - ");
            
            try {
                fs.mkdirSync(homeDir+"\\"+keys[o]+"\\"+u+"-"+p.replace("/"," ").replace(/\s/g, '-'));
            } catch (error) {
                
            }
         
            var tm = course[u].Vids;
            
        

            for(let t = 0 ;t < tm.length; t++){
                let ti = tm[t].title.replace(":","");
                await link_gen(tm[t].id,ti.replace("/"," "),t,homeDir+"/"+keys[o]+"/"+u+"-"+p.replace("/"," ").replace(/\s/g, '-'));
                var inputOut = "D:/scrapped"+"/"+keys[o]+"/"+u+"-"+p.replace("/"," ").replace(/\s/g, '-')+"/"+t+"-"+ti.replace("/"," ").replace(/\s/g, '-')+".ts"
                var out = "D:/scrapped"+"/"+keys[o]+"/"+u+"-"+p.replace("/"," ").replace(/\s/g, '-')+"/"+t+"-"+ti.replace("/"," ").replace(/\s/g, '-')+".mp4"
                
                let options2 =   {
                    input: inputOut,
                    output:out,
                    encoder: 'x265',
                    rotate: 0
                }

                console.log("A Converter... "+inputOut+"\n\n");

                //await converter.run(options2).catch(console.error)
                
            }
           
        }
    }
}

function getTitles(driver){
    return new Promise(async res=>{
        const tabs = await driver.findElements(By.className("css-17sa5ng"));
        const titlesAll = [];
     
        for(let i = 0; i < tabs.length; i++){
             await tabs[i].getAttribute("innerHTML").then(async val=>{
                
                 titlesAll.push({title:val});
                 titlesAll[i].elem = await driver.executeScript("return arguments[0].parentNode.parentNode;",tabs[i])
             });
        }
     
        titles = [];
        for(let i = 9 ; i < titlesAll.length ; i++){
           
            titles.push(titlesAll[i])
        }
     
        res();
    })
  
}



async function getCourses(driver){
    courses = [];
    return new Promise(async res=>{
        const container = await driver.findElement(By.className("elem-course-rows-main css-b1flu"));

        await driver.sleep(500);
       

        courses = await driver.executeScript("return arguments[0].childNodes",container);
        res();
    })
}

function link_gen(id,filename,i,path){
   
    return new Promise(async res=>{
         const link = mainCDN+id+file;
         await download(link,filename.replace(/\s/g, '-'),i,path,id);
         res()
    })
    
}

async function download (link,filename,i,path,id) {
   return new Promise(async res=>{
    const response = await fetch(link);

    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    await streamPipeline(response.body, fs.createWriteStream(path+"\\"+i+"-"+filename.replace(/\s/g, '-')+'.m3u8'))
    if (!fs.existsSync(path+"\\"+i+"-"+filename.replace(/\s/g, '-'))) {
     fs.mkdirSync(path+"\\"+i+"-"+filename.replace(/\s/g, '-'));
    }

    var linkList = await recreate(path+"\\"+i+"-"+filename.replace(/\s/g, '-')+'.m3u8',id,path+"\\"+i+"-"+filename.replace(/\s/g, '-'));

    console.log(linkList);
   

    for (let s = 0; s < linkList.length; s++){
        
        await merger(linkList[s],path+"/"+i+"-"+filename.replace(/\s/g, '-'));

        let buffer = fs.readFileSync(path.replace(`\\`,`/`)+'/'+i+'-'+filename.replace(/\s/g, '-')+'/'+linkList[s].substr(linkList[s].length - 19, linkList[s].length))
        fs.appendFileSync(path.replace("\\","/")+"/"+i+"-"+filename.replace(/\s/g, '-')+".ts", buffer);
        
        
        fs.unlinkSync(path.replace(`\\`,`/`)+'/'+i+'-'+filename.replace(/\s/g, '-')+'/'+linkList[s].substr(linkList[s].length - 19, linkList[s].length));
    }

    


    res()
   })

}

function pad_with_zeroes(number, length, st) {

    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }

    return st+my_string

}

function recreate(path,id,folder){
    
 
    return new Promise( async res =>{
        const text = fs.readFileSync(path);
        
        const fileTmp =  Buffer.from(text).toString("utf8");
       
        let  def_file = fileTmp.replace(/(HIDDEN4500)+/gm,"https://d13z5uuzt1wkbz.cloudfront.net/"+id+"/HIDDEN4500").split("\n");
        let links = [];
    
        for(let d = 0; d < def_file.length; d++){
            if(def_file[d].match(/https:\/\/d13z5uuzt1wkbz.cloudfront.net\//gm) != null){
                links.push(def_file[d]);
            }
        }
    
        fs.unlinkSync(path);
        fs.writeFileSync(path,def_file);
     
       
        console.log("Written to: "+path);
        totalVideos++;

        res(links);
    })
 
        
}

function merger(file, path){
    
    if(!fs.existsSync(path+"\\"+file.substr(file.length - 19, file.length))){
        console.log("Downloading: "+file);
       
        return new Promise(async res=>{

        
            const response = await fetch(file);
        
            console.log("File",file.substr(file.length - 19, file.length));
            console.log("Path",path+"\\"+file.substr(file.length - 19, file.length));
                    
            if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
           
            await streamPipeline(response.body, fs.createWriteStream(path+"\\"+file.substr(file.length - 19, file.length)))
            
           
            res();
        
           })
    }else{
        return new Promise(async res=>{

        
            console.log("Already downloaded")
            res();
        
        })
    }
   
}

a();
