var formLib = (function() {

    'use strict';

    document.addEventListener('DOMContentLoaded', assignEvents);

    function assignEvents() {
        document.getElementById('feedback-form-submit').addEventListener('click', checkFormItems);
        document.getElementById('feedback-form').addEventListener('keypress', pressEnter);
    }

    var feedback = {
        form: document.getElementById('feedback-form'),
        submit: document.getElementById('feedback-form-submit'),
        forms: [],
        conditions: [],
        current: 0,
        sendTo: '',
        next: function() {
            return this.current++;
        }
    }

    function createRadio(caption, quantity) {
        var elem = document.createElement('div');
        elem.className = 'feedback-form_item';
        var text = document.createElement('div');
        text.textContent = caption;
        elem.appendChild(text);

        for(var i = 0; i < quantity; i++) {
            var rbCaption = document.createElement('span');
            rbCaption.textContent = `${i + 1}`;
            elem.appendChild(rbCaption);
            var rb = document.createElement('input')
            rb.type = 'radio';
            if((quantity - i) == 1) {
                rb.checked = true;
            }
            rb.name = caption.replace(/\s/gi, '-').toLowerCase();
            rb.value = `${i + 1}`;
            elem.appendChild(rb);
        }

        elem.setAttribute('data-type', 'radio');
        elem.setAttribute('data-name', `${caption.replace(/\s/gi, '-').toLowerCase()}`);

        return elem;
    }

    function createCheckbox(caption, checked) {
        var elem = document.createElement('div');
        elem.className = 'feedback-form_item';
        var text = document.createElement('div');
        text.textContent = caption;
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = checked;
        elem.appendChild(text);
        elem.appendChild(cb);
        elem.setAttribute('data-type', 'checkbox');
        elem.setAttribute('data-name', `${caption.replace(/\s/gi, '-').toLowerCase()}`);

        return elem;
    }

    function createText(caption) {
        var elem = document.createElement('div');
        elem.className = 'feedback-form_item';
        var inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.placeholder = caption;
        elem.appendChild(inputText);
        elem.setAttribute('data-type', 'text');
        elem.setAttribute('data-name', `${caption.replace(/\s/gi, '-').toLowerCase()}`);

        return elem;
    }

    function createTextArea(caption) {
        var elem = document.createElement('div');
        elem.className = 'feedback-form_item';
        var text = document.createElement('div');
        text.textContent = caption;
        var textarea = document.createElement('textarea');
        textarea.setAttribute('maxlength', '300');
        elem.appendChild(text);
        elem.appendChild(textarea);
        elem.setAttribute('data-type', 'textarea');
        elem.setAttribute('data-name', `${caption.replace(/\s/gi, '-').toLowerCase()}`);

        return elem;
    }

    function createDropdown(caption, arr) {
        var elem = document.createElement('div');
        elem.className = 'feedback-form_item';
        var text = document.createElement('div');
        text.textContent = caption;
        var select = document.createElement('select');
        select.name = caption.replace(/\s/gi, '-').toLowerCase();

        arr.forEach((elem) => {
            var opt = document.createElement('option');
            opt.value = elem;
            opt.textContent = elem;
            select.appendChild(opt);
        });

        elem.appendChild(text);
        elem.appendChild(select);
        elem.setAttribute('data-type', 'dropdown');
        elem.setAttribute('data-name', `${caption.replace(/\s/gi, '-').toLowerCase()}`);

        return elem;
    }

    function createFeedback(formArr, condArr, url) {
        var formArr = formArr || [];
        var condArr = condArr || [];
        feedback.forms = formArr;
        feedback.conditions = condArr;
        feedback.sendTo = url;
        renderForm(feedback.forms[feedback.current]);
    }

    function renderForm(arr) {
        var container = document.createElement('div');

        arr.forEach((elem) => {
            container.appendChild(elem);
        });

        feedback.form.insertBefore(container, feedback.submit);
    }

    function cleanForm(delBut) {
        var delBut = delBut || false;
        var elem = feedback.form.children[0];
        elem.parentNode.removeChild(elem);

        if(delBut) {
            feedback.submit.parentNode.removeChild(feedback.submit);
        }
    }

    function lastMessage() {
        var message = document.createElement('div');
        message.textContent = 'Thank you for feedback!'
        feedback.form.appendChild(message);
        var data = getJsonFromCookie();
        delCookie();
        sendData(data);
    }

    //______ The following function checks conditions
    //______ and returns next min index of form (next step)

    function setNextStep(arr) {
        var nextStep;
        var nextStepArray = [];

        feedback.conditions.forEach((cond) => {

            if((cond.formIndex == feedback.current) && (cond.answer == arr[cond.fieldIndex][1]) && !(cond.nextStep < feedback.current)) {
                nextStepArray.push(cond.nextStep);
            }

        });

        nextStepArray.length > 0 ? nextStep = Math.min.apply(null, nextStepArray) : nextStep;

        return nextStep;
    }

    function pressEnter(e) {
        if(e.which == 13 || e.keyCode == 13) {
            checkFormItems();
        }
    }

    function checkFormItems() {
        var formElems = feedback.form.children[0].children;
        var data = [];
        var nextStep;

        Array.prototype.forEach.call(formElems, (elem, i) => {

            var elemType = elem.getAttribute('data-type');
            var elemName = elem.getAttribute('data-name');

            if(elemType == 'radio') {
                var radioArr = elem.getElementsByTagName('input');

                Array.prototype.forEach.call(radioArr, (radioElem) => {
                    if(radioElem.checked) {
                        data.push([elemName, radioElem.value]);
                    }
                })

            }

            if(elemType == 'checkbox') {
                data.push([elemName, `${elem.children[1].checked}`]);
            }

            if(elemType == 'text') {

                //______ email check

                if(elemName.match(/e[-]?mail/gi)) {

                    if(!elem.children[0].value.match(/@/g)) {
                        data.push([elemName, '']);
                    } else {
                        data.push([elemName, elem.children[0].value]);
                    }

                } else {
                    data.push([elemName, elem.children[0].value]);
                }
            }

            if(elemType == 'textarea') {
                data.push([elemName, elem.children[1].value]);
            }

            if(elemType == 'dropdown') {
                var elems = elem.children[1].children;

                Array.prototype.forEach.call(elems, (drElem) => {

                    if(drElem.selected) {
                        data.push([elemName, drElem.value]);
                    }

                })
            }

        });

        //______ Stop processing if some field isn't filled

        for(var c of data) {
            if(!c[1]) {
                return alert('The data is wrong. Check it out');
            }
        }

        //______ Set cookies

        data.forEach((elem) => {
            setCookie(`_${elem[0]}`, elem[1]);
        });

        //______ Evaluating next step (what form to show next)

        if(feedback.conditions.length > 0) {
            nextStep = setNextStep(data);
        }

        if(feedback.current != (feedback.forms.length - 1)) {

            if(nextStep || (nextStep == 0)) {

                if(nextStep == feedback.current) {
                    cleanForm(true);
                    lastMessage();
                } else {
                    cleanForm(false);
                    feedback.current = nextStep;
                    renderForm(feedback.forms[feedback.current]);
                }

            } else {
                cleanForm(false);
                feedback.next();
                renderForm(feedback.forms[feedback.current]);
            }

        } else {
            cleanForm(true);
            lastMessage();
        }

    }

    function sendData(json) {
        //console.log(json);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', feedback.sendTo, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(json);
    }

    function setCookie(key, value) {
        var key = encodeURIComponent(key);
        var value = encodeURIComponent(value.trim().replace(/\n/g, ' '));
        var expires = new Date();
        expires.setTime(expires.getTime() + 3600 * 1000);
        document.cookie = `${key}=${value}; expires=${expires.toUTCString()}`;
    }

    function getJsonFromCookie() {
        var data = [];
        var cookieArr = document.cookie.split('; ');
        cookieArr = cookieArr.map((elem) => {return elem.split('=')});
        var keys = cookieArr.map((elem) => {return decodeURIComponent(elem[0])});
        var values = cookieArr.map((elem) => {return decodeURIComponent(elem[1])});

        for(var i = 0; i < keys.length; i++) {
            if(keys[i].charAt(0) == '_') {
                data.push({
                    q: decodeURIComponent(keys[i]),
                    a: decodeURIComponent(values[i])
                });
            }
        }

        var json = JSON.stringify(data);

        return json;
    }

    function delCookie() {
        var cookieArr = document.cookie.split('; ');
        cookieArr = cookieArr.map((elem) => {return elem.split('=')});
        var keys = cookieArr.map((elem) => {return decodeURIComponent(elem[0])});

        keys.forEach((elem) => {
            if(elem.charAt(0) == '_') {
                var expires = new Date();
                expires.setTime(expires.getTime() - 1);
                document.cookie = `${encodeURIComponent(elem)}= ; expires=${expires.toUTCString()}`;
            }
        });
    }

    return {
        createRadio: createRadio,
        createCheckbox: createCheckbox,
        createText: createText,
        createTextArea: createTextArea,
        createDropdown: createDropdown,
        createFeedback: createFeedback
    }

})()

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
