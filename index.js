const util = require('util');
const {Builder, By} = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const download_dir = __dirname;
var fluent_ffmpeg = require("fluent-ffmpeg");
//const converter = new m3u8ToMp4();
const fetch = require('node-fetch');
const jsonfile = require('jsonfile');
const M3U8FileParser = require('m3u8-file-parser');
const reader = new M3U8FileParser();
//let videos = require("./data.json");
let videos = {Mid:[],Top:[],Jungle:[],Support:[],Adc:[]} ;

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

const homeDir = "F:\\";



let titles = [];
let courses = [];
let subtitles = [];

//let videos={};

const url = "https://www.skill-capped.com/lol/browse";
//const addon = "https://addons.mozilla.org/pt-PT/firefox/addon/video-downloadhelper/";

async function a() {
    
    let driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
    
   
    driver.manage().setTimeouts({pageLoad:3000});
    await driver.navigate().to(url);
    await getTitles(driver);

    await  driver.manage().window().maximize();

       
        //videos[titles[i].title] = [];

      
        await titles[4].elem.click();
        
        await driver.sleep(500);
    
        await getCourses(driver);
        for(let j = 0; j < courses.length; j++){
       
            if(j == 0){
                continue;
            }
              
           await driver.executeScript("arguments[0].scrollIntoView();",courses[j]);
            
            
            
            await driver.sleep(1500);
            
            let section = await driver.executeScript(`return arguments[0].querySelectorAll("[class='title-text css-1ai61ue'] div")[0].childNodes[0].textContent`,courses[j]);
            let ind = videos.Top.push({Course:section.replace("?"," "),Vids:[]})
            
            


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
                    videos.Top[ind - 1]["Vids"].push({title:titleVid,id:id});
                }
                        
            }
               
            
        }

        
        //await driver.sleep(2000);
        
      //  await driver.executeScript("window.scrollTo(0, 0);");
        
        //await driver.executeScript("arguments[0].scrollIntoView(true)",titles[i].elem);
    
    driver.close();
    Object.keys(videos).forEach(key=>{
        fs.mkdirSync(homeDir+"\\"+key);
        videos[key].forEach((course,i)=>{
            let p = course.Course.replace(":"," - ");
            fs.mkdirSync(homeDir+"\\"+key+"\\"+i+"-"+p.replace("/"," "));
            course.Vids.forEach(async (vid,j)=>{
                let ti =vid.title.replace(":","");
                await link_gen(vid.id,ti.replace("/"," "),j,homeDir+"\\"+key+"\\"+i+"-"+p.replace("/"," "));
            })
        })
    })

    jsonfile.writeFileSync(homeDir+"\\videos.json", videos)
}
   
   

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
  
async function login (driver){
    return new Promise(async res=>{
        await driver.navigate().to(url);
        await driver.findElement(By.className("css-7co8v6")).click();
        const inputs =  await driver.findElements(By.className("MuiInputBase-input MuiInput-input"));

    
        await inputs[0].click();
        await inputs[0].sendKeys(cred.user);
        await inputs[1].click()
        await inputs[1].sendKeys(cred.pass);
        await driver.findElement(By.className("MuiButton-label")).click();
        res();
    })
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

function createFolder(title,subtitle = "", i=""){
    subtitle = subtitle.replace("?"," ");

    if(!fs.existsSync(homeDir+`\\${title}\\${i}  ${subtitle}`.replace("/","-").trim())){
        fs.mkdirSync(homeDir+`\\${title}\\${i}  ${subtitle}`.replace("/","-").trim());
        return homeDir+`\\${title}\\${i}  ${subtitle}`.replace("/","-").trim();
    }
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
         await download(link,filename,i,path,id);
         res()
    })
    
}

function download (link,filename,i,path,id) {
   return new Promise(async res=>{
    const response = await fetch(link);
    console.log(link,i+"-"+filename+'.m3u8');

    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    await streamPipeline(response.body, fs.createWriteStream(path+"\\"+i+"-"+filename+'.m3u8'))
    if (!fs.existsSync(path+"\\"+i+"-"+filename)) {
     fs.mkdirSync(path+"\\"+i+"-"+filename);
    }

    await recreate(path+"\\"+i+"-"+filename+'.m3u8',id,path+"\\"+i+"-"+filename);
    res()

   }) 
    
    //merger(path+"\\"+i+"-"+filename)
}

function pad_with_zeroes(number, length, st) {

    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }

    return st+my_string

}

function recreate(path,id,folder){
    console.log("Recreating file "+path);
 
    return new Promise( async res =>{
        const text = fs.readFileSync(path);
        
        const fileTmp =  Buffer.from(text).toString("utf8");
            
        console.log("A escrever linhas")
        let  def_file = fileTmp.replace(/(HIDDEN4500)+/gm,"https://d13z5uuzt1wkbz.cloudfront.net/"+id+"/HIDDEN4500").split("\n");
        let links = [];
    
        for(let d = 0; d < def_file.length; d++){
            if(def_file[d].match(/https:\/\/d13z5uuzt1wkbz.cloudfront.net\//gm) != null){
                links.push(def_file[d]);
            }
        }
    
        fs.unlinkSync(path);
        fs.writeFileSync(path,def_file);
     
       
        console.log(path);
        
        /*for(let s = 0; s < links.length; s++){
            
             await merger(links[s],folder);
          
        }*/

        res();
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

a()

/*Object.keys(videos).forEach(async key=>{/
    if (!fs.existsSync(homeDir+"\\"+key)){
        fs.mkdirSync(homeDir+"\\"+key);
    }
 (async ()=>{
     let key =  "Top";
    for(let k = 0; k < videos.Top.length; k++){
        let p = videos.Top[k].Course.replace(":"," - ");
        if (!fs.existsSync(homeDir+"\\"+key+"\\"+k+"-"+p.replace("/"," "))){
            fs.mkdirSync(homeDir+"\\"+key+"\\"+k+"-"+p.replace("/"," "));
        }

        for(let s = 0; s < videos.Top[k].Vids.length; s++){
            let ti =videos.Top[k].Vids[s].title.replace(":","");
            await link_gen(videos.Top[k].Vids[s].id,ti.replace("/"," "),s,homeDir+"\\"+key+"\\"+k+"-"+p.replace("/"," "));
        }

    }
 })()      
    
})*/


