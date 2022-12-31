function shareRoom(url) {
    let shareId = prompt("Please enter the NetID of the person with whom "
    + "you would like to share your design:");
    if (shareId != null && shareId != "") {
        document.cookie = "shareid=" + shareId;
        window.location.href = url;
    }
}