class ProvinceDescription{
    constructor(provinceMap,rawLabels,localisations,areaLabels,regionLabels,regionColors,continentLabels){
        this.provinceMap = provinceMap
        this.color2id = new Map()
        this.provinces = new Map()
        rawLabels.forEach(label => {
            let key = label.red+","+label.green+","+label.blue
            this.color2id.set(key,label.province)
            this.provinces.set(label.province, {
                enable: false,
                name: label.name,
                color: [87, 87, 87]
            })
        });
        localisations.forEach(localisation=>{
            localisation.forEach(pair=>{
                this.provinces.set(pair[0],{
                    enable: false,
                    name: pair[1],
                    color: [87, 87, 87]
                })
            })
        })
        this.areas = new Map()
        for(let i=0; i<regionLabels.length; i++){
            if(regionLabels[i].props.length==0) continue
            regionLabels[i].props[0].props.forEach((area)=>{
                this.areas.set(area.name,{
                    region: regionLabels[i].name,
                    color: regionColors[i].props.map(v=>Number(v.name))
                })
            })
        }

        areaLabels[0].props.forEach(area=>{
            area.props.forEach(prov=>{
                if(prov.name=="color") return
                let id = Number(prov.name)
                this.provinces.get(id).color = [70, 105, 158]
            })
        })
        areaLabels[1].props.forEach(area=>{
            area.props.forEach(prov=>{
                if(prov.name=="color") return
                let id = Number(prov.name)
                this.provinces.get(id).color = [70, 105, 158]
            })
        })
        areaLabels[2].props.forEach(area=>{
            area.props.forEach(prov=>{
                if(prov.name=="color") return
                let id = Number(prov.name)
                if(!this.provinces.has(id)){
                    console.log(id)
                    return
                }
                this.provinces.get(id).enable = true
                this.provinces.get(id).area = area.name
                this.provinces.get(id).region = this.areas.get(area.name).region
                this.provinces.get(id).color = this.areas.get(area.name).color
            })
        })
        this.idList = new Set()
        this.provinces.forEach((prov,key)=>{
            if("enable" in prov && prov.enable){
                this.idList.add(key)
            }
        })
        this.id2color = new Map()
        this.color2id.forEach((val,key)=>{
            if(this.idList.has(val)){
                this.id2color.set(val,key.split(",").map(s=>Number(s)))
            }
        })
        this.id2continent = new Map()
        this.continents = []
        continentLabels.forEach((cont)=>{
            this.continents.push(cont.name)
            cont.props.forEach(prov=>{
                this.id2continent.set(Number(prov.name),cont.name)
            })
        })
    }

    getBorderTexture(gl){
        let w = this.provinceMap.width
        let h = this.provinceMap.height
        let pixels = this.provinceMap.pixels
        let newPixels = new Uint8Array(pixels.length)
        for(let x=0; x<w; x++){
            for(let y=0; y<h; y++){
                let ind = (y*w+x)*4
                let key = pixels[ind]+","+pixels[ind+1]+","+pixels[ind+2]
                let id = this.color2id.get(key)
                let color = this.provinces.get(id).color
                newPixels[ind] = color[0]
                newPixels[ind+1] = color[1]
                newPixels[ind+2] = color[2]
                newPixels[ind+3] = 255
            }
        }
        return [new ComputeTexture(gl,TextureType.T4I,w,h,newPixels,false),new ComputeTexture(gl,TextureType.T4I,w,h,pixels,false)]
    }

    getProvinceId(x,y){
        console.log(x,y)
        let ix = Math.round(this.provinceMap.width*x)
        let iy = Math.round(this.provinceMap.height*y)
        let ind = (iy*this.provinceMap.width+ix)*4
        let rgb = Array.from(this.provinceMap.pixels.slice(ind,ind+3))
        console.log(rgb)
        let id = this.color2id.get(rgb[0]+","+rgb[1]+","+rgb[2])
        console.log(id)
        console.log(this.provinces.get(id))
        return id
    }

    getAspectRatio(){
        return 11/4
    }

    getSize(){
        return [this.provinceMap.width,this.provinceMap.height]
    }

    getColor(provId){
        return this.id2color.get(provId)
    }

    legalProvince(provId){
        return this.idList.has(provId)
    }

    pickRandomProvince(continentDisable){
        let forbid = new Set(continentDisable)
        let pickList = Array.from(this.idList).filter((id)=>{
            return !forbid.has(this.id2continent.get(id))
        })
        return pickList[Math.floor(Math.random()*pickList.length)]
    }

    getProvinceHierarchy(provId){
        let prov = this.provinces.get(provId)
        return [prov.name,prov.area,prov.region]
    }

    getContinents(){
        return this.continents
    }
}