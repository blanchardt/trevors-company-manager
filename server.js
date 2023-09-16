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


app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
