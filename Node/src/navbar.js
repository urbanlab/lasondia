var toggled = false;

function hideMenu() {
    $('#menu').css('display', 'none');
}

function showMenu() {
    $('#menu').css('display', 'block');
}

function toggleMenu() {
    toggled = !toggled;
    if (toggled) {
        showMenu();
    } else {
        hideMenu();
    }
}

function tryHidingMenu() {
    if (toggled) {
        toggleMenu();
    }
}

function goToMyLessons() {
    window.location.href = '';
}

function goToMyProgress() {
    window.location.href = '';
}

function goToRegister() {
    window.location.href = '';
}