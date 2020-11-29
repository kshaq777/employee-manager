// Bring in the modules
var mysql = require("mysql");
const inquirer = require('inquirer');
const cTable = require('console.table');


var connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "password",
  database: "ems_db"
});

// Establish connection with the DB
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  askFork();
});

// init array of questions to ask
const questions1 = [
    {
        type: 'list',
        message: "Would you like to use dynamic mode, or use pre-built functions?",
        name: 'dynamic',
        choices: ['dynamic', 'pre-built']
    }
]
const questions2 = [
    // the question to decide the path
    {
        type: 'list',
        message: "What are you looking to edit?",
        name: 'table',
        choices: ['department', 'roles', 'employees']

    },
    {
        type: 'list',
        message: "What action do you need to take?",
        name: 'action',
        choices: ['create', 'update', 'view', 'delete']

    }
    
]

const questions3 = [
    {
        type: 'list',
        message: 'Which query would you like to execute?',
        name: 'query',
        choices: ['View Employees by Manager', 
        // 'View Employees by Dept', 
        'View Dept Budgets']
    }
]

const reset = {
    type: 'confirm',
    message: "Press 'Y' to do your next query",
    name: 'reset'
}

// Make the schemas global variables for the various functions
var deptSchema = [];
var roleSchema = [];
var empSchema = [];

// Make the total values avaialable like a 'cache'
var empVals = [];
var roleVals = [];
var deptVals = [];
var mgrVals = [];

getSchemas();


// get init input so as to guide which function to execute
function askFork() {
    inquirer.prompt(questions1).then(a => {
        if (a.dynamic === 'dynamic') {
            dynamicFork();
        }
        else {
            staticFork();
        }
    })
    
}


// function to fill global vars
function getSchemas() {

connection.query("select * from department", function(err,res){
    if (err) throw err;
    deptSchema = Object.keys(res[0]);
    deptVals = res;

})

connection.query("select * from roles", function(err,res){
    if (err) throw err;
    roleSchema = Object.keys(res[0]);
    roleVals = res;

})

connection.query("select * from employees", function(err,res){
    if (err) throw err;
    empSchema = Object.keys(res[0]);
    empVals = res;
    for (let m=0; m < res.length; m++) {
        if (res[m].is_manager) {
            mgrVals.push(res[m]);
        }
    }
    
})

}

// guide user through steps for a dynamic sql query creation
function dynamicFork() {
    inquirer.prompt(questions2).then(answer => {
        console.log(`You want to ${answer.action} an entry in the ${answer.table} table.`);

        // fork in the road; where do you go robert frost
        switch (answer.action) {
            case 'create':
                createDB(answer.action, answer.table);
                break;
            case 'update':
                updateDB(answer.action, answer.table);
                break;
            case 'view':
                viewDB(answer.action, answer.table);
                break;
            case 'delete':
                deleteDB(answer.action, answer.table);
                break;
            default:
                console.log('Error, choose right action.');
                break;
        }

    })
}

// guide user to popular pre-defined queries 
function staticFork() {
    inquirer.prompt(questions3).then(answer => {
        console.log(`You want to execute ${answer.query}.`);

        // fork in the road; where do you go robert frost
        switch (answer.query) {
            case 'View Employees by Manager':
                groupByMgr();
                break;
            // case 'View Employees by Dept':
                // groupByDept();
                // break;
            case 'View Dept Budgets':
                deptBudget();
                break;
            default:
                console.log('Error, choose right action.');
                break;
        }

    })

}

// Query the database based on the user's input
function createDB(action, table) {
    // uncomment the below to confirm args come into function, if needed
    // console.log('test');

    const createQs = [];
    const dept = [];
    const role = [];
    const mgr = ['null'];
    var dq;
    var rq;
    var mq;

    connection.query("select * from department", function(err,res){
        if (err) throw err;
        for (let d=0; d < res.length; d++) {
            dept.push(res[d].name)
        }
        dq = res;
    })
    
   

    connection.query("select * from roles", function(err,res){
        if (err) throw err;
        for (let r=0; r < res.length; r++) {
            role.push(res[r].title)
        }

        rq = res;
    })

    connection.query("select * from employees where is_manager = true", function(err,res){
        if (err) throw err;
        for (let r=0; r < res.length; r++) {
            mgr.push(res[r].firstname + ' ' + res[r].lastname)
        }

        mq = res;
    })

    switch (table){
        case ("department"):
            let a = {
                type: 'input',
                message: "What's the department called?",
                name: 'name'
            }

            createQs.push(a);
            break;
        
        case ("roles"):
            let b = [
                {
                    type: 'input',
                    message: 'what is the role called?',
                    name: 'title'
                },
                {
                    type: 'number',
                    message: 'How much is the salary for this role?',
                    name: 'salary'
                },
                {
                    type: 'list',
                    message: 'What department is this in?',
                    name: 'department_id',
                    choices: dept
                }
            ]

            for (let i=0; i < b.length; i++){
                createQs.push(b[i]);
            }
            
            break;

        case ("employees"):
            let c = [
                {
                    type: 'input',
                    message: "What is the employee's first name?",
                    name: 'firstname'
                },
                {
                    type: 'input',
                    message: "What is the employee's last name?",
                    name: 'lastname'
                },
                {
                    type: 'list',
                    message: "What is the employee's role?",
                    name: 'role_id',
                    choices: role
                },
                {
                    type: 'confirm',
                    message: "Are they a manager?",
                    name: 'is_manager'
                },
                {
                    type: 'list',
                    message: "Who is this peron's manager?",
                    name: 'manager_id',
                    choices: mgr
                }
            ]

            
            for (let j=0; j < c.length; j++){
                createQs.push(c[j]);
            }
            
            break;

    }

    // console.log(createQs);
    // const schema = createQs.map(name => name.name);
    // console.log(schema);
    
    inquirer.prompt(createQs).then(schema => {
        // console.log(answer);
        if (table === 'roles') {
            let match = dq.find(obj => obj.name === schema.department_id);
            schema.department_id = match.id;
        }

        if (table === 'employees') {
            let match = rq.find(obj => obj.title === schema.role_id);
            schema.role_id = match.id;

            if (schema.manager_id != 'null') {
            let match2 = mq.find(obj => obj.firstname.concat(' ').concat(obj.lastname) === schema.manager_id);
            schema.manager_id = match2.id;
            }
            else {
                schema.manager_id = null;
            }
        }
    
    
        // Create query
        connection.query(`insert into ${table} set ?`, 
        [schema],
        
        function(err, res) {
            if (err) throw err;
            console.log(res);
            inquirer.prompt(reset).then(r => {
                if (r.reset) {
                    askFork();
                }
                else {
                    connection.end();
                }
            })

        })


    })

}

// Query the database based on the user's input
function updateDB(action, table) {
    // uncomment the below to confirm args come into function, if needed
    // console.log(empSchema);        

    var tableSchema;

    // async function getTable() {
    //     connection.query(`select * from ${table}`, function(err, res) {
    //     // if (err) throw err;
    //         console.table(res);

    //     })

    //     return new Promise(resolve => {
    //         setTimeout(() => {
    //             resolve('resolved'),
    //             2000
    //         });
    //     })
    // }

    // Get the right table
    switch (table){
        case ("department"):
            console.log('\n');
            console.table(deptVals);
            tableSchema = deptSchema;
            break;
        
        case ("roles"):
            console.log('\n');
            console.table(roleVals);
            tableSchema = roleSchema;
            break;

        case ("employees"):
            console.log('\n');
            console.table(empVals);
            tableSchema = empSchema;
            break;

    }

    const updateQs = 
        [{
            type: 'input',
            message: 'Enter the ID of the record you want to update.',
            name: 'id'
        },
        {
            type: 'list',
            message: "Select the field you'd like to update",
            name: "fields",
            choices: tableSchema
        },
        {
            type: 'input',
            message: 'What value should the field get?',
            name: 'value'

        }]


        inquirer.prompt(updateQs).then(schema => {
        // console.log(schema);
        // Create query
        connection.query(`update ${table} set ${schema.fields} = '${schema.value}' where id = '${schema.id}'`, 
    
        function(err, res) {
            if (err) throw err;
            console.log(res);
            inquirer.prompt(reset).then(r => {
                if (r.reset) {
                    askFork();
                }
                else {
                    connection.end();
                }
            })

        })

    })
    

}

// Query the database based on the user's input
function viewDB(action, table) {
    // uncomment the below to confirm args come into function, if needed
    // console.log('test');
    var tableSchema;

    // Get the right table
    switch (table){
        case ("department"):
            tableSchema = deptSchema;
            break;
        
        case ("roles"):
            tableSchema = roleSchema
            break;

        case ("employees"):
            tableSchema = empSchema;
            break;

    }
    
    const viewQs = {
        type: 'confirm',
        message: 'Would you like to enter any search filters?',
        name: 'filters'
    }

    const whereQs = 
        [{
            type: 'list',
            message: "Select the field you'd like to filter by.",
            name: "fields",
            choices: tableSchema
        },
        {
            type: 'input',
            message: 'What value should the filter get?',
            name: 'value'

        }]

    inquirer.prompt(viewQs).then(answers => {
        // console.log(answers.filters);
        if (answers.filters) {
            inquirer.prompt(whereQs).then( a => {
                connection.query(`SELECT * from ${table} where ${a.fields} = '${a.value}'`, function(err, res){
                if (err) throw err;
                console.log('\n');
                console.table(res);
                inquirer.prompt(reset).then(r => {
                    if (r.reset) {
                        askFork();
                    }
                    else {
                        connection.end();
                    }
                })
                })
            })
        }

        else {
            connection.query(`SELECT * from ${table}`, function(err, res) {
                if (err) throw err;
                console.log('\n');
                console.table(res);
                inquirer.prompt(reset).then(r => {
                    if (r.reset) {
                        askFork();
                    }
                    else {
                        connection.end();
                    }
                })
        
            })
        }
    })

}

// Query the database based on the user's input
function deleteDB(action, table) {
    // uncomment the below to confirm args come into function, if needed
    // console.log('test');
    async function getTable() {
        connection.query(`select * from ${table}`, function(err, res) {
        // if (err) throw err;
            console.table(res);

        })

        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved'),
                2000
            });
        })
    }

    const delQs = 
        {
            type: 'input',
            message: 'Enter the ID of the records you want to delete.',
            name: 'id'
        }

    getTable().then(
        inquirer.prompt(delQs).then(schema => {
        // console.log(schema);
        // Create query
        connection.query(`delete from ${table} where id = '${schema.id}'`, 
    
        function(err, res) {
            if (err) throw err;
            console.log(res);
            inquirer.prompt(reset).then(r => {
                if (r.reset) {
                    askFork();
                }
                else {
                    connection.end();
                }
            })

        })

    })
    )

}

// function to group employees by manager
function groupByMgr() {
    // init manager vars
    console.log('\n');
    console.table(mgrVals);

    let manager =  
    {
        type: 'input',
        message: 'Enter the ID of the manager you want to view.',
        name: 'id'
    };


    inquirer.prompt(manager).then(m => {

        connection.query(`select * from employees where id = ${m.id}`, function(err,res){
            console.log(`\nViewing Employees Under ${res[0].firstname} ${res[0].lastname}`);
        })

        connection.query(`select * from employees where manager_id = '${m.id}'`, function(err,res){
            if (res.length > 0) {
                console.table(res);
                inquirer.prompt(reset).then(r => {
                    if (r.reset) {
                        askFork();
                    }
                    else {
                        connection.end();
                    }
                })
            }
            else {
                console.log('This Manager currently has no employees under them.')
                inquirer.prompt(reset).then(r => {
                    if (r.reset) {
                        askFork();
                    }
                    else {
                        connection.end();
                    }
                })
            }
            
        })

    
    })
}

function deptBudget() {
    // create a series of subqueries to structure the data as desired
    connection.query(`
    with depts as (
        select id, name
        from department
    ),
    
    emps as (
        select 
        e.id, e.role_id, r.salary, r.department_id
        from employees e 
        left join roles r on r.id = e.role_id
    ),

    summ as (
        select department_id, sum(salary) as budget
        from emps
        group by department_id
    )

    select d.id, d.name, s.budget from depts d left join summ s on s.department_id = d.id
    `, 
    function(err,res){
        if (err) throw err;
        console.log('\n');
        console.table(res);
        inquirer.prompt(reset).then(r => {
            if (r.reset) {
                askFork();
            }
            else {
                connection.end();
            }
        })
    })
}
