create database ems_db;

use ems_db;

create table department (
    id int AUTO_INCREMENT,
    name varchar(30),
    PRIMARY KEY (id)
);

create table roles (
    id int AUTO_INCREMENT,
    title varchar(30),
    salary decimal,
    department_id int,
    primary key (id)
);

create table employees (
   id int AUTO_INCREMENT,
   firstname varchar(30),
   lastname varchar(30),
   role_id int,
   is_manager boolean, 
   manager_id int,
   primary key (id)

);