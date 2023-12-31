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
var employeeChoicesWithNone = ["None"];
var employeeChoices = [];

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
      employeeChoicesWithNone.push(`${el.first_name} ${el.last_name}`);
      employeeChoices.push(`${el.first_name} ${el.last_name}`)
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
    console.log(`--  ${dashes}`);
    
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
  /*Natalia Natalie, OCDan, Fenton, user1864610, user1978081, Md Yeasin Arafat, Gordon Linoff, Riv, Nicolas Gervais,  
      4b0, &amp; Sudipta Mondal. (2013, July 2). Joining two tables with specific columns. Stack Overflow.   
      https://stackoverflow.com/questions/17434929/joining-two-tables-with-specific-columns   */
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

//create a function for viewing all employees.
function viewAllEmployees() {
  //went to https://www.w3schools.com/sql/sql_join_self.asp to learn how to self JOIN.  also credited in the readme file.
  //SQL Self Join. SQL Self join. (1999). https://www.w3schools.com/sql/sql_join_self.asp 
  //went to https://learnsql.com/blog/concatenate-two-columns-in-sql/#:~:text=The%20CONCAT_WS%20function%20in%20SQL,strings%20you%20want%20to%20concatenate.
  //to figure out how to combine 2 columns into a single column.  also credited in the readme file.
  /*Bruffa, A. (2023, February 16). How to concatenate two columns in SQL – A detailed guide. LearnSQL.com.   
      https://learnsql.com/blog/concatenate-two-columns-in-sql/#:~:text=The%20CONCAT_WS%20function%20in%20SQL,strings%20you%20want%20to%20concatenate. */
  //went to https://www.educative.io/answers/how-to-join-3-or-more-tables-in-sql to learn how to join multiple tables together.  also credited in the readme file.
  /*How to join 3 or more tables in SQL. Educative, Inc. (2023). 
      https://www.educative.io/answers/how-to-join-3-or-more-tables-in-sql */
  db.query(`SELECT e1.id, e1.first_name, e1.last_name, role.title, department.name, role.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager
  FROM ((employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id)
  LEFT JOIN role ON e1.role_id = role.id)
  LEFT JOIN department ON role.department_id = department.id;`, function (err, results) {
    
    var maxId = 0;
    var fNameLength = 10;
    var lNameLength = 9;
    var titleLength = 5;
    var departmentLength = 10;
    var managerLength = 7;
    var idDashes = "--";
    var fNameDashes = "";
    var lNameDashes = "";
    var titleDashes = "";
    var departmentDashes = "";
    var managerDashes = "";
    var idSpaces = "";
    var fNameSpaces = "";
    var lNameSpaces = "";
    var titleSpaces = "";
    var departmentSpaces = "";

    //get the length of the largest department name, role title, first name, last name id number, and manager name.
    results.forEach((el) => {
      if (el.id > maxId) {
        maxId = el.id;
      }
      if (el.first_name.length > fNameLength) {
        fNameLength = el.first_name.length;
      }
      if (el.last_name.length > lNameLength) {
        lNameLength = el.last_name.length;
      }
      if(el.name.length > departmentLength) {
        departmentLength = el.name.length;
      }
      if(el.title.length > titleLength) {
        titleLength = el.title.length;
      }
      if (el.manager !== null && el.manager.length > managerLength) {
        managerLength = el.manager.length;
      }
    });

    //create a - for the largest department name, role title, first name, last name id number, and manager name.
    for (var i = 0; i < fNameLength; i++) {
      fNameDashes += "-";
      if (i >= 10) {
        fNameSpaces += " ";
      }
    }
    for (var i = 0; i < lNameLength; i++) {
      lNameDashes += "-";
      if (i >= 9) {
        lNameSpaces += " ";
      }
    }
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
    for (var i = 0; i < managerLength; i++) {
      managerDashes += "-";
    }

    //create a - based off the largest id number.
    if(maxId >= 100) {
      idDashes = "---";
      idSpaces = " ";
    }



    //console log the top of the table.
    console.log(`\n\nid${idSpaces}  first_name${fNameSpaces}  last_name${lNameSpaces}  title${titleSpaces}  department${departmentSpaces}  salary  manager`);
    console.log(`${idDashes}  ${fNameDashes}  ${lNameDashes}  ${titleDashes}  ${departmentDashes}  ------  ${managerDashes}`);
    
    //output each element in a loop, have a different output determined by length of each element.
    results.forEach((el) => {
      var idSpace = "";
      var fNameSpace = "";
      var lNameSpace = "";
      var titleSpace = "";
      var departmentSpace = "";
      var salarySpace = "";
      var salary = el.salary;


      //check if extra space is needed for id.
      if (maxId >= 100 && el.id < 10) {
        idSpace = "  ";
      }
      else if ((maxId >= 100 && el.id < 100) || (maxId < 100 && el.id < 10)) {
        idSpace = " ";
      }

      //check if extra spaces are needed for the first name.
      if (el.first_name.length < fNameLength) {
        for (var i = el.first_name.length; i < fNameLength; i++) {
          fNameSpace += " ";
        }
      }

      //check if extra spaces are needed for the last name.
      if (el.last_name.length < lNameLength) {
        for (var i = el.last_name.length; i < lNameLength; i++) {
          lNameSpace += " ";
        }
      }

      //check if extra spaces are needed for the title.
      if (el.title.length < titleLength) {
        for (var i = el.title.length; i < titleLength; i++) {
          titleSpace += " ";
        }
      }

      //check if extra spaces are needed for the department name.
      if(el.name.length < departmentLength) {
        for (var i = el.name.length; i < departmentLength; i++) {
          departmentSpace += " ";
        }
      }

      //check if extra spaces are needed for the salary.
      if(salary.toString().length < 6) {
        for (var i = salary.toString().length; i < 6; i++) {
          salarySpace += " ";
        }
      }

      //output the row appropriately.
      console.log(`${el.id}${idSpace}  ${el.first_name}${fNameSpace}  ${el.last_name}${lNameSpace}  ${el.title}${titleSpace}  ${el.name}${departmentSpace}  ${salary}${salarySpace}  ${el.manager}`);
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
        validate: function(department) {
          //department cannot be empty.
          if (department.length != 0) {
            return true;
          }
          else {
            return "department cannot be empty.";
          }
        }
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
        validate: function(role) {
          //role cannot be empty.
          if (role.length != 0) {
            return true;
          }
          else {
            return "role cannot be empty.";
          }
        }
      },
      {
        type: 'input',
        message: addingRoleQuestions[1],
        name: 'salary',
        validate: function(salary) {
          //salary cannot be empty.
          if (salary.length != 0) {
            return true;
          }
          else {
            return "salary cannot be empty.";
          }
        }
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
        validate: function(firstName) {
          var space = /\s/;
          //first name cannot be empty or contain space.
          if (firstName.length == 0) {
            return "first name cannot be empty.";
          }
          else if (space.test(firstName)) {
            return "first name cannot contain spaces."
          }
          else {
            return true;
          }
        }
      },
      {
        type: 'input',
        message: addingEmployeeQuestions[1],
        name: 'lastName',
        validate: function(lastName) {
          var space = /\s/;
          //last name cannot be empty or contain space.
          if (lastName.length == 0) {
            return "last name cannot be empty.";
          }
          else if (space.test(lastName)) {
            return "last name cannot contain spaces."
          }
          else {
            return true;
          }
        }
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
        choices: employeeChoicesWithNone,
        name: 'manager',
      },
    ])
    .then((data) => {
      db.query(`SELECT id FROM role WHERE role.title = ?`, data.role, (err,result) => {
        //check if user selected none.
        if(data.manager === "None") {
          db.query(`INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);`, [data.firstName, data.lastName, result[0].id], (err2, result2) => {
            if (err2) {
              console.log(err2);
            }
          });
        }
        else {
          var managerName = data.manager.split(' ');
          db.query(`SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?`, [managerName[0], managerName[1]], (err2,result2) => {
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`, [data.firstName, data.lastName, result[0].id, result2[0].id], (err2, result) => {
              if (err2) {
                console.log(err2);
              }
            });
          });
        }
        employeeChoicesWithNone.push(`${data.firstName} ${data.lastName}`);
        employeeChoices.push(`${data.firstName} ${data.lastName}`);
        initialQuestion();
      });
    });
}

//Create a function to update the emplyee role.
function updateEmployee() {
  inquirer
  .prompt([
    {
      type: 'list',
      message: updateEmployeeQuestions[0],
      choices: employeeChoices,
      name: 'employee',
    },
    {
      type: 'list',
      message: updateEmployeeQuestions[1],
      choices: roleChoices,
      name: 'role',
    },
  ])
  .then((data) => {
    var employeeName = data.employee.split(' ');
    //get the role id.
    db.query(`SELECT id FROM role WHERE role.title = ?`, data.role, (err,result) => {
      //update the specified emplyee's role.
      db.query(`UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`, [result[0].id, employeeName[0], employeeName[1]]);
      initialQuestion();
    });

  });
}

//Went to https://stackoverflow.com/questions/43003870/how-do-i-shut-down-my-express-server-gracefully-when-its-process-is-killed to figure out the
//comand to quit out of the program while it is running on a port.  Also credited in the readme file.
/*Patrick Hund, Slava Fomin II, Przemek Nowak, Erick, Adarsh Madrecha, LeoPucciBr, twg, &amp; Rafael Tavares. (2017, 
    March 24). How do I shut down my express server gracefully when its process is killed?. Stack Overflow. 
    https://stackoverflow.com/questions/43003870/how-do-i-shut-down-my-express-server-gracefully-when-its-process-is-killed */
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
      if (employeeChoices.length == 0) {
        console.log("No employees to display.");
        initialQuestion();
      }
      else {
        viewAllEmployees();
      }
    }
    else if(data.request === "Add Employee") {
      if (roleChoices.length ==  0) {
        console.log("There are no roles.  Emplyees need a role when created.");
        initialQuestion();
      }
      else {
        addEmployee();
      }
    }
    else if(data.request === "Update Employee Role") {
      if (employeeChoices.length == 0) {
        console.log("There are no employees to update.");
        initialQuestion();
      }
      else {
        updateEmployee();
      }
    }
    else if(data.request === "View All Role") {
      if (departmentChoices.length == 0) {
        console.log("No roles to display.");
        initialQuestion();
      }
      else {
        viewAllRoles();
      }
    }
    else if(data.request === "Add Role") {
      if (departmentChoices.length == 0) {
        console.log("There are no departments.  Role needs a department when created.");
        initialQuestion();
      }
      else {
        addRodle();
      }
    }
    else if(data.request === "View All Departments") {
      if (departmentChoices.length == 0) {
        console.log("No departments to display.");
        initialQuestion();
      }
      else {
        viewAllDepartments();
      }
    }
    else if(data.request === "Add Department") {
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

const server = app.listen(PORT);

//call functions to initialize the program.
getDepartments();
getRoles();
getEmployees();
initialQuestion();