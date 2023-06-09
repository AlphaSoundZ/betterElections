let result = document.getElementById("result");
let options = [];
let maxOptionSize = 2;
let alreadyChecked = [];
let electionResults = []
let notYetAssigned = [];
let maxVotes = 0;
let unluckyPersons = [];

// {personIndex: 0, option: "A"}
let assigned = [];

// #################################

// add options to select
let primary_wish = document.getElementById("primary_wish");
let secondary_wish = document.getElementById("secondary_wish");

for (let i = 0; i < options.length; i++) {
    let option = document.createElement("option");
    option.text = options[i].name;
    primary_wish.add(option);

    let option2 = document.createElement("option");
    option2.text = options[i].name;
    secondary_wish.add(option2);
}


// #################################

function validate() {
    // create electionResults test data (100 persons, 2 choices, 4 options)
    /*for (let i = 0; i < 100; i++) {
        let person = {
            "name": "Person " + i,
            "choice": []
        }
    
        for (let j = 0; j < 2; j++) {
            let randomOption = Math.floor(Math.random() * Math.random() * options.length);
            person.choice.push(options[randomOption].name);
        }
    
        electionResults.push(person);
    }*/

    // every index from electionResults
    notYetAssigned = electionResults.map((x, i) => i);


    while (notYetAssigned.length > 0)
    {
        let randomIndex = Math.floor(Math.random() * notYetAssigned.length);
        randomIndex = 0; // set this to chose first person instead of random
        
        // get real index from electionResults
        let randomPersonIndex = notYetAssigned[randomIndex];
        let randomPerson = electionResults[randomPersonIndex];

        
        let PersonChoice = randomPerson.choice;

        // Check from first to last choice
        let option = checkChoices(PersonChoice);
        if (option !== false) { // result could be index 0 instead of false
            moveToAssigned(randomPersonIndex, PersonChoice[option]);
        } else // check for exchange loop
        {
            let result = false;
            for (let i = 0; i < PersonChoice.length; i++) {
                // clear alreadyChecked
                alreadyChecked = [];

                if (findExchangeLoop(randomPersonIndex, PersonChoice[i], PersonChoice[i]))
                {
                    console.log("Exchange loop found")
                    result = true;
                    break;
                }
                else
                {
                    console.log("No exchange loop found")
                    result = false;
                }
            }

            if (!result)
            {
                // delete random person from notYetAssigned and move to seperate array
                unluckyPersons.push(randomPersonIndex);
                notYetAssigned.splice(randomIndex, 1);
            } 
        }
    }

    // show results
    result.innerHTML = "";
    for (let i = 0; i < options.length; i++) {
        // create h4 title
        let h4 = document.createElement("h4");
        h4.innerHTML = options[i].name + ": " + options[i].amount;
        result.appendChild(h4);
        
        // show persons
        let persons = assigned.filter(x => x.option == options[i].name);
        for (let j = 0; j < persons.length; j++) {
            
            // change color depending on nth choice
            let color = "black";
            if (electionResults[persons[j].personIndex].choice[0] == options[i].name)
            {
                color = "green";
            } else if (electionResults[persons[j].personIndex].choice[1] == options[i].name)
            {
                color = "orange";
            }

            // create span
            let span = document.createElement("span");
            span.innerHTML = electionResults[persons[j].personIndex].name;
            span.style.color = color;
            result.appendChild(span);
            result.innerHTML += "<br>";
        }
        result.innerHTML += "<br/>";
    }

    // show unlucky persons
    result.innerHTML += "Unlucky voters (" + unluckyPersons.length + "): <br/>";
    for (let i = 0; i < unluckyPersons.length; i++) {
        result.innerHTML += electionResults[unluckyPersons[i]].name + "<br/>";
    }
}
function findExchangeLoop(exchanger, exchangerChoice, originalChoice) {

    // check if exchanger has already been checked
    if (alreadyChecked.includes(exchanger))
    {
        return false;
    } else
    {
        alreadyChecked.push(exchanger);
    }

    // check if exchanger's choice is free
    if (lookupOption(exchangerChoice) < maxOptionSize)
    {
        console.log("found!");
        changeAssignment(exchanger, exchangerChoice);
        return true;
    }
    
    // iterate through persons who are assigned to the exchanger's choice
    let persons = assigned.filter(x => x.option == exchangerChoice);

    for (let i = 0; i < persons.length; i++) {
        let person = persons[i];

        // person's other choices (without the exchanger's choice and the original choice)
        let personChoices = electionResults[person.personIndex].choice.filter(x => x != exchangerChoice && x != originalChoice);

        // recursive call to check if the person can exchange
        let option = checkChoices(personChoices);
        if (option !== false) {
            // change assignment of person to change away from exchanger's choice
            changeAssignment(person.personIndex, personChoices[option]);

            // change assignment of exchanger to exchanger's choice (which is now free)
            changeAssignment(exchanger, exchangerChoice);
            return true;
        }
    }

    for (let i = 0; i < persons.length; i++) {
        let person = persons[i];

        // person's other choices (without the exchanger's choice and the original choice)
        let personChoices = electionResults[person.personIndex].choice.filter(x => x != exchangerChoice && x != originalChoice);

        // recursive call to check if the person can exchange
        for (let k = 0; k < personChoices.length; k++) {
            if (findExchangeLoop(person.personIndex, personChoices[k], originalChoice))
            {
                return true;
            }
        }
    }

    return false;
}

function moveToAssigned(personIndex, option) {
    assigned.push({"personIndex": personIndex, "option": option});
    
    // delete from notYetAssigned where element is index
    notYetAssigned.splice(notYetAssigned.indexOf(personIndex), 1);

    options.find(x => x.name == option).amount++;

    console.log("Assigned " + electionResults[personIndex].name + " to " + option);
}

function changeAssignment(index, newOption) {
    let person = assigned.find(x => x.personIndex == index)

    if (person == undefined)
    {
        moveToAssigned(index, newOption);
        return;
    }

    console.log("Changed " + electionResults[index].name + " from " + person.option + " to " + newOption)

    // Remove from old option counter
    options.find(x => x.name == person.option).amount--;

    // Add to new option counter
    options.find(x => x.name == newOption).amount++;

    // Change assignment
    person.option = newOption;
}

// Returns the amount of votes for a given option
function lookupOption(optionName) {
    let option = options.find(x => x.name == optionName);
    return option.amount;
}

function checkChoices (personChoices) {
    for (let i = 0; i < personChoices.length; i++) {
        if (lookupOption(personChoices[i]) < maxOptionSize) // If first choice is available
        {
            return i;
        }
    };

    return false;
}

function addVote(e) {
    e.preventDefault();
    
    let name = document.getElementById("name").value;
    let primary = document.getElementById("primary_wish").value;
    let secondary = document.getElementById("secondary_wish").value;

    // check if name already exists
    if (electionResults.find(x => x.name == name))
    {
        alert("Name already exists!");
        return;
    }

    // check if secondary wish is already in primary wish
    if (primary == secondary)
    {
        alert("Secondary wish is already in primary wish!");
        return;
    }

    // check if primary wish has selection
    if (primary == "---" || secondary == "---")
    {
        alert("Please select wishes!");
        return;
    }

    // check if maximum amount of votes is reached
    if (electionResults.length >= maxVotes)
    {
        alert("Maximum amount of votes reached!");
        return;
    }

    // clear input fields
    document.getElementById("name").value = "";
    document.getElementById("primary_wish").value = "---";
    document.getElementById("secondary_wish").value = "---";

    // add to electionResults
    electionResults.push({ name: name, choice: [primary, secondary] });
    notYetAssigned.push(electionResults.length - 1);

    // add to div "voters"
    let div = document.createElement("div");
    div.innerHTML = name + ": " + primary + ", " + secondary;
    document.getElementById("voters").appendChild(div);
}

function updateSettings(e) {
    e.preventDefault();

    let groups = document.getElementById("groups").value;
    let groupSize = document.getElementById("groupSize").value;

    // split groups by comma
    groups = groups.split(",");

    // check if there are duplicate groups
    if (new Set(groups).size !== groups.length)
    {
        alert("Duplicate groups!");
        return;
    }

    // set vars
    options = [];
    maxOptionSize = groupSize;

    // set options with amount of 0
    for (let i = 0; i < groups.length; i++) {
        options.push({ name: groups[i], amount: 0 });
    }

    // reset votes
    electionResults = [];
    notYetAssigned = [];
    assigned = [];
    unluckyPersons = [];

    maxVotes = groups.length * groupSize;

    // clear div "voters"
    document.getElementById("voters").innerHTML = "";

    // clear div "result"
    result.innerHTML = "";

    // delete old option elements
    let primary_wish = document.getElementById("primary_wish");
    let secondary_wish = document.getElementById("secondary_wish");
    primary_wish.innerHTML = "";
    secondary_wish.innerHTML = "";

    // add primary and secondary wish
    let option = document.createElement("option");
    option.text = "Primary Wish";
    option.value = "---";
    option.disabled = true;
    option.selected = true;
    primary_wish.add(option);

    let option2 = document.createElement("option");
    option2.text = "Secondary Wish";
    option2.value = "---";
    option2.disabled = true;
    option2.selected = true;
    secondary_wish.add(option2);

    // add options to select

    for (let i = 0; i < options.length; i++) {
        let option = document.createElement("option");
        option.text = options[i].name;
        primary_wish.add(option);

        let option2 = document.createElement("option");
        option2.text = options[i].name;
        secondary_wish.add(option2);
    }

    let saveButton = document.getElementById("saveButton");

    // set save button title to saved for 2 seconds
    saveButton.innerHTML = "Saved!";
    setTimeout(() => {
        saveButton.innerHTML = "Save";
    }, 1000);

}

function undoVote() {
    // check if there are votes
    if (electionResults.length == 0)
    {
        return;
    }
    
    // delete last entry in electionResults
    electionResults.pop();

    // delete last entry in voters div
    let voters = document.getElementById("voters");
    voters.removeChild(voters.lastChild);
}