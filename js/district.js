const districts = {

Western:[
"Colombo",
"Gampaha",
"Kalutara"
],

Central:[
"Kandy",
"Matale",
"Nuwara Eliya"
],

Southern:[
"Galle",
"Matara",
"Hambantota"
],

Northern:[
"Jaffna",
"Kilinochchi",
"Mannar",
"Mullaitivu",
"Vavuniya"
],

Eastern:[
"Batticaloa",
"Ampara",
"Trincomalee"
],

"North Western":[
"Kurunegala",
"Puttalam"
],

"North Central":[
"Anuradhapura",
"Polonnaruwa"
],

Uva:[
"Badulla",
"Monaragala"
],

Sabaragamuwa:[
"Kegalle",
"Ratnapura"
]

};

const province =
document.getElementById("province");

const district =
document.getElementById("district");

province.addEventListener("change",()=>{

district.innerHTML =
"<option>Select District</option>";

districts[province.value].forEach(item=>{

district.innerHTML +=

`<option>${item}</option>`;

});

});