function loadCSV(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(data => {
        const decoder = new TextDecoder('iso-8859-1');
        let text = decoder.decode(data)
        const rows = text.trim().split('\n');
        const headers = rows[0].split(';').map(header => header.trim());
        
        return rows.slice(1).map(row => {
          const values = row.split(';').map(value => value.trim());
          const obj = {};
          
          headers.forEach((header, index) => {
            const value = values[index];
            obj[header] = isNaN(value) ? value : Number(value);
          });
          
          return obj;
        });
      });
  }

  function loadBMPImage(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        const buffer = new Uint8Array(arrayBuffer);
        
        if (buffer[0] !== 0x42 || buffer[1] !== 0x4D) {
          throw new Error('Not a valid BMP file');
        }
        
        const fileSize = new DataView(arrayBuffer).getUint32(2, true);
        const pixelDataOffset = new DataView(arrayBuffer).getUint32(10, true);
        const dibHeaderSize = new DataView(arrayBuffer).getUint32(14, true);
        const width = new DataView(arrayBuffer).getInt32(18, true);
        const height = new DataView(arrayBuffer).getInt32(22, true);
        const bitsPerPixel = new DataView(arrayBuffer).getUint16(28, true);
        const compression = new DataView(arrayBuffer).getUint32(30, true);
        
        if (compression !== 0) {
          throw new Error(`Unsupported BMP compression method: ${compression}`);
        }
        
        const rowSize = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
        let pixels;
        
        if (bitsPerPixel === 24) {
          pixels = new Uint8Array(width * Math.abs(height) * 4);
          
          for (let y = 0; y < Math.abs(height); y++) {
            for (let x = 0; x < width; x++) {
              const srcY = height > 0 ? Math.abs(height) - 1 - y : y;
              const srcPos = pixelDataOffset + srcY * rowSize + x * 3;
              const destPos = (y * width + x) * 4;
              
              pixels[destPos + 0] = buffer[srcPos + 2];
              pixels[destPos + 1] = buffer[srcPos + 1];
              pixels[destPos + 2] = buffer[srcPos + 0];
              pixels[destPos + 3] = 255;
            }
          }
        } else if (bitsPerPixel === 32) {
          pixels = new Uint8Array(width * Math.abs(height) * 4);
          
          for (let y = 0; y < Math.abs(height); y++) {
            for (let x = 0; x < width; x++) {
              const srcY = height > 0 ? Math.abs(height) - 1 - y : y;
              const srcPos = pixelDataOffset + srcY * rowSize + x * 4;
              const destPos = (y * width + x) * 4;
              
              pixels[destPos + 0] = buffer[srcPos + 2];
              pixels[destPos + 1] = buffer[srcPos + 1];
              pixels[destPos + 2] = buffer[srcPos + 0];
              pixels[destPos + 3] = buffer[srcPos + 3];
            }
          }
        } else {
          throw new Error(`Unsupported bits per pixel: ${bitsPerPixel}`);
        }
        
        return {
          width,
          height: Math.abs(height),
          bitsPerPixel,
          pixels,
          fileSize
        };
      });
  }

function loadLocalisation(url){
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
      })
      .then(text => {
        const rows = text.trim().split('\n').map(s=>s.trim());
        let pairs = []
        rows.forEach(str=>{
            if(str.startsWith("PROV") && !str.startsWith("PROV_ADJ")){
                let num = Number(str.substring(4,str.indexOf(":")))
                let name = str.substring(str.indexOf("\"")+1,str.lastIndexOf("\""))
                pairs.push([num,name])
            }
        })
        return pairs
    });
}

function loadBracketFile(url){
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
      })
      .then(text => {
        let tokens = []
        let curToken = ""
        let arr = [...text]
        let commented = false
        let separate = [" ","\n","\t","}","{","="]
        let whitespace = [" ","\n","\t"]
        let newline = ["\n"]
        arr.forEach(c=>{
            if(c=="#") commented = true
            else if(separate.includes(c)){
                if(curToken.length>0){
                    tokens.push(curToken)
                    curToken=""
                }
                if(newline.includes(c)) commented = false
            }
            if(!commented && !whitespace.includes(c)){
                curToken+=c
            }
        })
        if(curToken.length>0) tokens.push(curToken)
        let base = []
        let stack = [base]
        let select = null
        tokens.forEach(tok=>{
            if(tok=="{"){
                stack.push(select)
            }else if(tok=="}"){
                stack.pop()
            }else if(tok!="="){
                let newObj = []
                stack[stack.length-1].push({name: tok,props: newObj})
                select = newObj
            }
        })
        return base
    });
}