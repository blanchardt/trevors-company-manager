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
var managerChoices = ["None"];
var updateEmployeeQuestions = ["Which employee's role do you want to update?", "Which role do you want to assign the selected employee?"];


var departments = [];

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

//create a function that will return an array of departments.
function getDepartments() {
  db.query('SELECT * FROM department', function (err, results) {
    
    results.forEach((el) => {
      departments.push(el.name);
    });
    console.log(departments);
    return departments;
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
    console.log(results);
  });
  initialQuestion();
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
      departments.push(data.department);
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
        choices: departments,
        name: 'department',
      },
    ])
    .then((data) => {
      var departmentId;
      db.query(`SELECT id FROM department WHERE department.name = ?`, data.department, (err,result) => {
        console.log(result);
        departmentId = result;
      });
      db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`, [data.role, data.salary, departmentId], (err, result) => {
        if (err) {
          console.log(err);
        }
      });
      initialQuestion();
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//call functions to initialize the program.
getDepartments();
initialQuestion();