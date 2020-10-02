var ffmpeg = require('fluent-ffmpeg');

var pathToFolder = `D:\\scrapped\\Adc`;
var fs = require('fs')


async function start () {
    var folders = fs.readdirSync(pathToFolder);

    for(let i = 0; i < folders.length;  i++){

        var tmpPath = pathToFolder + `\\${folders[i]}`;
    
        var folder = fs.readdirSync(tmpPath);
    
        for(let j = 0; j < folder.length; j++){
            if(fs.lstatSync(tmpPath+`\\`+folder[j]).isDirectory()){
                var files = fs.readdirSync(tmpPath+`\\`+folder[j]);
    
                fs.writeFileSync(pathToFolder+"\\vids.txt","ffconcat version 1.0\n");
    
                for(let k = 0 ; k < files.length; k++){
                    fs.appendFileSync(pathToFolder+"\\vids.txt", `file '${tmpPath+`\\`+folder[j]+`\\`+files[k]}' \n`);
                }
                
                await ffmpeg(pathToFolder+"\\"+j+".txt").inputFormat('concat').mergeToFile(tmpPath+`\\`+folder[j]+'\\'+folder[j]+'.mp4', tmpPath+`\\`+folder[j]);
                console.log(tmpPath+`\\`+folder[j]+'\\'+folder[j]+'.mp4 Criado');
            }
        }
    }
}

start();