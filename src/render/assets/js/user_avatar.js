document.addEventListener("DOMContentLoaded", (e) => {
    // NAVBAR

    // DROPDOWN
    const dropdown = document.querySelector("#dropdown");
    const dropdown_open = document.querySelector("#dropdown-open-btn");
    let state = false;
    dropdown_open.addEventListener("click", (e => {
        state = !state;
        dropdown.hidden = !state;
    }));

    // USER AVATAR
    const user_avatar = document.querySelector("#user-avatar");
    fetch("/api/user/me").then((res) => res.json()).then(async data => {
        const address = data.email.trim().toLowerCase();
        const hash = await sha256(address);
        user_avatar.setAttribute("src", `https://www.gravatar.com/avatar/${ hash }`);
    });

    // SIDEBAR

    // DROPDOWN
    const sb_dropdown = document.querySelector("#sb-dropdown");
    const sb_dropdown_open = document.querySelector("#sb-dropdown-open-btn");
    let sb_state = false;
    sb_dropdown_open.addEventListener("click", (e => {
        sb_state = !sb_state;
        sb_dropdown.hidden = !sb_state;
    }));

    // USER AVATAR
    const sb_user_avatar = document.querySelector("#sb-user-avatar");
    fetch("/api/user/me").then((res) => res.json()).then(async data => {
        const address = data.email.trim().toLowerCase();
        const hash = await sha256(address);
        sb_user_avatar.setAttribute("src", `https://www.gravatar.com/avatar/${ hash }`);
    });
});