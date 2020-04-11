function setTipoPac(habArr) {
    var htmlStr = "";
    var spltHab = habArr.split("@");

    htmlStr =  "<label>Seleccionar Habitación</label>";
    htmlStr += "<select class='u-full-width no-padding' name='id_hab' required>" +
                    "<option></option>";
        
    for(var echStr in spltHab) {
        var spltVal = spltHab[echStr].split("|");
        
        if(spltVal[0] != "") {
            htmlStr += "<option value='" +
                        spltVal[0] + "'>" + 
                        spltVal[1] + "</option>";
        }
    }

    htmlStr += "</select>";
    document.getElementById('tipo-pac').innerHTML = htmlStr;
}

function setTipoPacSel(habArr,habActId,habActAl) {
    var htmlStr = "";
    var spltHab = habArr.split("@");

    htmlStr =  "<b>Seleccionar Habitación</b> Habitación acutal <b class='red'>" + habActAl + "</b>";
    htmlStr += "<select class='u-full-width no-padding' name='id_hab' required>" +
                    "<option value='" + habActId + "'>" + habActAl + "</option>" +
                    "<option></option>";
        
    for(var echStr in spltHab) {
        var spltVal = spltHab[echStr].split("|");
        
        if(spltVal[0] != "") {
            htmlStr += "<option value='" +
                        spltVal[0] + "'>" + 
                        spltVal[1] + "</option>";
        }
    }

    htmlStr += "</select>";
    document.getElementById('tipo-pac').innerHTML = htmlStr;
}

function noHab() {
    var htmlStr = "";

    htmlStr = "<label>Seleccionar Habitación:</label>No hay habitaciones disponibles.";

    document.getElementById('tipo-pac').innerHTML = htmlStr;
}

function pacTransit() {
    var htmlStr = "";

    document.getElementById('tipo-pac').innerHTML = htmlStr;
}

function cmbPassword(boolOpt, passWord) {
    var passHtml = "";

    if(boolOpt) {
        passHtml = "<input class='u-full-width' type='password' name='" + passWord + "' required>";
    }

    document.getElementById('cambiar-password').innerHTML = passHtml;
}

/* Seccion alergias */
function addAlergia() {
    var addAlrgHtml = "<textarea class='u-full-width no-padding' placeholder='Listar alergias' name='alrg_pac' style='max-width: 100%;' required></textarea>";
    
    addAlrgHtml += "<i onclick='delAlergia()' class='fa fa-minus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-alergias').innerHTML = addAlrgHtml;
}

function addAlergiaPass(alrgVal) {
    var alrgValCmp = String.fromCharCode(39) + alrgVal + String.fromCharCode(39);

    alrgVal = alrgVal.replace(/\|/gm,"\r\n");

    var addAlrgHtml = "<textarea class='u-full-width no-padding' placeholder='Listar alergias' name='alrg_pac' style='max-width: 100%;' required>" + alrgVal + "</textarea>";
    
    addAlrgHtml += "<i onclick=" + String.fromCharCode(34) + "delAlergiaPass(" + alrgValCmp + ")" + String.fromCharCode(34) + " class='fa fa-minus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-alergias').innerHTML = addAlrgHtml;
}

function delAlergia() {
    var delAlrgHtml = "<i onclick='addAlergia()' class='fa fa-plus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-alergias').innerHTML = delAlrgHtml;
}

function delAlergiaPass(alrgVal) {
    var alrgValCmp = String.fromCharCode(39) + alrgVal + String.fromCharCode(39);
    var delAlrgHtml = "<i onclick=" + String.fromCharCode(34) + "addAlergiaPass(" + alrgValCmp + ")" + String.fromCharCode(34) + " class='fa fa-plus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-alergias').innerHTML = delAlrgHtml;
}
/* Seccion alergias End */

/* Seccion enfermedades preexistentes */
function addPreexEnf() {
    var addPreexEnfHtml = "<textarea class='u-full-width no-padding' placeholder='Listar enfermedades preexistentes' name='enf_prex_pac' style='max-width: 100%;' required></textarea>";
    
    addPreexEnfHtml += "<i onclick='delPreexEnf()' class='fa fa-minus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-preex-enf').innerHTML = addPreexEnfHtml;
}

function addPreexEnfPass(enfpVal) {
    var enfpValCmp = String.fromCharCode(39) + enfpVal + String.fromCharCode(39);

    enfpVal = enfpVal.replace(/\|/gm,"\r\n");

    var addPreexEnfHtml = "<textarea class='u-full-width no-padding' placeholder='Listar enfermedades preexistentes' name='enf_prex_pac' style='max-width: 100%;' required>" + enfpVal + "</textarea>";
    
    addPreexEnfHtml += "<i onclick=" + String.fromCharCode(34) + "delAlergiaPass(" + enfpValCmp + ")" + String.fromCharCode(34) + " class='fa fa-minus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-preex-enf').innerHTML = addPreexEnfHtml;
}

function delPreexEnf() {
    var delPreexEnf = "<i onclick='addPreexEnf()' class='fa fa-plus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-preex-enf').innerHTML = delPreexEnf;
}

function delPreexEnfPass(enfpVal) {
    var enfpValCmp = String.fromCharCode(39) + enfpVal + String.fromCharCode(39);
    var delPreexEnf = "<i onclick=" + String.fromCharCode(34) + "addPreexEnfPass(" + enfpValCmp + ")" + String.fromCharCode(34) + " class='fa fa-plus-circle' style='color: #cd5070;font-size:20px;cursor: pointer;'></i>";

    document.getElementById('agr-preex-enf').innerHTML = delPreexEnf;
}
/* Seccion enfermedades preexistentes end */

function descSelected(selObj) {
    var itemDesc = "<label>" + selObj.options[selObj.selectedIndex].text + "</label>";
    document.getElementById('desc-exammed').innerHTML = itemDesc;
}