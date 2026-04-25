const navToggle = document.querySelector(".nav-toggle");
const topNav = document.querySelector(".topnav");

if (navToggle && topNav) {
  navToggle.addEventListener("click", () => {
    const open = topNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

document.querySelectorAll(".signup-form button").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest(".signup-form");
    if (!form) return;
    const inputs = Array.from(form.querySelectorAll("input"));
    const hasValue = inputs.every((input) => input.value.trim().length > 1);
    button.textContent = hasValue ? "Added" : "Enter details";
  });
});
