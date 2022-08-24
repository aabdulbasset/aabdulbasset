import { gsap } from "gsap";

import typeit from "typeit";

const skills = [
  {
    type: "language",
    name: "HTML & CSS",
  },
  {
    type: "language",
    name: "Javascript",
  },
  {
    type: "language",
    name: "Python",
  },
  {
    type: "framework",
    name: "Next.js",
  },
  {
    type: "framework",
    name: "React",
  },
  {
    type: "framework",
    name: "TailwindCSS",
  },
  {
    type: "framework",
    name: "Express.js",
  },
  {
    type: "framework",
    name: "Django",
  },
  {
    type: "framework",
    name: "Bootstrap",
  },
  {
    type: "database",
    name: "Postgres",
  },

  {
    type: "database",
    name: "SQLlite",
  },
];

const projects = [
  {
    name: "Social dashboard",
    img: new URL("../assets/social-dashboard.jpg", import.meta.url),
    url: "https://aabdulbasset.github.io/social-media-dashboard-with-theme-switcher-master/",
  },
  {
    name: "Pomodoro",
    img: new URL("../assets/pomodoro.jpg", import.meta.url),
    url: "https://aabdulbasset.github.io/Prilliant/",
  },
  {
    name: "Landing page",
    img: new URL("../assets/landing.jpg", import.meta.url),
    url: "https://aabdulbasset.github.io/fylo-dark-theme/",
  },
  {
    name: "Next estore",
    img: new URL("../assets/nextstore.jpg", import.meta.url),
    url: "https://nextstore.netlify.app",
  },
];
//Cursor
const navElements = document.querySelectorAll(".nav-links a");
navElements.forEach((element) => {
  element.addEventListener("mouseover", function handleMouseOver(e) {
    addCursor(e.target);
  });
  element.addEventListener("mouseleave", function handleMouseLeave() {
    removeCursor();
  });
  // Selector
  element.addEventListener("click", (e) => {
    removeAllSelected();
    addSelected(e.target);
    removeCursor();
  });
});
//Cursor functions
let element = document.createElement("div");
function addCursor(target) {
  element.id = "cursor";
  if (!target.classList.contains("selected")) {
    target.appendChild(element);
  }
}
function removeCursor() {
  document.querySelectorAll("#cursor").forEach((element) => {
    element.remove();
  });
}
//Selector Function

function addSelected(target) {
  target.classList.add("selected");
}
function removeAllSelected() {
  navElements.forEach((element) => {
    element.classList.remove("selected");
  });
}
// ***************************************************
const logo = document.querySelector(".logo-img");
const logoParent = document.querySelector(".nav-logo");
let left = 0;
// Logo animation
let logoAnimation = gsap.to(logo, {
  duration: 1,
  y: -10,
  yoyo: true,
  repeat: -1,
  onRepeat: animationCompleted,
});
logoAnimation.pause();
logoParent.addEventListener("mouseover", handleMouseOver);
logoParent.addEventListener("mouseleave", handleMouseLeave);
function handleMouseOver() {
  left = 0;
  logoAnimation.play();
}
function animationCompleted() {
  if (logoAnimation.progress() < 0.1 && left === 1) {
    logoAnimation.pause();
  }
}
function handleMouseLeave() {
  left = 1;
}

//********************** TYPING EFFECT

new typeit(".typing", {
  speed: 50,
  startDelay: 1000,
})
  .type(
    `<strong class="large-text">Hello there 👋,</br> My name is <a href='https://www.linkedin.com/in/aabdulbasset/'>Ahmed Abdulbasset.</a> 
</br></strong><span class='medium-text'>I'm a full-stack web developer.</span></br></br>`,
    { delay: 100 }
  )
  .type(
    `<span class="small-text"> I'm currently a senior computer science student.
</br>I have always loved problem-solving, so I picked up programming; specifically, Web Programming 🤗. 
I'm currently learning React, Docker and mastering Javascript.</span></br></br> <span class='footer-text'>So, What do you think 💭?</span>`
  )
  .go();

new typeit(".typing-projects", {
  speed: 50,
  waitUntilVisible: true,
  cursor: false,
})
  .type(`Projects`)
  .go();

/***********************  Mobile menu */

document.querySelector(".menu").addEventListener("click", handleClick);
function checkOpened() {
  return document.querySelector(".dropdown").classList.contains("opened");
}
function closeMenu() {
  document.querySelector(".dropdown").classList.remove("opened");
  document.querySelector(".menu").classList.remove("opened");
  gsap
    .timeline()
    .add("up")
    .to(".dropdown", { height: 0, duration: 0.5 }, "up")
    .to(".dropdown-container a", { fontSize: 0, duration: 0.5 }, "up")
    .add("hide")
    //.to(".projects-container", { display: "flex", duration: 0 }, "hide")
    .to(".dropdown", { display: "none", duration: 0.1 }, "hide")
    .to(".ti-cursor", { display: "inline", duration: 0.1 }, "hide");
}
function openMenu() {
  document.querySelector(".dropdown").classList.add("opened");
  gsap
    .timeline()
    .add("display")
    .to(".dropdown", { display: "block", duration: 0.1 }, "display")
    //.to(".projects-container", { display: "none", duration: 0 })
    .add("dropdown")
    .to(".dropdown", { height: "100%", duration: 0.5 }, "dropdown")
    .to(".dropdown-container a", { fontSize: "3em", duration: 0.5 }, "dropdown")
    .to(".ti-cursor", { display: "none", duration: 0.1 }, "dropdown");
}
function handleClick() {
  let isOpened = checkOpened();
  if (isOpened) {
    closeMenu();
  } else {
    openMenu();
  }
}

/****************** Projects */
projects.forEach((project) => {
  let projectcard = document.createElement("div");
  projectcard.classList.add("project-card");
  let projectlink = document.createElement("a");
  projectlink.href = project.url;
  projectlink.target = "_blank";
  let projectcardimg = document.createElement("img");
  projectcardimg.src = project.img as unknown as string;
  projectcardimg.classList.add("image");
  projectlink.appendChild(projectcardimg);
  let projectcardname = document.createElement("div");
  projectcardname.classList.add("project-name");
  projectcardname.innerHTML = project.name;
  projectcard.appendChild(projectlink);
  projectcard.appendChild(projectcardname);
  document.querySelector(".cards-container").prepend(projectcard);
});

let observer = new IntersectionObserver(handleIntersection, {
  threshold: 0.8,
});

observer.observe(document.querySelector("#index"));
observer.observe(document.querySelector("#projects"));
observer.observe(document.querySelector("#about"));

function handleIntersection(entries) {
  console.log(entries);
  // console.log(entries[0].target.id);
  if (entries[0].target.id == "projects" && entries[0].isIntersecting) {
    removeAllSelected();
    addSelected(document.querySelector('a[href="#projects"]'));
    openProjects();
  } else if (
    entries[0].target.id == "projects" &&
    entries[0].isIntersecting == false
  ) {
    closeProjects();
  }
  if (entries[0].target.id == "index" && entries[0].isIntersecting) {
    removeAllSelected();
    addSelected(document.querySelector('a[href="#index"]'));
  }

  if (entries[0].target.id == "about" && entries[0].isIntersecting) {
    removeAllSelected();
    addSelected(document.querySelector('a[href="#about"]'));
  }
}
let width = window.innerWidth / 1.3 + "px";
let height = window.innerHeight / 1.3 + "px";
function openProjects() {
  gsap
    .timeline()
    .add("width")
    .to(
      ".projects-container",
      {
        width: width,
        height: height,
        duration: 0.3,
      },
      "width"
    )
    .add("add")
    .to(
      ".header-container, .project-card",
      { display: "flex", duration: 0 },
      "add"
    )
    .add("display")
    .to(
      ".header-container, .project-card",
      { opacity: 1, duration: 0.3 },
      "add"
    );
}
function closeProjects() {
  gsap
    .timeline()
    .add("hide")
    .to(
      ".header-container, .project-card",
      { opacity: 0, duration: 0.3 },
      "hide"
    )

    .add("height")
    .to(".projects-container", { height: 0, width: 0, duration: 0.3 }, "height")
    .add("remove")
    .to(
      ".header-container,.project-card",
      { display: "none", duration: 0 },
      "remove"
    );
}

let skillIconsContainer = document.querySelector(".skills-icons-container");
let icon;
skills.forEach((skill) => {
  if (skill.type == "framework") {
    icon = '<i class="fa-solid fa-cubes"></i>';
  } else if (skill.type == "language") {
    icon = `<i class="fa-solid fa-cube"></i>`;
  } else if (skill.type == "database") {
    icon = `<i class="fa-solid fa-database"></i>`;
  }
  let skillItemElement = document.createElement("div");
  skillItemElement.classList.add("skill-item");
  skillItemElement.innerHTML = `${icon} ${skill.name}`;
  skillIconsContainer.appendChild(skillItemElement);
});
