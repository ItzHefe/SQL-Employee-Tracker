const res = require('express/lib/response');
const inquirer = require('inquirer');
const connection = require('./config/connection.js');
const consoleTable = require('console.table');
const util = require('util');

connection.query = util.promisify(connection.query);

function mainMenu() {
  inquirer.prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'mgrchoice',
      choices: ["View Departments", "Add Department", "View Roles", "Add a Role", "Update a Role", "View Employees", "Add an Employee", "Exit"]
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

      if (answers.mgrchoice === "Exit") process.exit();
    })
}

function viewAllEmployees() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
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
    mainMenu();
  });
}

function viewByDepartment() {
  const query = `SELECT* FROM department`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log('\n');
    console.log('VIEWING DEPARTMENTS');
    console.log('\n');
    console.table(res);
    mainMenu();
  });
}

function viewAllRoles() {
  const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department.department_name AS department
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
    mainMenu();
  });

}

function addDepartment() {
  const addDept = inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      Message: 'What is the Departments name?'
    }
  ])
    .then(answers => {
      connection.query('INSERT INTO department SET ?', { department_name: answers.name })
      mainMenu();
    })
};

// Create Async Function separately to make the call.  Then call that function chained with a .then statement to then do the inquire.

const addRole = async () => {
  try {
      console.log('Role Add');

      let departments = await connection.query("SELECT * FROM department")

      let answer = await inquirer.prompt([
          {
              name: 'title',
              type: 'input',
              message: 'What is the name of your new role?'
          },
          {
              name: 'salary',
              type: 'input',
              message: 'What salary will this role provide?'
          },
          {
              name: 'departmentId',
              type: 'list',
              choices: departments.map((departmentId) => {
                  return {
                      name: departmentId.department_name,
                      value: departmentId.id
                  }
              }),
              message: 'What department ID is this role associated with?',
          }
      ]);
      
      let chosenDepartment;
      for (i = 0; i < departments.length; i++) {
          if(departments[i].department_id === answer.choice) {
              chosenDepartment = departments[i];
          };
      }
      let result = await connection.query("INSERT INTO role SET ?", {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId
      })

      console.log(`${answer.title} role added successfully.\n`)
      mainMenu();

  } catch (err) {
      console.log(err);
      mainMenu();
  };
}

const updateRole = async () => {
  try {
      console.log('Employee Update');
      
      let employees = await connection.query("SELECT * FROM employee");

      let employeeSelection = await inquirer.prompt([
          {
              name: 'employee',
              type: 'list',
              choices: employees.map((employeeName) => {
                  return {
                      name: employeeName.first_name + " " + employeeName.last_name,
                      value: employeeName.id
                  }
              }),
              message: 'Please choose an employee to update.'
          }
      ]);

      let roles = await connection.query("SELECT * FROM role");

      let roleSelection = await inquirer.prompt([
          {
              name: 'role',
              type: 'list',
              choices: roles.map((roleName) => {
                  return {
                      name: roleName.title,
                      value: roleName.id
                  }
              }),
              message: 'Please select the role to update the employee with.'
          }
      ]);

      let result = await connection.query("UPDATE employee SET ? WHERE ?", [{ role_id: roleSelection.role }, { id: employeeSelection.employee }]);

      console.log(`The role was successfully updated.\n`);
      mainMenu();

    } catch (err) {
      console.log(err);
      mainMenu();
  };
}

const addEmployees = async () => {
  try {
      console.log('Employee Add');

      let roles = await connection.query("SELECT * FROM role");

      let managers = await connection.query("SELECT * FROM employee");

      let answer = await inquirer.prompt([
          {
              name: 'firstName',
              type: 'input',
              message: 'What is the first name of this Employee?'
          },
          {
              name: 'lastName',
              type: 'input',
              message: 'What is the last name of this Employee?'
          },
          {
              name: 'employeeRoleId',
              type: 'list',
              choices: roles.map((role) => {
                  return {
                      name: role.title,
                      value: role.id
                  }
              }),
              message: "What is this Employee's role id?"
          },
          {
              name: 'employeeManagerId',
              type: 'list',
              choices: managers.map((manager) => {
                  return {
                      name: manager.first_name + " " + manager.last_name,
                      value: manager.id
                  }
              }),
              message: "What is this Employee's Manager's Id?"
          }
      ])

      let result = await connection.query("INSERT INTO employee SET ?", {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: (answer.employeeRoleId),
          manager_id: (answer.employeeManagerId)
      });

      console.log(`${answer.firstName} ${answer.lastName} added successfully.\n`);
      mainMenu();

  } catch (err) {
      console.log(err);
      mainMenu();
  };
}

mainMenu();