const express  = require('express');
const pool     = require('../database');
const passport = require('passport');
const helpers  = require('../lib/helpers');
const multer   = require('multer');
const fs       = require('fs-extra');

//Storage
const storage = multer.diskStorage({
    destination: __dirname + '/../public/',
    filename: function(req, file, cb) {
        cb(null,Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage
});

const { isLoggedIn } = require('../lib/auth');
const router  = express.Router();

//Metodos Administradores ======================
//Vista Agregar Administradores ----------------
router.get('/agregar-admin', isLoggedIn, async (req, res) =>{
    res.render('idoctor/agregarAdmin');
});

router.post('/agregar-admin', isLoggedIn, async (req, res) =>{
    const
    {
        nombre_admin,
        alias_admin,
        password_admin
    } = req.body;

    const newAdmin = {
        nombre_admin,
        alias_admin,
        password_admin
    };

    newAdmin.password_admin = await helpers.encryptPassword(newAdmin.password_admin);

    await pool.query('INSERT INTO admins SET ?', [newAdmin]);
    req.flash('success', 'Administrador Agregado');
    res.redirect('/home');
});
//Metodos Administradores ======================
//==============================================

//Metodos paciente =============================
//Vista Ver Pacientes --------------------------
router.get('/ver-pacientes', isLoggedIn, async (req, res) =>{
    if(req.user.id_enf) {
        const pacLista = await pool.query('SELECT paciente.id_pac, ' +
                                                 'paciente.foto_pac, ' +
                                                 'paciente.tipo_pac, ' +
                                                 'paciente.nombre_pac, ' +
                                                 'paciente.fecha_nac_pac, ' +
                                                 'paciente.sexo_pac, ' +
                                                 'paciente.lugar_nac_pac, ' +
                                                 'paciente.curp_pac, ' +
                                                 'paciente.grp_sang_pac, ' +
                                                 'paciente.dir_pac, ' +
                                                 'paciente.tel_pac, ' +
                                                 'paciente.cont_ref_pac, ' +
                                                 'paciente.alta_pac, ' +
                                                 'paciente.diag_pac, ' +
                                                 'paciente.id_hab, ' +
                                                 'alergias.alrg_pac, ' +
                                                 'enf_preex.enf_prex_pac, ' +
                                                 'habitaciones.alias_hab ' +
                                            'FROM paciente ' +
                                            'LEFT OUTER JOIN alergias ' +
                                            'ON paciente.id_pac = alergias.id_pac ' +
                                            'LEFT OUTER JOIN enf_preex ' +
                                            'ON paciente.id_pac = enf_preex.id_pac ' +
                                            'LEFT OUTER JOIN habitaciones ' +
                                            'ON paciente.id_hab = habitaciones.id_hab ' +
                                            'WHERE paciente.tipo_pac = 1');
        
        res.render('idoctor/verPacientes',{ pacLista });
    }
    else if(req.user.id_dr || req.user.id_admin) {
        const pacLista = await pool.query('SELECT paciente.id_pac, ' +
                                                 'paciente.foto_pac, ' +
                                                 'paciente.tipo_pac, ' +
                                                 'paciente.nombre_pac, ' +
                                                 'paciente.fecha_nac_pac, ' +
                                                 'paciente.sexo_pac, ' +
                                                 'paciente.lugar_nac_pac, ' +
                                                 'paciente.curp_pac, ' +
                                                 'paciente.grp_sang_pac, ' +
                                                 'paciente.dir_pac, ' +
                                                 'paciente.tel_pac, ' +
                                                 'paciente.cont_ref_pac, ' +
                                                 'paciente.alta_pac, ' +
                                                 'paciente.diag_pac, ' +
                                                 'paciente.id_hab, ' +
                                                 'alergias.alrg_pac, ' +
                                                 'enf_preex.enf_prex_pac, ' +
                                                 'habitaciones.alias_hab ' +
                                            'FROM paciente ' +
                                            'LEFT OUTER JOIN alergias ' +
                                            'ON paciente.id_pac = alergias.id_pac ' +
                                            'LEFT OUTER JOIN enf_preex ' +
                                            'ON paciente.id_pac = enf_preex.id_pac ' +
                                            'LEFT OUTER JOIN habitaciones ' +
                                            'ON paciente.id_hab = habitaciones.id_hab');
        
        res.render('idoctor/verPacientes',{ pacLista, user: req.user });
    } 
    else {
        res.redirect('/home');
    }
});

router.post('/ver-pacientes/:id_pac', isLoggedIn, async (req, res) =>{
    const { id_pac } = req.params;
    const { diag_pac } = req.body;

    await pool.query('UPDATE paciente SET diag_pac = ? WHERE id_pac = ?', [diag_pac,id_pac]);
    req.flash('success', 'Cambios Guardados');
    res.redirect('/idoctor/ver-pacientes');
});

//Vista Editar Paciente ------------------------
router.get('/editar-paciente/:id_pac', isLoggedIn, async (req, res) =>{
    const { id_pac } = req.params;
    const habLista = await pool.query('SELECT * FROM habitaciones');
    const pacLista = await pool.query('SELECT * FROM paciente');
    const pacDatos = await pool.query('SELECT paciente.id_pac, ' +
                                          'paciente.foto_pac, ' +
                                          'paciente.tipo_pac, ' +
                                          'paciente.nombre_pac, ' +
                                          'paciente.fecha_nac_pac, ' +
                                          'paciente.sexo_pac, ' +
                                          'paciente.lugar_nac_pac, ' +
                                          'paciente.curp_pac, ' +
                                          'paciente.grp_sang_pac, ' +
                                          'paciente.dir_pac, ' +
                                          'paciente.tel_pac, ' +
                                          'paciente.cont_ref_pac, ' +
                                          'paciente.alta_pac, ' +
                                          'paciente.diag_pac, ' +
                                          'paciente.id_hab, ' +
                                          'habitaciones.alias_hab, ' +
                                          'alergias.alrg_pac, ' +
                                          'enf_preex.enf_prex_pac ' +
                                      'FROM paciente ' +
                                      'LEFT OUTER JOIN habitaciones ' +
                                      'ON paciente.id_hab = habitaciones.id_hab ' +
                                      'LEFT OUTER JOIN alergias ' +
                                      'ON paciente.id_pac = alergias.id_pac ' +
                                      'LEFT OUTER JOIN enf_preex ' +
                                      'ON paciente.id_pac = enf_preex.id_pac ' +
                                      'WHERE paciente.id_pac = ?',[id_pac]);
    
    if(Object.keys(habLista).length > 0) {
        if(Object.keys(pacLista).length > 0) {
            for(var pacIndx in pacLista) {
                if(pacLista[pacIndx].id_hab == undefined) {
                    continue;
                }
                for(var habIndx in habLista) {
                    if(habLista[habIndx].id_hab == pacLista[pacIndx].id_hab) {
                        delete habLista[habIndx];
                    }
                }
            }
            
            const innLista = habLista.filter(n=>n);
            if(innLista.length == 0) {
                pacDatos[0].habLst = null;
            }
            else {
                pacDatos[0].habLst = { innLista };
            }
            
        }
        else {
            const innLista = habLista;
            pacDatos[0] = { 
                habLst: { innLista }
            };
        }
    }
    
    res.render('idoctor/editarPaciente', { pacDatos: pacDatos[0] });
});

router.post('/editar-paciente/:id_pac', isLoggedIn, async (req, res) =>{
    const { id_pac } = req.params;
    const alrgList   = await pool.query('SELECT * FROM alergias WHERE id_pac = ?', [id_pac]);
    const enfpList   = await pool.query('SELECT * FROM enf_preex WHERE id_pac = ?', [id_pac]);

    const
    {
        nombre_pac,
        tipo_pac,
        id_hab,
        fecha_nac_pac,
        sexo_pac,
        lugar_nac_pac,
        curp_pac,
        grp_sang_pac,
        dir_pac,
        tel_pac,
        cont_ref_pac,
        alrg_pac,
        enf_prex_pac
    } = req.body;
    
    var diag_pac = null;
    var foto_pac = null;
    var alta_pac;

    if(tipo_pac == '2') {
        alta_pac = true;
    }
    else {
        alta_pac = false;
    }

    const pacienteData = 
    {
        foto_pac,
        tipo_pac,
        nombre_pac,
        fecha_nac_pac,
        sexo_pac,
        lugar_nac_pac,
        curp_pac,
        grp_sang_pac,
        dir_pac,
        tel_pac,
        cont_ref_pac,
        alta_pac,
        diag_pac,
    };
    
    await pool.query('UPDATE paciente SET ? WHERE id_pac = ?', [pacienteData,id_pac]);
    
    if(id_hab != '') {
        await pool.query('UPDATE paciente SET id_hab = ? WHERE paciente.id_pac = ?', [id_hab,id_pac]);
    }
    else {
        await pool.query('UPDATE paciente SET id_hab = NULL WHERE paciente.id_pac = ?', [id_pac]);
    }
    
    if(alrg_pac != undefined) {
        if(alrgList.length == 0) {
            await pool.query('INSERT INTO alergias SET id_pac = ?, alrg_pac = ?', [id_pac,alrg_pac]);
        }
        else {
            await pool.query('UPDATE alergias SET alrg_pac = ? WHERE id_pac = ?', [alrg_pac,id_pac]);
        }
    }
    else {
        if(alrgList.length != 0) {
            await pool.query('UPDATE alergias SET alrg_pac = NULL WHERE id_pac = ?', [id_pac]);
        }
    }
        
    if(enf_prex_pac != undefined) {
        if(enfpList.length == 0) {
            await pool.query('INSERT INTO enf_preex SET id_pac = ?, enf_prex_pac = ?', [id_pac,enf_prex_pac]);
        }
        else {
            await pool.query('UPDATE enf_preex SET enf_prex_pac = ? WHERE id_pac = ?', [enf_prex_pac,id_pac]);
        }
    }
    else {
        if(enfpList.length != 0) {
            await pool.query('UPDATE enf_preex SET enf_prex_pac = NULL WHERE id_pac = ?', [id_pac]);
        }
    }
    
    req.flash('success', 'Cambios Guardados');
    res.redirect('/idoctor/ver-pacientes');
});

//Vista Agregar Paciente -----------------------
router.get('/agregar-paciente', isLoggedIn, async (req, res) =>{
    const habLista = await pool.query('SELECT * FROM habitaciones');
    var pacLista = await pool.query('SELECT * FROM paciente');

    
    if(Object.keys(habLista).length > 0) {
        if(Object.keys(pacLista).length > 0) {
            for(var pacIndx in pacLista) {
                if(pacLista[pacIndx].id_hab == undefined) {
                    continue;
                }
                for(var habIndx in habLista) {
                    if(habLista[habIndx].id_hab == pacLista[pacIndx].id_hab) {
                        delete habLista[habIndx];
                    }
                }
            }
            
            const innLista = habLista.filter(n=>n);
            if(innLista.length == 0) {
                pacLista[0].habLst = null;
            }
            else {
                pacLista[0].habLst = { innLista };
            }
            
        }
        else {
            const innLista = habLista;
            pacLista[0] = { 
                habLst: { innLista }
            };
        }
    }
    
    res.render('idoctor/agregarPaciente', { pacLista: pacLista[0] });
});

router.post('/agregar-paciente', isLoggedIn, async (req, res) =>{
    const
    {
        nombre_pac,
        tipo_pac,
        id_hab,
        fecha_nac_pac,
        sexo_pac,
        lugar_nac_pac,
        curp_pac,
        grp_sang_pac,
        dir_pac,
        tel_pac,
        cont_ref_pac,
        alrg_pac,
        enf_prex_pac
    } = req.body;
    
    var diag_pac = null;
    var foto_pac = null;
    var alta_pac;

    if(tipo_pac == '2') {
        alta_pac = true;
    }
    else {
        alta_pac = false;
    }

    const pacienteData = 
    {
        foto_pac,
        tipo_pac,
        nombre_pac,
        fecha_nac_pac,
        sexo_pac,
        lugar_nac_pac,
        curp_pac,
        grp_sang_pac,
        dir_pac,
        tel_pac,
        cont_ref_pac,
        alta_pac,
        diag_pac,
        id_hab
    };

    await pool.query('INSERT INTO paciente SET ?', [pacienteData]);

    if(alrg_pac     != undefined ||
       enf_prex_pac != undefined) {
        const id_pac = await pool.query('SELECT id_pac FROM paciente WHERE (nombre_pac=? && grp_sang_pac=? && dir_pac=?)',[nombre_pac,grp_sang_pac,dir_pac]);
        
        if(alrg_pac != undefined) {
            await pool.query('INSERT INTO alergias SET id_pac=?,alrg_pac=?', [id_pac[0].id_pac,alrg_pac]);
        }
        
        if(enf_prex_pac != undefined) {
            await pool.query('INSERT INTO enf_preex SET id_pac=?,enf_prex_pac=?', [id_pac[0].id_pac,enf_prex_pac]);
        }
    }

    req.flash('success', 'Paciente Agregado');
    res.redirect('/idoctor/ver-pacientes');
});
//==============================================

//Metodos Doctor ===============================
//Vista Ver Doctores ---------------------------
router.get('/ver-doctores', isLoggedIn, async (req, res) =>{
    const doctoresLista = await pool.query('SELECT * FROM doctores');
    const consltLista = await pool.query('SELECT * FROM consultorios');
    
    if(doctoresLista != null) {
        if(consltLista != null) {
            for (var drTblEntry in doctoresLista) {
                if(doctoresLista[drTblEntry].id_conslt != null){
                    for (var tblEntry in consltLista) {
                        if (consltLista[tblEntry].id_conslt == doctoresLista[drTblEntry].id_conslt) {
                            doctoresLista[drTblEntry].alias_conslt = consltLista[tblEntry].alias_conslt;
                            break;
                        }
                    }
                }
            }
        }
    }
    
    res.render('idoctor/verDoctores',  { doctoresLista });
});

//Vista Editar Doctores ------------------------
router.get('/editar-doctor/:id_dr', isLoggedIn, async (req, res) =>{
    const { id_dr } = req.params;
    const drLista = await pool.query('SELECT doctores.id_dr, ' +
                                            'doctores.foto_dr, ' +
                                            'doctores.nombre_dr, ' +
                                            'doctores.alias_dr, ' +
                                            'doctores.password_dr, ' +
                                            'doctores.id_conslt, ' +
                                            'consultorios.alias_conslt ' +
                                     'FROM doctores ' +
                                     'LEFT OUTER JOIN consultorios ' +
                                     'ON doctores.id_conslt = consultorios.id_conslt ' +
                                     'WHERE id_dr = ?',[id_dr]);
    
    const innLista = await pool.query('SELECT * FROM consultorios');
    const drsLista = await pool.query('SELECT * FROM doctores');
    
    if(Object.keys(innLista).length > 0) {
        if(Object.keys(drsLista).length > 0) {
            for(var drIndx in drsLista) {
                if(drsLista[drIndx].id_conslt != undefined ||
                   drsLista[drIndx].id_conslt != null) {
                    for(var consltIndx in innLista) {
                        if(innLista[consltIndx].id_conslt == drsLista[drIndx].id_conslt) {
                            delete innLista[consltIndx];
                        }
                    }
                }
            }
        }

        const consltLista = innLista.filter(n=>n);

        if(consltLista.length == 0) {
            drLista[0].clLista = null;
        }
        else {
            drLista[0].clLista = {consltLista};
        }
    }

    
    
    res.render('idoctor/editarDoctor',  { drLista: drLista[0] });
});

router.post('/editar-doctor/:id_dr', upload.single("foto_dr"), isLoggedIn, async (req, res) =>{
    const { id_dr } = req.params;
    const { nombre_dr,
            alias_dr,
            password_dr,
            id_conslt } = req.body;
    
    if(res.req.file != undefined ||
        res.req.file != null) {
        const drAct = {
            foto_dr: res.req.file.filename,
            nombre_dr,
            alias_dr,
            password_dr,
            id_conslt
        };
    
        if(drAct.id_conslt == '' ||
           drAct.id_conslt == null) {
            drAct.id_conslt = null;
        }
    
        if(drAct.password_dr == '' ||
           drAct.password_dr == null) {
            delete drAct.password_dr;
        }
        else {
            drAct.password_dr = await helpers.encryptPassword(password_dr);
        }
        
        fs.move(res.req.file.path, __dirname + '/../public/images/doctores/' + res.req.file.filename, function (err) {
            if (err) return console.error(err);
        });

        await pool.query('UPDATE doctores SET ? WHERE id_dr = ?',[drAct,id_dr]);
        req.flash('success', 'Cambios Guardados');
        res.redirect('/idoctor/ver-doctores');
    }
    else {
        const drAct = {
            nombre_dr,
            alias_dr,
            password_dr,
            id_conslt
        };
    
        if(drAct.id_conslt == '' ||
           drAct.id_conslt == null) {
            drAct.id_conslt = null;
        }
    
        if(drAct.password_dr == '' ||
           drAct.password_dr == null) {
            delete drAct.password_dr;
        }
        else {
            drAct.password_dr = await helpers.encryptPassword(password_dr);
        }

        await pool.query('UPDATE doctores SET ? WHERE id_dr = ?',[drAct,id_dr]);
        req.flash('success', 'Cambios Guardados');
        res.redirect('/idoctor/ver-doctores');
    }
});

//Vista Agregar Doctores -------------------------------
router.get('/agregar-doctor', isLoggedIn, async (req, res) =>{
    const cnsltLst = await pool.query('SELECT * FROM consultorios');
    const docLista = await pool.query('SELECT * FROM doctores');
    
    if(Object.keys(cnsltLst).length > 0) {
        if(Object.keys(docLista).length > 0) {
            for(var drIndx in docLista) {
                if(docLista[drIndx].id_conslt == undefined) {
                    continue;
                }
                for(var consltIndx in cnsltLst) {
                    if(cnsltLst[consltIndx].id_conslt == docLista[drIndx].id_conslt) {
                        delete cnsltLst[consltIndx];
                    }
                }
            }
        }
    }

    const consltLista = cnsltLst.filter(n=>n);

    res.render('idoctor/agregarDoctor',  { consltLista });
});

router.post('/agregar-doctor', upload.single("foto_dr"), isLoggedIn, async (req, res) => {
    const { 
        nombre_dr, 
        alias_dr, 
        password_dr,
        id_conslt
    } = req.body;

    if(res.req.file != undefined ||
        res.req.file != null) {
        const newDoctor = {
            foto_dr: res.req.file.filename,
            nombre_dr,
            alias_dr,
            password_dr,
            id_conslt
        };

        fs.move(res.req.file.path, __dirname + '/../public/images/doctores/' + res.req.file.filename, function (err) {
            if (err) return console.error(err);
        });

        if(newDoctor.id_conslt == '')
        {
            newDoctor.id_conslt = null;
        }
        newDoctor.password_dr = await helpers.encryptPassword(password_dr);
        await pool.query('INSERT INTO doctores SET ?', [newDoctor]);
        req.flash('success', 'Doctor/a Agregado/a');
        res.redirect('/idoctor/ver-doctores');
    }
    else {
        const newDoctor = {
            foto_dr: 'no-photo.png',
            nombre_dr,
            alias_dr,
            password_dr,
            id_conslt
        };
    
        if(newDoctor.id_conslt == '')
        {
            newDoctor.id_conslt = null;
        }
        newDoctor.password_dr = await helpers.encryptPassword(password_dr);
        await pool.query('INSERT INTO doctores SET ?', [newDoctor]);
        req.flash('success', 'Doctor/a Agregado/a');
        res.redirect('/idoctor/ver-doctores');
    }
});
//==============================================

//Metodos enfermero ============================
//Vista Ver Enfermeros -------------------------
router.get('/ver-enfermeros', isLoggedIn, async (req, res) =>{
    const enfLista = await pool.query('SELECT * FROM enfermeros');
    res.render('idoctor/verEnfermeros',  { enfLista });
});

//Vista Editar Enfermeros ----------------------
router.get('/editar-enfermero/:id_enf', isLoggedIn, async (req, res) => {
    const { id_enf } = req.params;
    const enfDatos = await pool.query('SELECT * FROM enfermeros WHERE id_enf = ?', [id_enf]);
    res.render('idoctor/editarEnfermero',  { enfDatos: enfDatos[0] });
});

router.post('/editar-enfermero/:id_enf', upload.single("foto_enf"), isLoggedIn, async (req, res) => {
    const { id_enf } = req.params;
    const {nombre_enf,
           alias_enf,
           password_enf } = req.body;
    
    var enfDatos;

    if(res.req.file != undefined ||
        res.req.file != null) {
        enfDatos = {
            foto_enf: res.req.file.filename,
            nombre_enf,
            alias_enf,
            password_enf
        };

        fs.move(res.req.file.path, __dirname + '/../public/images/enfermeros/' + res.req.file.filename, function (err) {
            if (err) return console.error(err);
        });
    }
    else {
        enfDatos = {
            nombre_enf,
            alias_enf,
            password_enf
        };
    }

    if(enfDatos.password_enf == '' ||
       enfDatos.password_enf == null) {
        delete enfDatos.password_enf;
    }
    else {
        enfDatos.password_enf = await helpers.encryptPassword(password_enf);
    }

    await pool.query('UPDATE enfermeros SET ? WHERE id_enf = ?',[enfDatos,id_enf]);
    req.flash('success', 'Cambios Guardados');
    res.redirect('/idoctor/ver-enfermeros');
});

//Vista Agregar Enfermero ----------------------
router.get('/agregar-enfermero', isLoggedIn, (req, res) =>{
    res.render('idoctor/agregarEnfermero',  { layout: 'main' });
});

router.post('/agregar-enfermero', upload.single("foto_enf"), isLoggedIn, async (req, res) =>{
    const {
        nombre_enf, 
        alias_enf,
        password_enf
    } = req.body;
    
    var newEnfermero;
    
    if(res.req.file != undefined ||
        res.req.file != null) {
        newEnfermero = {
            foto_enf: res.req.file.filename,
            nombre_enf,
            alias_enf,
            password_enf
        };

        fs.move(res.req.file.path, __dirname + '/../public/images/enfermeros/' + res.req.file.filename, function (err) {
            if (err) return console.error(err);
        });
    }
    else {
        newEnfermero = {
            foto_enf: 'no-photo.png',
            nombre_enf,
            alias_enf,
            password_enf
        };
    }

    newEnfermero.password_enf = await helpers.encryptPassword(password_enf);

    await pool.query('INSERT INTO enfermeros SET ?', [newEnfermero]);
    req.flash('success', 'Enfermero/a Agregado/a');
    res.redirect('/idoctor/ver-enfermeros');
});
//==============================================

//Metodos Laboratorista ========================
//Vista Ver Laboratorista ----------------------
router.get('/ver-laboratorista', isLoggedIn, async (req, res) =>{
    const labLista = await pool.query('SELECT * FROM laboratoristas');
    res.render('idoctor/verLaboratorista',  { labLista });
});

//Vista Editar Laboratorista -------------------
router.get('/editar-laboratorista/:id_lab', isLoggedIn, async (req, res) => {
    const { id_lab } = req.params;
    const labDatos = await pool.query('SELECT * FROM laboratoristas WHERE id_lab = ?', [id_lab]);
    res.render('idoctor/editarLaboratorista',  { labDatos: labDatos[0] });
});

router.post('/editar-laboratorista/:id_lab', upload.single("foto_lab"), isLoggedIn, async (req, res) => {
    const { id_lab } = req.params;
    const {nombre_lab,
           alias_lab,
           password_lab } = req.body;
    
    var labDatos;

    if(res.req.file != undefined ||
        res.req.file != null) {
        labDatos = {
            foto_lab: res.req.file.filename,
            nombre_lab,
            alias_lab,
            password_lab
        };

        fs.move(res.req.file.path, __dirname + '/../public/images/laboratoristas/' + res.req.file.filename, function (err) {
            if (err) return console.error(err);
        });
    }
    else {
        labDatos = {
            nombre_lab,
            alias_lab,
            password_lab
        };
    }

    if(labDatos.password_lab == '' ||
       labDatos.password_lab == null) {
        delete labDatos.password_lab;
    }
    else {
        labDatos.password_lab = await helpers.encryptPassword(password_lab);
    }

    await pool.query('UPDATE laboratoristas SET ? WHERE id_lab = ?',[labDatos,id_lab]);
    req.flash('success', 'Cambios Guardados');
    res.redirect('/idoctor/ver-laboratorista');
});

//Vista Agregar Laboratorista ------------------
router.get('/agregar-laboratorista', isLoggedIn, (req, res) =>{
    res.render('idoctor/agregarLaboratorista',  { layout: 'main' });
});

router.post('/agregar-laboratorista', upload.single("foto_lab"), isLoggedIn, async (req, res) =>{
    const { nombre_lab, 
            alias_lab,
            password_lab } = req.body;
    
    var newLaboratorista;

    if(res.req.file != undefined ||
        res.req.file != null) {
        newLaboratorista = {
            foto_lab: res.req.file.filename,
            nombre_lab,
            alias_lab,
            password_lab
        };

        fs.move(res.req.file.path, __dirname + '/../public/images/laboratoristas/' + res.req.file.filename, function (err) {
            if (err) return console.error(err);
        });
    }
    else {
        newLaboratorista = {
            foto_lab: 'no-photo.png',
            nombre_lab,
            alias_lab,
            password_lab
        };
    }
    
    newLaboratorista.password_lab = await helpers.encryptPassword(password_lab);

    await pool.query('INSERT INTO laboratoristas SET ?', [newLaboratorista]);
    req.flash('success', 'Laboratorista Agregado');
    res.redirect('/idoctor/ver-laboratorista');
});
//==============================================
//==============================================



//Metodos generales ============================
//==============================================
//Consultorios ---------------------------------
//Vista Ver Consultorios -----------------------
router.get('/ver-consultorios', isLoggedIn, async (req, res) =>{
    const consltLista = await pool.query('SELECT consultorios.id_conslt, ' +
                                                'consultorios.alias_conslt, ' +
                                                'doctores.alias_dr ' +
                                         'FROM consultorios ' +
                                         'LEFT OUTER JOIN doctores ' +
                                         'ON consultorios.id_conslt = doctores.id_conslt');
    
    res.render('idoctor/verConsultorios',  { consltLista });
});

//Vista Editar Consultorios --------------------
router.get('/editar-consultorio/:id_conslt', isLoggedIn, async (req, res) =>{
    const { id_conslt } = req.params;
    const consltLista = await pool.query('SELECT * FROM consultorios WHERE id_conslt = ?',[id_conslt]);
    res.render('idoctor/editarConsultorio', { consltLista});
});

router.post('/editar-consultorio/:id_conslt', isLoggedIn, async (req, res) =>{
    const { id_conslt } = req.params;
    const { alias_conslt } = req.body;
    
    await pool.query('UPDATE consultorios SET alias_conslt = ? WHERE id_conslt = ?',[alias_conslt,id_conslt]);
    req.flash('success', 'Cambios Guardados');
    res.redirect('/idoctor/ver-consultorios');
});

//Vista Agregar Consultorios -------------------
router.get('/agregar-consultorio', isLoggedIn, (req, res) =>{
    res.render('idoctor/agregarConsultorio',  { layout: 'main' });
});

router.post('/agregar-consultorio', isLoggedIn, async (req, res) =>{
    const { alias_conslt } = req.body;
    
    const newConslt = { alias_conslt };

    await pool.query('INSERT INTO consultorios SET ?', [newConslt]);
    req.flash('success', 'Consultorio Agregado');
    res.redirect('/idoctor/ver-consultorios');
});
//Consultorios End -----------------------------
//----------------------------------------------
//----------------------------------------------
//Habitaciones ---------------------------------
//Vista Ver Habitaciones -----------------------
router.get('/ver-habitaciones', isLoggedIn, async (req, res) =>{
    const habtLista = await pool.query('SELECT habitaciones.id_hab, '    +
                                              'habitaciones.alias_hab, ' +
                                              'habitaciones.id_dr, '     +
                                              'habitaciones.id_enf, '    +
                                              'doctores.alias_dr, '      +
                                              'enfermeros.alias_enf '    +
                                       'FROM habitaciones ' +
                                       'LEFT OUTER JOIN doctores ' +
                                       'ON habitaciones.id_dr = doctores.id_dr ' +
                                       'LEFT OUTER JOIN enfermeros ' +
                                       'ON habitaciones.id_enf = enfermeros.id_enf');
    
    res.render('idoctor/verHabitaciones',  { habtLista });
});

//Vista Editar Habitaciones
router.get('/editar-habitacion/:id_hab', isLoggedIn, async (req, res) =>{
    const { id_hab } = req.params;
    const habLista = await pool.query('SELECT habitaciones.id_hab,'                 +
                                             'habitaciones.alias_hab, '             +
                                             'doctores.id_dr, '                     +
                                             'doctores.alias_dr, '                  +
                                             'enfermeros.id_enf, '                  +
                                             'enfermeros.alias_enf '                +
                                      'FROM habitaciones '                          +
                                      'LEFT OUTER JOIN doctores '                   +
                                      'ON habitaciones.id_dr = doctores.id_dr '     +
                                      'LEFT OUTER JOIN enfermeros '                 +
                                      'ON habitaciones.id_enf = enfermeros.id_enf ' +
                                      'WHERE habitaciones.id_hab = ?',[id_hab]);

    const drLista = await pool.query('SELECT * FROM doctores');
    const enLista = await pool.query('SELECT * FROM enfermeros');

    if(drLista != null)
    {
        habLista[0].drLst = {drLista};
    }

    if(enLista != null)
    {
        habLista[0].enLst = {enLista};
    }
    console.log(habLista[0]);
    res.render('idoctor/editarHabitacion',  { habLista: habLista[0] });
});

router.post('/editar-habitacion/:id_hab', isLoggedIn, async (req, res) =>{
    const { id_hab } = req.params;

    const {
        alias_hab,
        id_dr,
        id_enf 
    } = req.body;
    
    const habAct = {
        alias_hab,
        id_dr,
        id_enf
    };

    if(habAct.id_dr == '') {
        habAct.id_dr = null;
    }

    if(habAct.id_enf == '') {
        habAct.id_enf = null;
    }
    
    await pool.query('UPDATE habitaciones SET ? WHERE id_hab = ?',[habAct,id_hab]);
    req.flash('success', 'Cambios Guardados');
    res.redirect('/idoctor/ver-habitaciones');
});

//Vista Agregar Hab ------------------------------
router.get('/agregar-habitacion', isLoggedIn, async (req, res) =>{
    const drLista = await pool.query('SELECT * FROM doctores');
    const enLista = await pool.query('SELECT * FROM enfermeros');

    const habDatos = {
        drLista,
        enLista
    };
    
    res.render('idoctor/agregarHabitacion',  { habDatos });
});

router.post('/agregar-habitacion', isLoggedIn, async (req, res) =>{
    const {
        alias_hab,
        id_dr,
        id_enf
    } = req.body;
    
    const newHabitacion = { 
        alias_hab,
        id_dr,
        id_enf
    };
    
    if(newHabitacion.id_dr == '')
    {
        newHabitacion.id_dr = null;
    }
    
    if(newHabitacion.id_enf == '')
    {
        newHabitacion.id_enf = null;
    }
    
    await pool.query('INSERT INTO habitaciones SET ?', [newHabitacion]);
    req.flash('success', 'Habitación Agregada');
    res.redirect('/idoctor/ver-habitaciones');
});
//Habitaciones End -----------------------------
//==============================================
//----------------------------------------------
//Exámenes médicos -----------------------------
//Vista Ver Exámenes ---------------------------
router.get('/ver-examenes', isLoggedIn, async (req, res) => {
    const exmLista = await pool.query('SELECT examen_medico.id_exmmed, '     +
                                             'examen_medico.nombre_exmmed, ' +
                                             'examen_medico.desc_exmmed, '   +
                                             'examen_medico.id_lab, '        +
                                             'laboratoristas.alias_lab '     +
                                      'FROM examen_medico '                  +
                                      'LEFT OUTER JOIN laboratoristas '      +
                                      'ON examen_medico.id_lab = laboratoristas.id_lab');
    
    res.render('idoctor/verExamenes',  { exmLista });
});

//Vista Editar Examen --------------------------
router.get('/editar-examen/:id_exmmed', isLoggedIn, async (req, res) => {
    const { id_exmmed } = req.params;
    const exmDatos = await pool.query('SELECT examen_medico.id_exmmed, '     +
                                             'examen_medico.nombre_exmmed, ' +
                                             'examen_medico.desc_exmmed, '   +
                                             'examen_medico.id_lab, '        +
                                             'laboratoristas.alias_lab '     +
                                      'FROM examen_medico '                  +
                                      'LEFT OUTER JOIN laboratoristas '      +
                                      'ON examen_medico.id_lab = laboratoristas.id_lab ' + 
                                      'WHERE id_exmmed = ?', [id_exmmed]);
    const labLista = await pool.query('SELECT * FROM laboratoristas');
    
    exmDatos[0].lbLst = { labLista };
    res.render('idoctor/editarExamen',  { exmDatos: exmDatos[0] });
});

router.post('/editar-examen/:id_exmmed', isLoggedIn, async (req, res) => {
    const { id_exmmed } = req.params;
    const {
        nombre_exmmed,
        desc_exmmed,
        id_lab
    } = req.body;
    
    const exmDatos = {
        nombre_exmmed,
        desc_exmmed,
        id_lab
    };

    if(exmDatos.id_lab == '') {
        exmDatos.id_lab = null;
    }

    await pool.query('UPDATE examen_medico SET ? WHERE id_exmmed = ?',[exmDatos,id_exmmed]);
    req.flash('success', 'Cambios Guardados');
    res.redirect('/idoctor/ver-examenes');
});

//Vista Agregar Examen -------------------------
router.get('/agregar-examen', isLoggedIn, async (req, res) => {
    const labLista = await pool.query('SELECT * FROM laboratoristas');
    res.render('idoctor/agregarExamen',  { labLista });
});

router.post('/agregar-examen', isLoggedIn, async (req, res) => {
    const {
        nombre_exmmed,
        desc_exmmed,
        id_lab
    } = req.body;

    const newExamen = {
        nombre_exmmed,
        desc_exmmed,
        id_lab
    };
    
    if(newExamen.id_lab == '') {
        newExamen.id_lab = null;
    }

    await pool.query('INSERT INTO examen_medico SET ?', [newExamen]);
    req.flash('success', 'Exámen Agregado');
    res.redirect('/idoctor/ver-examenes');
});
//Exámenes médicos End -------------------------
//==============================================



//==============================================
//==============================================
// Vista Mis Pacientes -------------------------
router.get('/mis-pacientes', isLoggedIn, async (req, res) => {
    if(req.user.id_dr ||
       req.user.id_enf) {
        if(req.user.id_dr) {
            const habcinStrng =     'SELECT  paciente.id_pac, ' +
                                            'paciente.foto_pac, ' +
                                            'paciente.tipo_pac, ' +
                                            'paciente.nombre_pac, ' +
                                            'paciente.fecha_nac_pac, ' +
                                            'paciente.sexo_pac, ' +
                                            'paciente.lugar_nac_pac, ' +
                                            'paciente.curp_pac, ' +
                                            'paciente.grp_sang_pac, ' +
                                            'paciente.dir_pac, ' +
                                            'paciente.tel_pac, ' +
                                            'paciente.cont_ref_pac, ' +
                                            'paciente.alta_pac, ' +
                                            'paciente.diag_pac, ' +
                                            'paciente.id_hab, ' +
                                            'habitaciones.id_dr, ' +
                                            'habitaciones.alias_hab, ' +
                                            'doctores.id_dr ' +
                                    'FROM paciente ' +
                                    'INNER JOIN habitaciones ' +
                                    'ON habitaciones.id_hab = paciente.id_hab ' +
                                    'INNER JOIN doctores ' +
                                    'ON doctores.id_dr = habitaciones.id_dr ' +
                                    'WHERE doctores.id_dr = ?';
            
            habcinLista = await pool.query(habcinStrng, [req.user.id_dr]);
            
            if(Object.keys(habcinLista).length > 0) {
                for(var indxPac in habcinLista) {
                    habcinLista[indxPac]["consltaLista"] = await pool.query('SELECT * FROM consulta WHERE id_pac = ?', [habcinLista[indxPac].id_pac]);

                    if(Object.keys(habcinLista[indxPac].consltaLista).length > 0) {
                        for(var indxCon in habcinLista[indxPac].consltaLista) {
                            habcinLista[indxPac].consltaLista[indxCon]["solexamLista"] = 
                            await pool.query('SELECT * FROM solicitudes_exmmed WHERE id_consulta = ?',[habcinLista[indxPac].consltaLista[indxCon].id_consulta]);
                        }
                    }
                }
            }
            
            res.render('idoctor/misPacientes',{ habcinLista, user: req.user });
        }
        else {
            const habcinStrng =     'SELECT  paciente.id_pac, ' +
                                            'paciente.foto_pac, ' +
                                            'paciente.tipo_pac, ' +
                                            'paciente.nombre_pac, ' +
                                            'paciente.fecha_nac_pac, ' +
                                            'paciente.sexo_pac, ' +
                                            'paciente.lugar_nac_pac, ' +
                                            'paciente.curp_pac, ' +
                                            'paciente.grp_sang_pac, ' +
                                            'paciente.dir_pac, ' +
                                            'paciente.tel_pac, ' +
                                            'paciente.cont_ref_pac, ' +
                                            'paciente.alta_pac, ' +
                                            'paciente.diag_pac, ' +
                                            'paciente.id_hab, ' +
                                            'habitaciones.id_enf, ' +
                                            'habitaciones.alias_hab, ' +
                                            'enfermeros.id_enf ' +
                                    'FROM paciente ' +
                                    'INNER JOIN habitaciones ' +
                                    'ON habitaciones.id_hab = paciente.id_hab ' +
                                    'INNER JOIN enfermeros ' +
                                    'ON enfermeros.id_enf = habitaciones.id_enf ' +
                                    'WHERE enfermeros.id_enf = ?';
            
            habcinLista = await pool.query(habcinStrng, [req.user.id_enf]);
            
            if(Object.keys(habcinLista).length > 0) {
                for(var indxPac in habcinLista) {
                    habcinLista[indxPac]["consltaLista"] = await pool.query('SELECT * FROM consulta WHERE id_pac = ?', [habcinLista[indxPac].id_pac]);

                    if(Object.keys(habcinLista[indxPac].consltaLista).length > 0) {
                        for(var indxCon in habcinLista[indxPac].consltaLista) {
                            habcinLista[indxPac].consltaLista[indxCon]["solexamLista"] = 
                            await pool.query('SELECT * FROM solicitudes_exmmed WHERE id_consulta = ?',[habcinLista[indxPac].consltaLista[indxCon].id_consulta]);
                        }
                    }
                }
            }
            
            res.render('idoctor/misPacientes',{ habcinLista, user: req.user });
        }
    }
    else {
        res.redirect('/home');
    }
});
// Vista Mis Pacientes -------------------------
// Vista Agendar Cita --------------------------
router.get('/agendar-consulta/:id_pac', isLoggedIn, async (req, res) => {
    const { id_pac } = req.params;
    
    var pacCntStrng;
    var pacientLista;
    var consltLista;

    pacCntStrng =   'SELECT tipo_pac FROM paciente WHERE id_pac = ?';
    pacientLista = await pool.query(pacCntStrng, [id_pac]);

    if(pacientLista[0].tipo_pac == 1) {
        pacCntStrng =   'SELECT  paciente.id_pac, '    +
                                'paciente.nombre_pac ' +
                        'FROM paciente '               +
                        'WHERE paciente.id_pac = ? ';
        
        pacientLista = await pool.query(pacCntStrng, [id_pac]);
        pacientLista[0].no_dr = true;
    }
    else {
        pacCntStrng =   'SELECT id_hab FROM paciente WHERE id_pac = ?';
        pacientLista = await pool.query(pacCntStrng, [id_pac]);

        if(pacientLista[0].id_hab == undefined || pacientLista[0].id_hab == null) {
            pacCntStrng =   'SELECT  paciente.id_pac, '    +
                                    'paciente.nombre_pac ' +
                            'FROM paciente '               +
                            'WHERE paciente.id_pac = ? ';
            
            pacientLista = await pool.query(pacCntStrng, [id_pac]);
            pacientLista[0].no_dr = true;
        }
        else {
            habPacStrng = pacientLista[0].id_hab;

            if((req.user.id_dr != undefined ||
                req.user.id_dr != null)) {
                pacCntStrng =   'SELECT  paciente.id_pac, '                       +
                                        'paciente.nombre_pac, '                   +
                                        'habitaciones.id_hab, '                   +
                                        'habitaciones.alias_hab, '                +
                                        'doctores.id_dr, '                        +
                                        'doctores.alias_dr, '                     +
                                        'consultorios.id_conslt, '                +
                                        'consultorios.alias_conslt '              +
                                'FROM paciente '                                  +
                                'LEFT OUTER JOIN habitaciones '                   +
                                'ON paciente.id_hab = habitaciones.id_hab '       +
                                'LEFT OUTER JOIN doctores '                       +
                                'ON habitaciones.id_dr = doctores.id_dr '         +
                                'LEFT OUTER JOIN consultorios '                   +
                                'ON doctores.id_conslt = consultorios.id_conslt ' +
                                'WHERE paciente.id_pac = ? '                      +
                                'AND doctores.id_dr = ?';
                
                pacientLista = await pool.query(pacCntStrng, [id_pac, req.user.id_dr]);
                
                if(Object.keys(pacientLista).length > 0) {
                    pacientLista[0].no_dr = false;
                    pacientLista[0].more_dr = false;
                } 
                else {
                    pacCntStrng =   'SELECT  habitaciones.id_hab, '                   +
                                            'habitaciones.alias_hab, '                +
                                            'doctores.id_dr, '                        +
                                            'doctores.alias_dr, '                     +
                                            'consultorios.id_conslt, '                +
                                            'consultorios.alias_conslt '              +
                                    'FROM habitaciones '                              +
                                    'LEFT OUTER JOIN doctores '                       +
                                    'ON habitaciones.id_dr = doctores.id_dr '         +
                                    'LEFT OUTER JOIN consultorios '                   +
                                    'ON doctores.id_conslt = consultorios.id_conslt ' +
                                    'WHERE habitaciones.id_hab = ?';
                    
                    consltLista = await pool.query(pacCntStrng, [habPacStrng]);
                    
                    pacCntStrng =   'SELECT  paciente.id_pac, '    +
                                            'paciente.nombre_pac ' +
                                    'FROM paciente '               +
                                    'WHERE paciente.id_pac = ?';
                    
                    pacientLista = await pool.query(pacCntStrng, [id_pac]);
                    pacientLista[0].no_dr = false;
                    pacientLista[0].more_dr = true;
                    pacientLista[0].cnsltLst = {
                        consltLista
                    };
                }
            }
            else {
                pacCntStrng =   'SELECT  habitaciones.id_hab, '                   +
                                        'habitaciones.alias_hab, '                +
                                        'doctores.id_dr, '                        +
                                        'doctores.alias_dr, '                     +
                                        'consultorios.id_conslt, '                +
                                        'consultorios.alias_conslt '              +
                                'FROM habitaciones '                              +
                                'LEFT OUTER JOIN doctores '                       +
                                'ON habitaciones.id_dr = doctores.id_dr '         +
                                'LEFT OUTER JOIN consultorios '                   +
                                'ON doctores.id_conslt = consultorios.id_conslt ' +
                                'WHERE habitaciones.id_hab = ?';
                
                consltLista = await pool.query(pacCntStrng, [habPacStrng]);
                
                pacCntStrng =   'SELECT  paciente.id_pac, '    +
                                    'paciente.nombre_pac '     +
                                'FROM paciente '               +
                                'WHERE paciente.id_pac = ? ';
            
                pacientLista = await pool.query(pacCntStrng, [id_pac]);
                pacientLista[0].no_dr = false;
                pacientLista[0].more_dr = true;
                pacientLista[0].cnsltLst = {
                    consltLista
                };
            }
        }
    }
    
    const cnsltrsLista = await pool.query('SELECT * FROM consultorios');

    res.render('idoctor/agendarConsulta', { pacientLista: pacientLista[0], cnsltrsLista, user: req.user });
});

router.post('/agendar-consulta/:id_pac', isLoggedIn, async (req, res) => {
    const { id_pac } = req.params;
    const {
        fecha_consulta,
        id_conslt
    } = req.body;

    var fin_consulta = false;

    const newConsulta = {
        fecha_consulta,
        fin_consulta,
        id_conslt,
        id_pac
    };
    
    await pool.query('INSERT INTO consulta SET ?', [newConsulta]);
    req.flash('success', 'Consulta Agendada');
    if(req.user.id_dr) {
        res.redirect('/idoctor/mis-consultas');
    }
    else {
        res.redirect('/idoctor/ver-pacientes');
    }
});
// Vista Agendar Cita --------------------------
// Vista Mis Consultas -------------------------
router.get('/mis-consultas', isLoggedIn, async (req, res) => {
    var cnsltaLista;
    var solexmLista;

    if(req.user.id_dr) {
        const cnsltaStrng =     'SELECT  consulta.id_consulta, '                  +
                                        'consulta.fecha_consulta, '               +
                                        'consulta.fin_consulta, '                 +
                                        'consulta.id_conslt, '                    +
                                        'consulta.id_pac, '                       +
                                        'paciente.nombre_pac, '                   +
                                        'paciente.tipo_pac, '                     +
                                        'paciente.diag_pac, '                     +
                                        'consultorios.alias_conslt, '             +
                                        'doctores.id_conslt '                     +
                                'FROM consulta '                                  +
                                'INNER JOIN paciente '                            +
                                'ON consulta.id_pac = paciente.id_pac '           +
                                'INNER JOIN consultorios '                        +
                                'ON consulta.id_conslt = consultorios.id_conslt ' +
                                'INNER JOIN doctores '                            +
                                'ON consultorios.id_conslt = doctores.id_conslt ' +
                                'WHERE doctores.id_dr = ?';
        const solexmStrng =     'SELECT *, ' +
                                       'examen_medico.nombre_exmmed ' +
                                'FROM solicitudes_exmmed ' +
                                'INNER JOIN examen_medico ' +
                                'ON examen_medico.id_exmmed = solicitudes_exmmed.id_exmmed';
        cnsltaLista = await pool.query(cnsltaStrng, [req.user.id_dr]);
        solexmLista = await pool.query(solexmStrng);

        var cnsltaExmLista;
        
        if(Object.keys(solexmLista).length > 0 &&
           Object.keys(cnsltaLista).length > 0) {
            var indxExmCnt = 0;
            var some = [];
            for(var indxCon in cnsltaLista) {
                for(var indxSol in solexmLista) {
                    if(cnsltaLista[indxCon].id_consulta ==
                       solexmLista[indxSol].id_consulta) {
                        
                        some[indxExmCnt] = {
                            solexmLista: solexmLista[indxSol]
                        };
                        
                        indxExmCnt++;
                    }
                }
                if(some.length > 0) {
                    cnsltaLista[indxCon]["sol_exam"] = {
                        some 
                    };
                }
                some = [];
                indxExmCnt = 0;
            }
        }
        res.render('idoctor/misConsultas', { cnsltaLista, user: req.user });
    }
    else {
        res.redirect('/home');
    }
});

router.post('/mis-consultas/:id_pac', isLoggedIn, async (req, res) => {
    const { id_pac } = req.params;
    const {
        diag_pac
    } = req.body;

    const updPaciente = {
        id_pac,
        diag_pac
    };
    await pool.query('UPDATE paciente SET diag_pac = ? WHERE id_pac = ?', [updPaciente.diag_pac, updPaciente.id_pac]);
    res.redirect('/idoctor/mis-consultas');
});
// Vista Mis Consultas -------------------------
// Vista Solicitar Examen medico ---------------
router.get('/solicitar-examen/:id_pac/:id_consulta', isLoggedIn, async (req, res) => {
    const {
        id_pac,
        id_consulta
    } = req.params;
    
    if((req.user.id_dr != null || req.user.id_dr != undefined) ||
       (req.user.id_enf != null || req.user.id_enf != undefined)) {
        const exammedLista = await pool.query('SELECT * FROM examen_medico');
        const pacDatos     = await pool.query('SELECT id_pac, nombre_pac FROM paciente WHERE id_pac = ?', [id_pac]);
        
        res.render('idoctor/solicitarExammed', { exammedLista, pacDatos: pacDatos[0], id_consulta });
    }
    else {
        res.redirect('/home');
    }
});

router.post('/solicitar-examen/:id_pac/:id_consulta', isLoggedIn, async (req, res) => {
    const {
        id_pac,
        id_consulta
    } = req.params;

    const {
        id_exmmed,
    } = req.body;

    if((req.user.id_dr != null || req.user.id_dr != undefined) ||
       (req.user.id_enf != null || req.user.id_enf != undefined)) {
        await pool.query('INSERT INTO solicitudes_exmmed(id_exmmed, id_pac, id_consulta) VALUES (?,?,?)', [id_exmmed,id_pac,id_consulta]);
        req.flash('success', 'Solicitud Enviada');
        res.redirect('/idoctor/mis-consultas');
    }
    else {
        res.redirect('/home');
    }
});
// Vista Solicitar Examen medico ---------------
//==============================================
//==============================================

router.get('/ver-solicitudes-examenes', isLoggedIn, async (req, res) => {
    if(req.user.id_lab != null ||
       req.user.id_lab != undefined)
    {
        const solexamStrn = 'SELECT solicitudes_exmmed.id_solicitud, '  +
                                   'solicitudes_exmmed.pdf_solicitud, ' +
                                   'solicitudes_exmmed.res_solicitud, ' +
                                   'solicitudes_exmmed.id_exmmed, '     +
                                   'examen_medico.id_lab, '             +
                                   'examen_medico.nombre_exmmed '       +
                            'FROM solicitudes_exmmed '                  +
                            'INNER JOIN examen_medico '                 +
                            'ON solicitudes_exmmed.id_exmmed = examen_medico.id_exmmed ' +
                            'WHERE examen_medico.id_lab = ?';
        const solexamList = await pool.query(solexamStrn, [req.user.id_lab]);
        res.render('idoctor/verSolicitudesExm', { solexamList, user: req.user });
    }
    else {
        res.redirect('/home');   
    }
});

router.post('/ver-solicitudes-examenes/:id_solicitud', upload.single('pdf_solicitud'), isLoggedIn, async (req, res) => {
    const { id_solicitud } = req.params;
    const {
        res_solicitud
    } = req.body;
    if(res.req.file != undefined ||
       res.req.file != null)
    {
        const fileName = res.req.file.filename;
        
        fs.move(res.req.file.path, __dirname + '/../public/res_exam/' + res.req.file.filename, function (err) {
            if (err) return console.error(err);
        });

        await pool.query('UPDATE solicitudes_exmmed SET pdf_solicitud = ?, res_solicitud = ? WHERE id_solicitud = ?', [fileName,res_solicitud,id_solicitud]);
        req.flash('success', 'Datos Guardados');
        res.redirect('/idoctor/ver-solicitudes-examenes');
    }
    else {
        await pool.query('UPDATE solicitudes_exmmed SET res_solicitud = ? WHERE id_solicitud = ?', [res_solicitud,id_solicitud]);
        req.flash('success', 'Datos Guardados');
        res.redirect('/idoctor/ver-solicitudes-examenes');
    }
});

router.get('/download/:file_name', isLoggedIn, (req, res) => {
    const { file_name } = req.params;
    var filePath = './src/public/res_exam/' + file_name;
    res.download(filePath);
});

router.get('/editar-perfil', isLoggedIn, (req, res) => {
    res.render('idoctor/editarPerfil',{ user: req.user });
});

router.post('/editar-perfil/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    if(req.user.id_admin) {
        const {
            nombre_admin,
            alias_admin,
            password_admin
        } = req.body;

        const updAdmin = {
            nombre_admin,
            alias_admin,
            password_admin
        };

        if(updAdmin.password_admin != undefined ||
           updAdmin.password_admin != null) {
            
            await pool.query('UPDATE admins SET ? WHERE id_admin = ?', [updAdmin,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
        else {
            await pool.query('UPDATE admins SET nombre_admin = ?, alias_admin = ? WHERE id_admin = ?', [updAdmin.nombre_admin,updAdmin.alias_admin,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
    }
    else if(req.user.id_dr) {
        const {
            nombre_dr,
            alias_dr,
            password_dr
        } = req.body;

        const updDoctr = {
            nombre_dr,
            alias_dr,
            password_dr
        };

        if(updDoctr.password_dr != undefined ||
            updDoctr.password_dr != null) {
             
            updDoctr.password_dr = await helpers.encryptPassword(updDoctr.password_dr);
            await pool.query('UPDATE doctores SET ? WHERE id_dr = ?', [updDoctr,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
        else {
            await pool.query('UPDATE doctores SET nombre_dr = ?, alias_dr = ? WHERE id_dr = ?', [updDoctr.nombre_dr,updDoctr.alias_dr,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
    }
    else if(req.user.id_enf) {
        const {
            nombre_enf,
            alias_enf,
            password_enf
        } = req.body;

        const updEnfrm = {
            nombre_enf,
            alias_enf,
            password_enf
        };

        if(updEnfrm.password_enf != undefined ||
            updEnfrm.password_enf != null) {
             
            updEnfrm.password_enf = await helpers.encryptPassword(updEnfrm.password_enf);
            await pool.query('UPDATE enfermeros SET ? WHERE id_enf = ?', [updEnfrm,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
        else {
            await pool.query('UPDATE enfermeros SET nombre_enf = ?, alias_enf = ? WHERE id_enf = ?', [updEnfrm.nombre_enf,updEnfrm.alias_enf,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
    }
    else {
        const {
            nombre_lab,
            alias_lab,
            password_lab
        } = req.body;

        const updLabtr = {
            nombre_lab,
            alias_lab,
            password_lab
        };

        if(updLabtr.password_lab != undefined ||
            updLabtr.password_lab != null) {
             
            updLabtr.password_lab = await helpers.encryptPassword(updLabtr.password_lab);
            await pool.query('UPDATE laboratoristas SET ? WHERE id_lab = ?', [updLabtr,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
        else {
            await pool.query('UPDATE laboratoristas SET nombre_lab = ?, alias_lab = ? WHERE id_lab = ?', [updLabtr.nombre_lab,updLabtr.alias_lab,id]);
            req.flash('success', 'Datos Guardados');
            res.redirect('/home');
        }
    }
    //res.redirect('idoctor/editarPerfil',{ user: req.user });
});

//==============================================
//==============================================
//Test =========================================
router.get('/test', isLoggedIn, (req, res) => {
    res.render('idoctor/test',  { layout: 'main' });
});
//Test End =====================================
//==============================================
//==============================================



module.exports = router;