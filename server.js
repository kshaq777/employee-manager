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
const questions = [
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

// get init input so as to guide which function to execute
function askFork() {
    inquirer.prompt(questions).then(answer => {
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
            case '/delete':
                deleteDB(answer.action, answer.table);
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
    var dq;
    var rq;

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
        }
    
    
        // Create query
        connection.query(`insert into ${table} set ?`, 
        [schema],
        
        function(err, res) {
            if (err) throw err;
            console.log(res);

        })


    })

}

// Query the database based on the user's input
function updateDB(action, table) {
    // uncomment the below to confirm args come into function, if needed
    // console.log('test');


    connection.query(`select * from ${table}`, function(err,res){
        if (err) throw err;
        // console.log(Object.keys(res[0]));
        // console.log(res);
        tableSchema = Object.keys(res[0]);
    })

    

    const updateQs = 
        {
            type: 'checkbox',
            message: "Select the fields you'd like to update",
            name: "fields",
            choices: tableSchema
        }
    

    // console.log(updateQs);

    // inquirer.prompt(updateQs).then(schema => {
    //     console.log(schema);
    //     // Create query
    //     // connection.query(`insert into ${table} set ?`, 
    //     // [schema],
        
    //     // function(err, res) {
    //     //     if (err) throw err;
    //     //     console.log(res);

    //     // })

    // })
}

// Query the database based on the user's input
function viewDB(action, table) {
    // uncomment the below to confirm args come into function, if needed
    // console.log('test');
    const viewQs = {
        type: 'confirm',
        message: 'Would you like to enter any search filters?',
        name: 'filters'
    }

    // inquirer.prompt(viewQs).then(answers => {
    //     // console.log(answers.filters);
    //     if (answers.filters) {
    //         inquirer.prompt
    //     }
    //     else {
    //         connection.query(`SELECT * from ${table}`, function(err, res) {
    //             if (err) throw err;
    //             console.log('\n');
    //             console.table(res);
        
    //         })
    //     }
    // })

}

// Query the database based on the user's input
function deleteDB(action, table) {
    // uncomment the below to confirm args come into function, if needed
    // console.log('test');

    // Create query
    // connection.query("FROM auctions", function(err, res) {
    //     if (err) throw err;
    //     console.log(res);

}
