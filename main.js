let result = document.getElementById("result");

let options = [{"name": "A", "amount": 0}, {"name": "B", "amount": 0}, {"name": "C", "amount": 0}];
let maxOptionSize = 2;

let alreadyChecked = [];

let electionResults = [
]

// every index from electionResults
let notYetAssigned = electionResults.map((x, i) => i);

// {person: 0, option: "A"}
let assigned = [
];

let unluckyPersons = [];

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

    while (notYetAssigned.length > 0)
    {

        let randomIndex = Math.floor(Math.random() * notYetAssigned.length);
        // get real index from electionResults
        let randomPersonIndex = notYetAssigned[randomIndex];
        let randomPerson = electionResults[randomPersonIndex];

        
        let PersonChoice = randomPerson.choice;

        // Check from first to last choice
        let option = checkChoices(PersonChoice);
        if (option !== false) { // result could be index 0 instead of false
            moveToAssigned(randomPersonIndex, PersonChoice[option]);
            console.log(notYetAssigned)
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
            }

            if (!result)
            {
                // delete random person from notYetAssigned and move to seperate array
                unluckyPersons.push(randomIndex);
                notYetAssigned.splice(randomIndex, 1);
            } 
        }
    }

    // show results
    result.innerHTML = "";
    for (let i = 0; i < options.length; i++) {
        result.innerHTML += options[i].name + ": " + options[i].amount + "<br/>";

        // show persons
        let persons = assigned.filter(x => x.option == options[i].name);
        for (let j = 0; j < persons.length; j++) {
            result.innerHTML += electionResults[persons[j].personIndex].name + "<br/>";
        }
        result.innerHTML += "<br/>";

    }

    console.log("Unlucky persons: " + unluckyPersons.length);
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
        console.log("found!")
        changeAssignment(exchanger, exchangerChoice);
        return true;
    }
    
    // iterate through persons who are assigned to the exchanger's choice
    let persons = assigned.filter(x => x.option == originalChoice);

    for (let i = 0; i < persons.length; i++) {
        let person = persons[i];

        // person's other choices (without the exchanger's choice)
        let personChoices = electionResults[person.personIndex].choice.filter(x => x != exchangerChoice && x != originalChoice);

        for (let j = 0; j < personChoices.length; j++) { // iterate through person's choices (without the exchanger's choice)
            // recursive call to check if the person can exchange
            let option = checkChoices(personChoices);
            if (option !== false) {
                changeAssignment(person.personIndex, personChoices[option]);
                return true;
            } else
            {
                for (let k = 0; k < personChoices.length; k++) {
                    if (findExchangeLoop(person.personIndex, personChoices[k], originalChoice))
                    {
                        changeAssignment(person.personIndex, personChoices[k]);
                        return true;
                    }
                }
            }
        }

        return false;
    }

        
}

function moveToAssigned(index, option) {
    assigned.push({"personIndex": index, "option": option});
    
    // delete from notYetAssigned where element is index
    notYetAssigned.splice(notYetAssigned.indexOf(index), 1);

    options.find(x => x.name == option).amount++;
}

function changeAssignment(index, newOption) {
    let person = assigned.find(x => x.personIndex == index)

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

function checkChoices (PersonChoice) {
    let amountOfChoices = PersonChoice.length;

    for (let i = 0; i < amountOfChoices; i++) {
        if (lookupOption(PersonChoice[i]) < maxOptionSize) // If first choice is available
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

    // clear input fields
    document.getElementById("name").value = "";
    document.getElementById("primary_wish").value = "---";
    document.getElementById("secondary_wish").value = "---";

    electionResults.push({ name: name, choice: [primary, secondary] });
    notYetAssigned.push(electionResults.length - 1);

    console.log(electionResults);
}