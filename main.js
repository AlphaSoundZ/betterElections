let result = document.getElementById("result");
let groupSize = 6;
let amountOfStudents = 25;
let wishedAmountOfRounds = null;
let defaultArray;
let answer = [];

// round up to the nearest multiple of groupSize
amountOfStudents = Math.ceil(amountOfStudents / groupSize) * groupSize;

let amountOfGroups = amountOfStudents / groupSize;

function rounds(array, amountOfStudents, groupSize) {
    if (amountOfStudents == groupSize) {
        return array;
    }
    
    let result = [];
    // first round
    result.push(fullCopy(defaultArray));

    amountOfGroups = amountOfStudents / groupSize;

    if (wishedAmountOfRounds != null && wishedAmountOfRounds < amountOfGroups)
        amountOfGroups = wishedAmountOfRounds;
    
    for (let i = 0; i < amountOfGroups-1; i++) { // iterate through rounds
        for (let j = 1; j < groupSize; j++) { // iterate through columns
            shiftDown(array, j, j);
        }
        result.push(fullCopy(array));
    }
    
    return result;
}

function shiftDown(array, column, n) {
    let temp = getColumn(array, column);
    for (let i = 0; i < n; i++) {
        let last = temp[temp.length - 1]; // get last element
        temp.pop(); // remove last element
        temp.unshift(last); // add last element to the beginning
    }
    // put temp back into array
    for (let i = 0; i < temp.length; i++) {
        array[i][column] = temp[i];
    }
    return array;
}

function createArray(amountOfStudents, groupSize) {
    let result = [];
    let student = 1;
    
    for (let i = 0; student <= amountOfStudents; i++) {
        result[i] = [];
        for (let j = 0; j < groupSize; j++) {
            result[i][j] = student;
            student++;
        }
    }
    return result;
}

function getColumn(array, column) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        result[i] = array[i][column];
    }
    return result;
}

function fullCopy(currentArray) {
    var newArray = [];
    for (var i = 0; i < currentArray.length; i++)
        newArray[i] = currentArray[i].slice();
    return newArray;
}

function validate(e) {
    e.preventDefault();

    amountOfStudents = document.getElementById("amountOfStudents").value;
    groupSize = document.getElementById("groupSize").value;
    wishedAmountOfRounds = (document.getElementById("amountOfRounds").value == "") ? null : document.getElementById("amountOfRounds").value;

    let students = [];
    for (let i = 1; i <= amountOfStudents; i++) {
        students.push(i);
    }

    defaultArray = createArray(amountOfStudents, groupSize);

    answer = rounds(fullCopy(defaultArray), amountOfStudents, groupSize);
    
    result = document.getElementById("result");
    // delete all children of result
    while (result.firstChild) {
        result.removeChild(result.firstChild);
    }

    // create new children
    let rounds_title = document.createElement("h2");
    rounds_title.innerHTML = "Rounds";
    result.appendChild(rounds_title);


    for (let i = 0; i < answer.length; i++) {
        let title = document.createElement("h3");
        title.innerHTML = "Round " + (i+1);
        result.appendChild(title);

        let table = document.createElement("table");
        table.className = "table table-bordered";
        result.appendChild(table);

        let thead = document.createElement("thead");
        table.appendChild(thead);

        let tr = document.createElement("tr");
        thead.appendChild(tr);

        for (let j = 0; j < groupSize; j++) {
            let th = document.createElement("th");
            th.innerHTML = "Group " + (j+1);
            tr.appendChild(th);
        }

        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        for (let j = 0; j < answer[i].length; j++) {
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            for (let k = 0; k < groupSize; k++) {
                let td = document.createElement("td");
                td.innerHTML = answer[i][k][j];
                tr.appendChild(td);
            }
        }

        // table style with borders
        let style = document.createElement("style");
        style.innerHTML = "table, th, td { border: 1px solid black; padding: 5px;}";
        result.appendChild(style);
    }
}