Promise.all([
    loadBMPImage("resource/provinces.bmp"),
    loadCSV("resource/definition.csv"),
    loadLocalisation("resource/prov_names_l_english.yml"),
    loadLocalisation("resource/emperor_map_l_english.yml"),
    loadBracketFile("resource/area.txt"),
    loadBracketFile("resource/region.txt"),
    loadBracketFile("resource/00_region_colors.txt"),
    loadBracketFile("resource/continent.txt"),

]).then((resource)=>{
    let provinceDescription = new ProvinceDescription(resource[0],resource[1],[resource[2],resource[3]],resource[4],resource[5],resource[6],resource[7])

    let promptProvince = null
    let selectProvince = null
    let gameOver = true
    let errText = makeh()
    errText.style.display = "none"
    errText.style.color = "red"
    let dispText = makeh("")
    
    let mapView = makeMapView(provinceDescription,(id)=>{
        if(!gameOver){
            if(selectProvince==id){
                selectProvince = null
                mapView.unsetMarker(0)
            }else{
                selectProvince = id
                mapView.setMarker(0,id)
            }
        }
    })

    let continentSelect = makeSelectList(provinceDescription.getContinents())

    function setupGame(){
        let none = true
        let banList = []
        continentSelect.getSelectList().forEach((val,key)=>{
            if(val) none = false
            else banList.push(key)
        })
        if(none){
            errText.innerHTML = "Select Continent"
            errText.style.display = "block"
            return
        }else{
            errText.style.display = "none"
        }
        btn.innerHTML = "Submit"
        promptProvince = provinceDescription.pickRandomProvince(banList)
        dispText.innerHTML = provinceDescription.getProvinceHierarchy(promptProvince)[0]
        gameOver = false
        selectProvince = null
        mapView.unsetMarker(0)
        mapView.unsetMarker(1)
    }

    let btn = makeButton("Submit",()=>{
        if(gameOver){
            setupGame()
        }else{
            if(selectProvince==null){
                errText.innerHTML = "Select Province"
                errText.style.display = "block"
                return
            }
            mapView.setMarker(1,promptProvince)
            gameOver = true
            errText.style.display = "none"
            let guessed = provinceDescription.getProvinceHierarchy(selectProvince)
            let prompt = provinceDescription.getProvinceHierarchy(promptProvince)
            dispText.innerHTML = "<b>Guessed</b><br> "+guessed[2]+"<br>"+guessed[1]+"<br>"+guessed[0]+"<br><b>Correct</b><br>"+prompt[2]+"<br>"+prompt[1]+"<br>"+prompt[0]
            btn.innerHTML = "Try again"
        }
    })

    let skipBtn = makeButton("Skip",()=>{
        setupGame()
    })

    let ltab = makevbox([
        makeh("EU4_Guesser"),
        dispText,
        errText,
        btn,
        skipBtn,
        continentSelect.html
    ])
    ltab.style.minWidth="150px"
    let main = makehbox([
        makevbox([mapView.html]),
        ltab
    ])
    document.body.appendChild(main)

    setupGame()
})