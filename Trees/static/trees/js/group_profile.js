const vuetifyApp = new Vuetify({
    theme: {
        dark: localStorage.getItem('theme') == 'Oscuro',
        options: { customProperties: true },
    },
    options: {
        customProperties: true
    },
})

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
        allAdmins: admins,
        allReaders: readers,
        allEditors: editors,
        allUsers: users,
        addReaderValue: null,
        isStaff: is_staff,
        allGroups: all_groups,
    },
    methods: {
        addReader: function addReader() {
            csrftoken = getCookie('csrftoken'); 
            var request = new XMLHttpRequest();
            request.open('POST', window.location.href);
            request.setRequestHeader("X-CSRFToken", csrftoken); 
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.onload = function () {
                if (request.status==200) {
                    console.log(JSON.parse(this.response))
                    console.log(typeof JSON.parse(this.response))
                    this['allReaders'] = JSON.parse(this.response)
                }
            }
            request.send('method=add_reader&user='+this.addReaderValue)
            this.addReaderValue = null
        },
        makeAdmin: function makeEditor(editor,pos) {
            this.allEditors.splice(pos,1)
            postRequest(()=>{},'method=make_admin&id='+editor.pk)
            this.allAdmins.push(editor)
        },
        makeEditor: function makeEditor(reader, pos) {
            this.allReaders.splice(pos,1)
            postRequest(()=>{},'method=make_editor&id='+reader.pk)
            this.allEditors.push(reader)
        },
    }
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