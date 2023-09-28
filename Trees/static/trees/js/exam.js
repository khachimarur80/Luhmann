if (!localStorage.getItem('fontFamily')) {
    localStorage.setItem('fontFamily','Helvetica')
}
document.documentElement.style.fontFamily = localStorage.getItem('fontFamily')+' !important'
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
function postRequest(func, data) {
    csrftoken = getCookie('csrftoken'); 
    var request = new XMLHttpRequest();
    request.open('POST', window.location.href);
    request.setRequestHeader("X-CSRFToken", csrftoken); 
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = func
    request.send(data)
}
const vuetifyApp = new Vuetify({
    theme: {
        dark: localStorage.getItem('theme') == 'Oscuro',
        options: { customProperties: true },
    },
    options: {
        customProperties: true
    },
})
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

const vueApp = new Vue({
    delimiters : ['[[',']]'],
    vuetify : vuetifyApp,
    el: '#app',
    data: {
        links: [
            'About Us',
            'Team',
            'Services',
            'Blog',
            'Contact Us',
        ],
        sideBar: false,
        group: null,
        theme: localStorage.getItem('theme')=='Oscuro',
        options: [],
        id_options: [],
        branch_id: global_id,
        questionTitle : '',
        questionImage : '',
        answer : '',
        answerInt: '',
        correct: null,
        answered: false,
        streak: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        currentScore: 0,
        countDown: 0,

    },
    methods: {
        changeTheme: function changeTheme() {
            this.$vuetify.theme.dark=!this.$vuetify.theme.dark;
            if (localStorage.getItem('theme')!='dark') {
                localStorage.setItem('theme','dark')
            }
            else {
                localStorage.setItem('theme','light')
            }
        },
        evalOption: function evalOption(option) {
            var option = option
            if (option=='Todas son verdaderas.' && 'VVVVV'.includes(this.answer)) {
                return true
            }
            else if (option=='Todas son falsas.'  && 'FFFFF'.includes(this.answer)) {
                return false
            }
            else {
                var sortedOption = option.split('').sort().join('')
                console.log(sortedOption)
                console.log(this.answerInt)
                return sortedOption==this.answerInt
            }
        },
        checkAnswer: function checkAnswer() {
            var given = ''
            var options = document.querySelectorAll('.option')
            for (i=0; i<options.length;i++) {
                if (options[i].getElementsByTagName('input')[0].checked) {
                    given += 'V'
                }
                else {
                    given += 'F'
                }
            }
            if (given==this.answer) {
                document.getElementById('question').parentElement.classList.add('correct-answer')
                this.totalCorrect += 1
                this.streak += 1
            }
            else {
                document.getElementById('question').parentElement.classList.add('incorrect-answer')
                this.totalIncorrect += 1
                this.streak = 0
                for (i=0; i<this.answer.length;i++) {
                    if (this.answer[i] == 'V') {
                        document.querySelectorAll('.option')[i].classList.add('correct-answer')
                        break
                    }
                }
            }
            this.currentScore = parseInt((this.totalCorrect/(this.totalCorrect+this.totalIncorrect))*100)
            this.correct = given==this.answer
            this.answered = true
            this.answerInt = ''
            var data = ''
            
            for (i=0;i<this.id_options.length;i++) {
                data+='&'+this.id_options[i][0]+'='+this.id_options[i][1]
            }
            postRequest(()=>{},'method=check_answers&success='+this.correct+data)
        },
        newQuestion: function newQuestion() {
            var request = new XMLHttpRequest();
            request.open('GET', window.location.href.replace('exam','question'));
            request.onload = () => {
                if (request.status==200) {
                    var data = JSON.parse(request.response)
                    var options = data['options']
                    var id_options = data['id_options']
                    var question = data['question']
                    var scores = data['scores']

                    if (question.includes('/')) {
                        this['questionImage'] = question
                    }
                    else {
                        this['questionTitle'] = question
                    }

                    this['options'] = options
                    this['id_options'] = id_options
                    this['scores'] = scores

                    var correct = []
                    var correctStr = 'FFFFF'
                    var additional = []

                    document.getElementById('question').innerHTML = ''
                    if (this.correct) {
                        document.getElementById('question').parentElement.classList.remove('correct-answer')
                        this.answered = false
                        this.correct = null
                    }
                    else {
                        document.getElementById('question').parentElement.classList.remove('incorrect-answer')
                        this.answered = false
                        this.correct = null
                    }

                    for (i=0; i<options.length; i++) {
                        var option = document.createElement('div')

                        option.classList.add('option')
                        option.innerHTML = options[i][0]
                        
                        document.getElementById('question').appendChild(option)
                        
                        bool_flag = true

                        for (x=0; x<option.querySelectorAll('.clothe').length; x++) {
                            if (options[i][1][x]=='F') {
                                var all_alias = option.querySelectorAll('.clothe')[x].getAttribute('data-options').split('|')
                                option.querySelectorAll('.clothe')[x].innerHTML = all_alias[randomInteger(0, all_alias.length-1)]
                                bool_flag = false
                            }
                        }
                        if (bool_flag) {
                            correct.push(i)
                            correctStr = correctStr.replaceAt(i, 'V') 
                        }

                        var check = document.createElement('input')
                        check.id = i
                        check.setAttribute('type', 'checkbox')
                        option.appendChild(check)
                    }
                    this.answer = correctStr
                    for (i=0;i<correct.length;i++) {
                        this.answerInt += 'ABCDE'[correct[i]]
                    }
                    var additional = ''
                    if (options.length==3) {
                        var option = document.createElement('div')
                        option.classList.add('option')
                        option.innerHTML = ''
                        if (this.answerInt.length==3) {
                            option.innerHTML = 'Todas son verdaderas.'
                            this.answerInt = 'D'
                            this.answer = 'FFFVF'
                        }
                        else if (this.answerInt.length==0) {
                            option.innerHTML = 'Todas son falsas.'
                            this.answerInt = 'D'
                            this.answer = 'FFFVF'
                        }
                        else if (this.answerInt.length==1) {
                            var num = randomInteger(1,3)
                            if (num==1) {
                                var pos1 = 'ABCD'[randomInteger(0, options.length-1)]
                                var pos2 = pos1
                                while (pos2==pos1) {
                                    pos2 = 'ABCD'[randomInteger(0, options.length-1)]
                                }
                                new_option = [pos1,pos2].sort()
                                option.innerHTML = new_option[0]+' y '+new_option[1]+' son verdaderas.'
                            }
                            else if (num==2) {
                                option.innerHTML = 'Todas son verdaderas.'
                            }
                            else if (num==3) {
                                option.innerHTML = 'Todas son falsas.'
                            }
                        }
                        else if  (this.answerInt.length==2){
                            var pos1 = this.answerInt.split('')[0]
                            var pos2 = this.answerInt.split('')[1]
                            new_option = [pos1,pos2].sort()
                            option.innerHTML = new_option[0]+' y '+new_option[1]+' son verdaderas.'
                            this.answerInt = 'D'
                            this.answer = 'FFFVF'
                        }
                        var additional = option.innerHTML
                        var check = document.createElement('input')
                        check.id = i
                        check.setAttribute('type', 'checkbox')
                        option.appendChild(check)
                        document.getElementById('question').appendChild(option)

                        var option2 = document.createElement('div')
                        option2.classList.add('option')
                        option2.innerHTML = ''
                        while (option2.innerHTML==''||option2.innerHTML==additional){
                            if (this.answerInt.length==3) {
                                option2.innerHTML = 'Todas son verdaderas.'
                                this.answerInt = 'E'
                                this.answer = 'FFFFV'
                            }
                            else if (this.answerInt.length==0) {
                                option2.innerHTML = 'Todas son falsas.'
                                this.answerInt = 'E'
                                this.answer = 'FFFFV'
                            }
                            else if (this.answerInt.length==1) {
                                var pos1 = 'ABCD'[randomInteger(0, options.length-1)]
                                var pos2 = pos1
                                while (pos2==pos1) {
                                    pos2 = 'ABCD'[randomInteger(0, options.length-1)]
                                }
                                new_option = [pos1,pos2].sort()
                                option2.innerHTML = new_option[0]+' y '+new_option[1]+' son verdaderas.'
                            }
                            else if  (this.answerInt.length==2){
                                var pos1 = this.answerInt.split('')[0]
                                var pos2 = this.answerInt.split('')[1]
                                new_option = [pos1,pos2].sort()
                                option2.innerHTML =new_option[0]+' y '+new_option[1]+' son verdaderas.'
                                this.answerInt = 'E'
                                this.answer = 'FFFFV'
                            }
                            console.log(additional)
                            console.log(option2.innerHTML)
                        }
                        var check = document.createElement('input')
                        check.id = i
                        check.setAttribute('type', 'checkbox')
                        option2.appendChild(check)
                        document.getElementById('question').appendChild(option2)
                    }
                    else if (options.length==4) {
                        console.log(this.answerInt)
                        var option = document.createElement('div')
                        option.classList.add('option')
                        if (this.answerInt.length==4) {
                            option.innerHTML = 'Todas son verdaderas.'
                            this.answerInt = ['E']
                            this.answer = 'FFFFV'
                        }
                        else if (this.answerInt.length==0) {
                            option.innerHTML = 'Todas son falsas.'
                            this.answerInt = ['E']
                            this.answer = 'FFFFV'
                        }
                        else if (this.answerInt.length==1) {
                            var num = randomInteger(1,3)
                            if (num==1) {
                                var pos1 = 'ABCD'[randomInteger(0, options.length-1)]
                                var pos2 = pos1
                                while (pos2==pos1) {
                                    pos2 = 'ABCD'[randomInteger(0, options.length-1)]
                                }
                                new_option = [pos1,pos2].sort()
                                option.innerHTML = pos1+' y '+pos2+' son verdaderas.'
                            }
                            else if (num==2) {
                                option.innerHTML = 'Todas son verdaderas.'
                            }
                            else if (num==3) {
                                option.innerHTML = 'Todas son falsas.'
                            }
                        }
                        else if  (this.answerInt.length==2){
                            var pos1 = this.answerInt.split('')[0]
                            var pos2 = this.answerInt.split('')[1]
                            new_option = [pos1,pos2].sort()
                            option.innerHTML = pos1+' y '+pos2+' son verdaderas.'
                            this.answerInt = 'E'
                            this.answer = 'FFFFV'
                        }
                        var check = document.createElement('input')
                        check.id = i
                        check.setAttribute('type', 'checkbox')
                        option.appendChild(check)
                        document.getElementById('question').appendChild(option)
                    }
                    }
                }
                request.send()
            }
    },
    mounted() {
        this.countDown = new Date().getTime()
        var request = new XMLHttpRequest();
        request.open('GET', window.location.href.replace('exam','question'));
        request.onload = () => {
            if (request.status==200) {
                var data = JSON.parse(request.response)
                var options = data['options']
                var id_options = data['id_options']
                var question = data['question']
                var scores = data['scores']

                if (question.includes('/')) {
                    this['questionImage'] = question
                }
                else {
                    this['questionTitle'] = question
                }

                this['options'] = options
                this['id_options'] = id_options
                this['scores'] = scores

                var correct = []
                var correctStr = 'FFFFF'
                var additional = []

                for (i=0; i<options.length; i++) {
                    var option = document.createElement('div')

                    option.classList.add('option')
                    option.innerHTML = options[i][0]
                    
                    document.getElementById('question').appendChild(option)
                    
                    var bool_flag = true

                    for (x=0; x<option.querySelectorAll('.clothe').length; x++) {
                        if (options[i][1][x]=='F') {
                            var all_alias = option.querySelectorAll('.clothe')[x].getAttribute('data-options').split('|')
                            option.querySelectorAll('.clothe')[x].innerHTML = all_alias[randomInteger(0, all_alias.length-1)]
                            bool_flag = false
                        }
                    }
                    if (bool_flag) {
                        correct.push(i)
                        correctStr = correctStr.replaceAt(i, 'V') 
                    }

                    var check = document.createElement('input')
                    check.id = i
                    check.setAttribute('type', 'checkbox')
                    option.appendChild(check)
                }
                this.answer = correctStr
                for (i=0;i<correct.length;i++) {
                    this.answerInt += 'ABCDE'[correct[i]]
                }
                if (options.length==3) {
                    for (i=0; i<2;i++) {
                        var option = document.createElement('div')
                        option.classList.add('option')
                        if (this.answerInt.length==3) {
                            option.innerHTML = 'Todas son verdaderas.'
                            this.answerInt = 'DE'[i]
                            this.answer = 'FFFFV'
                        }
                        else if (this.answerInt.length==0) {
                            option.innerHTML = 'Todas son falsas.'
                            this.answerInt = 'DE'[i]
                            this.answer = 'FFFFV'
                        }
                        else if (this.answerInt.length==1) {
                            var num = randomInteger(1,3)
                            if (num==1) {
                                var pos1 = 'ABCD'[randomInteger(0, options.length-1)]
                                var pos2 = pos1
                                while (pos2==pos1) {
                                    pos2 = 'ABCD'[randomInteger(0, options.length-1)]
                                }
                                new_option = [pos1,pos2].sort()
                                option.innerHTML = pos1+' y '+pos2+' son verdaderas.'
                            }
                            else if (num==2) {
                                option.innerHTML = 'Todas son verdaderas.'
                            }
                            else if (num==3) {
                                option.innerHTML = 'Todas son falsas.'
                            }
                        }
                        else if  (this.answerInt.length==2){
                            var pos1 = this.answerInt.split('')[0]
                            var pos2 = this.answerInt.split('')[1]
                            new_option = [pos1,pos2].sort()
                            option.innerHTML = pos1+' y '+pos2+' son verdaderas.'
                            this.answerInt = 'DE'[i]
                            this.answer = 'FFFFV'
                        }
                        var check = document.createElement('input')
                        check.id = i
                        check.setAttribute('type', 'checkbox')
                        option.appendChild(check)
                        document.getElementById('question').appendChild(option)
                    }
                }
                else if (options.length==4) {
                    var option = document.createElement('div')
                    option.classList.add('option')
                    if (this.answerInt.length==4) {
                        option.innerHTML = 'Todas son verdaderas.'
                        this.answerInt = ['E']
                        this.answer = 'FFFFV'
                    }
                    else if (this.answerInt.length==0) {
                        option.innerHTML = 'Todas son falsas.'
                        this.answerInt = ['E']
                        this.answer = 'FFFFV'
                    }
                    else if (this.answerInt.length==1) {
                        var num = randomInteger(1,3)
                        if (num==1) {
                            var pos1 = 'ABCD'[randomInteger(0, options.length-1)]
                            var pos2 = pos1
                            while (pos2==pos1) {
                                pos2 = 'ABCD'[randomInteger(0, options.length-1)]
                            }
                            new_option = [pos1,pos2].sort()
                            option.innerHTML = pos1+' y '+pos2+' son verdaderas.'
                        }
                        else if (num==2) {
                            option.innerHTML = 'Todas son verdaderas.'
                        }
                        else if (num==3) {
                            option.innerHTML = 'Todas son falsas.'
                        }
                    }
                    else if  (this.answerInt.length==2){
                        var pos1 = this.answerInt.split('')[0]
                        var pos2 = this.answerInt.split('')[1]
                        new_option = [pos1,pos2].sort()
                        option.innerHTML = pos1+' y '+pos2+' son verdaderas.'
                        this.answerInt = 'E'
                        this.answer = 'FFFFV'
                    }
                    var check = document.createElement('input')
                    check.id = i
                    check.setAttribute('type', 'checkbox')
                    option.appendChild(check)
                    document.getElementById('question').appendChild(option)
                }

            }
        }
        request.send()
    }
})