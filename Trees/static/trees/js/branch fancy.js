localStorage.setItem('visibleChilds','')
let last_coords = [0,0]

const vuetifyApp = new Vuetify({
    theme: {
        dark: localStorage.getItem('theme') == 'dark',
        options: { customProperties: true },
    },
    options: {
        customProperties: true
    },
})
const referenceButton = Vue.extend({
    vuetify: vuetifyApp,
    template: '<v-btn dense fab x-small depressed><v-icon color="amber darken-2">mdi-link</v-icon></v-btn>',
});
const commentsButton = Vue.extend({
    vuetify: vuetifyApp,
    template: '<v-btn dense fab x-small depressed><v-icon color="blue">mdi-comment-text-outline</v-icon></v-btn>',
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
        title: branch_title,
        leafs: branch_leafs,
        theme: localStorage.getItem('theme')=='dark',
    },
    methods: {
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
            if (event.target == document.activeElement) {
                info = {}
                info[event.target.parentElement.parentElement.id]='focus'
                socket.send(JSON.stringify(info))
            }
            else {
                info = {}
                info[event.target.parentElement.parentElement.id]='focusout'
                socket.send(JSON.stringify(info))
            }
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
                    comments=0
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
                    comments=0
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

                var showButton = document.createElement('button')
                showButton.classList.add('leaf-toolbar-btn', 'show-btn')
                var showButtonIcon = new showIcon()
                showButtonIcon.$mount(showButton)
                showButton.append(showButtonIcon.$el)
                previousLeafToolbar.appendChild(showButton)

                var expandBtn = document.createElement('button')
                expandBtn.classList.add('leaf-toolbar-btn')
                var expandButtonIcon = new expandIcon()
                expandButtonIcon.$mount(expandBtn)
                expandBtn.append(expandButtonIcon.$el)
                expandBtn.setAttribute('onclick', 'window.location.href="/branch/'+previousLeaf.id+'"')
                previousLeafToolbar.appendChild(expandBtn)
            }
            else if (event.key==' ') {
                event.target.changed='true'
            }
        },
        leafHandler: async function leafHandler(event) {
            target = event.target.parentElement
            if(target.classList.contains('hide')) {
                var leaf = target.parentElement.parentElement.parentElement
                if (leaf.previousElementSibling.classList.contains('.leaf')) {
                    focusTextToEnd(leaf.previousElementSibling.querySelector('.leaf-input'))
                }
                leaf.remove()
                postRequest(()=>{}, 'method=trash_leaf'+'&id='+leaf.id)
            }
            else if(target.classList.contains('select')) {
                if (event.target.parentElement.parentElement.parentElement.classList.contains('selected')) {
                    event.target.parentElement.parentElement.parentElement.classList.remove('selected')
                }
                else {
                    event.target.parentElement.parentElement.parentElement.classList.add('selected')
                }
                postRequest(()=>{}, 'method=select_leaf'+'&id='+event.target.parentElement.parentElement.parentElement.id)
            }
            else if(target.classList.contains('comments')) {
                if (document.getElementById('comments').style.display == 'block') {
                    document.getElementById('comments').style.display = 'none'
                }
                else {
                    document.getElementById('comments').style.display = 'block'
                    postRequest(()=>{
                        if (this.status == 200) {
                            data = JSON.parse(this.response)
                        }
                    }, 'method=get_leaf_comments&id='+target.parentElement.id)
                }
            }
            else if (target.classList.contains('show-btn') && last_coords != [event.x, event.y]) {
                last_coords = [event.x, event.y]
                var showBtn = event.target.parentElement
                var leaf = showBtn.parentElement.parentElement.parentElement
                if (localStorage.getItem('visibleChilds')) {
                    var visibleChildsFlag = localStorage.getItem('visibleChilds').includes('|'+leaf.id+'|')
                    var visibleChilds = localStorage.getItem('visibleChilds')
                    if (visibleChildsFlag) {
                        showBtn.classList.remove('showing')
                        localStorage.setItem('visibleChilds',localStorage.getItem('visibleChilds').replace(leaf.id+'|',''))
                        var leaves = leaf.querySelectorAll('.leaf')
                        for (x=0; x<leaves.length; x++) {
                            leaves[x].remove()
                        }
                    }
                    else {
                        showBtn.classList.add('showing')
                        var data = {}
                        postRequest( function () {
                            if (this.status == 200) {
                                data = JSON.parse(this.response)
                            }
                        } ,'method=get_leafs'+'&target_leaf='+leaf.id)
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
                            )
                            leaf.querySelector('.leaf-content').appendChild(new_leaf)
                        }
                        localStorage.setItem('visibleChilds',visibleChilds+leaf.id+'|')
                        showBtn.classList.add('showing')
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
                                )
                                leaf.querySelector('.leaf-content').appendChild(new_leaf)
                            }
                        }
                    } ,'method=get_leafs'+'&target_leaf='+leaf.id)
                }
            }
            target.blur()
        },
        commentsHandler: function commentsHandler(event) {
            if (event.target.classList.contains('toggle-issue') && document.getElementById('add-comment').innerHTML!='') {
                
            }
        },
        createLink : function createLink(event) {
            inlineToolbar = document.getElementById('inline-toolbar')
            inlineToolbar.style.display = 'none'
            text = getSelectionText()
            var original_text = new RegExp(text, 'ig');
            leafInputs = document.getElementsByClassName('leaf-input')
            if (document.querySelector('[data-title="'+text.toUpperCase()+'"')) {
                for (i=0; i<leafInputs.length; i++) {
                    link = document.querySelector('[data-title="'+text.toUpperCase()+'"]').getAttribute('data-pk')
                    leafInputs[i].innerHTML = leafInputs[i].innerHTML.replace(original_text, '<a class="inline-link" contenteditable="false" href="/branch/'+link+'">'+text+'</a><span></span>')
                    leafInputs[i].changed = 'true'
                }
                vueApp.sendData()
            }
            else {
                csrftoken = getCookie('csrftoken'); 
                var request = new XMLHttpRequest();
                request.open('POST', window.location.href);
                request.setRequestHeader("X-CSRFToken", csrftoken); 
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                var data = 'link='+text.toLowerCase()
                request.onload = function(e) {
                    if (this.status == 200) {
                        updated = JSON.parse(this.response)
                        link = document.createElement('div')
                        link.classList.add('suggestion')
                        link.setAttribute('onclick',"window.location.href='/branch/'"+updated['id']+"'")
                        link.setAttribute('data-title', updated['text'].toUpperCase())
                        link.setAttribute('data-pk', updated['id'])
                        link.innerHTML = updated['text']
                        document.getElementById('searchbar').appendChild(link)
                    }
                }
                request.send(data)
                setTimeout(
                function(e){
                    for (i=0; i<leafInputs.length; i++) {
                        link = document.querySelector('[data-title="'+text.toUpperCase()+'"]').getAttribute('data-pk')
                        leafInputs[i].innerHTML = leafInputs[i].innerHTML.replace(original_text, '<a class="inline-link" contenteditable="false" href="/branch/'+link+'">'+text.toLowerCase()+'</a><span></span>')
                        leafInputs[i].changed = 'true'
                    }
                    vueApp.sendData()
                }, 100)
            }
        },
        searchWord: function searchWord(event) {
            text = getSelectionText()
            window.open('http://google.com/search?q='+text);
        },
        createClothe: function createClothe(event) {
            text = getSelectionText()
            var original_text = new RegExp(text, 'ig');
            leafInputs = document.getElementsByClassName('leaf-input')
            for (i=0; i<leafInputs.length; i++) {
                leafInputs[i].innerHTML = leafInputs[i].innerHTML.replace(original_text, '<span contenteditable="false" class="clothe">'+text+'</span>')
            }
            vueApp.sendData()
        },
        saveDelete : function saveDelete(event) {
            pressedToolbarBtn = true
            leaf = event.target.parentElement.parentElement.parentElement
            var id = leaf.id
            if (id=='branch') {
                id = global_id;
            }
            csrftoken = getCookie('csrftoken'); 
            var request = new XMLHttpRequest();
            request.open('POST', window.location.href);
            request.setRequestHeader("X-CSRFToken", csrftoken); 
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            data = 'delete='+id
            request.send(data)
            leaf.remove()
        },
    }
})

console.log(branch_leafs.length)
for(var i=0; i<branch_leafs.length; i++) {
    console.log(i)
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
}

let url = 'ws://' + window.location.host + '/ws/socket-server'
var socket = new WebSocket(url)
socket.onmessage = function(e) {
    let data = JSON.parse(e.data)
    for (var key in data) {
        if (data[key]==true && document.getElementById('leaf-input'+key)) {
            document.getElementById('leaf-input'+key).setAttribute('contenteditable', false)
            document.getElementById('leaf-input'+key).classList.add('focusin-leaf')
        }
        else if (data[key]==false && document.getElementById('leaf-input'+key)) {
            document.getElementById('leaf-input'+key).setAttribute('contenteditable', true)
            document.getElementById('leaf-input'+key).classList.remove('focusin-leaf')
        }
        else if (data[key]=='None') {
            document.getElementById('trash-container').appendChild(document.getElementById(key))
        }
        else if ( !isNaN(key) ){
            if (typeof data[key] == 'string') {
                document.getElementById('leaf-input'+key).innerHTML = data[key].split('|')[1]
            }
            else  if (!document.getElementById('branch-content').querySelector('[data-order="'+(data[key]).toString()+'"]') && typeof data[key] == 'number') {
                console.log('#############')
                console.log(data[key])
                console.log(key)
                console.log('#############')
                leaf_order = data[key].toString()
                previousLeaf = document.getElementById('branch-content').querySelector('[data-order="'+(data[key]-1).toString()+'"]')
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
                    comments=0
                )
                insertAfter(previousLeaf, newLeaf)
                newLeaf.querySelector('.leaf-input').changed = 'true'
            }
        }
    }
}
window.addEventListener('beforeunload', (event) => { 
    focusinLeaf = document.querySelectorAll('.focusin-leaf')
    for (i=0; i<focusinLeaf.length; i++) {
        postRequest(()=>{}, 'method=defocus_leaf'+'&id='+focusinLeaf[i].parentElement.parentElement.id)
    }
});
setInterval(()=>{
    var info = {'all_actual_leafs':global_id}
    var data = ''
    let leaves = document.getElementById('branch-content').querySelectorAll('.leaf')
    for (i=0; i<leaves.length; i++) {
        if (leaves[i].querySelector('.leaf-input')!=document.activeElement && leaves[i].querySelector('.leaf-input').change!='true') {
            info[leaves[i].id]=leaves[i].querySelector('.leaf-input').innerHTML.length
        }
        else if (leaves[i].querySelector('.leaf-input').changed=='true') {
            data += '&'+leaves[i].id+'='+leaves[i].querySelector('.leaf-input').innerHTML
            leaves[i].querySelector('.leaf-input').changed='false'
        }
    }
    if (data.length!='') {
        data += '&method=save_leaf'
        postRequest(()=>{}, data.replace('&nbsp;',' '))
    }
    socket.send(JSON.stringify(info))
},300)

if (localStorage.getItem('visibleChilds')) {
    var invisibleChilds = localStorage.getItem('visibleChilds').split('|').sort().reverse().filter(i => i!='')
    console.log(invisibleChilds)
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
leafConstructor: function leafConstructor(id, style, text, parent, embed, order, selected, references, leaves, unsolved, comments) {
    var leaf = document.createElement('div')
    leaf.id = id
    leaf.classList.add('leaf')
    leaf.setAttribute('data-style', style)
    leaf.setAttribute('data-parent', parent)
    leaf.setAttribute('data-selected', selected)
    leaf.setAttribute('data-order', order)
    leaf.setAttribute('onmouseup', 'vueApp.leafHandler(event)')

    var referencesEl = document.createElement('div')
    referencesEl.classList.add('references')
    var referencesBtn = new referenceButton()
    referencesBtn.$mount(referencesEl)
    referencesEl.appendChild(referencesBtn.$el)
    leaf.appendChild(referencesEl)

    var leafContent = document.createElement('div')
    leafContent.classList.add('leaf-content')
    leaf.appendChild(leafContent)

    var leafToolbar = document.createElement('div')
    leafToolbar.classList.add('leaf-toolbar')
    leafToolbar.id = "leaf-toolbar"+id
    leafContent.appendChild(leafToolbar)

    if (leaves) {
        var showButton = document.createElement('button')
        showButton.classList.add('leaf-toolbar-btn', 'show-btn')
        var showButtonIcon = new showIcon()
        showButtonIcon.$mount(showButton)
        showButton.append(showButtonIcon.$el)
        leafToolbar.appendChild(showButton)
    }

    if (global_editor) {
        var hideBtn = document.createElement('button')
        hideBtn.classList.add('leaf-toolbar-btn', 'hide')
        var hideButtonIcon = new hideIcon()
        hideButtonIcon.$mount(hideBtn)
        hideBtn.append(hideButtonIcon.$el)
        leafToolbar.appendChild(hideBtn)
    }
    
    var selectBtn = document.createElement('button')
    selectBtn.classList.add('leaf-toolbar-btn', 'select')
    var selectButtonIcon = new selectIcon()
    selectButtonIcon.$mount(selectBtn)
    selectBtn.append(selectButtonIcon.$el)
    leafToolbar.appendChild(selectBtn)
    
    if (leaves) {
        var expandBtn = document.createElement('button')
        expandBtn.classList.add('leaf-toolbar-btn')
        var expandButtonIcon = new expandIcon()
        expandButtonIcon.$mount(expandBtn)
        expandBtn.append(expandButtonIcon.$el)
        expandBtn.setAttribute('onclick', 'window.location.href="/branch/'+id+'"')
        leafToolbar.appendChild(expandBtn)
    }

    if (embed) {
        var origin = document.createElement('a')
        origin.href = "/branch/"+embed
        origin.innerHTML = 'Origin'
        leafToolbar.appendChild(origin)
    }
    var leafInput = document.createElement('div')
    leafInput.id = 'leaf-input'+id
    leafInput.classList.add('leaf-input')
    leafInput.setAttribute('spellcheck', 'false')
    if (global_editor) {
        leafInput.setAttribute('contenteditable', 'true')
    }
    leafInput.setAttribute('onkeydown', "vueApp.inputHandler(event)")
    leafInput.setAttribute('onfocus', "vueApp.updateHandler(event)")
    leafInput.setAttribute('onfocusout', "vueApp.updateHandler(event)")
    if (text) {
        leafInput.innerHTML = text
    }
    leafContent.appendChild(leafInput)

    var leafComments = document.createElement('div')
    leafComments.classList.add('comments')
    leafComments.id = 'comment'+id
    var commentsBtn = new commentsButton()
    commentsBtn.$mount(leafComments)
    leafComments.appendChild(commentsBtn.$el)
    if (unsolved!=0) {
        var unsolvedIssues = document.createElement('div')
        unsolvedIssues.innerHTML = '<p>'+ unsolved+'</p>'
        leafComments.appendChild(unsolvedIssues)
    }
    leaf.appendChild(leafComments)
    
    return leaf
}
