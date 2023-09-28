if (!localStorage.getItem('fontFamily')) {
    localStorage.setItem('fontFamily','Helvetica')
}
if (!localStorage.getItem('fontSize')) {
    localStorage.setItem('fontSize','15')
}
document.documentElement.style.setProperty('--titleFont', localStorage.getItem('titleFontFamily'));
document.documentElement.style.setProperty('--fontSize', localStorage.getItem('fontSize')+'px');
const vuetifyApp = new Vuetify({
    theme: {
        dark: localStorage.getItem('theme') == 'Oscuro',
        options: { customProperties: true },
        fontFamily :'Times',
    },
    options: {
        customProperties: true
    },
})
const referenceButton = Vue.extend({
    vuetify: vuetifyApp,
    template: '<v-btn dense fab small><v-icon color="amber darken-2">mdi-link</v-icon></v-btn>',
});
const commentsButton = Vue.extend({
    vuetify: vuetifyApp,
    template: '<v-btn dense fab small><v-icon color="blue">mdi-comment-text-outline</v-icon></v-btn>',
});
const expandIcon = Vue.extend({
    vuetify: vuetifyApp,
    template: '<v-icon x-small class="ma-0">mdi-arrow-expand-right</v-icon>',
});
const hideIcon = Vue.extend({
    vuetify: vuetifyApp,
    template: '<v-icon x-small class="ma-0">mdi-close-circle</v-icon>',
});
const showIcon = Vue.extend({
    vuetify: vuetifyApp,
    template: '<v-icon x-small class="ma-0">mdi-triangle-outline</v-icon>',
});
const selectIcon = Vue.extend({
    vuetify: vuetifyApp,
    props: ['icon', 'color'],
    template: '<v-icon x-small class="ma-0">mdi-content-copy</v-icon>',
});
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
        date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        title: branch_title,
        globalUser: global_user,
        allLeafs: branch_leafs,
        theme: localStorage.getItem('theme')=='dark',
        comments: null,
        references: null,
        allComments: [],
        allReferences: [],
        allTags: [],
        allTrueTags: all_true_tags,
        issueText: '',
        branchCols: 9,
        pdfCols: 8,
        inlineToolbar: false,
        inlineToolbarX: 0,
        inlineToolbarY: 0,
        headers: ['No','H1','H2','H3','H4','H5','H6'],
        issueStateColor : {
            'Hacer':'warning base',
            'Haciendo':'error base',
            'Hecho':'success base',
        },
        viewTrash: false,
        overlay: true,
        branchPdfFile : null,
        pdfUrl: pdf_viewer+pdf_url,
        viewPDF : false,
        subMode: false,
        branchSelected: branch_selected=='True',
        branchPinned: branch_pinned=='True',
        targetLeaf: null,
        deeplight: {
            show: false,
            x: 0,
            y: 0,
            options: [],
            text: '',
            width: null,
            focused: null,
        },
        deeplightOption: '',
        snackbar: false,
        snackbarText: '',
        isEditor: global_editor,
        focusMode: localStorage.getItem('mode')=='true',
        style: null,
        header: 'No',
        branchParent: branch_parent,
        branchTitle: branch_title,
        editTitle: false,
        selectedTags: [],
        selectedBranchs: global_selected,
        allGroups: all_groups,
        validGroup: false,
        totalBranchScore: parseInt(total_branch_score),
        markdown: "#Hola",
    },
    methods: {
        showBranchReferences: function showBranchReferences(event) {
            var leaf = event.target.parentElement

            var notLoaded = true

            if (notLoaded) {
                csrftoken = getCookie('csrftoken'); 
                var request = new XMLHttpRequest();
                request.open('POST', window.location.href);
                request.setRequestHeader("X-CSRFToken", csrftoken); 
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                request.onload = () => {
                    if (request.status==200 && request.response) {
                        data = JSON.parse(request.response)
                        for (var key in data) {
                            if (key=='tags') {
                                this['allTags'] = data[key]
                            }
                            if (key=='styling') {
                                if (data[key].includes('r')) {
                                    this['style'] = data[key]
                                }
                                else {
                                    this['header'] = data[key]
                                }
                            }
                            else if (typeof data[key] == "string" ) {
                                var new_reference = {direction:'/branch/'+key, text: data[key].split('|')[1], leaf: data[key].split('|')[0]}
                                this['allReferences'].push(new_reference)
                            }
                        }
                    }
                }
                request.send('method=get_leaf_references&id='+global_id)
            }
            if (this.references != global_id) {
                this.references = global_id
                if (document.querySelector('.view-references')) {
                    document.querySelector('.view-references').classList.remove('view-references')
                }
                leaf.classList.add('view-references')
            }
            else {
                leaf.classList.remove('view-references')
                this.references = null
            }
            var visibleComments = this.comments!=null
            var visibleReferences = this.references!=null

            if (this.viewPDF) {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 3
                    this.pdfCols = 3
                }
                else if (visibleReferences || visibleComments){
                    this.branchCols = 3
                    this.pdfCols = 6
                }
                else {
                    this.branchCols = 4
                    this.pdfCols = 8
                }
            }
            else {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 6
                }
                else  {
                    this.branchCols = 9
                }
            }
        },
        showBranchComments: function showBranchComments(event) {
            var target = event.target
            var leaf = event.target.parentElement
            
            var notLoaded = true

            for(i=0;i<this.allComments.length;i++) {
                if(this.allComments[i].leaf == global_id) {notLoaded=false}
            }

            if (notLoaded) {
                csrftoken = getCookie('csrftoken'); 
                var request = new XMLHttpRequest();
                request.open('POST', window.location.href);
                request.setRequestHeader("X-CSRFToken", csrftoken); 
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                request.onload = () => {
                    if (request.status==200 && request.response) {
                        data = JSON.parse(request.response)
                        for (var key in data) {
                            var tags = []
                            for (i=0; i<this['allTrueTags'].length;i++) {
                                if (data[key].fields['tags'].includes(this['allTrueTags'][i].pk)) {
                                    tags.push(this['allTrueTags'][i])
                                }
                            }
                            if (data[key].fields['date']) {
                                var new_comment = {title:data[key].fields['text'],tags:[],date:data[key].fields['date'].substring(0, 10), leaf:data[key].fields['branch'], edit:false, state:data[key].fields['state'], pk:data[key].pk}
                                this['allComments'].push(new_comment)
                            }
                            else {
                                var new_comment = {title:data[key].fields['text'],tags:[],date:null, leaf:data[key].fields['branch'], edit:false, state:data[key].fields['state'], pk:data[key].pk}
                                this['allComments'].push(new_comment)
                            }
                        }
                    }
                }
                request.send('method=get_leaf_comments&id='+global_id)
            }

            if (this.comments != global_id) {
                this.comments = global_id
                if (document.querySelector('.view-comments')) {
                    document.querySelector('.view-comments').classList.remove('view-comments')
                }
                leaf.classList.add('view-comments')
            }
            else {
                leaf.classList.remove('view-comments')
                this.comments = null
            }
            var visibleComments = this.comments!=null
            var visibleReferences = this.references!=null

            if (this.viewPDF) {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 3
                    this.pdfCols = 3
                }
                else if (visibleReferences || visibleComments){
                    this.branchCols = 3
                    this.pdfCols = 6
                }
                else {
                    this.branchCols = 4
                    this.pdfCols = 8
                }
            }
            else {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 6
                }
                else  {
                    this.branchCols = 9
                }
            }
        },
        changeTheme: function changeTheme() {
            this.$vuetify.theme.dark=!this.$vuetify.theme.dark;
            if (localStorage.getItem('theme')!='dark') {
                localStorage.setItem('theme','dark')
                //vuetifyApp.theme[dark] = true
            }
            else {
                localStorage.setItem('theme','light')
                //vuetifyApp.theme[dark] = false
            }
        },
        updateHandler: function updateHandler(event) {
            event.preventDefault()
            if (event.target == document.activeElement) {
                info = {}
                info[event.target.parentElement.parentElement.id]='focus|'+this.globalUser
                socket.send(JSON.stringify(info))
            }
            else {
                event.target.change = 'true'
                info = {}
                info[event.target.parentElement.parentElement.id]='focusout|'+this.globalUser
                socket.send(JSON.stringify(info))
            }
        },
        onPaste: function onPaste(event) {
            event.stopPropagation();
            event.preventDefault();
            var target = event.target
            var text = event.clipboardData.getData("text/plain");
            if (text) { 
                document.execCommand("insertHTML", false, text);
                target.change = 'true'
            }
            else { 
                file = event.clipboardData.files[0]
                csrftoken = getCookie('csrftoken'); 
                var request = new XMLHttpRequest();
                request.open('POST', window.location.href);
                request.setRequestHeader("X-CSRFToken", csrftoken); 
                var formData = new FormData();
                formData.append("method", "insert_image");
                formData.append("image", file);
                formData.append("id", target.parentElement.parentElement.id);
                target.change = 'true'
                request.send(formData);
            }
            target.blur()
        },
        branchHandler : function branchHandler(event) {
            event.stopPropagation()
            /* Check if there are any leaves: add one if there are none */
            if (!document.getElementById('branch-content').querySelector('.leaf')) {
                leaf_order = 0
                leaf_text = ''
                var newLeaf = leafConstructor(
                    id='',
                    text=leaf_text,
                    style='', 
                    parent=global_id, 
                    embed=null, 
                    order=leaf_order, 
                    selected=null, 
                    references=null, 
                    leaves=null, 
                    unsolved=0, 
                    comments=0,
                    image=null,
                    image_width=0,
                    image_height=0,
                    score=0,
                )
                document.getElementById('branch-content').appendChild(newLeaf)
                newLeaf.querySelector('.leaf-input').focus()
                postRequest(function(e) {
                    if (this.status == 200) {
                        data = JSON.parse(this.response)
                        newLeaf.id = data['id']
                    }
                }, 'method=new_leaf'+'&text='+leaf_text+'&order='+leaf_order+'&parent='+global_id)
            }
        },
        selectBranch : function selectBranch() {
            this.branchSelected = !this.branchSelected
            target = document.getElementById('branch-content').parentElement
            if (target.classList.contains('selected')) {
                target.classList.remove('selected')
            }
            else {
                target.classList.add('selected')
            }
            postRequest(()=>{}, 'method=select_leaf'+'&id='+global_id)
        },
        emptyTrash : function emptyTrash() {
            this.viewTrash = false;
            postRequest(()=>[],'method=empty_trash')
            var hidden = document.getElementById('trash-container').querySelectorAll('.leaf')
            for (i=0; i<hidden.length; i++) {
                hidden[i].remove()
            }
        },
        displayPdf: async function displayPdf() {
            var new_pdf = ''

            const formData = new FormData()
            formData.append('file', this.branchPdfFile)
            formData.append('method', 'change_pdf')

            csrftoken = getCookie('csrftoken')
            var request = new XMLHttpRequest()
            request.open('POST', window.location.href)
            request.setRequestHeader("X-CSRFToken", csrftoken);
            request.onload = function (){
                if (this.status == 200) {
                    var data = JSON.parse(this.response)
                    new_pdf= pdf_viewer+data['pdf_url']
                }
            }
            /* ############################################################ */
            /* #### SHOULD add Content-Type, but adding it gives error #### */
            //request.setRequestHeader("Content-Type", "multipart/form-data")
            /* ############################################################ */
            /* ############################################################ */
            request.send(formData)
            setTimeout(()=>{this.pdfUrl = new_pdf},100)
        },
        addPDF : function addPDF() {
            document.getElementById('pdfUploader').click();
        },
        closePDF : function closePDF() {
            var visibleComments = this.comments!=null
            var visibleReferences = this.references!=null

            if (visibleReferences && visibleComments) {
                this.branchCols = 6
            }
            else  {
                this.branchCols = 9
            }
            this.viewPDF = false
        },
        showPDF : function showPDF() {
            var visibleComments = this.comments!=null
            var visibleReferences = this.references!=null

            if (visibleReferences && visibleComments) {
                this.branchCols = 3
                this.pdfCols = 3
            }
            else if (visibleReferences || visibleComments){
                this.branchCols = 3
                this.pdfCols = 6
            }
            else {
                this.branchCols = 4
                this.pdfCols = 8
            }
            this.viewPDF = true

            setTimeout(()=>{
                document.getElementById('pdfFrame').contentWindow.addEventListener('mouseup', function (e) {
                    if (document.getElementById('pdfFrame').contentWindow.getSelection()!='') {
                        previousLeaf = document.getElementById('branch-content').querySelector('.leaf')
                        leaf_order = document.getElementById('branch-content').querySelectorAll('.leaf').length
                        leaf_text = document.getElementById('pdfFrame').contentWindow.getSelection()

                        var newLeaf =  leafConstructor(
                            id='',
                            style='', 
                            text=leaf_text,
                            parent=previousLeaf.getAttribute('data-parent'), 
                            embed=null, 
                            order=leaf_order, 
                            selected=null, 
                            references=null, 
                            leaves=null, 
                            unsolved=0, 
                            comments=0,
                            image=null,
                            image_width=0,
                            image_height=0,
                            score=0,
                        )
                        document.getElementById('branch-content').appendChild(newLeaf)

                        focusTextToEnd(newLeaf.querySelector('.leaf-input'))

                        postRequest(function(e) {
                            if (this.status == 200) {
                                data = JSON.parse(this.response)
                                newLeaf.id = data['id']
                            }
                        }, 'method=new_leaf'+'&text='+leaf_text+'&order='+leaf_order+'&parent='+previousLeaf.getAttribute('data-parent'))
                    }
                })
            },)
        },
        pdfFloatingBtn: function pdfFloatingBtn() {
            return !this.viewPDF && (this.pdfUrl!=pdf_viewer)
        },
        exportBranch : function exportBranch() {
            window.open('/download/'+global_id, '_self');
        },
        pinBranch : function pinBranch() {
            this.branchPinned =! this.branchPinned
            postRequest(()=>{},'method=pin_branch')
        },
        subBranch : function subBranch() {},
        inputHandler: function inputHandler(event) {
            if (event.key=='Enter') {
                event.preventDefault()
                previousLeaf = event.target.parentElement.parentElement
                leaf_order = parseInt(previousLeaf.getAttribute('data-order'))+1
                leaf_text = ''

                var newLeaf =  leafConstructor(
                    id='',
                    text=leaf_text,
                    style='', 
                    parent=previousLeaf.getAttribute('data-parent'), 
                    embed=null, 
                    order=leaf_order, 
                    selected=null, 
                    references=null, 
                    leaves=null, 
                    unsolved=0, 
                    comments=0,
                    image=null,
                    image_width=0,
                    image_height=0,
                    score=0,
                )
                insertAfter(previousLeaf, newLeaf)

                newLeaf.querySelector('.leaf-input').focus()

                postRequest(function(e) {
                    if (this.status == 200) {
                        data = JSON.parse(this.response)
                        newLeaf.id = data['id']
                    }
                }, 'method=new_leaf'+'&text='+leaf_text+'&order='+leaf_order+'&parent='+previousLeaf.getAttribute('data-parent'))
            }
            else if (event.key=='Backspace' && event.target.innerHTML=='') {
                event.preventDefault()
                if (event.target.parentElement.parentElement.previousElementSibling.classList.contains('.leaf')) {
                    focusTextToEnd(event.target.parentElement.parentElement.previousElementSibling.querySelector('.leaf-input'))
                }
                event.target.parentElement.parentElement.remove()
                postRequest(function(e) {
                }, 'method=trash_leaf'+'&id='+event.target.parentElement.parentElement.id)
            }
            else if (event.key=='Tab' && event.shiftKey) {
                event.preventDefault()
                var leaf = event.target.parentElement.parentElement
                var parent = leaf.parentElement.parentElement
                leaf.setAttribute('data-parent', parent.getAttribute('data-parent'))
                insertAfter(parent, leaf)
                focusTextToEnd(event.target)
                postRequest(()=>{} ,'method=change_parent'+'&leaf='+leaf.id+'&parent='+parent.getAttribute('data-parent'))
                if (!parent.querySelector('.leaf')) {
                    parent.querySelector('.show-btn').remove()
                }
            }
            else if (event.key=='Tab' && !event.shiftKey && event.target.parentElement.parentElement.previousElementSibling) {
                event.preventDefault()
                var leaf = event.target.parentElement.parentElement
                var previous = event.target.parentElement.parentElement.previousElementSibling
                leaf.setAttribute('data-parent', previous.id)
                var previousContent = previous.querySelector('.leaf-content')
                previousContent.appendChild(event.target.parentElement.parentElement)
                focusTextToEnd(event.target)
                postRequest(()=>{} ,'method=change_parent'+'&leaf='+leaf.id+'&parent='+previous.id)

                previousLeafToolbar = previous.querySelector('.leaf-toolbar')
                if (!previousLeafToolbar.querySelector('.show-btn')) {
                    var showButton = document.createElement('button')
                    showButton.classList.add('show-btn')
                    showButton.style.backgroundImage = "url('/static/trees/images/show.png')"
                    previous.querySelector('.pair-button').appendChild(showButton)

                    var expandBtn = document.createElement('button')
                    expandBtn.classList.add('leaf-toolbar-btn')
                    var expandButtonIcon = new expandIcon()
                    expandButtonIcon.$mount(expandBtn)
                    expandBtn.append(expandButtonIcon.$el)
                    expandBtn.setAttribute('onclick', 'window.location.href="/branch/'+previous.id+'"')
                    previousLeafToolbar.appendChild(expandBtn)
                }
            }
            else if (event.key==' ') {
                event.target.change='true'
            }
            else if (event.key=='Tab' && !event.shiftKey) {
            }
            else if (event.key=='|' || event.key=='&') {
                event.preventDefault()
            }
        },
        leafHandler: function leafHandler(event) {
            event.stopPropagation()
            if (getSelectionText() && !this.subMode) {
                this.inlineToolbar = !this.inlineToolbar
                this.inlineToolbarX = getCaretGlobalPosition().left
                this.inlineToolbarY = getCaretGlobalPosition().top
                this.targetLeaf = event.target
                postRequest(function () {
                    if (this.status==200) {
                        var data = JSON.parse(this.response)
                    }
                }, 'method=get_regex&word='+getSelectionText())
            }
            else if (getSelectionText() && this.subMode) {
                text = getSelectionText()
                event.target.innerHTML = event.target.innerHTML.replace(text, '<span contenteditable="false" class="clothe" data-options="">'+text+'</span>')
                event.target.change = 'true'
                this.targetLeaf = null
                focusTextToEnd(event.target)
            }

            target = event.target
            if(target.classList.contains('hide')) {
                var leaf = target.parentElement.parentElement.parentElement
                if (leaf.previousElementSibling && leaf.previousElementSibling.classList.contains('leaf')) {
                    focusTextToEnd(leaf.previousElementSibling.querySelector('.leaf-input'))
                }
                postRequest(()=>{}, 'method=trash_leaf'+'&id='+leaf.id)
                target.blur()

                var trashContainer = document.getElementById('trash-container')
                if (trashContainer.querySelector('[id="'+leaf.id+'"]')) {
                    trashContainer.querySelector('[id="'+leaf.id+'"]').querySelector('.leaf-content').appendChild(trashWrapper(leaf)) 
                }
                else {
                    trashContainer.appendChild(trashWrapper(leaf)) 
                }
            }
            else if(target.classList.contains('select')) {
                if (event.target.parentElement.parentElement.parentElement.classList.contains('selected')) {
                    event.target.parentElement.parentElement.parentElement.classList.remove('selected')
                }
                else {
                    event.target.parentElement.parentElement.parentElement.classList.add('selected')
                }
                postRequest(()=>{}, 'method=select_leaf'+'&id='+event.target.parentElement.parentElement.parentElement.id)
                target.blur()
            }
            else if(target.classList.contains('references')) {
                var target = event.target
                var leaf = event.target.parentElement
                var notLoaded = true
                for(i=0;i<this.allReferences.length;i++) {
                    if(this.allReferences[i].leaf == leaf.id) {notLoaded=false}
                }
    
                if (notLoaded) {
                    csrftoken = getCookie('csrftoken'); 
                    var request = new XMLHttpRequest();
                    request.open('POST', window.location.href);
                    request.setRequestHeader("X-CSRFToken", csrftoken); 
                    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    request.onload = () => {
                        if (request.status==200 && request.response) {
                            data = JSON.parse(request.response)
                            for (var key in data) {
                                if (key=='tags') {
                                    this['allTags'] = data[key]
                                }
                                else if (key=='styling') {
                                    if (data[key].includes('r')) {
                                        this['style'] = data[key]
                                    }
                                    else {
                                        this['header'] = data[key]
                                    }
                                }
                                else if (typeof data[key] == "string" ) {
                                    var new_reference = {direction:'/branch/'+key, text: data[key].split('|')[1], leaf: data[key].split('|')[0]}
                                    this['allReferences'].push(new_reference)
                                }
                            }
                        }
                    }
                    request.send('method=get_leaf_references&id='+leaf.id)
                }

                if (this.references != leaf.id) {
                    this.references = leaf.id
                    if (document.querySelector('.view-references')) {
                        document.querySelector('.view-references').classList.remove('view-references')
                    }
                    leaf.classList.add('view-references')
                }
                else {
                    leaf.classList.remove('view-references')
                    this.references = null
                }
                var visibleComments = this.comments!=null
                var visibleReferences = this.references!=null

                if (this.viewPDF) {
                    if (visibleReferences && visibleComments) {
                        this.branchCols = 3
                        this.pdfCols = 3
                    }
                    else if (visibleReferences || visibleComments){
                        this.branchCols = 3
                        this.pdfCols = 6
                    }
                    else {
                        this.branchCols = 4
                        this.pdfCols = 8
                    }
                }
                else {
                    if (visibleReferences && visibleComments) {
                        this.branchCols = 6
                    }
                    else  {
                        this.branchCols = 9
                    }
                }
            }
            else if(target.classList.contains('comments')) {
                var target = event.target
                var leaf = event.target.parentElement
                
                var notLoaded = true

                if (notLoaded) {
                    csrftoken = getCookie('csrftoken'); 
                    var request = new XMLHttpRequest();
                    request.open('POST', window.location.href);
                    request.setRequestHeader("X-CSRFToken", csrftoken); 
                    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    request.onload = () => {
                        if (request.status==200 && request.response) {
                            data = JSON.parse(request.response)
                            for (var key in data) {
                                var tags = []
                                for (i=0; i<this['allTrueTags'].length;i++) {
                                    if (data[key].fields['tags'].includes(this['allTrueTags'][i].pk)) {
                                        tags.push(this['allTrueTags'][i])
                                    }
                                }
                                if (data[key].fields['date']) {
                                    var new_comment = {title:data[key].fields['text'],tags:tags,date:data[key].fields['date'].substring(0, 10), leaf:leaf.id, edit:false, state:data[key].fields['state'], pk:data[key].pk}
                                    this['allComments'].push(new_comment)
                                }
                                else {
                                    var new_comment = {title:data[key].fields['text'],tags:tags,date:null, leaf:leaf.id, edit:false, state:data[key].fields['state'], pk:data[key].pk}
                                    this['allComments'].push(new_comment)
                                }
                            }
                        }
                    }
                    request.send('method=get_leaf_comments&id='+leaf.id)
                }

                if (this.comments != leaf.id) {
                    this.comments = leaf.id
                    if (document.querySelector('.view-comments')) {
                        document.querySelector('.view-comments').classList.remove('view-comments')
                    }
                    leaf.classList.add('view-comments')
                }
                else {
                    leaf.classList.remove('view-comments')
                    this.comments = null
                }
                var visibleComments = this.comments!=null
                var visibleReferences = this.references!=null

                if (this.viewPDF) {
                    if (visibleReferences && visibleComments) {
                        this.branchCols = 3
                        this.pdfCols = 3
                    }
                    else if (visibleReferences || visibleComments){
                        this.branchCols = 3
                        this.pdfCols = 6
                    }
                    else {
                        this.branchCols = 4
                        this.pdfCols = 8
                    }
                }
                else {
                    if (visibleReferences && visibleComments) {
                        this.branchCols = 6
                    }
                    else  {
                        this.branchCols = 9
                    }
                }
            }
            else if (target.classList.contains('show-btn')) {
                var showBtn = event.target
                var leaf = showBtn.parentElement.parentElement
                if (localStorage.getItem('visibleChilds')) {
                    var visibleChildsFlag = localStorage.getItem('visibleChilds').includes('|'+leaf.id+'|')
                    var visibleChilds = localStorage.getItem('visibleChilds')
                    if (visibleChildsFlag) {
                        showBtn.classList.remove('showing')
                        localStorage.setItem('visibleChilds',localStorage.getItem('visibleChilds').replace(leaf.id+'|',''))
                        var leaves = leaf.querySelectorAll('.leaf')
                        for (x=0; x<leaves.length; x++) {
                            leaves[x].classList.add('invisible')
                        }
                        var cascade = leaf.querySelectorAll('.showing')
                        for (i=0; i<cascade.length; i++) {
                            var innerLeaf = cascade[i].parentElement.parentElement
                            localStorage.setItem('visibleChilds',localStorage.getItem('visibleChilds').replace(innerLeaf.id+'|',''))
                        }
                    }
                    else {
                        showBtn.classList.add('showing')
                        if (document.querySelector('[data-parent="'+leaf.id+'"]')) {
                            var leaves = document.querySelectorAll('[data-parent="'+leaf.id+'"]')
                            for (x=0; x<leaves.length; x++) {
                                leaves[x].classList.remove('invisible')
                            }
                        }
                        else {
                            postRequest( function () {
                                if (this.status == 200) {
                                    data = JSON.parse(this.response)
                                    for (var key in data) {
                                        var new_leaf =  leafConstructor(
                                            id = data[key].pk,
                                            style = data[key].fields['style'],
                                            text = data[key].fields['text'],
                                            parent = data[key].fields['leaf_parent'],
                                            embed = data[key].fields['reference_origin'],
                                            order = data[key].fields['order'],
                                            selected = data[key].fields['selected'],
                                            references = data[key].fields['references'],
                                            leaves = data[key].fields['leaves_count'],
                                            unsolved = data[key].fields['unsolved'],
                                            comments = data[key].fields['comments'],
                                            image = data[key].fields['image'],
                                            image_width = data[key].fields['image_width'],
                                            image_height = data[key].fields['image_height'],
                                            score =  data[key].fields['points'],
                                        )
                                        leaf.querySelector('.leaf-content').appendChild(new_leaf)
                                    }
                                }
                            } ,'method=get_leafs'+'&target_leaf='+leaf.id)
                        }
                        localStorage.setItem('visibleChilds',visibleChilds+leaf.id+'|')
                    }
                }
                else {
                    localStorage.setItem('visibleChilds','|'+leaf.id+'|')
                    showBtn.classList.add('showing')
                    postRequest( function () {
                        if (this.status == 200) {
                            data = JSON.parse(this.response)
                            for (var key in data) {
                                var new_leaf =  leafConstructor(
                                    id = data[key].pk,
                                    style = data[key].fields['style'],
                                    text = data[key].fields['text'],
                                    parent = data[key].fields['leaf_parent'],
                                    embed = data[key].fields['reference_origin'],
                                    order = data[key].fields['order'],
                                    selected = data[key].fields['selected'],
                                    references = data[key].fields['references'],
                                    leaves = data[key].fields['leaves_count'],
                                    unsolved = data[key].fields['unsolved'],
                                    comments = data[key].fields['comments'],
                                    image = data[key].fields['image'],
                                    image_width = data[key].fields['image_width'],
                                    image_height = data[key].fields['image_height'],
                                    score = data[key].fields['points'],
                                )
                                leaf.querySelector('.leaf-content').appendChild(new_leaf)
                            }
                        }
                    } ,'method=get_leafs'+'&target_leaf='+leaf.id)
                }
                target.blur()
            }
            else if(target.classList.contains('clothe')) {
                var alias = event.target
                this.deeplightOption = ''
                this.deeplight.width = 72+alias.innerHTML.length*12
                var coords = alias.getBoundingClientRect()
                if (this.deeplight.focused==alias) {
                    this.deeplight.show = false
                    this.deeplight.x = null
                    this.deeplight.y = null
                    this.deeplight.width = null
                    this.deeplight.text = ''
                    this.deeplight.focused = null
                    alias.setAttribute('data-options', this.deeplight.options.join('|'))
                    alias.parentElement.change = 'true'
                    this.deeplight.options = []
                }
                else {
                    if (this.deeplight.focused) {
                        this.deeplight.focused.setAttribute('data-options',this.deeplight.options.join('|'))
                        this.deeplight.show = true
                        this.deeplight.x = coords.left + window.scrollX + alias.offsetWidth/2 - this.deeplight.width/2
                        this.deeplight.y = coords.top + window.scrollY - 40
                        this.deeplight.text = alias.innerHTML
                        this.deeplight.options = []
                        this.deeplight.focused = alias
                        if (alias.getAttribute('data-options')) {
                            this.deeplight.options = alias.getAttribute('data-options').split('|')
                        }
                    }
                    else {
                        this.deeplight.text = ''
                        this.deeplight.show = true
                        this.deeplight.x = coords.left + window.scrollX + alias.offsetWidth/2 - this.deeplight.width/2
                        this.deeplight.y = coords.top + window.scrollY - 40
                        this.deeplight.text = alias.innerHTML
                        this.deeplight.options = []
                        this.deeplight.focused = alias
                        if (alias.getAttribute('data-options')) {
                            this.deeplight.options = alias.getAttribute('data-options').split('|')
                        }
                    }
                }
            }
            else if (event.target.classList.contains('inline-img-container')) {
                var image = event.target.querySelector('.inline-img')
                var leaf = event.target.parentElement.parentElement.id
                postRequest(()=>{},'method=save_image_size&id='+leaf+'&width='+image.width+'&height='+image.height)
            }
        },
        closeComments: function closeComments(event) {
            this.comments = null
            document.querySelector('.view-comments').classList.remove('view-comments')
            var visibleComments = this.comments!=null
            var visibleReferences = this.references!=null

            if (this.viewPDF) {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 3
                    this.pdfCols = 3
                }
                else if (visibleReferences || visibleComments){
                    this.branchCols = 3
                    this.pdfCols = 6
                }
                else {
                    this.branchCols = 4
                    this.pdfCols = 8
                }
            }
            else {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 6
                }
                else  {
                    this.branchCols = 9
                }
            }
        },
        sendComment: function sendComment(event) {
            if (this.issueText) {
                csrftoken = getCookie('csrftoken'); 
                var request = new XMLHttpRequest();
                request.open('POST', window.location.href);
                request.setRequestHeader("X-CSRFToken", csrftoken); 
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                request.onload = () => {
                    if (request.status==200 && request.response) {
                        data = JSON.parse(request.response)
                        var new_comment = {title:this['issueText'],tags:[],date:null, leaf:this['comments'], edit:false, state: 'Hacer', pk: data['id']}
                        this['allComments'].push(new_comment)
                        this['issueText'] = null
                    }
                }
                request.send( 'method=new_issue&'+'title='+this['issueText']+'&leaf='+this['comments'])
            }
        },
        doIssue: function doIssue(target) {
            if (target.state == 'Hacer') {
                target.state = 'Haciendo'
            }
            else {
                target.state = 'Hecho'
            }
            postRequest(()=>{}, 'method=do_issue&id='+target.pk)
        },
        changeIssue: function changeIssue(target) {
            if (target.edit) {
                target.edit = false
                postRequest(()=>{}, 'method=change_issue&id='+target.pk+'&text='+target.title)
            }
            else {
                target.edit = true
            }
        },
        changeIssueDate: function changeIssueDate(target) {
            if (target.date) {
                postRequest(()=>{}, 'method=change_issue_date&id='+target.pk+'&date='+target.date)
            }
        },
        closeReferences: function closeReferences(event) {
            this.references = null
            document.querySelector('.view-references').classList.remove('view-references')
            var visibleComments = this.comments!=null
            var visibleReferences = this.references!=null

            if (this.viewPDF) {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 3
                    this.pdfCols = 3
                }
                else if (visibleReferences || visibleComments){
                    this.branchCols = 3
                    this.pdfCols = 6
                }
                else {
                    this.branchCols = 4
                    this.pdfCols = 8
                }
            }
            else {
                if (visibleReferences && visibleComments) {
                    this.branchCols = 6
                }
                else  {
                    this.branchCols = 9
                }
            }
        },
        createLink : function createLink(event) {
            text = getSelectionText()
            var result = ''
            postRequest(function() {
                if (this.status == 200) {
                    data = JSON.parse(this.response)['connections']
                    if (data==1) {
                        result = '¡Creaste 1 nueva conexión!'
                    }
                    else {
                        result = '¡Creaste '+data+' nuevas conexiones!'
                    }
                }
            },'method=create_link&text='+text)
            setTimeout(()=>{this.snackbar=true;this.snackbarText=result},100)
        },
        makeBold : function makeBold(){
            text = getSelectionText()
            document.execCommand('bold', false, null);
            this.targetLeaf.change = 'true'
            this.targetLeaf = null
            window.getSelection().removeAllRanges();
        },
        makeItalic : function makeItalic(){
            text = getSelectionText()
            document.execCommand('italic', false, null);
            this.targetLeaf.change = 'true'
            this.targetLeaf = null
            window.getSelection().removeAllRanges();
        },
        makeUnderlined : function makeUnderlined(){
            text = getSelectionText()
            document.execCommand('underline', false, null);
            this.targetLeaf.change = 'true'
            this.targetLeaf = null
            window.getSelection().removeAllRanges();
        },
        searchBranch: function searchBranch(event) {
            window.location.href = '/search/'+event.target.value
        },
        searchGoogle: function searchGoogle(event) {
            text = getSelectionText()
            window.open('http://google.com/search?q='+text);
        },
        makeDeeplight: function makeDeeplight(event) {
            text = getSelectionText()
            this.targetLeaf.innerHTML = this.targetLeaf.innerHTML.replace(text, '<span contenteditable="false" class="clothe" data-options="">'+text+'</span>')
            this.targetLeaf.change = 'true'
            this.targetLeaf = null
        },
        addDeeplightOption: function addDeeplightOption(event) {
            this.deeplight.options.push(event.target.value)
            event.target.value = ''
            this.deeplightOption = ''
        },
        clearDeeplightOption: function clearDeeplightOption(item) {
            this.deeplight.options = this.deeplight.options.filter(i => i !== item)
            this.deeplight.focused.setAttribute('data-options',this.deeplight.options.join('|'))
            this.deeplightOption = ''
        },
        deleteDeeplight: function deleteDeeplight(event) {
            var all_alias = document.getElementById('branch-content').querySelectorAll('.clothe')
            for(i=0; i<all_alias.length; i++) {
                if (all_alias[i].innerHTML == this.deeplight.text) {
                    all_alias[i].parentElement.change = 'true'
                    all_alias[i].outerHTML = this.deeplight.text
                }
            }
            this.deeplight.show = false
            this.deeplight.x = null
            this.deeplight.y = null
            this.deeplight.options = []
            this.deeplight.text = ''
            this.deeplight.focused = null
        },
        changeMode: function changeMode() {
            this.focusMode = !this.focusMode
            if (this.focusMode) {
                document.getElementById('branch-content').classList.add('zen')
                document.getElementById('navBar').classList.add('d-none')
            }
            else {
                document.getElementById('branch-content').classList.remove('zen')
                document.getElementById('navBar').classList.remove('d-none')
            }
            localStorage.setItem('mode', this.focusMode)
        },
        changeStyle: function changeStyle(value) {
            var leaf = document.getElementById(this.references).querySelector('.leaf-input')
            if ((value!=this.style) && value) {
                if (value=='Keywords'||value=='Abstract') {
                    this.header = 'No'
                    leaf.classList.remove('keywords')
                    leaf.classList.remove('abstract')
                    leaf.classList.remove('h1')
                    leaf.classList.remove('h2')
                    leaf.classList.remove('h3')
                    leaf.classList.remove('h4')
                    leaf.classList.remove('h5')
                    leaf.classList.remove('h6')
                    leaf.classList.remove('none')
                    this.style = value
                    leaf.classList.add(value.toLowerCase())
                    postRequest(()=>{}, 'method=set_style&id='+this.references+'&style='+this.style)
                }
                else {
                    this.style = null
                    leaf.classList.remove('keywords')
                    leaf.classList.remove('abstract')
                    leaf.classList.remove('h1')
                    leaf.classList.remove('h2')
                    leaf.classList.remove('h3')
                    leaf.classList.remove('h4')
                    leaf.classList.remove('h5')
                    leaf.classList.remove('h6')
                    leaf.classList.remove('none')
                    leaf.classList.add(this.header.toLowerCase())
                    postRequest(()=>{}, 'method=set_style&id='+this.references+'&style='+this.header)
                }
            }
            else if ((value==this.style) && value) {
                this.style = null
                this.header = 'No'
                leaf.classList.remove(value.toLowerCase())
                postRequest(()=>{}, 'method=set_style&id='+this.references+'&style='+this.style)
            }
        },
        addTag: function addTag(event) {
            if (event.target.value!='') {
                var new_tag = event.target.value
                this.allTrueTags.push(new_tag)
            }
        },
        editIssueTags: function editIssueTags(comment) {
            this.selectedTags = comment.tags
        },
        deleteTag: function deleteTag(tag) {
            this.allTrueTags.splice(tag,1)
            postRequest(()=>{},'method=delete_tag&tag='+tag.id)
        },
        setIssueTags: function setIssueTags(comment) {
            comment.tags = this.selectedTags
            var tags_list = []
            for (i=0; i<this.selectedTags.length; i++) {
                tags_list.push(this.selectedTags[i].pk)
            }
            postRequest(()=>{}, 'method=change_issue_tags&id='+comment.pk+'&tags='+tags_list.join('|'))
        },
        createTag: function createTag(event) {
            var name = event.target.value
            csrftoken = getCookie('csrftoken'); 
            var request = new XMLHttpRequest();
            request.open('POST', window.location.href);
            request.setRequestHeader("X-CSRFToken", csrftoken); 
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.onload = () => {
                if (request.status==200 && request.response) {
                    data = JSON.parse(request.response)
                    this['allTrueTags'].push(data[0])
                    event.target.value = ''
                }
            }
            request.send( 'method=create_tag&'+'name='+name)
        },
        changeIssueTags: function changeIssueTags(target) {
            csrftoken = getCookie('csrftoken'); 
            var request = new XMLHttpRequest();
            request.open('POST', window.location.href);
            request.setRequestHeader("X-CSRFToken", csrftoken); 
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.onload = () => {
                if (request.status==200 && request.response) {
                    data = JSON.parse(request.response)
                    target.tags = data
                }
            }
            request.send('method=change_issue_tags&id='+target.pk+'&tags='+target.tags.join('|'))
        },
        dumpSelected: function dumpSelected() {
            postRequest(()=>{window.location.reload()},'method=dump_selected')
        },
        thereAreSelectedBranchs: function thereAreSelectedBranchs() {
            return this.selectedBranchs.length>0
        }
    },
    mounted() {
        this.overlay = false
        if (this.viewPDF) {
            this.branchCols = 6
        }
        document.getElementById('branch-content').style.fontFamily=localStorage.getItem('fontFamily')
        document.getElementById('title').style.fontFamily=localStorage.getItem('titleFontFamily')
    },
    watch: {
        allTags: function(val, oldVal) {
            var result = []
            for (i=0;i<val.length;i++) {
                result.push(val[i].pk)
            }
            postRequest(()=>{}, 'method=save_tags&id='+this.references+'&tags='+result.join('|'))
        },
        header: function(val, oldVal) {
            if (val!='No' && val!=null) {
                this.style = val
                postRequest(()=>{}, 'method=set_style&id='+this.references+'&style='+this.style)
            }
        }
    }
})

for(var i=0; i<branch_leafs.length; i++) {
    var new_leaf =  leafConstructor(
        id = branch_leafs[i].pk,
        style = branch_leafs[i].fields['style'],
        text = branch_leafs[i].fields['text'],
        parent = branch_leafs[i].fields['leaf_parent'],
        embed = branch_leafs[i].fields['reference_origin'],
        order = branch_leafs[i].fields['order'],
        selected = branch_leafs[i].fields['selected'],
        references = branch_leafs[i].fields['references'],
        leaves = branch_leafs[i].fields['leaves_count'],
        unsolved = branch_leafs[i].fields['unsolved'],
        comments = branch_leafs[i].fields['comments'],
        image = branch_leafs[i].fields['image'],
        imageWidth = branch_leafs[i].fields['image_width'],
        imageHeight = branch_leafs[i].fields['image_height'],
        score = branch_leafs[i].fields['points'],
    )
    if (branch_leafs[i].fields['hidden']==false) {
        if (new_leaf.getAttribute('data-parent')==global_id) {
            document.getElementById('branch-content').appendChild(new_leaf)
        }
        else {
            var parent = document.getElementById(new_leaf.getAttribute('data-parent')).querySelector('.leaf-content')
            parent.appendChild(new_leaf)
        }
    }
    else {
        document.getElementById('trash-container').appendChild(trashWrapper(new_leaf))
    }
}

let url = 'ws://' + window.location.host + '/ws/socket-server'
var socket = new WebSocket(url)
socket.onmessage = function(e) {
    let data = JSON.parse(e.data)
    for (var key in data) {
        //Check if we delete the leaf.
        if (data[key]=='None') {
            var leaf = document.getElementById(key)
            document.getElementById('trash-container').appendChild(trashWrapper(leaf))
         }
         //Check if we should add new leaf.
        else if (!document.getElementById(key)) {
            leaf_order = parseInt(data[key].split('|')[0])
            if (data[key].split('|')[1]!=global_id) {
                previousLeaf = document.getElementById(data[key].split('|')[1]).querySelector('[data-order="'+(leaf_order-1).toString()+'"]')
            }
            else {
                previousLeaf = document.getElementById('branch-content').querySelector('[data-order="'+(leaf_order-1).toString()+'"]')
            }
            leaf_text = ''
            var newLeaf =  leafConstructor(
                id=key,
                style='None', 
                text=leaf_text,
                parent= previousLeaf.getAttribute('data-parent'), 
                embed=null, 
                order=leaf_order, 
                selected=false, 
                references=null, 
                leaves=null, 
                unsolved=0, 
                comments=0,
                image=null,
                image_width=0,
                image_height=0,
                score=0,
            )
            insertAfter(previousLeaf, newLeaf)
            newLeaf.querySelector('.leaf-input').change = 'true'
        }
        //Check if the existing leaf is updated.
        else if (data[key].image != undefined){
            var leaf = document.getElementById(key)
            var leaf_input = leaf.querySelector('.leaf-input')
            var leaf_content = leaf.querySelector('.leaf-content')
            if (data[key].text!='updated') {
                leaf_input.innerHTML = data[key].text
            }
            if (data[key].image!='updated') {
                var leaf_image_container = document.createElement('div')
                leaf_image_container.classList.add('inline-img-container')
                var leaf_image = document.createElement('img')
                leaf_image.classList.add('inline-img')
                leaf_image.src = data[key].image
                leaf_image_container.appendChild(leaf_image)
                leaf_content.appendChild(leaf_image_container)
            }
            if (data[key].parent!='updated') {
                var true_order = data[key].parent.split('|')[1]
                if (data[key].parent.split('|')[0]==global_id) {
                    var true_parent = document.getElementById('branch-content')
                }
                else {
                    var true_parent = document.getElementById(data[key].parent.split('|')[0]).querySelector('.leaf-content')
                }
                if (leaf.parentElement!=true_parent) {
                    true_parent.appendChild(leaf)
                }
            }
            if (data[key].focused=='no') {
                leaf_input.setAttribute('contenteditable', true)
                leaf_input.classList.remove('focusin-leaf')
                if (leaf.querySelector('.editing')) {
                    leaf.querySelector('.editing').innerHTML = ''
                }
            }
            else if (data[key].focused!='no' && data[key].focused!=global_user) {
                leaf_input.setAttribute('contenteditable', false)
                leaf_input.classList.add('focusin-leaf')
                if (leaf.querySelector('.editing')) {
                    leaf.querySelector('.editing').innerHTML = data[key].focused
                }
                else {
                    var editing = document.createElement('div')
                    editing.classList.add('editing')
                    editing.innerHTML = data[key].focused
                    leaf.appendChild(editing)
                }
            }
        }
    }
}
window.addEventListener('beforeunload', (event) => { 
    alert(document.querySelectorAll('.focusin-leaf'))
    focusinLeaf = document.querySelectorAll('.focusin-leaf')
    for (i=0; i<focusinLeaf.length; i++) {
        postRequest(()=>{}, 'method=defocus_leaf'+'&id='+focusinLeaf[i].parentElement.parentElement.id)
    }
    alert(document.querySelectorAll('.focusin-leaf'))
});
setInterval(()=>{
    var info = {'all_actual_leafs':global_id}
    var data = ''
    let leaves = document.getElementById('branch-content').querySelectorAll('.leaf')
    for (i=0; i<leaves.length; i++) {
        if (leaves[i].querySelector('.leaf-input')!=document.activeElement && leaves[i].querySelector('.leaf-input').change!='true') {
            var parent_id = leaves[i].getAttribute('data-parent')
            info[leaves[i].id]=leaves[i].querySelector('.leaf-input').innerHTML.length+'|'+parent_id+'|i'
            if (leaves[i].querySelector('.leaf-content').querySelector('.inline-img')) {
                info[leaves[i].id] += 'mage'
            }
        }
        else if (leaves[i].querySelector('.leaf-input').change=='true') {
            data += '&'+leaves[i].id+'='+leaves[i].querySelector('.leaf-input').innerHTML.replace('&nbsp;',' ')
            leaves[i].querySelector('.leaf-input').change='false'
        }
    }
    if (data.length!='') {
        data += '&method=save_leaf'
        postRequest(()=>{}, data)
    }
    socket.send(JSON.stringify(info))
},200)

if (localStorage.getItem('visibleChilds')) {
    var invisibleChilds = localStorage.getItem('visibleChilds').split('|').sort().filter(i => i!='' && i!=global_id)
    var newInvisibleChilds = []
    postRequest( function () {
        if (this.status == 200) {
            data = JSON.parse(this.response)
            for (var key in data) {
                var new_leaf =  leafConstructor(
                    id = data[key].pk,
                    style = data[key].fields['style'],
                    text = data[key].fields['text'],
                    parent = data[key].fields['leaf_parent'],
                    embed = data[key].fields['reference_origin'],
                    order = data[key].fields['order'],
                    selected = data[key].fields['selected'],
                    references = data[key].fields['references'],
                    leaves = data[key].fields['leaves_count'],
                    unsolved = data[key].fields['unsolved'],
                    comments = data[key].fields['comments'],
                    image = data[key].fields['image'],
                    imageWidth = data[key].fields['image_width'],
                    imageHeight = data[key].fields['image_height'],
                    score = data[key].fields['points'],
                )
                if (data[key].fields['hidden']==false) {
                    if (new_leaf.getAttribute('data-parent')==global_id) {
                        document.getElementById('branch-content').appendChild(new_leaf)
                    }
                    else if (document.getElementById(new_leaf.getAttribute('data-parent'))){
                        var parent = document.getElementById(new_leaf.getAttribute('data-parent')).querySelector('.leaf-content')
                        var showBtn = document.getElementById(new_leaf.getAttribute('data-parent')).querySelector('.show-btn')
                        showBtn.classList.add('showing')
                        parent.appendChild(new_leaf)
                    }
                }
                else {
                    if (document.getElementById('trash-container').querySelector('[id="'+new_leaf.getAttribute('data-parent')+'"]')){
                        var parent = document.getElementById('trash-container').querySelector('[id="'+new_leaf.getAttribute('data-parent')+'"]').querySelector('.leaf-content')
                        var showBtn = document.getElementById('trash-container').querySelector('[id="'+new_leaf.getAttribute('data-parent')+'"]').querySelector('.show-btn')
                        showBtn.classList.add('showing')
                        parent.appendChild(trashWrapper(new_leaf))
                    }
                    else {
                        document.getElementById('trash-container').appendChild(trashWrapper(new_leaf))
                    }
                }
            }
        }
    } ,'method=get_leafs'+'&target_leaf='+invisibleChilds.join('|'))
}
if (branch_selected=='True') {
    document.getElementById('branch-content').parentElement.classList.add('selected')
}
if (localStorage.getItem('mode')=='true') {
    document.getElementById('branch-content').classList.add('zen')
    document.getElementById('navBar').classList.add('d-none')
}
/* ############### */
/* Usefull methods */
/* ############### */

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentElement.insertBefore(newNode, referenceNode.nextElementSibling);
}

function getNextSiblings(elem) {
    var sibs = [];
    while (elem = elem.nextSibling) {
        if (elem.nodeType === 3) continue;
        sibs.push(elem);
    }
    return sibs;
}

function getCaretGlobalPosition(){
    const r = document.getSelection().getRangeAt(0)
    const node = r.startContainer
    const offset = r.startOffset+1
    const pageOffset = {x:window.pageXOffset, y:window.pageYOffset}
    let rect,  r2;

    if (offset > 0) {
        r2 = document.createRange()
        r2.setStart(node, (offset-1))
        r2.setEnd(node, (offset))
        rect = r2.getBoundingClientRect()
        return { left:rect.right + pageOffset.x, top:rect.bottom + pageOffset.y }
    }
}

function getCaretGlobalPositionForLinks(){
    const r = document.getSelection().getRangeAt(0)
    const node = r.startContainer
    const offset = r.startOffset
    const pageOffset = {x:window.pageXOffset, y:window.pageYOffset}
    let rect,  r2;

    if (offset > 0) {
        r2 = document.createRange()
        r2.setStart(node, (offset-1))
        r2.setEnd(node, (offset))
        rect = r2.getBoundingClientRect()
        return { left:rect.right + pageOffset.x, top:rect.bottom + pageOffset.y }
    }
}

function placeCaretAtEnd(el) {
    el.focus();
    if (window.getSelection){
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }
}

function focusTextToEnd(elem) {
    elem.focus()
    if (elem.contentEditable == 'true') {
        placeCaretAtEnd(elem)
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
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
function leafConstructor(id, style, text, parent, embed, order, selected, references, leaves, unsolved, comments, image, image_width, image_height, score) {
    var leaf = document.createElement('div')
    leaf.id = id
    leaf.classList.add('leaf')
    leaf.setAttribute('data-style', style)
    leaf.setAttribute('data-parent', parent)
    leaf.setAttribute('data-selected', selected)
    leaf.setAttribute('data-order', order)

    leaf.setAttribute('onmouseup', 'vueApp.leafHandler(event)')

    if (selected && global_selected.includes(id)) {
        leaf.classList.add('selected')
    }

    var referencesEl = document.createElement('div')
    referencesEl.classList.add('references')
    referencesEl.innerHTML = references
    leaf.appendChild(referencesEl)

    var pairButton = document.createElement('div')
    pairButton.classList.add('pair-button')
    leaf.appendChild(pairButton)

    var leafContent = document.createElement('div')
    leafContent.classList.add('leaf-content')
    leaf.appendChild(leafContent)

    var leafToolbar = document.createElement('div')
    leafToolbar.classList.add('leaf-toolbar')
    leafToolbar.id = "leaf-toolbar"+id
    leafContent.appendChild(leafToolbar)

    if (global_editor) {
        var hideBtn = document.createElement('button')
        hideBtn.classList.add('leaf-toolbar-btn', 'hide')
        hideBtn.style.backgroundImage = "url('/static/trees/images/cross.png')"
        leafToolbar.appendChild(hideBtn)
    }

    var selectBtn = document.createElement('button')
    selectBtn.classList.add('leaf-toolbar-btn', 'select')
    selectBtn.style.backgroundImage = "url('/static/trees/images/select.png')"
    leafToolbar.appendChild(selectBtn)

    if (leaves) {
        var expandBtn = document.createElement('button')
        expandBtn.classList.add('leaf-toolbar-btn')
        expandBtn.style.backgroundImage = "url('/static/trees/images/expand.png')"
        expandBtn.setAttribute('onclick', 'window.location.href="/branch/'+id+'"')
        leafToolbar.appendChild(expandBtn)

        var showButton = document.createElement('button')
        showButton.classList.add('show-btn')
        showButton.style.backgroundImage = "url('/static/trees/images/show.png')"
        pairButton.appendChild(showButton)
    }

    if (embed!=null) {
        var origin = document.createElement('a')
        origin.href = "/branch/"+embed
        origin.innerHTML = 'Origin'
        leafToolbar.appendChild(origin)
    }
    
    var leafInput = document.createElement('div')
    leafInput.id = 'leaf-input'+id
    leafInput.classList.add('leaf-input')
    leafInput.setAttribute('spellcheck', 'false')
    if (style!='') {
        if (style=='Abstract') {
            leafInput.classList.add('abstract')
        }
        else if (style=='Keywords') {
            leafInput.classList.add('keywords')
        }
        else {
            leafInput.classList.add(style.toLowerCase())
        }
    }
    if (global_editor) {
        leafInput.setAttribute('contenteditable', 'true')
    }
    else {
        leafInput.setAttribute('contenteditable', 'false')
    }
    leafInput.setAttribute('onkeydown', "vueApp.inputHandler(event)")
    leafInput.setAttribute('onfocus', "vueApp.updateHandler(event)")
    leafInput.setAttribute('onfocusout', "vueApp.updateHandler(event)")
    leafInput.setAttribute('onpaste', "vueApp.onPaste(event)")
    if (text) {
        leafInput.innerHTML = text
    }
    leafContent.appendChild(leafInput)

    if (image) {
        var leaf_image_container = document.createElement('div')
        leaf_image_container.classList.add('inline-img-container')
        var leaf_image = document.createElement('img')
        if ((image_height+image_width)!=0) {
            leaf_image_container.style.width = image_width+'px'
            leaf_image_container.style.height = image_height+'px'
        }
        leaf_image.classList.add('inline-img')
        leaf_image.src = media_url+image
        leaf_image_container.appendChild(leaf_image)
        leafContent.appendChild(leaf_image_container)
    }

    var leafComments = document.createElement('div')
    leafComments.classList.add('comments')
    leafComments.id = 'comment'+id
    leaf.appendChild(leafComments)

    if (score>0) {
        var leafScore = document.createElement('p')
        leafScore.classList.add('negative-score')
        leafScore.innerHTML = score
        leafToolbar.appendChild(leafScore)
    }
    else if (score<0) {
        var leafScore = document.createElement('p')
        leafScore.classList.add('positive-score')
        leafScore.innerHTML = score
        leafToolbar.appendChild(leafScore)
    }
    return leaf
}
function trashWrapper(element) {
    var target = element
    var wrapper = document.createElement('div')
    wrapper.classList.add('trash-wrapper')
    var recoverBtn = document.createElement('button')
    recoverBtn.innerHTML = 'Recuperar'
    recoverBtn.setAttribute('data-id', element.id)
    recoverBtn.onclick = function (event) {
        postRequest(()=>{}, 'method=trash_leaf'+'&id='+event.target.getAttribute('data-id'))
        var leaf = document.getElementById(event.target.getAttribute('data-id'))
        var wrapper = leaf.parentElement
        if (leaf.getAttribute('data-parent')==global_id) {
            var previous = document.getElementById('branch-content').querySelector('[data-order="'+parseInt(leaf.getAttribute('data-order'))+'"]')
            insertAfter(previous, leaf)
        }
        else {
            var parent = document.getElementById(leaf.getAttribute('data-parent'))
            var previous = parent.querySelector('[data-order="'+parseInt(leaf.getAttribute('data-order'))+'"]')
            insertAfter(previous, leaf)
        }
        wrapper.remove()
    }
    recoverBtn.classList.add('recover-btn')
    wrapper.appendChild(target)
    wrapper.appendChild(recoverBtn)
    return wrapper;
}
