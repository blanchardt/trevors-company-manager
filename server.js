//add the required libraries
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//create arrays for the questions and options for users to select select
var initialResponses = ["View All Employees", "Add Employee", "Update Employee Role", "View All Role", "Add Role", "View All Departments", "Add Department", "Quit"];
var addingDepartmentQuestion = "What is the name of the department?";
var addingRoleQuestions = ["What is the name of the role?", "What is the salary of the role?", "Which department does the role belong to?"];
var addingEmployeeQuestions = ["What is the emlyee's first name?", "What is the emlyee's last name?", "What is the employees role?", "Who is the emplyees's manager?"];
var updateEmployeeQuestions = ["Which employee's role do you want to update?", "Which role do you want to assign the selected employee?"];


var departmentChoices = [];
var roleChoices = [];
var employeeChoices = ["None"];

//make connect to the sql server.
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'qwerFDC$88',
    database: 'company_db'
  },
  console.log(`Connected to the company_db database.`)
);

//create a function that will populate an array of department names.
function getDepartments() {
  db.query('SELECT * FROM department', function (err, results) {
    
    results.forEach((el) => {
      departmentChoices.push(el.name);
    });
  });
}

//create a function that will populate an array of role titles.
function getRoles() {
  db.query('SELECT * FROM role', function (err, results) {
    
    results.forEach((el) => {
      roleChoices.push(el.title);
    });
  });
}

//create a function that will populate an array of employee names.
function getEmployees() {
  db.query('SELECT * FROM Employee', function (err, results) {
    
    results.forEach((el) => {
      employeeChoices.push(`${el.first_name} ${el.last_name}`);
    });
  });
}

//create a function for view all departments.
function viewAllDepartments() {
  db.query('SELECT * FROM department', function (err, results) {
    var length = 0;
    var dashes = "";
    //get the length of the largest department.
    results.forEach((el) => {
      if(el.name.length > length) {
        length = el.name.length;
      }
    });
    //create a - for the largest department name.
    for (var i = 0; i < length; i++) {
      dashes += "-";
    }

    //console log the top of the table.
    console.log(`\n`);
    console.log("id  name");
    console.log(`--  ${dashes}`)
    
    //output each element in a loop, have a different output determined by id length.
    results.forEach((el) => {
      if (el.id < 10) {
        console.log(`${el.id}   ${el.name}`);
      }
      else {
        console.log(`${el.id}  ${el.name}`);
      }
    });
    console.log();
    
    //call the initial question again so it can loop.
    initialQuestion();
  });
}

//create a function to view all roles.
function viewAllRoles() {
  //Went to https://stackoverflow.com/questions/17434929/joining-two-tables-with-specific-columns to learn how to not have duplicate column names.
  //also credited in the readme.
  db.query('SELECT role.id, role.title, role.salary, department.name FROM role JOIN department ON role.department_id = department.id;', function (err, results) {
    var departmentLength = 10;
    var titleLength = 5;
    var titleDashes = "";
    var titleSpaces = "";
    var departmentDashes = "";
    var departmentSpaces = "";


    //get the length of the largest department name, and role title.
    results.forEach((el) => {
      if(el.name.length > departmentLength) {
        departmentLength = el.name.length;
      }
      if(el.title.length > titleLength) {
        titleLength = el.title.length;
      }
    });

    //create a - for the largest department name and largest role title.
    for (var i = 0; i < departmentLength; i++) {
      departmentDashes += "-";
      if (i >= 10) {
        departmentSpaces += " ";
      }
    }

    for (var i = 0; i < titleLength; i++) {
      titleDashes += "-";
      if (i >= 5) {
        titleSpaces += " ";
      }
    }

    //console log the top of the table.
    console.log(`\n\nid  title${titleSpaces}  department${departmentSpaces}  salary`);
    console.log(`--  ${titleDashes}  ${departmentDashes}  ------`);

    //output each element in a loop, have a different output determined by length of each element.
    results.forEach((el) => {
      var idSpace = "";
      var titleSpace = "";
      var departmentSpace = "";

      //check if extra space is needed for id.
      if (el.id < 10) {
        idSpace += " ";
      }

      //check if extra spaces are needed for the title.
      if (el.title.length < titleLength) {
        for (var i = el.title.length; i < titleLength; i++) {
          titleSpace += " ";
        }
      }

      if(el.name.length < departmentLength) {
        for (var i = el.name.length; i < departmentLength; i++) {
          departmentSpace += " ";
        }
      }
      console.log(`${el.id}${idSpace}  ${el.title}${titleSpace}  ${el.name}${departmentSpace}  ${el.salary}`);
    });
    console.log();

    //call the initial question again so it can loop.
    initialQuestion();
  });
}

//create a function for adding a department.
function addDepartment() {
    inquirer
    .prompt([
      {
        type: 'input',
        message: addingDepartmentQuestion,
        name: 'department',
      },
    ])
    .then((data) => {
      db.query(`INSERT INTO department (name) VALUES (?);`, data.department, (err, result) => {
        if (err) {
          console.log(err);
        }
      });
      departmentChoices.push(data.department);
      initialQuestion();
  });
}

//create a function that will create a role
function addRodle() {
  inquirer
    .prompt([
      {
        type: 'input',
        message: addingRoleQuestions[0],
        name: 'role',
      },
      {
        type: 'input',
        message: addingRoleQuestions[1],
        name: 'salary',
      },
      {
        type: 'list',
        message: addingRoleQuestions[2],
        choices: departmentChoices,
        name: 'department',
      },
    ])
    .then((data) => {
      db.query(`SELECT id FROM department WHERE department.name = ?`, data.department, (err,result) => {
        db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`, [data.role, data.salary, result[0].id], (err2, result2) => {
          if (err2) {
            console.log(err2);
          }
        });
        roleChoices.push(data.role);
        initialQuestion();
      });
    });
}

//create a function to add an employee.
function addEmployee() {
  inquirer
    .prompt([
      {
        type: 'input',
        message: addingEmployeeQuestions[0],
        name: 'firstName',
      },
      {
        type: 'input',
        message: addingEmployeeQuestions[1],
        name: 'lastName',
      },
      {
        type: 'list',
        message: addingEmployeeQuestions[2],
        choices: roleChoices,
        name: 'role',
      },
      {
        type: 'list',
        message: addingEmployeeQuestions[3],
        choices: employeeChoices,
        name: 'manager',
      },
    ])
    .then((data) => {
      db.query(`SELECT id FROM role WHERE role.title = ?`, data.role, (err,result) => {
        //check if user selected none.
        if(data.manager === "None") {
          db.query(`INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);`, [data.firstName, data.lastName, result[0].id], (err2, result) => {
            if (err2) {
              console.log(err2);
            }
          });
          employeeChoices.push(`${data.firstName} ${data.lastName}`);
          initialQuestion();
        }
        else {
          var managerName = data.manager.split(' ');
          db.query(`SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?`, [managerName[0], managerName[1]], (err2,result2) => {
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`, [data.firstName, data.lastName, result[0].id, result2[0].id], (err2, result) => {
              if (err2) {
                console.log(err2);
              }
            });
            employeeChoices.push(`${data.firstName} ${data.lastName}`);
            initialQuestion();
          });
        }
      });
    });
}

//Went to https://stackoverflow.com/questions/43003870/how-do-i-shut-down-my-express-server-gracefully-when-its-process-is-killed to figure out the
//comand to quit out of the program while it is running on a port.  Also credited in the readme file.
//add the quit function to exit the program.
function quit() {
  server.close(() => {
    process.exit(0);
  });
}

//ask the user what they would like to do , then call another function based off result.
function initialQuestion() {
  inquirer
  .prompt([
    {
      type: 'list',
      message: "What would you like to do?",
      choices: initialResponses,
      name: 'request',
    },
  ])
  .then((data) => {
    if(data.request === "View All Employees"){
        allEmployees();
    }
    else if(data.request === "Add Employee"){
      addEmployee();
    }
    else if(data.request === "Update Employee Role"){
      updateEmployee();
    }
    else if(data.request === "View All Role"){
      viewAllRoles();
    }
    else if(data.request === "Add Role"){
      addRodle();
    }
    else if(data.request === "View All Departments"){
      viewAllDepartments();
    }
    else if(data.request === "Add Department"){
      addDepartment();
    }
    else {
        quit();
    }
  });
}

app.use((req, res) => {
  res.status(404).end();
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//call functions to initialize the program.
getDepartments();
getRoles();
getEmployees();
initialQuestion();