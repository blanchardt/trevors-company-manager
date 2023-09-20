SELECT role.id, role.title, role.salary, department.name
FROM role
JOIN department ON role.department_id = department.id;

SELECT *
FROM employee
LEFT JOIN role ON employee.role_id = role.id;

SELECT e1.id, e1.first_name, e1.last_name, role.title, department.name, role.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager
FROM ((employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id)
LEFT JOIN role ON e1.role_id = role.id)
LEFT JOIN department ON role.department_id = department.id;