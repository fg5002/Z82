const  pos={lat: 47.16, lng: 19.56};
const isoDate = new Date().toISOString().split('T')[0]
document.querySelector('#datum').value=isoDate;

const mymap = L.map('map_canvas').setView(pos, 7);
L.tileLayer('https://utcakereso.hu/tile/osm/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,<a href="https://utcakereso.hu/">Utcakereso.hu</a>',
    maxZoom: 18
}).addTo(mymap);

const centerButton = L.control({
    position: 'topleft'
});
centerButton.onAdd = () => {
    this._div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    this._div.style.backgroundColor = 'white';
    this._div.style.font.weight = 'bold';
    this._div.style.width = '30px';
    this._div.style.height ='30px';
    this._div.style.display = 'flex';
    this._div.style.justifyContent = "center";
    this._div.style.alignItems = "center";
    this._div.style.cursor = "pointer";
    this._div.innerHTML = `<img src='https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png' height='20px'>`;
    this._div.onclick = ()=> centerBtnClickHandler();
    return this._div;
}
centerButton.addTo(mymap);

const centerBtnClickHandler=()=>{
    const cor=mymap.getCenter();
    marker.setLatLng(cor);
    document.querySelector("#coordinput").value=coordToString(cor);
}

const marker = L.marker(pos,{draggable: true})
.on('dragend', (e)=> {
    document.querySelector("#coordinput").value=coordToString(e.target.getLatLng());
}) 
.on('dragstart', ()=> {
    document.querySelector('#telepules').value = 0; 
    document.querySelector('#suburb').value = '';
}) 
.on('click',(e)=>{
    mymap.setView(e.target.getLatLng());
    getAddress(e.target.getLatLng());
    document.querySelector("#coordinput").value=coordToString(e.target.getLatLng());
})
.addTo(mymap);
const coordInput = document.querySelector('#coordinput');

coordInput.addEventListener('keypress',(e)=>{
    if (e.keyCode === 13) {
        coordInputHandler(e.target.value)
        e.preventDefault();
    }
})

coordInput.addEventListener('dblclick',(e)=>{
    e.target.value = ''
});

const coordInputHandler=(coord)=>{
    const c=coordStringValidator(coord)
    if(c){
        const cor = stringToCoord(c);
        mymap.setView(cor);
        marker.setLatLng(cor);
        document.querySelector("#coordinput").value=coordToString(cor);
        document.querySelector("#telepules").value = 0;
        document.querySelector("#suburb").value = '';
    }
}

const coordStringValidator=(t)=>{
    try{
        const pattern=/^(\d{2})[\.,](\d+)\D+(\d{2})[\.;,](\d+)$/
        const result = t.match(pattern) ? t.replace(pattern,'$1.$2,$3.$4') : null;
        if(result){
            console.log(result);
            return result;
        }else{
            throw new ReferenceError();
        }
    }
    catch(error){
        if(error instanceof ReferenceError){
            alert('Invalid coordinate format');
        }else{
            alert(error.message);
        }
    }
}

const formatCoord = (cor)=>{
    const lat = parseFloat(cor.lat).toFixed(6);
    const lng = parseFloat(cor.lng).toFixed(6);
    return {lat, lng};
}

const stringToCoord=(s)=>{
    const ar=[] = s.split(',');
    let a=parseFloat(ar[0]).toFixed(6);
    let b=parseFloat(ar[1]).toFixed(6);
    if(b>a)
    [a, b] = [b, a]
    return {lat: a, lng: b}
}

const coordToString=(c)=>{
    const cor=formatCoord(c)
    return `${cor.lat},${cor.lng}`;
}

const setSettlement=(text)=>{
    const dd = document.querySelector('#telepules');
    Array.from(dd.options).forEach((d)=> {
        if (d.text == text) {
            dd.value = d.value;
            return false;
        }
    });
}

const getOptionsTextByValue=(id, value)=>{
    const dd = document.querySelector(id);
    return Array.from(dd.options).find((d)=> d.value == value).text;
}

const getAddress=(cor)=>{
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${cor.lat}&lon=${cor.lng}`;
    fetch(url) 
    .then((data)=> data.json()) 
    .then((data)=>  displayAddress(data.address)) 
}

const displayAddress=(d)=>{
    document.querySelector('#suburb').value = d.hasOwnProperty('suburb') ? d.suburb : '';
    const settlement=d.hasOwnProperty('city') ? d.city : 
    d.hasOwnProperty('town') ? d.town :
    d.hasOwnProperty('village') ? d.village : ''; 
    if(settlement)
        setSettlement(settlement)
}

const displayData=(d)=>{
    const kor=getOptionsTextByValue('#kor',d.kor.value)
    const nem=getOptionsTextByValue('#nem',d.nem.value)
    const ar=[];
    if(d.suburb.value!='')
        ar.push(d.suburb.value);
    if(d.terulet.value!='')
        ar.push(d.terulet.value);
    const ter = ar.join(', ')
    return `
        ${d.datum.value}
        ${getOptionsTextByValue('#fajId',d.fajId.value)}
        ${d.peldany.value}pd ${kor} ${nem}
        ${getOptionsTextByValue('#telepules', d.telepules.value)}${ter ? ', '+ter : ''}
        ${d.megfigyelo.value}
        ${d.megjegyzes.value}
        ${d.foto.value}
        ${d.coord.value}
    `
}

const clearData=()=>{
    document.querySelector('#fajId').value = 0;
    document.querySelector('#peldany').value = '';
    document.querySelector('#kor').value = 0;
    document.querySelector('#nem').value = 0;
    document.querySelector('#telepules').value = 0;
    document.querySelector('#suburb').value = '';
    if(document.querySelector('#hasonlo2').checked == false)
        document.querySelector('#terulet').value = '';
    document.querySelector('#megjegyzes').value = '';
    document.querySelector('#foto').value = '';    
    document.querySelector('#coordinput').value = '';    
}

const submitButtonClick=(e)=>{
    e.preventDefault();
    if(Feltoltes.fajId.value==0 || Feltoltes.telepules.value==0 || Feltoltes.peldany.value==''){
        alert("A szükséges mezők\nkitöltendőek");
        return false;
    }
    const dd=displayData(Feltoltes);
    alert(dd);
    setTimeout(()=>clearData(), 0);
}

const help=()=>{
    alert(`
    +   a marker ikonnal a képernyő közepére
        ugratható a marker (nem kell cincálni)
    +   a markerre kattintással lehet a beállítani
        a helyet
    +   a települést és esetleg a városrészt
        automatikusan beállítja
    +   feltöltés során a marker nem mozdul el
    +   LatLon/LonLat tizedes koordináta beírható, másolható
    +   enterre a marker a megadott koordinátára ugrik
    +   a városrész (ha van) a terület előtagja lesz, 
        így nem kell adatbázist módosítani
    -   Mint kiderült, a felhasznált reverse geocoder
        a https://nominatim.openstreetmap.org/
        nem mindig pontos...
    `)
}


const bird = (n)=>{
    const url=`http://birding.hu/megfigyeles/adatlap/682555`;

    const fetchHeaders = new Headers({ 
        'Content-Type': 'text/html'
    }) 

    const fetchOptions = { 
        method: 'GET', 
        headers: fetchHeaders, 
        mode: 'no-cors', 
        //cache: 'no-cache' 
    } 

    fetch(url, fetchOptions)
    .then((response)=> response.text())
    .then((html)=> {
        console.log(html);
        /*const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const lat = doc.querySelector('#gMapLat').innerHTML;
        console.log(lat);*/
    
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });

}