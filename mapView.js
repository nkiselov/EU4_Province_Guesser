function makeMapView(provinceDescription,onProvinceClick){
    let canvas = document.createElement("canvas")

    canvas.style.width = "100%"
    canvas.style.height = "100%"

    canvas.width = 3072/2
    canvas.height = 2048/2

    let rectPos = [0.5,0.5]
    let rectHeight = 1
    let minHeight = 0.03

    function getRectWidth(){
        return canvas.clientWidth/canvas.clientHeight*rectHeight/provinceDescription.getAspectRatio()
    }

    function clamp(val,low,high){
        if(high<low) return (low+high)/2
        return Math.max(low,Math.min(high,val))
    }

    function moveRect(dx,dy){
        console.log([dx,dy])
        let rectWidth = getRectWidth()
        rectPos[1]+=dy*rectWidth*provinceDescription.getAspectRatio()
        rectPos[0]+=dx*rectHeight/provinceDescription.getAspectRatio()
        rectPos[1] = clamp(rectPos[1],rectHeight/2,1-rectHeight/2)
        rectPos[0] = clamp(rectPos[0],rectWidth/2,1-rectWidth/2)
    }

    function scaleRect(cx,cy,r){
        rectHeight = clamp(rectHeight*r,minHeight,1)
        let rectWidth = getRectWidth()
        rectPos[1]-=(cy-0.5)*(r-1)*rectHeight
        rectPos[0]-=(cx-0.5)*(r-1)*rectWidth
        rectPos[1] = clamp(rectPos[1],rectHeight/2,1-rectHeight/2)
        rectPos[0] = clamp(rectPos[0],rectWidth/2,1-rectWidth/2)
    }

    let gl = canvas.getContext('webgl2')
    let [provinceTexture,baseTexture] = provinceDescription.getBorderTexture(gl)
    let renderShader = new ComputeShader(gl,new MeshAll(),shaders.renderMapFS,["srcTex","baseTex"])

    let markers = [[0,0,0],[0,0,0]]

    function anim(){
        let size = provinceDescription.getSize()
        let thickness = clamp(2*rectHeight,0.4,1)
        renderShader.setUniform("dxy",[thickness/size[0],thickness/size[1]],UniformType.U2F)
        renderShader.setUniform("center",rectPos,UniformType.U2F)
        renderShader.setUniform("size",[getRectWidth(),rectHeight],UniformType.U2F)
        for(let i=0; i<markers.length; i++){
            renderShader.setUniform("marker"+i,markers[i],UniformType.U3F)
        }
        renderShader.render([provinceTexture,baseTexture])
        requestAnimationFrame(anim)
    }

    anim()
    
    function navigate(e) {
        const rect = canvas.getBoundingClientRect();
        let mouseX = (e.clientX - rect.left)/canvas.clientWidth
        let mouseY = (e.clientY - rect.top)/canvas.clientHeight
        for(let i=0; i<Math.abs(e.deltaY); i++) scaleRect(mouseX,mouseY,Math.exp(0.001*Math.sign(e.deltaY)))
    }
    
    canvas.addEventListener('wheel', navigate);

    let moveDelta = 0.15
    document.addEventListener("keydown", (e)=>{
        if (e.key == "ArrowLeft") {
            moveRect(-moveDelta,0)
        }
        else if (e.key == "ArrowRight") {
            moveRect(moveDelta,0)
        }else if(e.key == "ArrowDown"){
            moveRect(0,moveDelta)
        }else if(e.key == "ArrowUp"){
            moveRect(0,-moveDelta)
        }
    });

    canvas.addEventListener("mousedown",(e)=>{
        const rect = canvas.getBoundingClientRect();
        let mouseX = (e.clientX - rect.left)/canvas.clientWidth
        let mouseY = (e.clientY - rect.top)/canvas.clientHeight
        let x = getRectWidth()*(mouseX-0.5)+rectPos[0]
        let y = rectHeight*(mouseY-0.5)+rectPos[1]
        let provId = provinceDescription.getProvinceId(x,y)
        if(provinceDescription.legalProvince(provId)) onProvinceClick(provId)
    })

    return {
        html: canvas,
        setMarker: (ind,provId)=>{
            markers[ind] = provinceDescription.getColor(provId)
        },
        unsetMarker: (ind)=>{
            markers[ind] = [0,0,0]
        },
        focusProvince: (provId)=>{

        }
    }
}