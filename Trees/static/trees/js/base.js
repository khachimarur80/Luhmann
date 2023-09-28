const vueApp = new Vue({
    delimiters : ['[[',']]'],
    vuetify : new Vuetify(),
    theme: { dark: true },
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
    }
})