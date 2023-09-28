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
        groupName: '',
        valid: true,
        allGroupsNames: all_groups_names.map(v => v.toLowerCase()),
        allGroups: all_groups,
    },
    computed: {
        validation: function validation() {
            return this.groupName=='' || this.allGroupsNames.includes(this.groupName.toLowerCase())
        }
    }
})