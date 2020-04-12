CREATE DATABASE daw_idoctor_db;

CREATE TABLE `paciente` (
	`id_pac` bigint NOT NULL AUTO_INCREMENT,
	`foto_pac` blob,
	`tipo_pac` int(3) NOT NULL,
	`nombre_pac` varchar(200) NOT NULL,
	`fecha_nac_pac` varchar(50) NOT NULL,
	`sexo_pac` varchar(20) NOT NULL,
	`lugar_nac_pac` varchar(100) NOT NULL,
	`curp_pac` varchar(50) NOT NULL,
	`grp_sang_pac` varchar(10) NOT NULL,
	`dir_pac` varchar(100) NOT NULL,
	`tel_pac` varchar(15) NOT NULL,
	`cont_ref_pac` varchar(100) NOT NULL,
	`alta_pac` BOOLEAN NOT NULL,
	`diag_pac` varchar(100000),
	`id_hab` bigint,
	PRIMARY KEY (`id_pac`)
);

CREATE TABLE `enf_preex` (
	`id_pac` bigint NOT NULL,
	`enf_prex_pac` varchar(10000) NOT NULL
);

CREATE TABLE `alergias` (
	`id_pac` bigint NOT NULL,
	`alrg_pac` varchar(10000) NOT NULL
);

CREATE TABLE `doctores` (
	`id_dr` bigint NOT NULL AUTO_INCREMENT,
	`foto_dr` blob,
	`nombre_dr` varchar(100) NOT NULL,
	`alias_dr` varchar(30) NOT NULL,
	`password_dr` varchar(1000) NOT NULL,
	`id_conslt` bigint,
	PRIMARY KEY (`id_dr`)
);

CREATE TABLE `admins` (
	`id_admin` bigint NOT NULL AUTO_INCREMENT,
	`foto_admin` blob,
	`nombre_admin` varchar(100) NOT NULL,
	`alias_admin` varchar(30) NOT NULL,
	`password_admin` varchar(1000) NOT NULL,
	PRIMARY KEY (`id_admin`)
);

CREATE TABLE `enfermeros` (
	`id_enf` bigint NOT NULL AUTO_INCREMENT,
	`foto_enf` blob,
	`nombre_enf` varchar(100) NOT NULL,
	`alias_enf` varchar(30) NOT NULL,
	`password_enf` varchar(1000) NOT NULL,
	PRIMARY KEY (`id_enf`)
);

CREATE TABLE `laboratoristas` (
	`id_lab` bigint NOT NULL AUTO_INCREMENT,
	`foto_lab` blob,
	`nombre_lab` varchar(100) NOT NULL,
	`alias_lab` varchar(30) NOT NULL,
	`password_lab` varchar(1000) NOT NULL,
	PRIMARY KEY (`id_lab`)
);

CREATE TABLE `habitaciones` (
	`id_hab` bigint NOT NULL AUTO_INCREMENT,
	`alias_hab` varchar(10) NOT NULL,
	`id_dr` bigint,
	`id_enf` bigint,
	PRIMARY KEY (`id_hab`)
);

CREATE TABLE `doctor_pacientes` (
	`id_dr` bigint NOT NULL,
	`id_pac` bigint NOT NULL
);

CREATE TABLE `consultorios` (
	`id_conslt` bigint NOT NULL AUTO_INCREMENT,
	`alias_conslt` varchar(10) NOT NULL,
	PRIMARY KEY (`id_conslt`)
);

CREATE TABLE `consulta` (
	`id_consulta` bigint NOT NULL AUTO_INCREMENT,
	`fecha_consulta` DATE NOT NULL UNIQUE,
	`fin_consulta` BOOLEAN NOT NULL,
	`id_conslt` bigint NOT NULL,
	`id_pac` bigint NOT NULL,
	PRIMARY KEY (`id_consulta`)
);

CREATE TABLE `enfermero_pacientes` (
	`id_enf` bigint NOT NULL,
	`id_pac` bigint NOT NULL
);

CREATE TABLE `examen_medico` (
	`id_exmmed` bigint NOT NULL AUTO_INCREMENT,
	`nombre_exmmed` varchar(150) NOT NULL,
	`desc_exmmed` varchar(500) NOT NULL,
	`id_lab` bigint,
	PRIMARY KEY (`id_exmmed`)
);

CREATE TABLE `solicitudes_exmmed` (
	`id_solicitud` bigint NOT NULL AUTO_INCREMENT,
	`pdf_solicitud` blob,
	`res_solicitud` varchar(100000) NOT NULL,
	`id_exmmed` bigint NOT NULL,
	`id_pac` bigint NOT NULL,
	`id_consulta` bigint NOT NULL,
	PRIMARY KEY (`id_solicitud`)
);

ALTER TABLE `paciente` ADD CONSTRAINT `paciente_fk0` FOREIGN KEY (`id_hab`) REFERENCES `habitaciones`(`id_hab`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `enf_preex` ADD CONSTRAINT `enf_preex_fk0` FOREIGN KEY (`id_pac`) REFERENCES `paciente`(`id_pac`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `alergias` ADD CONSTRAINT `alergias_fk0` FOREIGN KEY (`id_pac`) REFERENCES `paciente`(`id_pac`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `doctores` ADD CONSTRAINT `doctores_fk0` FOREIGN KEY (`id_conslt`) REFERENCES `consultorios`(`id_conslt`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `habitaciones` ADD CONSTRAINT `habitaciones_fk0` FOREIGN KEY (`id_dr`) REFERENCES `doctores`(`id_dr`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `habitaciones` ADD CONSTRAINT `habitaciones_fk1` FOREIGN KEY (`id_enf`) REFERENCES `enfermeros`(`id_enf`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `doctor_pacientes` ADD CONSTRAINT `doctor_pacientes_fk0` FOREIGN KEY (`id_dr`) REFERENCES `doctores`(`id_dr`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `doctor_pacientes` ADD CONSTRAINT `doctor_pacientes_fk1` FOREIGN KEY (`id_pac`) REFERENCES `paciente`(`id_pac`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `consulta` ADD CONSTRAINT `consulta_fk0` FOREIGN KEY (`id_conslt`) REFERENCES `consultorios`(`id_conslt`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `consulta` ADD CONSTRAINT `consulta_fk1` FOREIGN KEY (`id_pac`) REFERENCES `paciente`(`id_pac`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `enfermero_pacientes` ADD CONSTRAINT `enfermero_pacientes_fk0` FOREIGN KEY (`id_enf`) REFERENCES `enfermeros`(`id_enf`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `enfermero_pacientes` ADD CONSTRAINT `enfermero_pacientes_fk1` FOREIGN KEY (`id_pac`) REFERENCES `paciente`(`id_pac`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `examen_medico` ADD CONSTRAINT `examen_medico_fk0` FOREIGN KEY (`id_lab`) REFERENCES `laboratoristas`(`id_lab`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `solicitudes_exmmed` ADD CONSTRAINT `solicitudes_exmmed_fk0` FOREIGN KEY (`id_exmmed`) REFERENCES `examen_medico`(`id_exmmed`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `solicitudes_exmmed` ADD CONSTRAINT `solicitudes_exmmed_fk1` FOREIGN KEY (`id_pac`) REFERENCES `paciente`(`id_pac`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `solicitudes_exmmed` ADD CONSTRAINT `solicitudes_exmmed_fk2` FOREIGN KEY (`id_consulta`) REFERENCES `consulta`(`id_consulta`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `admins`(`nombre_admin`, `alias_admin`, `password_admin`) VALUES ("Administrador","Admin1","1234");

ALTER TABLE `paciente` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `enf_preex` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `alergias` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `doctores` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `admins` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `enfermeros` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `laboratoristas` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `habitaciones` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `doctor_pacientes` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `consultorios` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `consulta` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `enfermero_pacientes` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `examen_medico` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `solicitudes_exmmed` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;