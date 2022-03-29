const inquirer = require('inquirer');
const connection = require('./config/connection.js');

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


// async function addRole() {
//   let departments = await connection.query("SELECT * FROM department")
//   console.log(departments);
//   const addR = await inquirer.prompt([
//     {
//       type: 'input',
//       name: 'title',
//       Message: 'What is the Roles name?'
//     },
//     {
//       type: 'input',
//       name: 'Salary',
//       Message: 'What is the Salary?'
//     },
//     {
//       type: 'list',
//       name: 'ID',
//       choices: departments.map((departmentID) => {
//         return {
//           name: departmentID.department_name,
//           value: departmentID.id
//         }
//       })
//     },
//   ])
//     .then(answers => {
//       connection.query('INSERT INTO department SET ?', { department_name: answers.name })
//       mainMenu();
//     })
// };
mainMenu();