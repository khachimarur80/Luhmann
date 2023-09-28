document.getElementById('add-branch').addEventListener('click', function (e) {
    document.getElementById('cover').style.display='flex'
    document.getElementById('input-branch-title').focus()
})
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
function removeFolder(event) {
    id = event.target.getAttribute('data-branch')
    event.target.parentElement.style.display = 'none'
    csrftoken = getCookie('csrftoken'); 
    var request = new XMLHttpRequest();
    request.open('POST', window.location.href);
    request.setRequestHeader("X-CSRFToken", csrftoken); 
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    data = 'removefolder='+id
    request.send(data)
}
function mergeResults(event) {
    csrftoken = getCookie('csrftoken'); 
    var request = new XMLHttpRequest();
    request.open('POST', window.location.href);
    request.setRequestHeader("X-CSRFToken", csrftoken); 
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    data = 'merge=y'
    request.send(data)
}