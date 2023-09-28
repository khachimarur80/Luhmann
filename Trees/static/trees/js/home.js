if (!localStorage.getItem('fontFamily')) {
    localStorage.setItem('fontFamily','Helvetica')
}
document.documentElement.style.fontFamily = localStorage.getItem('fontFamily')+' !important'

var reveal_main = {}
for (i=0; i<home_main_leafs.length; i++) {
    reveal_main[home_main_leafs[i].pk] = false
}
var reveal_pinned= {}
for (i=0; i<home_pinned_leafs.length; i++) {
    reveal_main[home_pinned_leafs[i].pk] = false
}
var reveal_recent = {}
for (i=0; i<home_recent_leafs.length; i++) {
    reveal_main[home_recent_leafs[i].pk] = false
}
const vuetifyApp = new Vuetify({
    theme: {
        dark: localStorage.getItem('theme') == 'Oscuro',
    }
})
const vueApp = new Vue({
    delimiters : ['[[',']]'],
    vuetify : vuetifyApp,
    el: '#app',
    data: {
        selectedDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        links: [
            'About Us',
            'Team',
            'Services',
            'Blog',
            'Contact Us',
        ],
        homeOptions: [
            { text: 'Principales', icon: 'mdi-account' },
            { text: 'Recientes', icon: 'mdi-clock' },
            { text: 'Fijados', icon: 'mdi-pin' },
        ],
        homeOption: 0,
        homeMainLeafs: home_main_leafs,
        homeRecentLeafs: home_recent_leafs,
        homePinnedLeafs: home_pinned_leafs,
        sideBar: false,
        createBranch: false,
        group: null,
        theme: localStorage.getItem('theme')=='dark',
        reveal_main: reveal_main,
        reveal_pinned: reveal_pinned,
        reveal_recent: reveal_recent,
        newBranchName: '',
        newBranchFile: null,
        newBranchError: false,
        loading: false,
        changeTitle: false,
        changeTitleTarget: null,
        changeBranchName: '',
        newTitleError: false,
        insertImage: false,
        insertImageTarget: null,
        insertImageFile: null,
        allTodoIssues: all_todo_issues,
        allDoingIssues: all_doing_issues,
        issueStateColor : {
            'Hacer':'warning base',
            'Haciendo':'error base',
            'Hecho':'success base',
        },
        todo: todo,
        doing: doing,
        done: done,
        showMain: true,
        showRecent: false,
        showPinned: false,
        validGroup: valid_group,
        hasPermissions: permisionss,
        allGroups: all_groups,
    },
    methods: {
        searchBranch: function searchBranch(event) {
            window.location.href = '/search/'+event.target.value
        },
        changeTheme: function changeTheme() {
            this.$vuetify.theme.dark=!this.$vuetify.theme.dark;
            if (localStorage.getItem('theme')!='dark') {
                localStorage.setItem('theme','dark')
            }
            else {
                localStorage.setItem('theme','light')
            }
        },
        deleteBranch : function deleteBranch(event) {
            for (i=0; i<this.homeLeafs.length; i++) {
                if (this.homeLeafs[i].pk == event.target.getAttribute('value')) {
                    this.homeLeafs.splice(i, i);
                    break
                }
            }
            postRequest(()=>{}, 'method=delete_leaf&id='+event.target.getAttribute('value'))
        },
        triggerInsertThumbnail: function triggerInsertThumbnail(event) {
            this.insertImage = true
            this.insertImageTarget = event.target.getAttribute('value')
        },
        insertThumbnail : function insertThumbnail(event) {
            const formData = new FormData()
            formData.append('file', this.insertImageFile)
            formData.append('method', 'change_thumbnail')
            formData.append('id', this.insertImageTarget)

            csrftoken = getCookie('csrftoken')
            var request = new XMLHttpRequest()
            request.open('POST', window.location.href)
            request.setRequestHeader("X-CSRFToken", csrftoken);
            /* ############################################################ */
            /* #### SHOULD add Content-Type, but adding it gives error #### */
            //request.setRequestHeader("Content-Type", "multipart/form-data")
            /* ############################################################ */
            /* ############################################################ */
            request.send(formData)

            this.insertImage = false
            this.insertImageTarget = null
            this.insertImageFile = null
        },
        cancelInsertThumbnail : function cancelInsertThumbnail() {
            this.insertImage = false
            this.insertImageTarget = null
            this.insertImageFile = null
        },
        triggerChangeTitle: function triggerChangeTitle(event) {
            this.changeTitle = true
            this.changeTitleTarget = event.target.getAttribute('value')
        },
        changeBranchTitle : function changeBranchTitle(event) {
            if (this.changeBranchName) {
                console.log(event.target)
                for (i=0; i<this.homeLeafs.length; i++) {
                    if (this.homeLeafs[i].pk == this.changeTitleTarget) {
                        this.homeLeafs[i].fields['text'] = this.changeBranchName
                        postRequest(()=>{}, 'method=change_title&id='+this.changeTitleTarget+'&new_title='+this.changeBranchName)
                        this.changeBranchName = ''
                        break
                    }
                }
                this.changeTitle = false
                this.changeTitleTarget = null
            }
            else {
                this.newTitleError = true
            }
        },
        cancelChangeBranchTitle : function cancelChangeBranchTitle() {
            this.changeTitle = false
            this.changeTitleTarget = null
            this.changeBranchName = ''
        },
        submitBranch: function submitBranch() {
            if (this.newBranchName) {
                postRequest( function () {
                    if (this.status == 200) {
                        data = JSON.parse(this.response)
                        this.loading = false
                        window.location.href = '/branch/'+data['id']
                    }
                }, 'method=new_branch&title='+this.newBranchName)
                this.createBranch = false
                this.loading = true
            }
            else if (this.newBranchFile) {
                const formData = new FormData()
                formData.append('file', this.newBranchFile)
                formData.append('method', 'new_branch')

                csrftoken = getCookie('csrftoken')
                var request = new XMLHttpRequest()
                request.open('POST', window.location.href)
                request.setRequestHeader("X-CSRFToken", csrftoken);
                /* ############################################################ */
                /* #### SHOULD add Content-Type, but adding it gives error #### */
                //request.setRequestHeader("Content-Type", "multipart/form-data")
                /* ############################################################ */
                /* ############################################################ */
                request.onload = function() {
                    if (this.status == 200) {
                        data = JSON.parse(this.response)
                        this.loading = false
                        window.location.href = '/branch/'+data['id']
                    }
                }
                request.send(formData)

                this.createBranch = false
                this.loading = true
            }
            else {
                this.newBranchError = true
            }
        },
        cancelNewBranch: function cancelNewBranch() {
            this.createBranch = false
            this.newBranchError = false
        },
        passIssue: function passIssue() {
            var issue = this.allTodoIssues.shift()
            this.allTodoIssues.push(issue)
            postRequest(()=>{},'method=dismiss_issue&issue='+issue.pk)
        },
        changeStateIssue: function changeStateIssue(issue, pos) {
            if (issue.fields['state']=='Hacer') {
                var stored = this.allTodoIssues[pos]
                stored.fields['state']='Haciendo'
                this.allTodoIssues.splice(pos,1)
                this.allDoingIssues.push(stored)
                this.doing += 1
                this.todo -= 1
            }
            else if (issue.fields['state']=='Haciendo') {
                this.allDoingIssues.splice(pos,1)
                this.doing -= 1
                this.done += 1
            }
            postRequest(()=>{},'method=change_issue_state&id='+issue.pk)
        },
        changeDisplay: function changeDisplay(display) {
            this.showMain = false
            this.showRecent = false
            this.showPinned = false
            if (display=='Principales') {
                this.showMain = true
            }
            if (display=='Recientes') {
                this.showRecent = true
            }
            if (display=='Fijados') {
                this.showPinned = true
            }
        }
    },
})


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