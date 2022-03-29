const express = require('express');
const mysql = require('mysql');
const inquirer = require('inquirer');
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// turn on connection to db and server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});



function mainMenu() {
  return inquirer.prompt([
    {
      type: 'list',
      message: 'What would you like to do',
      name: 'mgrchoice',
      choices: ["View Departments", "Add Department", "View Roles", "Add a Role", "Update a Role", "View Employees", "Add an Employee" ]
    },

  ])
    .then((answers) => {
      if (answers.mgrchoice === "View Departments") viewByDepartment();

      if (answers.mgrchoice === "Add Department") addDepartment();

      if (answers.mgrchoice === "View Roles") viewAllRoles();

      if (answers.mgrchoice === "Add a Role") addRole();

      if (answers.mgrchoice === "Update a Role") updateRole();

      if (answers.mgrchoice === "View Employees") viewAllEmployees();

      if (answers.mgrchoice === "Add an Employee") addEmployees();
    })
}

function viewAllEmployees() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id)
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY employee.id;`;
  connection.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL EMPLOYEES');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

function viewByDepartment() {
  const query = `SELECT department.name AS department, role.title, employee.id, employee.first_name, employee.last_name
  FROM employee
  LEFT JOIN role ON (role.id = employee.role_id)
  LEFT JOIN department ON (department.id = role.department_id)
  ORDER BY department.name;`;
  connection.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW EMPLOYEE BY DEPARTMENT');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

function viewAllRoles() {
  const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.name AS department
  FROM employee
  LEFT JOIN role ON (role.id = employee.role_id)
  LEFT JOIN department ON (department.id = role.department_id)
  ORDER BY role.title;`;
  connection.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW EMPLOYEE BY ROLE');
      console.log('\n');
      console.table(res);
      prompt();
  });

}
mainMenu();