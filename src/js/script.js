'use strict';

var forms = [
    [
        formLib.createText('Your email'),
        formLib.createText('Your name'),
        formLib.createDropdown('Your nomination', ['Front-end', 'Back-end', 'Web design', 'QA', 'Team'])
    ],
    [
        formLib.createDropdown('Your main goal in this challenge', ['Improving skills', 'Getting glory', 'Participation', 'Something else']),
        formLib.createTextArea('What would you like to see in the next challenge?'),
        formLib.createCheckbox('Would you like to answer additional questions?', true)
    ],
    [
        formLib.createRadio('How do you rate judges work?', 5),
        formLib.createRadio('How do you rate organisation of the challenge?', 5),
        formLib.createTextArea('Please write your own suggestions')
    ]
];

var conditions = [
    {
        formIndex: 1,
        fieldIndex: 2,
        answer: `${false}`,
        nextStep: 1
    }
];

formLib.createFeedback(forms, conditions, 'somePath');
