if (!localStorage.getItem('fontFamily')) {
    localStorage.setItem('fontFamily','Helvetica')
}
if (!localStorage.getItem('titleFontFamily')) {
    localStorage.setItem('titleFontFamily','Helvetica')
}
document.documentElement.style.fontFamily = localStorage.getItem('fontFamily')+' !important'

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
        allGroups: all_groups,
        currentTheme: localStorage.getItem('theme'),
        themes: ['Claro', 'Oscuro'],
        fontFamily: localStorage.getItem('fontFamily'),
        titleFontFamily:  localStorage.getItem('titleFontFamily'),
        fontSize: parseInt(localStorage.getItem('fontSize'))-8,
        fonts: ['Helvetica', 'Arial', 'Times New Roman', 'Calibri', 'Verdana', 'Georgia', 'Gulliver'],
        fontSizes: ['8','9','10','11','12','13','14','15','16','17','18','19','20']
    },
    methods: {
        changeTheme: function changeTheme(event) {
            this.$vuetify.theme.dark = this.currentTheme=='Oscuro'
            localStorage.setItem('theme',this.currentTheme)
        },
        setFont: function setFont() {
            localStorage.setItem('fontFamily',this.fontFamily)
        },
        seTitletFont: function seTitletFont() {
            localStorage.setItem('titleFontFamily',this.titleFontFamily)
        },
        setFontSize: function setFontSize() {
            localStorage.setItem('fontSize',this.fontSize+8)
        }
    }
})