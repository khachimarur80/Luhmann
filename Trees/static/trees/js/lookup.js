var all_groups_list = []
var all_groups_dict = {}
for (var key in all_groups) {
    all_groups_list.push(all_groups[key]['fields']['name'])
    all_groups_dict[all_groups[key]['fields']['name']] = all_groups[key].pk
}
var all_users_list = []
var all_users_dict = {}
for (var key in all_users) {
    all_users_list.push(all_users[key]['fields'].username)
    all_users_dict[all_users[key]['fields'].username] = all_users[key].pk
}
var all_tags_list = []
var all_tags_dict = {}
for (var key in all_tags) {
    all_tags_list.push(all_tags[key]['fields']['name'])
    all_tags_dict[all_tags[key]['fields']['name']] = all_tags[key].pk
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

const vueApp = new Vue({
    delimiters : ['[[',']]'],
    vuetify : vuetifyApp,
    el: '#app',
    components: {
        'vue-code-highlight': window.VueCodeHighlight
    },
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
        allResults: all_results,
        beforeDate: null,
        beforeDateMenu: false,
        afterDate: null,
        afterDateMenu: false,
        allGroups: all_groups_list,
        allUsers: all_users_list,
        allTags: all_tags_list,
        user: current_user,
        tag: null,
        group: null,
        allGroups: all_groups,
        allSidebarGroups: all_sidebar_groups,
    },
    methods : {
        searchBranch: function searchBranch(event) {
            window.location.href = '/search/'+event.target.value
        },
        conditions: function conditions(result) {
            var evaluation = true
            if (this.group && all_groups_dict[this.group]!=result['fields']['group']) {
                evaluation = false
            }
            if (this.tag && all_tags_dict[this.tag]!=result['fields']['tag']) {
                evaluation = false
            }
            if (this.user && all_users_dict[this.user]!=result['fields']['author']) {
                evaluation = false
            }
            if (this.afterDate) {
                evaluation *= this.afterDate<result['fields']['created_date']
            }
            if (this.beforeDate) {
                evaluation *= this.beforeDate>result['fields']['created_date']
            }
            return evaluation;
        }
    },
})