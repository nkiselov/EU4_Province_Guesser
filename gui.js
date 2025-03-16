function makeButton(label, onclick){
    let button = document.createElement("button")
    button.onclick = onclick
    button.innerHTML = label
    return button
}

function makehbox(elems){
    let hbox = document.createElement("div")
    hbox.className = "hbox"
    elems.forEach((e)=>hbox.appendChild(e))
    return hbox
}

function makevbox(elems){
    let vbox = document.createElement("div")
    vbox.className = "vbox"
    elems.forEach((e)=>vbox.appendChild(e))
    return vbox
}

function makeh(text){
    let h = document.createElement("h")
    h.innerHTML = text
    return h
}

function maketoggle(checked, onchange){
    let tog = document.createElement("input")
    tog.type = "checkbox"
    tog.checked = checked
    tog.onchange = ()=>onchange(tog.checked)
    return tog
}

function makeSelectList(labels){
    let selectList = new Map()
    labels.forEach(lbl=>selectList.set(lbl,true))
    let main = makevbox(labels.map(lbl=>
        makehbox([maketoggle(true,val=>selectList.set(lbl,val)),makeh(lbl)])
    ))
    return {
        html: main,
        getSelectList: ()=>selectList
    }
}